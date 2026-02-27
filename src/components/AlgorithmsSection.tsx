import { motion } from "framer-motion";
import {
  Brain, Eye, BarChart3, Cpu, MonitorOff, Box, Fingerprint,
  Timer, ShieldCheck, Layers, Sparkles, GitBranch, Activity,
  Scan, AlertTriangle, Network
} from "lucide-react";

interface AlgoItem {
  title: string;
  desc: string;
  tech?: string;
}

interface AlgoCategory {
  category: string;
  icon: any;
  description: string;
  items: AlgoItem[];
}

const algorithms: AlgoCategory[] = [
  {
    category: "Question Generation",
    icon: Brain,
    description: "Dynamic MCQ creation using large language models with structured output control",
    items: [
      {
        title: "Gemini 3 Flash (LLM)",
        tech: "google/gemini-3-flash-preview",
        desc: "Google's latest multimodal LLM generates 15 unique CS questions per session. High temperature (1.0) ensures maximum variety across runs — no two tests are alike.",
      },
      {
        title: "Few-Shot Prompt Engineering",
        tech: "System + User prompt chain",
        desc: "Carefully crafted system prompt constrains the model to output pure JSON arrays. The user prompt specifies exact schema (question, options, answer, topic) with topic distribution control across 5 CS domains.",
      },
      {
        title: "JSON Schema Enforcement",
        tech: "Runtime validation + cleanup",
        desc: "Response is sanitized by stripping markdown fences, then parsed with JSON.parse. Each object is validated for required fields (question, 4 options, answer, topic) before being served to the client.",
      },
      {
        title: "Topic Stratification",
        tech: "Prompt-controlled distribution",
        desc: "The prompt explicitly lists 5 topics (Data Structures, DBMS, OS, Networking, Programming) ensuring balanced coverage. The LLM distributes ~3 questions per topic for comprehensive assessment.",
      },
    ],
  },
  {
    category: "Face Detection",
    icon: Eye,
    description: "Real-time face detection using lightweight neural networks optimized for browser execution",
    items: [
      {
        title: "BlazeFace (SSD-based)",
        tech: "MediaPipe Tasks Vision",
        desc: "A Single Shot MultiBox Detector (SSD) architecture with a custom encoder optimized for mobile GPUs. Uses a 128×128 input resolution with 6 anchor boxes, achieving sub-10ms inference on modern browsers via WebGL/GPU delegate.",
      },
      {
        title: "WebGL GPU Acceleration",
        tech: "MediaPipe WASM + WebGL",
        desc: "The face detector runs on the GPU via WebGL shaders, compiled from MediaPipe's C++ pipeline to WebAssembly. This offloads the neural network computation from the CPU, enabling smooth 30fps detection alongside the webcam feed.",
      },
      {
        title: "Bounding Box Regression",
        tech: "Canvas 2D overlay rendering",
        desc: "Each detected face returns a bounding box (originX, originY, width, height) predicted by the SSD's regression head. These coordinates are drawn as rectangles on an HTML Canvas overlaying the video element in real-time.",
      },
      {
        title: "Multi-Face Classification",
        tech: "Detection count thresholding",
        desc: "The detector returns an array of all detected faces. If detections.length > 1, the system flags it as a 'multiple faces' cheating event. If detections.length === 0 for more than 3 consecutive seconds, a 'face missing' event is triggered.",
      },
    ],
  },
  {
    category: "Proctoring Engine",
    icon: ShieldCheck,
    description: "Multi-signal cheating detection combining vision, browser APIs, and temporal analysis",
    items: [
      {
        title: "Page Visibility API",
        tech: "document.visibilitychange",
        desc: "The browser's native Visibility API fires when the user switches tabs or minimizes the window. Each 'hidden' state transition is captured as a tab_switch event with a timestamp for the integrity audit trail.",
      },
      {
        title: "Temporal Debouncing (Face Missing)",
        tech: "setTimeout with 3s threshold",
        desc: "To avoid false positives from brief glances away, face-missing events use a 3-second debounce timer. The timer starts when no face is detected and only fires the event if the face remains absent for the full duration. Timer resets on re-detection.",
      },
      {
        title: "Real-Time Event Stream",
        tech: "React state with useCallback",
        desc: "Cheating events are accumulated in a React state array using memoized callbacks (useCallback) to prevent unnecessary re-renders of the webcam component. Events are displayed in a live activity log sidebar.",
      },
      {
        title: "requestAnimationFrame Loop",
        tech: "Browser rAF scheduling",
        desc: "Face detection runs in a continuous requestAnimationFrame loop synced to the display refresh rate. Each frame captures the current video frame, runs BlazeFace inference, draws bounding boxes, and evaluates detection counts — all within ~16ms per frame.",
      },
    ],
  },
  {
    category: "Timer & Auto-Submit",
    icon: Timer,
    description: "Countdown-based test control with automatic submission on expiry",
    items: [
      {
        title: "setInterval Countdown",
        tech: "1-second tick interval",
        desc: "A setInterval timer decrements a seconds counter every 1000ms. The timer displays MM:SS format and visually changes to a red warning state when under 2 minutes remaining.",
      },
      {
        title: "Auto-Submit on Expiry",
        tech: "Callback invocation at zero",
        desc: "When the countdown reaches zero, the interval clears itself and invokes the onTimeUp callback, which triggers the same submission flow as manual submit — ensuring no answers are lost even if the user doesn't click submit.",
      },
    ],
  },
  {
    category: "Scoring & Evaluation",
    icon: BarChart3,
    description: "Multi-dimensional assessment combining correctness scoring with integrity analysis",
    items: [
      {
        title: "Weighted Penalty Scoring",
        tech: "Rule-based deduction system",
        desc: "Integrity starts at 100 and is reduced per event: -20 for multiple faces (high severity), -10 for tab switches (medium), -5 for face missing (low). Score is clamped to [0, 100]. Pass threshold is ≥ 80.",
      },
      {
        title: "Topic-Based Weakness Analysis",
        tech: "Grouping + threshold filter",
        desc: "Answers are grouped by topic. For each topic, a correct/total ratio is computed. Topics with < 50% accuracy are flagged as 'weak areas' and surfaced in the report with specific improvement suggestions.",
      },
      {
        title: "Mapped Suggestion Engine",
        tech: "Topic → recommendation lookup",
        desc: "Each weak topic maps to a pre-defined, actionable suggestion (e.g., 'Data Structures' → 'Revise trees, graphs, and time complexity'). This provides immediately actionable feedback rather than generic advice.",
      },
      {
        title: "Complete Answer Audit",
        tech: "Question-by-question review",
        desc: "The results page shows every question with a ✓/✗ indicator, the user's selected answer (highlighted in red if wrong), and the correct answer — enabling detailed self-review after each session.",
      },
    ],
  },
  {
    category: "Architecture & Security",
    icon: Layers,
    description: "Edge-function backend with client-side rendering and zero data persistence",
    items: [
      {
        title: "Edge Function Backend",
        tech: "Deno runtime on Lovable Cloud",
        desc: "Question generation runs server-side in a Deno edge function, keeping the API key secure. The function handles CORS, rate limiting (429), credit exhaustion (402), and response sanitization before returning questions to the client.",
      },
      {
        title: "Zero-Persistence Privacy",
        tech: "Client-side only state",
        desc: "Webcam feeds are processed entirely in-browser — no video frames leave the device. Questions, answers, and results exist only in React state and are lost on page refresh. No database storage means complete privacy by design.",
      },
      {
        title: "Client-Side Routing",
        tech: "React Router with state passing",
        desc: "Test results are passed to the results page via React Router's location state, avoiding URL parameters or API calls. This keeps the entire flow client-side with instant page transitions.",
      },
    ],
  },
];

const AlgorithmsSection = () => {
  return (
    <section id="algorithms" className="py-24 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">
            The <span className="text-primary">Algorithms</span> Behind the Magic
          </h2>
          <p className="section-subtitle mt-4">
            A deep dive into every algorithm and technique powering your proctored MCQ round
          </p>
        </div>

        <div className="space-y-8">
          {algorithms.map((algo, i) => (
            <motion.div
              key={algo.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass-card p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <algo.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">{algo.category}</h3>
                  <p className="text-sm text-muted-foreground">{algo.description}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {algo.items.map((item) => (
                  <div key={item.title} className="rounded-lg border border-border/40 bg-secondary/20 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-sm font-semibold text-foreground">{item.title}</h4>
                      {item.tech && (
                        <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {item.tech}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlgorithmsSection;
