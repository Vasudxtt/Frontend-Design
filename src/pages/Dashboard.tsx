import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, MoreVertical, Clock, BookOpen, BarChart3, Trash2, Edit3, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { getTests, deleteTest } from '../api/tests';
import { useTestStore } from '../store/testStore';
import type { Test, DifficultyLevel, TestStatus } from '../types';

const difficultyConfig: Record<DifficultyLevel, { label: string; variant: 'success' | 'warning' | 'error' }> = {
  EASY: { label: 'Easy', variant: 'success' },
  MEDIUM: { label: 'Medium', variant: 'warning' },
  DIFFICULT: { label: 'Difficult', variant: 'error' },
};

const statusConfig: Record<TestStatus, { label: string; variant: 'success' | 'info' | 'gray' | 'purple' }> = {
  PUBLISHED: { label: 'Published', variant: 'success' },
  DRAFT: { label: 'Draft', variant: 'gray' },
  SCHEDULED: { label: 'Scheduled', variant: 'purple' },
  ARCHIVED: { label: 'Archived', variant: 'info' },
};

const typeLabels: Record<string, string> = {
  CHAPTERWISE: 'Chapter Wise',
  PYQ: 'PYQ',
  MOCK_TEST: 'Mock Test',
};

// Mock data for when API is unavailable
const mockTests: Test[] = [
  {
    id: '1',
    name: 'Chapter 1 – Grammar Basics',
    type: 'CHAPTERWISE',
    subject: 'English',
    subjectId: 's1',
    topic: ['Grammar', 'Writing'],
    topicIds: ['t1', 't2'],
    subTopic: ['Application'],
    subTopicIds: ['st1'],
    duration: 60,
    difficulty: 'EASY',
    markingScheme: { correct: 5, wrong: -1, unattempted: 0 },
    totalQuestions: 50,
    totalMarks: 250,
    status: 'PUBLISHED',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Physics PYQ – 2023',
    type: 'PYQ',
    subject: 'Physics',
    subjectId: 's2',
    topic: ['Mechanics', 'Optics'],
    topicIds: ['t3', 't4'],
    subTopic: [],
    subTopicIds: [],
    duration: 180,
    difficulty: 'DIFFICULT',
    markingScheme: { correct: 4, wrong: -1, unattempted: 0 },
    totalQuestions: 90,
    totalMarks: 360,
    status: 'PUBLISHED',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '3',
    name: 'Math Full Mock Test',
    type: 'MOCK_TEST',
    subject: 'Mathematics',
    subjectId: 's3',
    topic: ['Algebra', 'Calculus'],
    topicIds: ['t5', 't6'],
    subTopic: [],
    subTopicIds: [],
    duration: 120,
    difficulty: 'MEDIUM',
    markingScheme: { correct: 4, wrong: -1, unattempted: 0 },
    totalQuestions: 60,
    totalMarks: 240,
    status: 'DRAFT',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z',
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { reset } = useTestStore();
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: tests = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['tests'],
    queryFn: getTests,
    placeholderData: mockTests,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast.success('Test deleted successfully');
    },
    onError: () => toast.error('Failed to delete test'),
  });

  const displayed = isError ? mockTests : tests;
  const filtered = displayed.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    reset();
    navigate('/tests/create');
  };

  const stats = {
    total: displayed.length,
    published: displayed.filter((t) => t.status === 'PUBLISHED').length,
    draft: displayed.filter((t) => t.status === 'DRAFT').length,
    totalQuestions: displayed.reduce((a, t) => a + t.totalQuestions, 0),
  };

  return (
    <Layout breadcrumbs={[{ label: 'Dashboard' }]}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tests', value: stats.total, icon: BookOpen, color: 'text-primary-600 bg-primary-50' },
          { label: 'Published', value: stats.published, icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Drafts', value: stats.draft, icon: Edit3, color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Questions', value: stats.totalQuestions, icon: Clock, color: 'text-blue-600 bg-blue-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 shrink-0">All Tests</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-48 sm:w-64"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
            <Filter size={14} /> Filter
          </Button>
          <Button size="sm" onClick={handleCreate} className="gap-1.5">
            <Plus size={14} /> Create Test
          </Button>
        </div>
      </div>

      {/* TC-DASH-004: API error banner with retry */}
      {isError && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-4">
          <div className="flex items-center gap-2 text-amber-700 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Unable to fetch tests from server. Showing cached data.
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-sm text-amber-700 font-medium underline hover:no-underline disabled:opacity-50"
          >
            {isFetching ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      )}

      {isLoading ? (
        /* TC-DASH-003: Loading skeleton */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 animate-pulse">
              <div className="flex-1 h-4 bg-gray-200 rounded" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
              <div className="w-20 h-4 bg-gray-200 rounded" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Test Name', 'Type', 'Subject', 'Questions', 'Duration', 'Difficulty', 'Status', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No tests found</p>
                    <p className="text-sm mt-1">Create your first test to get started</p>
                  </td>
                </tr>
              ) : (
                filtered.map((test) => (
                  <tr
                    key={test.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/tests/${test.id}/questions`)}
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{test.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(test.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="dark" className="text-xs">
                        {typeLabels[test.type] ?? test.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{test.subject}</td>
                    <td className="px-4 py-4 text-gray-600">{test.totalQuestions} Q's</td>
                    <td className="px-4 py-4 text-gray-600">{test.duration} min</td>
                    <td className="px-4 py-4">
                      <Badge variant={difficultyConfig[test.difficulty]?.variant ?? 'gray'}>
                        {difficultyConfig[test.difficulty]?.label ?? test.difficulty}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusConfig[test.status]?.variant ?? 'gray'}>
                        {statusConfig[test.status]?.label ?? test.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === test.id ? null : test.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === test.id && (
                          <div className="absolute right-0 top-9 bg-white shadow-lg border border-gray-200 rounded-xl py-1 w-44 z-10">
                            <button
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => {
                                setOpenMenu(null);
                                navigate(`/tests/${test.id}/questions`);
                              }}
                            >
                              <Eye size={14} /> View Questions
                            </button>
                            <button
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => {
                                setOpenMenu(null);
                                navigate(`/tests/${test.id}/edit`);
                              }}
                            >
                              <Edit3 size={14} /> Edit Test
                            </button>
                            <button
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setOpenMenu(null);
                                if (confirm('Delete this test?')) deleteMutation.mutate(test.id);
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
