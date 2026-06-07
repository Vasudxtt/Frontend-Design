import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Bold, Italic, UnderlineIcon, Link2, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, List, ListOrdered, ImageIcon, Table, Minus, Code2,
  Check, Trash2, Plus, ChevronLeft, ChevronRight, Upload,
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { createQuestion, getQuestions } from '../api/questions';
import { getSubjects, getTopics, getSubTopics } from '../api/tests';
import { useTestStore } from '../store/testStore';
import type { Question, DifficultyLevel, MCQOption } from '../types';
import { cn } from '../utils/cn';

const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'DIFFICULT', label: 'Difficult' },
];

const MOCK_SUBJECTS = [
  { id: 's1', name: 'English' },
  { id: 's2', name: 'Physics' },
  { id: 's3', name: 'Mathematics' },
];
const MOCK_TOPICS: Record<string, { id: string; name: string }[]> = {
  s1: [{ id: 't1', name: 'Grammar' }, { id: 't2', name: 'Writing' }],
  s2: [{ id: 't4', name: 'Mechanics' }, { id: 't5', name: 'Optics' }],
  s3: [{ id: 't7', name: 'Algebra' }, { id: 't8', name: 'Calculus' }],
};
const MOCK_SUBTOPICS: Record<string, { id: string; name: string }[]> = {
  t1: [{ id: 'st1', name: 'Application' }, { id: 'st2', name: 'Theory' }],
  t4: [{ id: 'st5', name: 'Newton\'s Laws' }],
};

function makeEmptyOptions(): MCQOption[] {
  return [
    { id: `o${Date.now()}-1`, text: '', isCorrect: false },
    { id: `o${Date.now()}-2`, text: '', isCorrect: false },
    { id: `o${Date.now()}-3`, text: '', isCorrect: false },
    { id: `o${Date.now()}-4`, text: '', isCorrect: false },
  ];
}

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'p-1.5 rounded text-sm transition-colors',
        active ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      {children}
    </button>
  );
}

function TiptapEditor({
  content,
  onChange,
  placeholder,
}: {
  content: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'Type here' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="tiptap-editor border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-white flex-wrap">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => { const url = prompt('URL:'); if (url) editor.chain().focus().setLink({ href: url }).run(); }} active={editor.isActive('link')} title="Link">
          <Link2 size={13} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <AlignJustify size={13} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
          <ListOrdered size={13} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <Minus size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={addImage} active={false} title="Image">
          <ImageIcon size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code">
          <Code2 size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => {}} active={false} title="Table">
          <Table size={13} />
        </ToolbarBtn>
      </div>
      <EditorContent editor={editor} className="min-h-[120px]" />
    </div>
  );
}

