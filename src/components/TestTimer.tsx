import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TestTimerProps {
  durationMinutes: number;
  isActive: boolean;
  onTimeUp: () => void;
}

const TestTimer = ({ durationMinutes, isActive, onTimeUp }: TestTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (!isActive) return;
    setSecondsLeft(durationMinutes * 60);
  }, [isActive, durationMinutes]);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isLow = secondsLeft < 120;

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-display text-lg font-bold ${
      isLow ? "border-destructive/50 text-destructive bg-destructive/10" : "border-border bg-card text-foreground"
    }`}>
      <Clock className="h-4 w-4" />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
};

export default TestTimer;
