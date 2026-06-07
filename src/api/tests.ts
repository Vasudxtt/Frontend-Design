import { api } from './axios';
import type { Test, CreateTestPayload, PublishPayload, Subject, Topic, SubTopic } from '../types';

export async function getTests(): Promise<Test[]> {
  const { data } = await api.get('/tests');
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function getTest(id: string): Promise<Test> {
  const { data } = await api.get(`/tests/${id}`);
  return data.data ?? data;
}

export async function createTest(payload: CreateTestPayload): Promise<Test> {
  const { data } = await api.post('/tests', payload);
  return data.data ?? data;
}

export async function updateTest(id: string, payload: Partial<CreateTestPayload>): Promise<Test> {
  const { data } = await api.put(`/tests/${id}`, payload);
  return data.data ?? data;
}

export async function deleteTest(id: string): Promise<void> {
  await api.delete(`/tests/${id}`);
}

export async function publishTest(id: string, payload: PublishPayload): Promise<Test> {
  const { data } = await api.post(`/tests/${id}/publish`, payload);
  return data.data ?? data;
}

export async function getSubjects(): Promise<Subject[]> {
  const { data } = await api.get('/subjects');
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function getTopics(subjectId: string): Promise<Topic[]> {
  const { data } = await api.get('/topics', { params: { subjectId } });
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function getSubTopics(topicId: string): Promise<SubTopic[]> {
  const { data } = await api.get('/subtopics', { params: { topicId } });
  return Array.isArray(data) ? data : data.data ?? [];
}
