import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, Camera, User, Eye } from "lucide-react";
import { CheatingEvent, BehavioralMetrics } from "@/lib/types";

interface WebcamMonitorProps {
  isActive: boolean;
  onCheatingEvent: (event: CheatingEvent) => void;
  onBehavioralUpdate?: (metrics: BehavioralMetrics) => void;
}

const SMOOTHING_THRESHOLD = 10; // consecutive frames before triggering
const GAZE_LEFT_THRESHOLD = 0.35;
const GAZE_RIGHT_THRESHOLD = 0.65;
const LOOKING_AWAY_TIMEOUT_MS = 7000;

const WebcamMonitor = ({ isActive, onCheatingEvent, onBehavioralUpdate }: WebcamMonitorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [faceStatus, setFaceStatus] = useState<"detected" | "missing" | "looking_away">("detected");
  const detectorRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);

  // Temporal smoothing counters
  const faceMissingFrames = useRef(0);
  const multipleFaceFrames = useRef(0);
  const lookingAwayFrames = useRef(0);

  // Already-triggered flags (reset when condition clears)
  const faceMissingTriggered = useRef(false);
  const multipleFaceTriggered = useRef(false);

  // Looking away timer
  const lookingAwayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lookingAwayTriggered = useRef(false);

  // Behavioral metrics
  const metricsRef = useRef<BehavioralMetrics>({
    eyeContactScore: 100,
    totalFrames: 0,
    eyeContactFrames: 0,
    lookingAwayEvents: 0,
    faceMissingEvents: 0,
    multipleFaceEvents: 0,
  });

  const updateMetrics = useCallback(() => {
    const m = metricsRef.current;
    m.eyeContactScore = m.totalFrames > 0
      ? Math.round((m.eyeContactFrames / m.totalFrames) * 100)
      : 100;
    onBehavioralUpdate?.({ ...m });
  }, [onBehavioralUpdate]);

  useEffect(() => {
    if (!isActive) return;

    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        await loadFaceDetection();
      } catch (err) {
        console.error("Camera access denied:", err);
        setWarning("Camera access denied");
      }
    };

    const loadFaceDetection = async () => {
      try {
        // @ts-ignore
        const vision = await import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs");
        const { FaceDetector, FaceLandmarker, FilesetResolver } = vision;
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );

        // Face detector for count
        detectorRef.current = {
          detector: await FaceDetector.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
          }),
          landmarker: null as any,
        };

        // Try loading face landmarker for gaze
        try {
          detectorRef.current.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numFaces: 1,
          });
        } catch (e) {
          console.warn("Face landmarker not available, gaze detection disabled:", e);
        }

        detectLoop();
      } catch (e) {
        console.error("Face detection failed to load:", e);
        setFaceStatus("detected");
      }
    };

    const detectLoop = () => {
      if (!videoRef.current || !canvasRef.current || !detectorRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const now = performance.now();
      const result = detectorRef.current.detector.detectForVideo(video, now);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const faces = result.detections || [];
      metricsRef.current.totalFrames++;

      if (faces.length === 0) {
        // === NO FACE ===
        multipleFaceFrames.current = 0;
        multipleFaceTriggered.current = false;
        lookingAwayFrames.current = 0;
        clearLookingAwayTimer();

        faceMissingFrames.current++;
        if (faceMissingFrames.current >= SMOOTHING_THRESHOLD && !faceMissingTriggered.current) {
          faceMissingTriggered.current = true;
          setFaceStatus("missing");
          setWarning("Face not detected");
          onCheatingEvent({ type: "face_missing", timestamp: Date.now() });
          metricsRef.current.faceMissingEvents++;
        }
      } else if (faces.length > 1) {
        // === MULTIPLE FACES ===
        faceMissingFrames.current = 0;
        faceMissingTriggered.current = false;
        lookingAwayFrames.current = 0;
        clearLookingAwayTimer();

        multipleFaceFrames.current++;
        if (multipleFaceFrames.current >= SMOOTHING_THRESHOLD && !multipleFaceTriggered.current) {
          multipleFaceTriggered.current = true;
          setFaceStatus("detected");
          setWarning("Multiple faces detected");
          onCheatingEvent({ type: "multiple_faces", timestamp: Date.now() });
          metricsRef.current.multipleFaceEvents++;
        }
      } else {
        // === SINGLE FACE ===
        faceMissingFrames.current = 0;
        faceMissingTriggered.current = false;
        multipleFaceFrames.current = 0;
        multipleFaceTriggered.current = false;

        // Check gaze via landmarks
        let gazeOk = true;
        if (detectorRef.current.landmarker) {
          try {
            const landmarkResult = detectorRef.current.landmarker.detectForVideo(video, now);
            if (landmarkResult.faceLandmarks && landmarkResult.faceLandmarks.length > 0) {
              const landmarks = landmarkResult.faceLandmarks[0];
              // Nose tip is landmark index 1
              const noseTip = landmarks[1];
              if (noseTip) {
                const noseX = noseTip.x; // normalized 0-1
                if (noseX < GAZE_LEFT_THRESHOLD || noseX > GAZE_RIGHT_THRESHOLD) {
                  gazeOk = false;
                }
              }
            }
          } catch {
            // Landmarker error, assume gaze ok
          }
        }

        if (gazeOk) {
          lookingAwayFrames.current = 0;
          clearLookingAwayTimer();
          lookingAwayTriggered.current = false;
          setFaceStatus("detected");
          setWarning(null);
          metricsRef.current.eyeContactFrames++;
        } else {
          lookingAwayFrames.current++;
          if (lookingAwayFrames.current >= SMOOTHING_THRESHOLD && !lookingAwayTriggered.current) {
            // Start 3-second timer
            if (!lookingAwayTimerRef.current) {
              setFaceStatus("looking_away");
              setWarning("Looking away from screen");
              lookingAwayTimerRef.current = setTimeout(() => {
                lookingAwayTriggered.current = true;
                onCheatingEvent({ type: "looking_away", timestamp: Date.now() });
                metricsRef.current.lookingAwayEvents++;
                lookingAwayTimerRef.current = null;
              }, LOOKING_AWAY_TIMEOUT_MS);
            }
          }
        }
      }

      // Draw bounding boxes
      const color = faces.length === 1
        ? (faceStatus === "looking_away" ? "hsl(38, 92%, 50%)" : "hsl(166, 72%, 52%)")
        : faces.length > 1
          ? "hsl(0, 72%, 55%)"
          : "hsl(0, 72%, 55%)";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (const face of faces) {
        const bb = face.boundingBox;
        if (bb) {
          ctx.strokeRect(bb.originX, bb.originY, bb.width, bb.height);
        }
      }

      // Update behavioral metrics periodically (every 30 frames)
      if (metricsRef.current.totalFrames % 30 === 0) {
        updateMetrics();
      }

      animFrameRef.current = requestAnimationFrame(detectLoop);
    };

    const clearLookingAwayTimer = () => {
      if (lookingAwayTimerRef.current) {
        clearTimeout(lookingAwayTimerRef.current);
        lookingAwayTimerRef.current = null;
      }
    };

    startCamera();

    // Tab switching detection
    const handleVisibility = () => {
      if (document.hidden) {
        setWarning("Tab switch detected!");
        onCheatingEvent({ type: "tab_switch", timestamp: Date.now() });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (lookingAwayTimerRef.current) clearTimeout(lookingAwayTimerRef.current);
    };
  }, [isActive, onCheatingEvent, updateMetrics]);

  if (!isActive) return null;

  const statusConfig = {
    detected: { label: "Detected", className: "text-success" },
    missing: { label: "Missing", className: "text-destructive" },
    looking_away: { label: "Looking Away", className: "text-warning" },
  };

  const status = statusConfig[faceStatus];

  return (
    <div className="glass-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="h-4 w-4 text-primary" />
        <span className="text-xs font-display font-semibold text-foreground">Live Proctoring</span>
        <div className={`ml-auto flex items-center gap-1 text-xs ${status.className}`}>
          {faceStatus === "looking_away" ? <Eye className="h-3 w-3" /> : <User className="h-3 w-3" />}
          {status.label}
        </div>
      </div>
      <div className="relative rounded-lg overflow-hidden bg-muted aspect-[4/3]">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
      {warning && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          {warning}
        </div>
      )}
    </div>
  );
};

export default WebcamMonitor;
