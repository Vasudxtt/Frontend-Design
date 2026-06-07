import { create } from 'zustand';
import type { Test, Question, CreateTestPayload } from '../types';

interface TestStore {
  currentTest: Test | null;
  currentTestPayload: Partial<CreateTestPayload> | null;
  questions: Question[];
  currentQuestionIndex: number;

  setCurrentTest: (test: Test | null) => void;
  setCurrentTestPayload: (payload: Partial<CreateTestPayload> | null) => void;
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, question: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  reset: () => void;
}

export const useTestStore = create<TestStore>((set) => ({
  currentTest: null,
  currentTestPayload: null,
  questions: [],
  currentQuestionIndex: 0,

  setCurrentTest: (test) => set({ currentTest: test }),
  setCurrentTestPayload: (payload) => set({ currentTestPayload: payload }),
  setQuestions: (questions) => set({ questions }),
  addQuestion: (question) => set((s) => ({ questions: [...s.questions, question] })),
  updateQuestion: (id, updated) =>
    set((s) => ({
      questions: s.questions.map((q) => (q.id === id ? { ...q, ...updated } : q)),
    })),
  removeQuestion: (id) =>
    set((s) => ({ questions: s.questions.filter((q) => q.id !== id) })),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  reset: () =>
    set({ currentTest: null, currentTestPayload: null, questions: [], currentQuestionIndex: 0 }),
}));