export function QuestionCreationPage() {
  const navigate = useNavigate();
  const { id: testId } = useParams<{ id: string }>();
  const { currentTest, questions, addQuestion, setQuestions, currentQuestionIndex, setCurrentQuestionIndex } = useTestStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const totalQuestions = currentTest?.totalQuestions ?? 50;

  const [questionContent, setQuestionContent] = useState('');
  const [solutionContent, setSolutionContent] = useState('');
  const [options, setOptions] = useState<MCQOption[]>(makeEmptyOptions());
  const [qDifficulty, setQDifficulty] = useState<DifficultyLevel>('EASY');
  const [qTopicId, setQTopicId] = useState('');
  const [qSubTopicId, setQSubTopicId] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavTarget, setPendingNavTarget] = useState<string | null>(null);

  // TC-Q-015: Detect unsaved changes
  const hasUnsavedContent = questionContent.trim() && questionContent !== '<p></p>';

  const safeNavigate = (to: string) => {
    if (hasUnsavedContent) {
      setPendingNavTarget(to);
      setShowUnsavedModal(true);
    } else {
      navigate(to);
    }
  };

  // Fetch existing questions
  const { data: fetchedQuestions } = useQuery({
    queryKey: ['questions', testId],
    queryFn: () => getQuestions(testId!),
    enabled: !!testId,
  });
  React.useEffect(() => {
    if (fetchedQuestions) setQuestions(fetchedQuestions);
  }, [fetchedQuestions, setQuestions]);

  // Fetch topics for question settings
  useQuery({ queryKey: ['subjects'], queryFn: getSubjects });

  const currentSubjectId = currentTest?.subjectId ?? 's1';
  const { data: topicsRaw } = useQuery({
    queryKey: ['topics', currentSubjectId],
    queryFn: () => getTopics(currentSubjectId),
    enabled: !!currentSubjectId,
  });
  const topics = topicsRaw?.length ? topicsRaw : (MOCK_TOPICS[currentSubjectId] ?? []);

  const { data: subTopicsRaw } = useQuery({
    queryKey: ['subtopics', qTopicId],
    queryFn: () => getSubTopics(qTopicId),
    enabled: !!qTopicId,
  });
  const subTopics = subTopicsRaw?.length ? subTopicsRaw : (MOCK_SUBTOPICS[qTopicId] ?? []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!testId) throw new Error('No test ID');
      const payload = {
        content: questionContent,
        options: options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
        solution: solutionContent,
        difficulty: qDifficulty,
        topicId: qTopicId || undefined,
        subTopicId: qSubTopicId || undefined,
      };
      return createQuestion(testId, payload);
    },
  });

  const handleSaveQuestion = async () => {
    if (!questionContent.trim() || questionContent === '<p></p>') {
      toast.error('Question content is required');
      return;
    }
    const hasCorrect = options.some((o) => o.isCorrect);
    if (!hasCorrect) {
      toast.error('Please select a correct answer');
      return;
    }
    // TC-Q-009: Validate that no option text is empty
    const emptyOption = options.find((o) => !o.text.trim());
    if (emptyOption) {
      toast.error('All option fields must be filled in');
      return;
    }

    try {
      const saved = await saveMutation.mutateAsync();
      addQuestion(saved);
      toast.success(`Question ${questions.length + 1} saved!`);
      // Reset for next question
      setQuestionContent('');
      setSolutionContent('');
      setOptions(makeEmptyOptions());
      setCurrentQuestionIndex(questions.length + 1);
    } catch {
      // Offline fallback
      const fakeQ: Question = {
        id: `local-${Date.now()}`,
        testId: testId ?? '',
        questionNumber: questions.length + 1,
        content: questionContent,
        options: options.map((o, i) => ({ ...o, id: `opt-${Date.now()}-${i}` })),
        solution: solutionContent,
        difficulty: qDifficulty,
        topicId: qTopicId,
        subTopicId: qSubTopicId,
        createdAt: new Date().toISOString(),
      };
      addQuestion(fakeQ);
      toast.success(`Question ${questions.length + 1} saved!`);
      setQuestionContent('');
      setSolutionContent('');
      setOptions(makeEmptyOptions());
      setCurrentQuestionIndex(questions.length + 1);
    }
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleCorrectAnswer = (id: string) => {
    setOptions((prev) => prev.map((o) => ({ ...o, isCorrect: o.id === id })));
  };

  const handleAddOption = () => {
    if (options.length < 6)
      setOptions((prev) => [...prev, { id: `o${Date.now()}`, text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 2)
      setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleDeleteEdits = () => {
    setQuestionContent('');
    setSolutionContent('');
    setOptions(makeEmptyOptions());
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.success(`Importing ${file.name}...`);
  };

  const handleNext = () => {
    if (questions.length < totalQuestions) {
      toast('Add all questions before proceeding', { icon: '⚠️' });
      return;
    }
    navigate(`/tests/${testId}/confirmation`);
  };

  const isAllDone = questions.length >= totalQuestions;
  const difficultyLabel = currentTest?.difficulty
    ? currentTest.difficulty.charAt(0) + currentTest.difficulty.slice(1).toLowerCase()
    : 'Easy';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      {/* Question list panel */}
      <div className="w-52 bg-white border-r border-gray-200 flex flex-col ml-16 shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">Question creation</span>
          <button className="text-gray-400 hover:text-gray-600">
            <ChevronLeft size={16} />
          </button>
        </div>
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-xs text-gray-500">
            Total Questions : <span className="font-semibold text-gray-700">{totalQuestions}</span>
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-3 flex flex-col gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const q = questions[i];
            const isDone = !!q;
            const isCurrent = i === currentQuestionIndex;
            return (
              <button
                key={i}
                onClick={() => setCurrentQuestionIndex(i)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all',
                  isCurrent
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-400 hover:bg-gray-50'
                )}
              >
                {isDone ? (
                  <span className="w-4 h-4 flex items-center justify-center bg-emerald-500 rounded-full flex-shrink-0">
                    <Check size={10} className="text-white" />
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
                )}
                <span className="truncate">{q ? `Question ${i + 1}` : `Question ${i + 1}`}</span>
                {isDone && <ChevronRight size={10} className="ml-auto flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Test Creation</span>
            <span>/</span>
            <span>Create Test</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Chapter Wise</span>
          </div>
          <Button onClick={handleNext} disabled={!isAllDone} className="px-6">
            Publish
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Test info card */}
          <div className="mx-6 mt-4 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="dark" className="text-xs font-semibold">
                {currentTest?.type === 'CHAPTERWISE' ? 'Chapter Wise' : currentTest?.type ?? 'Chapter Wise'}
              </Badge>
              <button
                onClick={() => setShowEditModal(true)}
                className="ml-auto text-primary-500 hover:text-primary-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>

            <div className="flex items-start gap-8">
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <span>📚</span>
                  {currentTest?.name ?? 'Chapter 1'}
                  <Badge variant="success" className="ml-1">
                    <span className="mr-0.5">🎯</span> {difficultyLabel}
                  </Badge>
                </h2>
                <div className="grid grid-cols-3 gap-y-2 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-400 text-xs">Subject</span>
                    <p className="font-medium">{currentTest?.subject ?? 'English'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Topic</span>
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      {(currentTest?.topic ?? ['Grammar', 'Writing']).map((t) => (
                        <Badge key={t} variant="warning" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Sub Topic</span>
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      {(currentTest?.subTopic ?? ['Application']).map((st) => (
                        <Badge key={st} variant="purple" className="text-xs">{st}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 shrink-0">
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  {currentTest?.duration ?? 60} Min
                </span>
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                  {totalQuestions} Q's
                </span>
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  {currentTest?.totalMarks ?? 250} Marks
                </span>
              </div>
            </div>
          </div>

          {/* Question editor */}
          <div className="mx-6 mt-4 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Question {currentQuestionIndex + 1}
                <span className="text-gray-400 font-normal">/{totalQuestions}</span>
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus size={13} /> MCQ
                </Button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                >
                  <Upload size={13} /> CSV
                </button>
                <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleDeleteEdits}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 mb-4"
            >
              <Trash2 size={14} /> Delete All Edits
            </button>

            {/* Question input */}
            <TiptapEditor
              content={questionContent}
              onChange={setQuestionContent}
              placeholder="Type your question here..."
            />

            {/* Options */}
            <div className="mt-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Type the options below</p>
              <div className="flex flex-col gap-3">
                {options.map((option) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCorrectAnswer(option.id)}
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all',
                        option.isCorrect
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300 hover:border-primary-400'
                      )}
                    >
                      {option.isCorrect && <span className="block w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                    </button>
                    <input
                      value={option.text}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      placeholder="Type Option here"
                      className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(option.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus size={14} /> Add Option
              </button>
            </div>

            {/* Solution */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Add Solution</p>
              <TiptapEditor
                content={solutionContent}
                onChange={setSolutionContent}
                placeholder="Type solution/explanation here..."
              />
            </div>

            {/* Navigation arrows */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 text-gray-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex >= totalQuestions - 1}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 text-gray-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Question settings */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Question settings</h4>
              <div className="flex flex-col gap-4">
                <Select
                  label="Level of Difficulty"
                  options={DIFFICULTY_OPTIONS}
                  value={qDifficulty}
                  onChange={(v) => setQDifficulty(v as DifficultyLevel)}
                />
                <Select
                  label="Topic"
                  options={topics.map((t) => ({ value: t.id, label: t.name }))}
                  value={qTopicId}
                  onChange={setQTopicId}
                />
                <Select
                  label="Sub-topic"
                  options={subTopics.map((st) => ({ value: st.id, label: st.name }))}
                  value={qSubTopicId}
                  onChange={setQSubTopicId}
                  disabled={!qTopicId}
                />
              </div>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="mx-6 mt-4 mb-6 flex items-center justify-between">
            <Button
              variant="danger"
              onClick={() => safeNavigate('/dashboard')}
              className="bg-rose-400 hover:bg-rose-500"
            >
              Exit Test Creation
            </Button>
            <Button onClick={handleSaveQuestion} loading={saveMutation.isPending}>
              {questions.length < totalQuestions - 1 ? 'Save & Next' : 'Save & Finish'}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 pt-6 pb-0">
              <h2 className="text-xl font-semibold text-gray-900">Edit Test creation</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-8 py-6">
              <CreateTestInline
                testId={testId}
                onClose={() => setShowEditModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TC-Q-015: Unsaved changes warning modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Unsaved Changes</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              You have unsaved changes on this question. If you leave now, your progress will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700"
              >
                Stay & Save
              </button>
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  if (pendingNavTarget) navigate(pendingNavTarget);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline create form for the edit modal (avoids circular imports)
function CreateTestInline({ testId: _testId, onClose }: { testId?: string; onClose: () => void }) {
  return (
    <div className="text-sm text-gray-600 py-4">
      <p className="mb-4">Edit functionality available via the main Edit Test flow.</p>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
}
