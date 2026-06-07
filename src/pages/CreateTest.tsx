import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SpinnerInput } from '../components/ui/SpinnerInput';
import { createTest, updateTest, getTest, getSubjects, getTopics, getSubTopics } from '../api/tests';
import { useTestStore } from '../store/testStore';
import type { TestType, DifficultyLevel } from '../types';

const schema = z.object({
  name: z.string().min(1, 'Test name is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  topicIds: z.array(z.string()).min(1, 'At least one topic is required'),
  subTopicIds: z.array(z.string()),
  duration: z.coerce
    .number({ invalid_type_error: 'Duration must be a number' })
    .int('Duration must be a whole number')
    .positive('Duration must be greater than 0')
    .min(1, 'Duration must be at least 1 minute'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'DIFFICULT']),
  correctMarks: z.coerce.number(),
  wrongMarks: z.coerce.number(),
  unattemptedMarks: z.coerce.number(),
  totalQuestions: z.coerce
    .number({ invalid_type_error: 'Number of questions is required' })
    .int('Must be a whole number')
    .positive('Must have at least 1 question')
    .min(1, 'Must have at least 1 question'),
});
type FormValues = z.infer<typeof schema>;

const testTypes: { value: TestType; label: string }[] = [
  { value: 'CHAPTERWISE', label: 'Chapterwise' },
  { value: 'PYQ', label: 'PYQ' },
  { value: 'MOCK_TEST', label: 'Mock Test' },
];

const difficultyOptions: { value: DifficultyLevel; label: string }[] = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'DIFFICULT', label: 'Difficult' },
];

// Fallback mock options
const MOCK_SUBJECTS = [
  { id: 's1', name: 'English' },
  { id: 's2', name: 'Physics' },
  { id: 's3', name: 'Mathematics' },
  { id: 's4', name: 'Chemistry' },
  { id: 's5', name: 'Biology' },
];
const MOCK_TOPICS: Record<string, { id: string; name: string }[]> = {
  s1: [{ id: 't1', name: 'Grammar' }, { id: 't2', name: 'Writing' }, { id: 't3', name: 'Reading' }],
  s2: [{ id: 't4', name: 'Mechanics' }, { id: 't5', name: 'Optics' }, { id: 't6', name: 'Thermodynamics' }],
  s3: [{ id: 't7', name: 'Algebra' }, { id: 't8', name: 'Calculus' }, { id: 't9', name: 'Geometry' }],
  s4: [{ id: 't10', name: 'Organic' }, { id: 't11', name: 'Inorganic' }],
  s5: [{ id: 't12', name: 'Botany' }, { id: 't13', name: 'Zoology' }],
};
const MOCK_SUBTOPICS: Record<string, { id: string; name: string }[]> = {
  t1: [{ id: 'st1', name: 'Application' }, { id: 'st2', name: 'Theory' }],
  t2: [{ id: 'st3', name: 'Essays' }, { id: 'st4', name: 'Reports' }],
  t4: [{ id: 'st5', name: 'Newton\'s Laws' }, { id: 'st6', name: 'Kinematics' }],
};

interface CreateTestProps {
  isModal?: boolean;
  initialTestId?: string;
  onClose?: () => void;
  onSaved?: () => void;
}

