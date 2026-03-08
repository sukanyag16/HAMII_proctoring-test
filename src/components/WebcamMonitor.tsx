import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, Camera, User, Eye, Smartphone } from "lucide-react";
import { CheatingEvent, BehavioralMetrics } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

interface WebcamMonitorProps {
  isActive: boolean;
  onCheatingEvent: (event: CheatingEvent) => void;
  onBehavioralUpdate?: (metrics: BehavioralMetrics) => void;
  onIntegrityUpdate?: (score: number) => void;
}

const SMOOTHING_THRESHOLD = 10;
const GAZE_LEFT_THRESHOLD = 0.35;
const GAZE_RIGHT_THRESHOLD = 0.65;
const LOOKING_AWAY_TIMEOUT_MS = 7000;
const PHONE_TIMEOUT_MS = 2000;
const DETECTION_INTERVAL_MS = 180; // throttle detection

// Base penalty weights (escalate on repeat)
const BASE_PENALTY = {
  face_missing: 8,
  multiple_faces: 15,
  looking_away: 8,
  phone_detected: 15,
  tab_switch: 10,
};
const ESCALATION_FACTOR = 1.5; // each repeat multiplies penalty

const WebcamMonitor = ({ isActive, onCheatingEvent, onBehavioralUpdate, onIntegrityUpdate }: WebcamMonitorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [faceStatus, setFaceStatus] = useState<"detected" | "missing" | "looking_away" | "phone">("detected");
  const [integrityScore, setIntegrityScore] = useState(100);
  const detectorRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const cocoModelRef = useRef<any>(null);

  // Temporal smoothing counters
  const faceMissingFrames = useRef(0);
  const multipleFaceFrames = useRef(0);
  const lookingAwayFrames = useRef(0);

  // Already-triggered flags
  const faceMissingTriggered = useRef(false);
  const multipleFaceTriggered = useRef(false);

  // Timers
  const lookingAwayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lookingAwayTriggered = useRef(false);
  const phoneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const phoneTriggered = useRef(false);

  // Integrity tracking
  const cumulativePenalty = useRef(0);
  const smoothedIntegrity = useRef(100);
  const eventCounts = useRef<Record<string, number>>({});

  // Throttle
  const lastDetectionTime = useRef(0);

  // Behavioral metrics
  const metricsRef = useRef<BehavioralMetrics>({
    eyeContactScore: 100,
    totalFrames: 0,
    eyeContactFrames: 0,
    lookingAwayEvents: 0,
    faceMissingEvents: 0,
    multipleFaceEvents: 0,
    phoneDetectedEvents: 0,
  });

  const applyPenalty = useCallback((type: keyof typeof BASE_PENALTY) => {
    // Escalate: each repeat of same type increases penalty
    const count = (eventCounts.current[type] || 0) + 1;
    eventCounts.current[type] = count;
    const pen = Math.round(BASE_PENALTY[type] * Math.pow(ESCALATION_FACTOR, Math.min(count - 1, 4)));
    cumulativePenalty.current += pen;
    const rawIntegrity = Math.max(0, 100 - cumulativePenalty.current);
    // Less aggressive smoothing: 0.5 lets penalties hit faster
    smoothedIntegrity.current = Math.round(0.5 * smoothedIntegrity.current + 0.5 * rawIntegrity);
    const newScore = Math.max(0, Math.min(100, smoothedIntegrity.current));
    setIntegrityScore(newScore);
    onIntegrityUpdate?.(newScore);
  }, [onIntegrityUpdate]);

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
        await loadPhoneDetection();
      } catch (err) {
        console.error("Camera access denied:", err);
        setWarning("Camera access denied");
      }
    };

    const loadPhoneDetection = async () => {
      try {
        // @ts-ignore
        const cocoSsd = await import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/+esm");
        // @ts-ignore
        await import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/+esm");
        cocoModelRef.current = await cocoSsd.load({ base: "lite_mobilenet_v2" });
        console.log("COCO-SSD phone detection loaded");
      } catch (e) {
        console.warn("Phone detection model failed to load:", e);
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

        detectorRef.current = {
          detector: await FaceDetector.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            minDetectionConfidence: 0.7,
          }),
          landmarker: null as any,
        };

        try {
          detectorRef.current.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numFaces: 1,
            minFaceDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
          });
        } catch (e) {
          console.warn("Face landmarker not available:", e);
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

      const now = performance.now();

      // Throttle detection
      if (now - lastDetectionTime.current < DETECTION_INTERVAL_MS) {
        animFrameRef.current = requestAnimationFrame(detectLoop);
        return;
      }
      lastDetectionTime.current = now;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const result = detectorRef.current.detector.detectForVideo(video, now);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const faces = result.detections || [];
      metricsRef.current.totalFrames++;

      // Phone detection (async, non-blocking)
      if (cocoModelRef.current && metricsRef.current.totalFrames % 5 === 0) {
        cocoModelRef.current.detect(video).then((predictions: any[]) => {
          const phoneFound = predictions.some(
            (p: any) => p.class === "cell phone" && p.score > 0.5
          );
          if (phoneFound) {
            if (!phoneTimerRef.current && !phoneTriggered.current) {
              phoneTimerRef.current = setTimeout(() => {
                phoneTriggered.current = true;
                setFaceStatus("phone");
                setWarning("Phone detected in frame");
                onCheatingEvent({ type: "phone_detected", timestamp: Date.now() });
                metricsRef.current.phoneDetectedEvents++;
                applyPenalty("phone_detected");
                phoneTimerRef.current = null;
                // Reset after a cooldown
                setTimeout(() => { phoneTriggered.current = false; }, 5000);
              }, PHONE_TIMEOUT_MS);
            }
          } else {
            if (phoneTimerRef.current) {
              clearTimeout(phoneTimerRef.current);
              phoneTimerRef.current = null;
            }
          }
        }).catch(() => {});
      }

      if (faces.length === 0) {
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
          applyPenalty("face_missing");
        }
      } else if (faces.length > 1) {
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
          applyPenalty("multiple_faces");
        }
      } else {
        faceMissingFrames.current = 0;
        faceMissingTriggered.current = false;
        multipleFaceFrames.current = 0;
        multipleFaceTriggered.current = false;

        let gazeOk = true;
        if (detectorRef.current.landmarker) {
          try {
            const landmarkResult = detectorRef.current.landmarker.detectForVideo(video, now);
            if (landmarkResult.faceLandmarks?.length > 0) {
              const noseTip = landmarkResult.faceLandmarks[0][1];
              if (noseTip) {
                const noseX = noseTip.x;
                if (noseX < GAZE_LEFT_THRESHOLD || noseX > GAZE_RIGHT_THRESHOLD) {
                  gazeOk = false;
                }
              }
            }
          } catch {
            // assume ok
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
            if (!lookingAwayTimerRef.current) {
              setFaceStatus("looking_away");
              setWarning("Looking away from screen");
              lookingAwayTimerRef.current = setTimeout(() => {
                lookingAwayTriggered.current = true;
                onCheatingEvent({ type: "looking_away", timestamp: Date.now() });
                metricsRef.current.lookingAwayEvents++;
                applyPenalty("looking_away");
                lookingAwayTimerRef.current = null;
              }, LOOKING_AWAY_TIMEOUT_MS);
            }
          }
        }
      }

      // Draw bounding boxes
      const color = faces.length === 1
        ? (faceStatus === "looking_away" ? "hsl(38, 92%, 50%)" : "hsl(142, 72%, 45%)")
        : faces.length > 1
          ? "hsl(0, 72%, 55%)"
          : "hsl(0, 72%, 55%)";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (const face of faces) {
        const bb = face.boundingBox;
        if (bb) ctx.strokeRect(bb.originX, bb.originY, bb.width, bb.height);
      }

      if (metricsRef.current.totalFrames % 30 === 0) updateMetrics();
      animFrameRef.current = requestAnimationFrame(detectLoop);
    };

    const clearLookingAwayTimer = () => {
      if (lookingAwayTimerRef.current) {
        clearTimeout(lookingAwayTimerRef.current);
        lookingAwayTimerRef.current = null;
      }
    };

    startCamera();

    const handleVisibility = () => {
      if (document.hidden) {
        setWarning("Tab switch detected!");
        onCheatingEvent({ type: "tab_switch", timestamp: Date.now() });
        applyPenalty("tab_switch");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (lookingAwayTimerRef.current) clearTimeout(lookingAwayTimerRef.current);
      if (phoneTimerRef.current) clearTimeout(phoneTimerRef.current);
    };
  }, [isActive, onCheatingEvent, updateMetrics, applyPenalty]);

  if (!isActive) return null;

  const statusConfig = {
    detected: { label: "Detected", className: "text-success" },
    missing: { label: "Missing", className: "text-destructive" },
    looking_away: { label: "Looking Away", className: "text-warning" },
    phone: { label: "Phone Detected", className: "text-destructive" },
  };
  const status = statusConfig[faceStatus];

  const integrityColor = integrityScore > 80
    ? "text-success"
    : integrityScore >= 50
      ? "text-warning"
      : "text-destructive";

  const integrityBarColor = integrityScore > 80
    ? "[&>div]:bg-success"
    : integrityScore >= 50
      ? "[&>div]:bg-warning"
      : "[&>div]:bg-destructive";

  return (
    <div className="glass-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="h-4 w-4 text-primary" />
        <span className="text-xs font-display font-semibold text-foreground">Live Proctoring</span>
        <div className={`ml-auto flex items-center gap-1 text-xs ${status.className}`}>
          {faceStatus === "looking_away" ? <Eye className="h-3 w-3" /> :
           faceStatus === "phone" ? <Smartphone className="h-3 w-3" /> :
           <User className="h-3 w-3" />}
          {status.label}
        </div>
      </div>
      <div className="relative rounded-lg overflow-hidden bg-muted aspect-[4/3]">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Live Integrity Score */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-display font-semibold text-foreground">Integrity Score</span>
          <span className={`text-xs font-bold ${integrityColor}`}>{integrityScore}/100</span>
        </div>
        <Progress value={integrityScore} className={`h-2 ${integrityBarColor}`} />
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
