import { api } from './axios';
import type { Question, CreateQuestionPayload } from '../types';

export async function getQuestions(testId: string): Promise<Question[]> {
  const { data } = await api.get(`/tests/${testId}/questions`);
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function createQuestion(testId: string, payload: CreateQuestionPayload): Promise<Question> {
  const { data } = await api.post(`/tests/${testId}/questions`, payload);
  return data.data ?? data;
}

export async function updateQuestion(
  testId: string,
  questionId: string,
  payload: Partial<CreateQuestionPayload>
): Promise<Question> {
  const { data } = await api.put(`/tests/${testId}/questions/${questionId}`, payload);
  return data.data ?? data;
}

export async function deleteQuestion(testId: string, questionId: string): Promise<void> {
  await api.delete(`/tests/${testId}/questions/${questionId}`);
}

export async function bulkImportQuestions(testId: string, file: File): Promise<Question[]> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post(`/tests/${testId}/questions/bulk`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return Array.isArray(data) ? data : data.data ?? [];
}
