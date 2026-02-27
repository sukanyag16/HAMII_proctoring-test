import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, User } from "lucide-react";
import { CheatingEvent } from "@/lib/types";

interface WebcamMonitorProps {
  isActive: boolean;
  onCheatingEvent: (event: CheatingEvent) => void;
}

const WebcamMonitor = ({ isActive, onCheatingEvent }: WebcamMonitorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const faceMissingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const detectorRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;

    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Load face detection
        await loadFaceDetection();
      } catch (err) {
        console.error("Camera access denied:", err);
        setWarning("Camera access denied");
      }
    };

    const loadFaceDetection = async () => {
      try {
        const vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs");
        const { FaceDetector, FilesetResolver } = vision;
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        detectorRef.current = await FaceDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
        });
        detectLoop();
      } catch (e) {
        console.error("Face detection failed to load:", e);
        // Fallback: run without face detection
        setFaceDetected(true);
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

      const result = detectorRef.current.detectForVideo(video, performance.now());
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const faces = result.detections || [];
      if (faces.length === 0) {
        setFaceDetected(false);
        if (!faceMissingTimerRef.current) {
          faceMissingTimerRef.current = setTimeout(() => {
            setWarning("Face not detected!");
            onCheatingEvent({ type: "face_missing", timestamp: Date.now() });
            faceMissingTimerRef.current = null;
          }, 3000);
        }
      } else if (faces.length > 1) {
        setFaceDetected(true);
        if (faceMissingTimerRef.current) {
          clearTimeout(faceMissingTimerRef.current);
          faceMissingTimerRef.current = null;
        }
        setWarning("Multiple faces detected!");
        onCheatingEvent({ type: "multiple_faces", timestamp: Date.now() });
      } else {
        setFaceDetected(true);
        if (faceMissingTimerRef.current) {
          clearTimeout(faceMissingTimerRef.current);
          faceMissingTimerRef.current = null;
        }
        setWarning(null);
      }

      // Draw bounding boxes
      ctx.strokeStyle = faces.length === 1 ? "hsl(166, 72%, 52%)" : "hsl(0, 72%, 55%)";
      ctx.lineWidth = 2;
      for (const face of faces) {
        const bb = face.boundingBox;
        if (bb) {
          ctx.strokeRect(bb.originX, bb.originY, bb.width, bb.height);
        }
      }

      animFrameRef.current = requestAnimationFrame(detectLoop);
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
      if (faceMissingTimerRef.current) clearTimeout(faceMissingTimerRef.current);
    };
  }, [isActive, onCheatingEvent]);

  if (!isActive) return null;

  return (
    <div className="glass-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="h-4 w-4 text-primary" />
        <span className="text-xs font-display font-semibold text-foreground">Live Proctoring</span>
        <div className={`ml-auto flex items-center gap-1 text-xs ${faceDetected ? 'text-success' : 'text-destructive'}`}>
          <User className="h-3 w-3" />
          {faceDetected ? "Detected" : "Missing"}
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
