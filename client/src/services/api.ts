import { Subject, Exam, ExamAttempt, Question, SystemStats, User, AuthResponse } from '../types';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'wayground_auth_token';
const USER_KEY = 'wayground_auth_user';

export const api = {
  // Auth Helpers
  getStoredToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setStoredToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
  },

  getStoredUser(): User | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setStoredUser(user: User | null) {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch {}
  },

  logout() {
    this.setStoredToken(null);
    this.setStoredUser(null);
  },

  // Auth API
  async register(payload: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    this.setStoredToken(json.data.token);
    this.setStoredUser(json.data.user);
    return json.data;
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    this.setStoredToken(json.data.token);
    this.setStoredUser(json.data.user);
    return json.data;
  },

  async getMe(): Promise<User> {
    const token = this.getStoredToken();
    if (!token) throw new Error('Chưa đăng nhập');

    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await res.json();
    if (!json.success) {
      this.logout();
      throw new Error(json.message);
    }
    this.setStoredUser(json.data);
    return json.data;
  },

  // Stats
  async getStats(): Promise<SystemStats> {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      const json = await res.json();
      return json.data || { totalExams: 0, totalQuestions: 0, totalAttempts: 0, totalSubjects: 0 };
    } catch {
      return { totalExams: 0, totalQuestions: 0, totalAttempts: 0, totalSubjects: 0 };
    }
  },

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
  async getExams(subjectId?: string, search?: string, gradeLevel?: string): Promise<Exam[]> {
    const params = new URLSearchParams();
    if (subjectId && subjectId !== 'all') params.append('subjectId', subjectId);
    if (search) params.append('q', search);
    if (gradeLevel && gradeLevel !== 'all') params.append('gradeLevel', gradeLevel);

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

  async getExamLeaderboard(id: string): Promise<import('../types').LeaderboardEntry[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/exams/${id}/leaderboard`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
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
    creatorId?: string;
    creatorName?: string;
    durationMinutes: number;
    gradeLevel?: string;
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

  async deleteExam(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/exams/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
  },

  async submitAttempt(payload: {
    examId: string;
    userId?: string;
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

  async parseDocumentFile(file: File): Promise<{ totalParsed: number; questions: Question[]; filename?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/upload/parse-document`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async parseExcelFile(file: File): Promise<{ totalParsed: number; questions: Question[] }> {
    return this.parseDocumentFile(file);
  },
};

