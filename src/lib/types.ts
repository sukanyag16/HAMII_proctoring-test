export interface MCQQuestion {
  question: string;
  options: string[];
  answer: string;
  topic: string;
}

export interface CheatingEvent {
  type: "tab_switch" | "face_missing" | "multiple_faces" | "looking_away";
  timestamp: number;
}

export interface BehavioralMetrics {
  eyeContactScore: number; // percentage of time with eye contact
  totalFrames: number;
  eyeContactFrames: number;
  lookingAwayEvents: number;
  faceMissingEvents: number;
  multipleFaceEvents: number;
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
  behavioralMetrics?: BehavioralMetrics;
}
