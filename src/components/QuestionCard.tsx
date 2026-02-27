import { MCQQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: MCQQuestion;
  index: number;
  selectedAnswer: string | undefined;
  onSelect: (answer: string) => void;
}

const optionLabels = ["A", "B", "C", "D"];

const QuestionCard = ({ question, index, selectedAnswer, onSelect }: QuestionCardProps) => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-bold text-primary">
          {index + 1}
        </span>
        <div>
          <span className="text-xs font-medium text-primary/70 uppercase tracking-wider">{question.topic}</span>
          <h3 className="font-display text-base font-medium text-foreground mt-1">{question.question}</h3>
        </div>
      </div>
      <div className="grid gap-2 ml-11">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => onSelect(option)}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200",
              selectedAnswer === option
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:bg-secondary/60"
            )}
          >
            <span className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
              selectedAnswer === option
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {optionLabels[i]}
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
