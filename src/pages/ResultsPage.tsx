import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { TestResult } from "@/lib/types";
import { motion } from "framer-motion";
import {
  CheckCircle, XCircle, Shield, Brain, ArrowLeft,
  BarChart3, Lightbulb, Download, TrendingUp, Target, AlertTriangle, Eye, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TOPIC_COLORS: Record<string, string> = {
  Java: "hsl(166, 72%, 52%)",
  Python: "hsl(38, 92%, 50%)",
  DBMS: "hsl(260, 60%, 60%)",
  OS: "hsl(200, 70%, 55%)",
  DSA: "hsl(340, 65%, 55%)",
};

const PIE_COLORS = ["hsl(142, 72%, 45%)", "hsl(0, 72%, 55%)"];

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as any)?.result as TestResult | undefined;

  if (!result) return <Navigate to="/" replace />;

  const percentage = Math.round((result.score / result.total) * 100);
  const incorrect = result.total - result.score;

  const topicData = Object.entries(result.topicResults).map(([topic, r]) => ({
    topic,
    accuracy: r.accuracy,
    correct: r.correct,
    total: r.total,
    fill: TOPIC_COLORS[topic] || "hsl(166, 72%, 52%)",
  }));

  const pieData = [
    { name: "Correct", value: result.score },
    { name: "Incorrect", value: incorrect },
  ];

  const strongTopics = Object.entries(result.topicResults)
    .filter(([, r]) => r.accuracy >= 50)
    .map(([t]) => t);

  const summary = generateSummary(result, percentage, strongTopics);
  const behavioralFeedback = generateBehavioralFeedback(result);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(20, 24, 33);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("HAMII — Performance Report", 14, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`, 14, 32);

    let y = 52;
    const addSection = (title: string) => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setTextColor(40);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
    };

    // 1. Candidate Performance Summary
    addSection("1. Candidate Performance Summary");
    const summaryLines = doc.splitTextToSize(summary, pageWidth - 28);
    doc.text(summaryLines, 14, y);
    y += summaryLines.length * 5 + 8;

    // 2. Score and Accuracy
    addSection("2. Score and Accuracy");
    doc.text(`Score: ${result.score} / ${result.total}`, 18, y); y += 6;
    doc.text(`Accuracy: ${percentage}%`, 18, y); y += 6;
    doc.text(`Correct Answers: ${result.score}  |  Incorrect Answers: ${incorrect}`, 18, y); y += 10;

    // 3. Integrity Analysis
    addSection("3. Integrity Analysis");
    doc.text(`Integrity Score: ${result.integrityScore}/100 — ${result.integrityStatus}`, 18, y); y += 6;
    if (result.behavioralMetrics) {
      doc.text(`Eye Contact Score: ${result.behavioralMetrics.eyeContactScore}%`, 18, y); y += 6;
    }
    const tabSwitches = result.cheatingEvents.filter((e) => e.type === "tab_switch").length;
    const multiFaces = result.cheatingEvents.filter((e) => e.type === "multiple_faces").length;
    const faceMissing = result.cheatingEvents.filter((e) => e.type === "face_missing").length;
    const lookingAway = result.cheatingEvents.filter((e) => e.type === "looking_away").length;
    if (tabSwitches > 0) { doc.text(`• Tab Switches: ${tabSwitches} (-5 each)`, 22, y); y += 6; }
    if (multiFaces > 0) { doc.text(`• Multiple Faces: ${multiFaces} (-10 each)`, 22, y); y += 6; }
    if (faceMissing > 0) { doc.text(`• Face Missing: ${faceMissing} (-5 each)`, 22, y); y += 6; }
    if (lookingAway > 0) { doc.text(`• Looking Away: ${lookingAway} (-5 each)`, 22, y); y += 6; }
    const phoneEvents = result.cheatingEvents.filter((e) => e.type === "phone_detected").length;
    if (phoneEvents > 0) { doc.text(`• Phone Detected: ${phoneEvents} (-10 each)`, 22, y); y += 6; }
    y += 4;

    // 4. Topic-wise Performance
    addSection("4. Topic-wise Performance");
    autoTable(doc, {
      startY: y,
      head: [["Topic", "Correct", "Total", "Accuracy", "Status"]],
      body: topicData.map((t) => [
        t.topic, String(t.correct), String(t.total), `${t.accuracy}%`,
        t.accuracy >= 50 ? "✓ Strong" : "✗ Weak",
      ]),
      theme: "grid",
      headStyles: { fillColor: [30, 40, 55], textColor: 255 },
      styles: { fontSize: 10 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // 5. Weak Areas
    if (result.weakTopics.length > 0) {
      addSection("5. Weak Areas");
      result.weakTopics.forEach((topic) => {
        doc.text(`• ${topic}`, 22, y); y += 6;
      });
      y += 4;
    }

    // 6. Improvement Suggestions
    if (result.suggestions.length > 0) {
      addSection("6. Improvement Suggestions");
      result.suggestions.forEach((s) => {
        const lines = doc.splitTextToSize(`• ${s}`, pageWidth - 36);
        if (y + lines.length * 5 > 270) { doc.addPage(); y = 20; }
        doc.text(lines, 22, y);
        y += lines.length * 5 + 2;
      });
      y += 4;
    }

    // 7. Behavioral Feedback
    if (behavioralFeedback.length > 0) {
      addSection("7. Behavioral Feedback");
      behavioralFeedback.forEach((s) => {
        const lines = doc.splitTextToSize(`• ${s}`, pageWidth - 36);
        if (y + lines.length * 5 > 270) { doc.addPage(); y = 20; }
        doc.text(lines, 22, y);
        y += lines.length * 5 + 2;
      });
    }

    doc.save("HAMII_Performance_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* Score Hero */}
            <div className="glass-card p-8 text-center mb-6">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Performance Report</h1>
              <div className="grid grid-cols-3 gap-6 mt-6">
                <div>
                  <div className="stat-value">{result.score}/{result.total}</div>
                  <p className="text-muted-foreground text-sm mt-1">Total Score</p>
                </div>
                <div>
                  <div className="stat-value">{percentage}%</div>
                  <p className="text-muted-foreground text-sm mt-1">Accuracy</p>
                </div>
                <div>
                  <div className="stat-value">{result.integrityScore}</div>
                  <p className="text-muted-foreground text-sm mt-1">Integrity</p>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Topic-wise Accuracy</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topicData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="topic" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 12 }} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(220, 18%, 10%)",
                        border: "1px solid hsl(220, 14%, 18%)",
                        borderRadius: "8px",
                        color: "hsl(210, 20%, 92%)",
                      }}
                      formatter={(value: number) => [`${value}%`, "Accuracy"]}
                    />
                    <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                      {topicData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Correct vs Incorrect</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
                    <Legend formatter={(value) => <span style={{ color: "hsl(210, 20%, 92%)" }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Integrity Progress */}
            <div className={`glass-card p-6 mb-6 ${result.integrityStatus === "Passed" ? "glow-border" : "border-destructive/30"}`}>
              <div className="flex items-center gap-3 mb-4">
                <Shield className={`h-6 w-6 ${result.integrityStatus === "Passed" ? "text-success" : "text-destructive"}`} />
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Integrity: {result.integrityStatus}
                  </h3>
                  <p className="text-sm text-muted-foreground">Score: {result.integrityScore}/100</p>
                </div>
              </div>
              <Progress value={result.integrityScore} className="h-3" />
              {result.cheatingEvents.length > 0 && (
                <div className="mt-4 space-y-1">
                  {[
                    { type: "tab_switch" as const, label: "Tab switches", penalty: "-5 each" },
                    { type: "multiple_faces" as const, label: "Multiple faces", penalty: "-10 each" },
                    { type: "face_missing" as const, label: "Face missing", penalty: "-5 each" },
                    { type: "looking_away" as const, label: "Looking away", penalty: "-5 each" },
                    { type: "phone_detected" as const, label: "Phone detected", penalty: "-10 each" },
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
              {result.behavioralMetrics && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Eye Contact Score</span>
                    <span className={`ml-auto text-sm font-semibold ${result.behavioralMetrics.eyeContactScore >= 60 ? "text-success" : "text-destructive"}`}>
                      {result.behavioralMetrics.eyeContactScore}%
                    </span>
                  </div>
                  <Progress value={result.behavioralMetrics.eyeContactScore} className="h-2" />
                </div>
              )}
            </div>

            {/* Topic-wise Breakdown */}
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">Topic-wise Breakdown</h3>
              </div>
              <div className="space-y-4">
                {topicData.map((t) => (
                  <div key={t.topic}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{t.topic}</span>
                      <span className={`text-sm font-semibold ${t.accuracy >= 50 ? "text-success" : "text-destructive"}`}>
                        {t.correct}/{t.total} ({t.accuracy}%)
                      </span>
                    </div>
                    <Progress value={t.accuracy} className="h-2" />
                    {t.accuracy < 50 && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Needs improvement
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">Performance Summary</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
            </div>

            {/* Weak Areas & Suggestions */}
            {(result.weakTopics.length > 0 || result.suggestions.length > 0) && (
              <div className="glass-card p-6 mb-6">
                {result.weakTopics.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <h3 className="font-display text-lg font-semibold text-foreground">Weak Areas</h3>
                    </div>
                    <ul className="space-y-1 ml-2">
                      {result.weakTopics.map((t, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-destructive">
                          <span>•</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.suggestions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5 text-warning" />
                      <h3 className="font-display text-lg font-semibold text-foreground">Improvement Suggestions</h3>
                    </div>
                    <ul className="space-y-2 ml-2">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Behavioral Feedback */}
            {behavioralFeedback.length > 0 && (
              <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Behavioral Feedback</h3>
                </div>
                <ul className="space-y-2 ml-2">
                  {behavioralFeedback.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Answer Review */}
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
                        <p className="text-foreground">
                          <span className="text-muted-foreground">[{q.topic}]</span> {q.question}
                        </p>
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

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button onClick={() => navigate("/")} variant="outline" className="flex-1 border-border text-foreground hover:bg-secondary gap-2">
                <ArrowLeft className="h-4 w-4" /> Back Home
              </Button>
              <Button onClick={downloadPDF} variant="outline" className="flex-1 border-primary/30 text-primary hover:bg-primary/10 gap-2">
                <Download className="h-4 w-4" /> Download Report
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

function generateSummary(result: TestResult, percentage: number, strongTopics: string[]): string {
  const { weakTopics, integrityStatus, integrityScore } = result;

  let performance: string;
  if (percentage >= 80) performance = "excellent";
  else if (percentage >= 60) performance = "good";
  else if (percentage >= 40) performance = "average";
  else performance = "below average";

  let summary = `You scored ${result.score} out of ${result.total} (${percentage}%), which is ${performance} performance. `;

  if (strongTopics.length > 0) {
    summary += `You performed well in ${strongTopics.join(", ")}. `;
  }

  if (weakTopics.length > 0) {
    summary += `However, you need improvement in ${weakTopics.join(" and ")}. `;
  }

  if (integrityStatus === "Passed") {
    summary += `Your integrity score of ${integrityScore}/100 indicates fair and honest test behavior.`;
  } else {
    summary += `Your integrity score of ${integrityScore}/100 indicates suspicious activity was detected during the test. Please ensure a distraction-free environment in future attempts.`;
  }

  return summary;
}

function generateBehavioralFeedback(result: TestResult): string[] {
  const feedback: string[] = [];
  const metrics = result.behavioralMetrics;

  if (metrics) {
    if (metrics.eyeContactScore < 60) {
      feedback.push("Maintain consistent eye contact with the camera during the assessment");
      feedback.push("Avoid frequently looking away from the screen during questions");
    } else if (metrics.eyeContactScore < 80) {
      feedback.push("Your eye contact was adequate but could be improved — try to focus on the screen consistently");
    }

    if (metrics.lookingAwayEvents > 2) {
      feedback.push("Reduce head movements and stay focused on the screen");
    }

    if (metrics.faceMissingEvents > 1) {
      feedback.push("Ensure your face is clearly visible to the camera throughout the test");
      feedback.push("Position yourself properly in front of the webcam before starting");
    }
  }

  if (result.integrityScore < 80) {
    feedback.push("Avoid switching tabs during the assessment");
    feedback.push("Stay focused on the test screen throughout the duration");
  }

  if (result.cheatingEvents.filter(e => e.type === "multiple_faces").length > 0) {
    feedback.push("Ensure you are alone in the room during the assessment");
  }

  return feedback;
}

export default ResultsPage;
