import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { TestResult } from "@/lib/types";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Shield, AlertTriangle, Brain, ArrowLeft, BarChart3, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as any)?.result as TestResult | undefined;

  if (!result) return <Navigate to="/" replace />;

  const percentage = Math.round((result.score / result.total) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Score Hero */}
            <div className="glass-card p-8 text-center mb-6">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Test Complete</h1>
              <div className="mt-6">
                <div className="stat-value !text-6xl">{result.score}/{result.total}</div>
                <p className="text-muted-foreground mt-2">{percentage}% correct</p>
              </div>
            </div>

            {/* Integrity */}
            <div className={`glass-card p-6 mb-6 ${result.integrityStatus === "Passed" ? "glow-border" : "border-destructive/30"}`}>
              <div className="flex items-center gap-3">
                <Shield className={`h-6 w-6 ${result.integrityStatus === "Passed" ? "text-success" : "text-destructive"}`} />
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Integrity: {result.integrityStatus}
                  </h3>
                  <p className="text-sm text-muted-foreground">Score: {result.integrityScore}/100</p>
                </div>
              </div>
              {result.cheatingEvents.length > 0 && (
                <div className="mt-4 space-y-1">
                  {[
                    { type: "tab_switch", label: "Tab switches", penalty: "-10 each" },
                    { type: "multiple_faces", label: "Multiple faces", penalty: "-20 each" },
                    { type: "face_missing", label: "Face missing", penalty: "-5 each" },
                  ].map(({ type, label, penalty }) => {
                    const count = result.cheatingEvents.filter((e) => e.type === type).length;
                    if (count === 0) return null;
                    return (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="text-destructive">{count}x ({penalty})</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Weak Topics */}
            {result.weakTopics.length > 0 && (
              <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-warning" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Weak Areas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.weakTopics.map((topic) => (
                    <span key={topic} className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-1 text-sm text-warning">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Suggestions</h3>
                </div>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Question Review */}
            <div className="glass-card p-6 mb-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Answer Review</h3>
              <div className="space-y-3">
                {result.questions.map((q, i) => {
                  const isCorrect = result.answers[i] === q.answer;
                  return (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      {isCorrect ? (
                        <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                      )}
                      <div>
                        <p className="text-foreground">{q.question}</p>
                        {!isCorrect && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Your answer: <span className="text-destructive">{result.answers[i] || "Not answered"}</span>
                            {" • "}Correct: <span className="text-success">{q.answer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => navigate("/")} variant="outline" className="flex-1 border-border text-foreground hover:bg-secondary gap-2">
                <ArrowLeft className="h-4 w-4" /> Back Home
              </Button>
              <Button onClick={() => navigate("/test")} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold">
                <Brain className="h-4 w-4" /> Try Again
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
