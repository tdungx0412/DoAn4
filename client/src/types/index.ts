export interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  examCount?: number;
}

export interface Option {
  id?: string;
  content: string;
  isCorrect?: boolean;
  orderIndex?: number;
}

export interface Question {
  id?: string;
  content: string;
  explanation?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  orderIndex?: number;
  imageUrl?: string;
  audioUrl?: string;
  options: Option[];
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  subjectId: string;
  subject?: Subject;
  creatorName: string;
  durationMinutes: number;
  accessCode?: string;
  isPublic: boolean;
  viewCount: number;
  attemptCount: number;
  totalQuestions?: number;
  questions?: Question[];
  createdAt: string;
}

export interface AttemptAnswer {
  id?: string;
  questionId: string;
  selectedOptionId?: string | null;
  isCorrect?: boolean;
  question?: Question;
  selectedOption?: Option;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentName: string;
  studentEmail?: string;
  durationSeconds: number;
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT';
  tabSwitchCount: number;
  submittedAt?: string;
  exam?: Exam;
  answers?: AttemptAnswer[];
}
