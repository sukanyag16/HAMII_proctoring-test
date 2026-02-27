import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const stats = [
  { value: "95%+", label: "Face Detection Accuracy" },
  { value: "<100ms", label: "Detection Latency" },
  { value: "15", label: "Dynamic MCQs" },
  { value: "$0", label: "Cost to Start" },
];

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-2 text-sm text-muted-foreground">
          <span className="text-primary">✦</span>
          AI-Powered Proctored MCQ Round
        </div>

        <h1 className="section-title !text-5xl md:!text-7xl max-w-4xl leading-tight">
          Ace Your MCQ Round{" "}
          <span className="text-primary italic">with AI</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Practice proctored MCQ rounds with AI-generated questions, real-time face detection via BlazeFace, tab-switch monitoring, and detailed performance analytics — all powered by Gemini AI.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/test">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 font-semibold text-base">
              <Play className="h-4 w-4" />
              Start MCQ Round
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#algorithms">
            <Button size="lg" variant="outline" className="gap-2 border-border text-foreground hover:bg-secondary px-8 font-semibold text-base">
              <BookOpen className="h-4 w-4" />
              How It Works
            </Button>
          </a>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-16">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="stat-value">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
