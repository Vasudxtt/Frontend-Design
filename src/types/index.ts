export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type TestType = 'CHAPTERWISE' | 'PYQ' | 'MOCK_TEST';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'DIFFICULT';
export type TestStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

export interface MarkingScheme {
  correct: number;
  wrong: number;
  unattempted: number;
}

export interface Test {
  id: string;
  name: string;
  type: TestType;
  subject: string;
  subjectId: string;
  topic: string[];
  topicIds: string[];
  subTopic: string[];
  subTopicIds: string[];
  duration: number;
  difficulty: DifficultyLevel;
  markingScheme: MarkingScheme;
  totalQuestions: number;
  totalMarks: number;
  status: TestStatus;
  publishedAt?: string;
  scheduledAt?: string;
  liveUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestPayload {
  name: string;
  type: TestType;
  subjectId: string;
  topicIds: string[];
  subTopicIds: string[];
  duration: number;
  difficulty: DifficultyLevel;
  markingScheme: MarkingScheme;
  totalQuestions: number;
}

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  testId: string;
  questionNumber: number;
  content: string;
  options: MCQOption[];
  solution: string;
  difficulty: DifficultyLevel;
  topicId?: string;
  subTopicId?: string;
  createdAt: string;
}

export interface CreateQuestionPayload {
  content: string;
  options: { text: string; isCorrect: boolean }[];
  solution: string;
  difficulty: DifficultyLevel;
  topicId?: string;
  subTopicId?: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
}

export interface SubTopic {
  id: string;
  name: string;
  topicId: string;
}

export interface PublishPayload {
  publishNow: boolean;
  scheduledAt?: string;
  liveUntil?: string | null;
  liveUntilDuration?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
