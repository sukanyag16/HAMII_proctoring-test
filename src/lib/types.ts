export interface MCQQuestion {
  question: string;
  options: string[];
  answer: string;
  topic: string;
}

export interface CheatingEvent {
  type: "tab_switch" | "face_missing" | "multiple_faces";
  timestamp: number;
}

export interface TopicResult {
  correct: number;
  total: number;
  accuracy: number;
}

export interface TestResult {
  score: number;
  total: number;
  integrityScore: number;
  integrityStatus: "Passed" | "Suspicious";
  weakTopics: string[];
  suggestions: string[];
  answers: Record<number, string>;
  questions: MCQQuestion[];
  cheatingEvents: CheatingEvent[];
  topicResults: Record<string, TopicResult>;
}
