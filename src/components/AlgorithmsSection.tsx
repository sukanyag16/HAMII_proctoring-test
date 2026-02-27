import { motion } from "framer-motion";
import { Brain, Eye, Shield, BarChart3, Cpu, Network, MonitorOff, Scan } from "lucide-react";

const algorithms = [
  {
    category: "Question Generation",
    icon: Brain,
    items: [
      { title: "Gemini LLM", desc: "Dynamic MCQ generation using Google's Gemini API for unique questions every session" },
      { title: "Prompt Engineering", desc: "Topic-controlled prompts covering Data Structures, DBMS, OS, Networking & Programming" },
      { title: "JSON Schema Validation", desc: "Structured output parsing ensures consistent question format with options and answers" },
    ],
  },
  {
    category: "Proctoring",
    icon: Eye,
    items: [
      { title: "BlazeFace (MediaPipe)", desc: "Real-time face detection using lightweight neural network optimized for mobile & web" },
      { title: "Bounding Box Tracking", desc: "Facial landmark-based bounding box drawn on canvas overlay for visual feedback" },
      { title: "Tab Switching Detection", desc: "Browser Visibility API monitors focus changes and flags suspicious tab switches" },
      { title: "Multi-Face Detection", desc: "Alert system triggers when more than one face is detected in the webcam feed" },
    ],
  },
  {
    category: "Evaluation",
    icon: BarChart3,
    items: [
      { title: "Rule-Based Scoring", desc: "Integrity score calculated: -20 for multiple faces, -10 for tab switch, -5 for face missing" },
      { title: "Topic Weakness Detection", desc: "Incorrect answers are grouped by topic to identify knowledge gaps" },
      { title: "Adaptive Suggestions", desc: "AI-generated improvement recommendations based on weak areas identified" },
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
            Deep dive into the AI pipeline that powers your interview coaching experience
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {algorithms.map((algo, i) => (
            <motion.div
              key={algo.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <algo.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">{algo.category}</h3>
              </div>
              <div className="space-y-4">
                {algo.items.map((item) => (
                  <div key={item.title} className="border-l-2 border-primary/20 pl-4">
                    <h4 className="font-display text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
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
