import { motion } from "framer-motion";
import {
  Brain, Eye, BarChart3, Timer, ShieldCheck, Layers
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
    description: "How we create a fresh set of MCQ questions every time you take a test",
    items: [
      {
        title: "Fisher-Yates Shuffle Algorithm",
        tech: "Random selection without bias",
        desc: "We use the Fisher-Yates (also called Knuth) shuffle algorithm to randomly pick questions from our bank. It works by going through the list backwards and swapping each item with a randomly chosen earlier item. This guarantees every possible order is equally likely — so you never get the same test twice.",
      },
      {
        title: "Stratified Sampling",
        tech: "Equal distribution across topics",
        desc: "Instead of picking 20 random questions from the entire pool, we divide questions into 5 topic groups (Java, Python, DBMS, OS, DSA) and pick exactly 4 from each. This is called stratified sampling — it ensures every topic is fairly represented in your test, just like how surveys sample from different demographics.",
      },
      {
        title: "Local Question Bank",
        tech: "50 curated questions, zero API calls",
        desc: "All 50 questions are stored right inside your browser — no internet request is needed to generate a test. This means instant test loading with zero latency. Each topic has 10 questions, giving you 10-choose-4 = 210 possible combinations per topic, and millions of unique test configurations overall.",
      },
    ],
  },
  {
    category: "Face Detection — BlazeFace Neural Network",
    icon: Eye,
    description: "How we detect and track your face in real-time using AI running inside your browser",
    items: [
      {
        title: "BlazeFace (Single Shot Detector)",
        tech: "MediaPipe by Google",
        desc: "BlazeFace is a lightweight neural network designed by Google specifically for detecting faces on mobile devices. It's based on the SSD (Single Shot MultiBox Detector) architecture — meaning it looks at the entire image once and predicts all face locations in a single pass, instead of scanning the image multiple times. This makes it extremely fast (<10ms per frame).",
      },
      {
        title: "WebGL GPU Acceleration",
        tech: "Hardware-accelerated inference",
        desc: "The neural network runs directly on your device's GPU (graphics card) using WebGL — the same technology used for 3D games in browsers. This offloads heavy math operations from your CPU, allowing face detection to run at 30+ frames per second without slowing down the rest of the app.",
      },
      {
        title: "Bounding Box Regression",
        tech: "Coordinate prediction + Canvas rendering",
        desc: "For each detected face, the model predicts 4 numbers: x position, y position, width, and height. These form a 'bounding box' — a rectangle around your face. We draw this rectangle on an invisible HTML Canvas layer placed on top of your webcam video, so you can see the detection happening live.",
      },
      {
        title: "Multi-Face Thresholding",
        tech: "Count-based classification",
        desc: "After detecting all faces in a frame, we simply count them. If count > 1, it means someone else is visible — flagged as a cheating event. If count === 0 for more than 3 seconds straight, it means you've left the frame. This simple counting rule is surprisingly effective for proctoring.",
      },
    ],
  },
  {
    category: "Proctoring Engine — Multi-Signal Detection",
    icon: ShieldCheck,
    description: "How we combine multiple signals to detect suspicious behavior during the test",
    items: [
      {
        title: "Page Visibility API (Browser Event Listener)",
        tech: "Built-in browser API",
        desc: "Every modern browser has a built-in feature called the Page Visibility API. It fires an event the moment you switch to another tab, minimize the browser, or open another app. We listen to this event and log every occurrence with a timestamp — there's no way to switch tabs without us knowing.",
      },
      {
        title: "Debounce Timer (3-Second Threshold)",
        tech: "setTimeout-based filtering",
        desc: "If you briefly look away from the screen, the face detector might lose your face for a split second. To avoid false alarms, we use a debounce timer: the 'face missing' alert only fires if your face has been undetected for 3 full seconds. If you look back within 3 seconds, the timer resets and no event is logged.",
      },
      {
        title: "requestAnimationFrame Loop",
        tech: "Browser's built-in render scheduler",
        desc: "Face detection runs inside a requestAnimationFrame (rAF) loop — the browser's native way to run code synced to your screen's refresh rate (usually 60 times per second). Each frame: capture webcam image → run BlazeFace → draw bounding box → check face count. All of this happens in under 16ms per cycle.",
      },
      {
        title: "Event Accumulator Pattern (React useCallback)",
        tech: "Immutable state updates",
        desc: "Every cheating event (tab switch, missing face, multiple faces) is added to a growing list stored in React state. We use the useCallback hook to create a stable reference to the event handler, preventing the webcam component from re-rendering unnecessarily every time a new event is added.",
      },
    ],
  },
  {
    category: "Countdown Timer — setInterval Clock",
    icon: Timer,
    description: "How the 15-minute timer works and what happens when it hits zero",
    items: [
      {
        title: "setInterval Countdown (1-Second Tick)",
        tech: "JavaScript timer API",
        desc: "A setInterval timer fires a function every 1000 milliseconds (1 second), decrementing a counter each time. The remaining seconds are converted to MM:SS display format. When less than 2 minutes remain, the timer turns red as a visual warning — a simple but effective UX pattern used in exam platforms worldwide.",
      },
      {
        title: "Auto-Submit on Expiry (Callback Invocation)",
        tech: "Zero-check trigger",
        desc: "When the counter reaches exactly zero, the interval clears itself (to stop ticking) and calls the onTimeUp callback function. This triggers the exact same submission logic as clicking the Submit button — meaning your answers are always saved, even if you forget to submit manually.",
      },
    ],
  },
  {
    category: "Scoring — Weighted Penalty System",
    icon: BarChart3,
    description: "How we calculate your score and integrity rating after the test",
    items: [
      {
        title: "Weighted Deduction Algorithm",
        tech: "Severity-based penalty scoring",
        desc: "Your integrity score starts at 100 and gets reduced based on the severity of each event: Multiple faces detected → −20 points (high severity, likely someone helping). Tab switch → −10 points (medium, possibly looking up answers). Face missing → −5 points (low, could be accidental). The score is clamped to never go below 0. You pass integrity if your score is ≥ 80.",
      },
      {
        title: "Topic-Wise Accuracy Analysis (Group-By Aggregation)",
        tech: "Percentage threshold filter",
        desc: "After the test, we group your answers by topic and calculate the percentage correct for each. Any topic where you scored below 50% is flagged as a 'weak area.' This is a simple group-by-and-filter operation — the same pattern used in SQL analytics and data science to find underperforming segments.",
      },
      {
        title: "Mapped Recommendation Engine (Lookup Table)",
        tech: "Topic → suggestion dictionary",
        desc: "Each weak topic maps to a hand-written, specific suggestion. For example: 'DSA' → 'Revise sorting algorithms, trees, and graph traversals.' This is a simple key-value lookup (hash map), but the suggestions are carefully crafted to be immediately actionable rather than generic advice like 'study more.'",
      },
      {
        title: "Full Answer Audit Trail",
        tech: "Question-by-question review",
        desc: "The results page displays every question with a ✓ or ✗, your selected answer highlighted in red if wrong, and the correct answer shown in green. This lets you do a complete self-review — understanding exactly what you got wrong and why, which is proven to be more effective for learning than just seeing a final score.",
      },
    ],
  },
  {
    category: "Architecture — Client-Side SPA",
    icon: Layers,
    description: "How the entire app is built and why your data never leaves your device",
    items: [
      {
        title: "Single Page Application (React + Vite)",
        tech: "Client-side rendering",
        desc: "The entire app runs as a Single Page Application (SPA) — your browser downloads the app once, and all navigation happens instantly without page reloads. Vite bundles the code using ES modules for fast development builds, and React handles the UI with a virtual DOM for efficient updates.",
      },
      {
        title: "Zero-Persistence Privacy Model",
        tech: "All data stays in browser memory",
        desc: "Your webcam feed is processed entirely inside your browser — no video frames are ever sent to any server. Questions, answers, scores, and proctoring events all live in React's in-memory state. When you close or refresh the page, everything is gone. No database, no cookies, no tracking — privacy by design.",
      },
      {
        title: "React Router State Transfer",
        tech: "In-memory navigation state",
        desc: "When you finish the test, your results are passed to the results page using React Router's location state — an in-memory object attached to the navigation event. This avoids putting sensitive data in the URL or making API calls. The data exists only during the navigation and disappears on page refresh.",
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
            Every algorithm explained in simple language — understand exactly how your proctored MCQ round works under the hood
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
