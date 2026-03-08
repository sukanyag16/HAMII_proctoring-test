import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, CheckCircle, XCircle, AlertTriangle, Shield, Eye, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

interface PreExamSetupProps {
  onReady: () => void;
}

const TIPS = [
  "Sit directly in front of the camera",
  "Ensure your face is fully visible",
  "Maintain proper lighting on your face",
  "Avoid looking away frequently",
  "Do not allow multiple people in frame",
  "Keep your camera stable",
];

type SetupPhase = "tips" | "proctoring" | "verifying" | "ready";
type FaceState = "none" | "detected" | "multiple" | "stabilizing" | "verified";

const STABILIZE_DURATION = 2000; // 2 seconds

const PreExamSetup = ({ onReady }: PreExamSetupProps) => {
  const [phase, setPhase] = useState<SetupPhase>("tips");
  const [proctoringEnabled, setProctoringEnabled] = useState(false);
  const [faceState, setFaceState] = useState<FaceState>("none");
  const [statusMessage, setStatusMessage] = useState("Waiting for camera...");
  const [stabilizeProgress, setStabilizeProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Stabilization tracking
  const stableStartRef = useRef<number | null>(null);
  const stabilizeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (stabilizeIntervalRef.current) clearInterval(stabilizeIntervalRef.current);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatusMessage("Loading face detection...");
      await loadDetector();
    } catch {
      setStatusMessage("Camera access denied. Please allow camera access.");
      setFaceState("none");
    }
  };

  const loadDetector = async () => {
    try {
      // @ts-ignore
      const vision = await import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs");
      const { FaceDetector, FilesetResolver } = vision;
      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      detectorRef.current = await FaceDetector.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
      });
      setStatusMessage("Detecting face...");
      detectLoop();
    } catch (e) {
      console.error("Failed to load face detection:", e);
      setStatusMessage("Face detection failed to load.");
    }
  };

  const detectLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !detectorRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const now = performance.now();
    const result = detectorRef.current.detectForVideo(video, now);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const faces = result.detections || [];

    if (faces.length === 0) {
      stableStartRef.current = null;
      setStabilizeProgress(0);
      setFaceState("none");
      setStatusMessage("No face detected. Position yourself in front of the camera.");
    } else if (faces.length > 1) {
      stableStartRef.current = null;
      setStabilizeProgress(0);
      setFaceState("multiple");
      setStatusMessage("Multiple faces detected. Only one person should be in frame.");
    } else {
      // Single face — draw box
      const bb = faces[0].boundingBox;
      if (bb) {
        ctx.strokeStyle = "hsl(166, 72%, 52%)";
        ctx.lineWidth = 2;
        ctx.strokeRect(bb.originX, bb.originY, bb.width, bb.height);
      }

      if (!stableStartRef.current) {
        stableStartRef.current = Date.now();
        setFaceState("stabilizing");
        setStatusMessage("Face detected. Hold still for verification...");
      }

      const elapsed = Date.now() - stableStartRef.current;
      const progress = Math.min(100, (elapsed / STABILIZE_DURATION) * 100);
      setStabilizeProgress(progress);

      if (elapsed >= STABILIZE_DURATION) {
        setFaceState("verified");
        setStatusMessage("Face verified. You're ready to start!");
      } else {
        setFaceState("stabilizing");
      }
    }

    animFrameRef.current = requestAnimationFrame(detectLoop);
  };

  const handleToggle = (checked: boolean) => {
    setProctoringEnabled(checked);
    if (checked) {
      setPhase("verifying");
      startCamera();
    } else {
      cleanup();
      setPhase("proctoring");
      setFaceState("none");
      setStabilizeProgress(0);
      setStatusMessage("Waiting for camera...");
    }
  };

  const handleStartExam = () => {
    cleanup();
    onReady();
  };

  const faceIndicator = {
    none: { color: "text-destructive", bg: "bg-destructive/10", icon: XCircle, label: "No Face" },
    multiple: { color: "text-destructive", bg: "bg-destructive/10", icon: XCircle, label: "Multiple Faces" },
    detected: { color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle, label: "Adjusting..." },
    stabilizing: { color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle, label: "Stabilizing..." },
    verified: { color: "text-success", bg: "bg-success/10", icon: CheckCircle, label: "Verified" },
  };

  const indicator = faceIndicator[faceState];
  const IndicatorIcon = indicator.icon;

  // Tips phase
  if (phase === "tips") {
    return (
      <div className="glass-card max-w-lg w-full p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-5">
          <Lightbulb className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Interview Proctoring Tips</h2>
        <p className="text-muted-foreground mt-2 text-sm">Please read the following before starting your exam</p>

        <ul className="text-left mt-6 space-y-3">
          {TIPS.map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>

        <Button
          onClick={() => setPhase("proctoring")}
          size="lg"
          className="mt-8 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
        >
          <Shield className="h-4 w-4" /> I Understand – Start Proctoring Check
        </Button>
      </div>
    );
  }

  // Proctoring toggle + verification
  return (
    <div className="glass-card max-w-lg w-full p-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-5">
        <Camera className="h-7 w-7 text-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground text-center">Pre-Exam Setup</h2>
      <p className="text-muted-foreground mt-2 text-sm text-center">Complete the proctoring check to begin</p>

      {/* Toggle */}
      <div className="flex items-center justify-between mt-6 p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">Enable Proctoring Check</span>
        </div>
        <Switch checked={proctoringEnabled} onCheckedChange={handleToggle} />
      </div>

      {/* Camera preview */}
      {proctoringEnabled && (
        <div className="mt-5 space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-muted aspect-[4/3] border border-border">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          </div>

          {/* Status indicator */}
          <div className={`flex items-center gap-3 p-3 rounded-lg ${indicator.bg} border border-border`}>
            <IndicatorIcon className={`h-5 w-5 ${indicator.color}`} />
            <div className="flex-1">
              <span className={`text-sm font-semibold ${indicator.color}`}>{indicator.label}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{statusMessage}</p>
            </div>
          </div>

          {/* Stabilization progress */}
          {(faceState === "stabilizing" || faceState === "verified") && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Face stabilization</span>
                <span>{Math.round(stabilizeProgress)}%</span>
              </div>
              <Progress value={stabilizeProgress} className="h-2" />
            </div>
          )}

          {/* Environment checks */}
          <div className="space-y-2">
            <h4 className="text-xs font-display font-semibold text-foreground">Environment Checks</h4>
            <div className="space-y-1.5">
              {[
                { label: "Camera active", ok: true },
                { label: "Single face detected", ok: faceState === "stabilizing" || faceState === "verified" },
                { label: "Face stabilized (2s)", ok: faceState === "verified" },
              ].map((check, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {check.ok ? (
                    <CheckCircle className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={check.ok ? "text-foreground" : "text-muted-foreground"}>{check.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ready message + start button */}
          {faceState === "verified" && (
            <div className="text-center space-y-3 pt-2">
              <p className="text-sm font-semibold text-success">✓ Face verified. Starting exam...</p>
              <Button
                onClick={handleStartExam}
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                Begin Exam
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PreExamSetup;