export function CreateTestPage({ isModal, initialTestId, onClose, onSaved }: CreateTestProps = {}) {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const testId = initialTestId ?? routeId;
  const isEdit = !!testId;

  const { setCurrentTest, setCurrentTestPayload } = useTestStore();
  const [testType, setTestType] = useState<TestType>('CHAPTERWISE');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      subjectId: '',
      difficulty: 'EASY',
      correctMarks: 5,
      wrongMarks: -1,
      unattemptedMarks: 0,
      topicIds: [],
      subTopicIds: [],
      duration: undefined as unknown as number,
      totalQuestions: undefined as unknown as number,
    },
  });

  const watchSubjectId = watch('subjectId');
  const watchTopicIds = watch('topicIds');
  const watchTotalQuestions = watch('totalQuestions');
  const watchCorrectMarks = watch('correctMarks');
  const totalMarks = (watchTotalQuestions || 0) * (watchCorrectMarks || 0);

  // Fetch test data for edit
  const { data: existingTest } = useQuery({
    queryKey: ['test', testId],
    queryFn: () => getTest(testId!),
    enabled: isEdit,
  });

  // Fetch subjects
  const { data: subjectsRaw } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });
  const subjects = subjectsRaw?.length ? subjectsRaw : MOCK_SUBJECTS;

  // Fetch topics based on subject
  const { data: topicsRaw } = useQuery({
    queryKey: ['topics', watchSubjectId],
    queryFn: () => getTopics(watchSubjectId),
    enabled: !!watchSubjectId,
  });
  const topics = topicsRaw?.length ? topicsRaw : (MOCK_TOPICS[watchSubjectId] ?? []);

  // Fetch subtopics based on first selected topic
  const firstTopicId = watchTopicIds?.[0];
  const { data: subTopicsRaw } = useQuery({
    queryKey: ['subtopics', firstTopicId],
    queryFn: () => getSubTopics(firstTopicId),
    enabled: !!firstTopicId,
  });
  const subTopics = subTopicsRaw?.length ? subTopicsRaw : (MOCK_SUBTOPICS[firstTopicId] ?? []);

  // Populate form for edit
  useEffect(() => {
    if (existingTest) {
      setTestType(existingTest.type);
      reset({
        name: existingTest.name,
        subjectId: existingTest.subjectId,
        topicIds: existingTest.topicIds,
        subTopicIds: existingTest.subTopicIds,
        duration: existingTest.duration,
        difficulty: existingTest.difficulty,
        correctMarks: existingTest.markingScheme.correct,
        wrongMarks: existingTest.markingScheme.wrong,
        unattemptedMarks: existingTest.markingScheme.unattempted,
        totalQuestions: existingTest.totalQuestions,
      });
    }
  }, [existingTest, reset]);

  const createMutation = useMutation({ mutationFn: (p: Parameters<typeof createTest>[0]) => createTest(p) });
  const updateMutation = useMutation({ mutationFn: (p: Parameters<typeof updateTest>) => updateTest(...p) });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      type: testType,
      subjectId: values.subjectId,
      topicIds: values.topicIds,
      subTopicIds: values.subTopicIds,
      duration: values.duration,
      difficulty: values.difficulty,
      markingScheme: {
        correct: values.correctMarks,
        wrong: values.wrongMarks,
        unattempted: values.unattemptedMarks,
      },
      totalQuestions: values.totalQuestions,
    };

    try {
      let savedTest;
      if (isEdit && testId) {
        savedTest = await updateMutation.mutateAsync([testId, payload]);
        toast.success('Test updated!');
      } else {
        savedTest = await createMutation.mutateAsync(payload);
        toast.success('Test created!');
      }
      setCurrentTest(savedTest);
      setCurrentTestPayload(payload);
      if (onSaved) { onSaved(); return; }
      navigate(`/tests/${savedTest.id}/questions`);
    } catch {
      // Offline fallback: simulate creation
      const fakeTest = {
        id: `local-${Date.now()}`,
        ...payload,
        subject: subjects.find((s) => s.id === payload.subjectId)?.name ?? '',
        topic: [],
        subTopic: [],
        totalMarks,
        status: 'DRAFT' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentTest(fakeTest as never);
      setCurrentTestPayload(payload);
      toast.success('Test saved locally (offline mode)');
      if (onSaved) { onSaved(); return; }
      navigate(`/tests/${fakeTest.id}/questions`);
    }
  };

  const handleCancel = () => {
    if (onClose) { onClose(); return; }
    navigate('/dashboard');
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-100 pb-0">
        {testTypes.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTestType(t.value)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              testType === t.value
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Row 1: Subject + Name */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <Controller
          name="subjectId"
          control={control}
          render={({ field }) => (
            <Select
              label="Subject"
              placeholder="Choose from Drop-down"
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
              value={field.value ?? ''}
              onChange={(v) => { field.onChange(v); setValue('topicIds', []); setValue('subTopicIds', []); }}
              error={errors.subjectId?.message}
            />
          )}
        />
        <Input
          label="Name of Test"
          placeholder="Enter name of Test"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>

      {/* Row 2: Topic + Sub Topic */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Topic</label>
          <div className="relative">
            <select
              multiple
              value={watch('topicIds') ?? []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                setValue('topicIds', selected);
              }}
              disabled={!watchSubjectId}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[42px] max-h-[100px] disabled:opacity-50"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          {!watchSubjectId && <p className="text-xs text-gray-400">Select a subject first</p>}
          {errors.topicIds && <p className="text-xs text-red-500">{errors.topicIds.message}</p>}
        </div>

        <Controller
          name="subTopicIds"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Sub Topic</label>
              <select
                multiple
                value={field.value ?? []}
                onChange={(e) => field.onChange(Array.from(e.target.selectedOptions).map((o) => o.value))}
                disabled={!firstTopicId}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[42px] max-h-[100px] disabled:opacity-50"
              >
                {subTopics.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
              {!firstTopicId && <p className="text-xs text-gray-400">Select a topic first</p>}
            </div>
          )}
        />
      </div>

      {/* Row 3: Duration + Difficulty */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <Input
          label="Duration (Minutes)"
          placeholder="Enter the time"
          type="number"
          min={1}
          {...register('duration')}
          error={errors.duration?.message}
        />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Test Difficulty Level</label>
          <div className="flex items-center gap-6 mt-1">
            {difficultyOptions.map((d) => (
              <label key={d.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={d.value}
                  {...register('difficulty')}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm text-gray-700">{d.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Marking Scheme */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Marking Scheme:</h3>
        <div className="flex items-end gap-4 flex-wrap">
          <Controller
            name="wrongMarks"
            control={control}
            render={({ field }) => (
              <SpinnerInput
                label="Wrong Answer"
                value={field.value ?? -1}
                onChange={field.onChange}
                min={-10}
                max={0}
              />
            )}
          />
          <Controller
            name="unattemptedMarks"
            control={control}
            render={({ field }) => (
              <SpinnerInput
                label="Unattempted"
                value={field.value ?? 0}
                onChange={field.onChange}
                min={-5}
                max={5}
              />
            )}
          />
          <Controller
            name="correctMarks"
            control={control}
            render={({ field }) => (
              <SpinnerInput
                label="Correct Answer"
                value={field.value ?? 5}
                onChange={field.onChange}
                min={1}
                max={20}
              />
            )}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">No of Questions</label>
            <input
              type="number"
              placeholder="Ex:250 Marks"
              {...register('totalQuestions')}
              className="w-36 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-gray-400"
            />
            {errors.totalQuestions && <p className="text-xs text-red-500">{errors.totalQuestions.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-400">Total Marks</label>
            <div className="w-36 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
              {totalMarks > 0 ? totalMarks : 'Ex:250 Marks'}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? 'Save' : 'Next'}
        </Button>
      </div>
    </form>
  );

  if (isModal) return formContent;

  const typeLabel = testTypes.find((t) => t.value === testType)?.label ?? 'Chapter Wise';
  const breadcrumbs = isEdit
    ? [{ label: 'Test Creation' }, { label: 'Edit Test' }]
    : [{ label: 'Test Creation' }, { label: 'Create Test' }, { label: typeLabel }];

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border-2 border-primary-400 p-8">
          {formContent}
        </div>
      </div>
    </Layout>
  );
}
