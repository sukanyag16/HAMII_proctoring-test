import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MCQQuestion, CheatingEvent, TestResult, TopicResult, BehavioralMetrics } from "@/lib/types";
import { generateQuestions } from "@/lib/questionBank";
import QuestionCard from "@/components/QuestionCard";
import WebcamMonitor from "@/components/WebcamMonitor";
import TestTimer from "@/components/TestTimer";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const TestPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "loading" | "active" | "submitting">("idle");
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [cheatingEvents, setCheatingEvents] = useState<CheatingEvent[]>([]);
  const behavioralMetricsRef = useRef<BehavioralMetrics>({
    eyeContactScore: 100, totalFrames: 0, eyeContactFrames: 0,
    lookingAwayEvents: 0, faceMissingEvents: 0, multipleFaceEvents: 0,
  });

  const startTest = () => {
    setPhase("loading");
    try {
      const generated = generateQuestions(20);
      setQuestions(generated);
      setAnswers({});
      setCheatingEvents([]);
      setTimeout(() => setPhase("active"), 800);
    } catch (err) {
      console.error("Failed to generate questions:", err);
      toast.error("Failed to generate questions. Please try again.");
      setPhase("idle");
    }
  };

  const handleCheatingEvent = useCallback((event: CheatingEvent) => {
    setCheatingEvents((prev) => [...prev, event]);
  }, []);

  const handleBehavioralUpdate = useCallback((metrics: BehavioralMetrics) => {
    behavioralMetricsRef.current = metrics;
  }, []);

  const submitTest = useCallback(() => {
    if (phase !== "active") return;
    setPhase("submitting");

    let score = 0;
    const topicResults: Record<string, TopicResult> = {};

    questions.forEach((q, i) => {
      const topic = q.topic;
      if (!topicResults[topic]) topicResults[topic] = { correct: 0, total: 0, accuracy: 0 };
      topicResults[topic].total++;
      if (answers[i] === q.answer) {
        score++;
        topicResults[topic].correct++;
      }
    });

    Object.values(topicResults).forEach((r) => {
      r.accuracy = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0;
    });

    let integrity = 100;
    cheatingEvents.forEach((e) => {
      if (e.type === "multiple_faces") integrity -= 20;
      else if (e.type === "tab_switch") integrity -= 10;
      else if (e.type === "face_missing") integrity -= 5;
      else if (e.type === "looking_away") integrity -= 5;
    });
    integrity = Math.max(0, integrity);

    const weakTopics = Object.entries(topicResults)
      .filter(([, r]) => r.correct / r.total < 0.5)
      .map(([topic]) => topic);

    const suggestions = generateSuggestions(weakTopics, topicResults, questions, answers);

    const result: TestResult = {
      score,
      total: questions.length,
      integrityScore: integrity,
      integrityStatus: integrity >= 80 ? "Passed" : "Suspicious",
      weakTopics,
      suggestions,
      answers,
      questions,
      cheatingEvents,
      topicResults,
      behavioralMetrics: behavioralMetricsRef.current,
    };

    navigate("/results", { state: { result } });
  }, [phase, questions, answers, cheatingEvents, navigate]);

  if (phase === "idle") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center px-6 pt-16">
          <div className="glass-card max-w-lg w-full p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">MCQ Interview Test</h2>
            <p className="text-muted-foreground mt-3 text-sm">
              20 topic-wise questions • 15 minutes • Proctored with webcam
            </p>
            <ul className="text-left text-sm text-muted-foreground mt-6 space-y-2">
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> Webcam will be enabled automatically</li>
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> Face & gaze detection monitors your session</li>
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> Tab switching will be flagged</li>
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> Auto-submit when time runs out</li>
            </ul>
            <Button onClick={startTest} size="lg" className="mt-8 w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold">
              <Play className="h-4 w-4" /> Start Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground font-display">Preparing your questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground">MCQ Interview</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {Object.keys(answers).length}/{questions.length} answered
              </span>
              <TestTimer durationMinutes={15} isActive={phase === "active"} onTimeUp={submitTest} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              {questions.map((q, i) => (
                <QuestionCard
                  key={i}
                  question={q}
                  index={i}
                  selectedAnswer={answers[i]}
                  onSelect={(answer) => setAnswers((prev) => ({ ...prev, [i]: answer }))}
                />
              ))}
              <Button
                onClick={submitTest}
                disabled={phase === "submitting"}
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {phase === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Test"}
              </Button>
            </div>

            <div className="order-first lg:order-last">
              <div className="sticky top-20 space-y-4">
                <WebcamMonitor
                  isActive={phase === "active"}
                  onCheatingEvent={handleCheatingEvent}
                  onBehavioralUpdate={handleBehavioralUpdate}
                />
                <div className="glass-card p-3">
                  <h4 className="text-xs font-display font-semibold text-foreground mb-2">Activity Log</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {cheatingEvents.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No suspicious activity</p>
                    ) : (
                      cheatingEvents.slice(-5).map((e, i) => (
                        <div key={i} className="text-xs text-destructive">
                          {e.type === "tab_switch" && "⚠ Tab switch detected"}
                          {e.type === "face_missing" && "⚠ Face not detected"}
                          {e.type === "multiple_faces" && "⚠ Multiple faces detected"}
                          {e.type === "looking_away" && "⚠ Looking away from screen"}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateSuggestions(
  weakTopics: string[],
  topicResults: Record<string, TopicResult>,
  questions: MCQQuestion[],
  answers: Record<number, string>
): string[] {
  const suggestions: string[] = [];

  const topicSuggestions: Record<string, string[]> = {
    DSA: [
      "Review binary search and time complexity concepts",
      "Practice linked list and tree traversal problems",
      "Study graph algorithms like BFS and DFS",
      "Solve at least 5 practice questions on sorting algorithms",
    ],
    DBMS: [
      "Revise database normalization (1NF, 2NF, 3NF, BCNF)",
      "Practice SQL joins, subqueries, and indexing",
      "Study transaction management and ACID properties",
      "Solve practice MCQs on ER diagrams and relational algebra",
    ],
    OS: [
      "Review process scheduling algorithms (FCFS, SJF, Round Robin)",
      "Study memory management and virtual memory concepts",
      "Practice deadlock detection and prevention strategies",
      "Revise file systems and disk scheduling algorithms",
    ],
    Java: [
      "Strengthen OOP concepts — inheritance, polymorphism, abstraction",
      "Review Java Collections Framework (ArrayList, HashMap, HashSet)",
      "Practice exception handling and multithreading concepts",
      "Study JVM architecture and garbage collection",
    ],
    Python: [
      "Review Python data types, list comprehension, and generators",
      "Practice decorators, context managers, and lambda functions",
      "Study Python OOP — classes, inheritance, magic methods",
      "Solve coding problems using Python standard libraries",
    ],
  };

  weakTopics.forEach((topic) => {
    const topicSpecific = topicSuggestions[topic];
    if (topicSpecific) {
      // Pick suggestions based on how poorly they did
      const accuracy = topicResults[topic]?.accuracy ?? 0;
      const count = accuracy === 0 ? 4 : accuracy < 25 ? 3 : 2;
      suggestions.push(...topicSpecific.slice(0, count));
    } else {
      suggestions.push(`Review ${topic} fundamentals and solve practice problems`);
    }
  });

  if (suggestions.length === 0) {
    suggestions.push("Great performance! Continue practicing to maintain your skills.");
  }

  return suggestions;
}

export default TestPage;
