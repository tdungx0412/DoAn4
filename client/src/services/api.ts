import { Subject, Exam, ExamAttempt, Question } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const res = await fetch(`${API_BASE_URL}/subjects`);
    const json = await res.json();
    return json.data || [];
  },

  async createSubject(data: { name: string; icon?: string; color?: string; description?: string }): Promise<Subject> {
    const res = await fetch(`${API_BASE_URL}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // Exams
  async getExams(subjectId?: string, search?: string): Promise<Exam[]> {
    const params = new URLSearchParams();
    if (subjectId && subjectId !== 'all') params.append('subjectId', subjectId);
    if (search) params.append('q', search);

    const res = await fetch(`${API_BASE_URL}/exams?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async getExamById(id: string, mode: 'exam' | 'review' = 'exam'): Promise<Exam> {
    const res = await fetch(`${API_BASE_URL}/exams/${id}?mode=${mode}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getExamByPin(pin: string): Promise<Exam> {
    const res = await fetch(`${API_BASE_URL}/exams/pin/${pin}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async createExam(payload: {
    title: string;
    description?: string;
    subjectId: string;
    creatorName?: string;
    durationMinutes: number;
    coverImage?: string;
    isPublic?: boolean;
    questions: Question[];
  }): Promise<Exam> {
    const res = await fetch(`${API_BASE_URL}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async submitAttempt(payload: {
    examId: string;
    studentName: string;
    studentEmail?: string;
    durationSeconds: number;
    tabSwitchCount: number;
    answers: { questionId: string; selectedOptionId: string | null }[];
  }): Promise<ExamAttempt> {
    const res = await fetch(`${API_BASE_URL}/exams/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getAttemptResult(attemptId: string): Promise<ExamAttempt> {
    const res = await fetch(`${API_BASE_URL}/exams/attempts/${attemptId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // Upload & Parsing
  async parseRawText(text: string): Promise<{ totalParsed: number; questions: Question[] }> {
    const res = await fetch(`${API_BASE_URL}/upload/parse-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async parseExcelFile(file: File): Promise<{ totalParsed: number; questions: Question[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/upload/parse-excel`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },
};
