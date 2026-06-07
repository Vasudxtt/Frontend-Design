import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Clock, Users, TrendingUp } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { getTests } from '../api/tests';
import type { Test } from '../types';

const mockTests: Test[] = [
  {
    id: '1', name: 'Chapter 1 – Grammar Basics', type: 'CHAPTERWISE',
    subject: 'English', subjectId: 's1', topic: ['Grammar'], topicIds: ['t1'],
    subTopic: ['Application'], subTopicIds: ['st1'], duration: 60, difficulty: 'EASY',
    markingScheme: { correct: 5, wrong: -1, unattempted: 0 }, totalQuestions: 50,
    totalMarks: 250, status: 'PUBLISHED', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2', name: 'Physics PYQ – 2023', type: 'PYQ',
    subject: 'Physics', subjectId: 's2', topic: ['Mechanics'], topicIds: ['t3'],
    subTopic: [], subTopicIds: [], duration: 180, difficulty: 'DIFFICULT',
    markingScheme: { correct: 4, wrong: -1, unattempted: 0 }, totalQuestions: 90,
    totalMarks: 360, status: 'PUBLISHED', createdAt: '2024-01-20T09:00:00Z', updatedAt: '2024-01-20T09:00:00Z',
  },
];

const mockStats = [
  { testId: '1', attempts: 234, avgScore: 187, passRate: 72, avgTime: 48 },
  { testId: '2', attempts: 156, avgScore: 241, passRate: 58, avgTime: 162 },
];

export function TestTrackingPage() {
  const { data: tests = [], isLoading, isError } = useQuery({
    queryKey: ['tests'],
    queryFn: getTests,
    placeholderData: mockTests,
  });

  const displayed = isError ? mockTests : tests;

  return (
    <Layout breadcrumbs={[{ label: 'Test Tracking' }]}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Test Performance Tracking</h2>
        <p className="text-sm text-gray-500">Monitor student performance across all published tests.</p>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <div className="flex flex-col gap-4">
          {displayed
            .filter((t) => t.status === 'PUBLISHED')
            .map((test) => {
              const stats = mockStats.find((s) => s.testId === test.id) ?? {
                attempts: Math.floor(Math.random() * 300) + 50,
                avgScore: Math.floor(test.totalMarks * 0.65),
                passRate: Math.floor(Math.random() * 40) + 50,
                avgTime: Math.floor(test.duration * 0.8),
              };
              const passPercent = stats.passRate;
              return (
                <div key={test.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{test.subject} · {test.totalQuestions} Questions · {test.duration} min</p>
                    </div>
                    <Badge variant="success">Published</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Total Attempts', value: stats.attempts, icon: Users, color: 'text-blue-600 bg-blue-50' },
                      { label: 'Avg Score', value: `${stats.avgScore}/${test.totalMarks}`, icon: TrendingUp, color: 'text-primary-600 bg-primary-50' },
                      { label: 'Pass Rate', value: `${passPercent}%`, icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
                      { label: 'Avg Time', value: `${stats.avgTime} min`, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">{value}</p>
                          <p className="text-xs text-gray-500">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Pass rate bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Pass rate</span>
                      <span>{passPercent}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${passPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </Layout>
  );
}
