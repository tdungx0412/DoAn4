import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { JoinPinModal } from './components/JoinPinModal';
import { AuthModal } from './components/AuthModal';
import { ExplorePage } from './pages/ExplorePage';
import { ExamRunnerPage } from './pages/ExamRunnerPage';
import { ExamResultPage } from './pages/ExamResultPage';
import { CreatorStudioPage } from './pages/CreatorStudioPage';
import { HistoryPage } from './pages/HistoryPage';
import { GuidePage } from './pages/GuidePage';
import { ExamAttempt, Exam, User } from './types';
import { api } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<'explore' | 'exam' | 'result' | 'create' | 'history' | 'guide'>('explore');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [examMode, setExamMode] = useState<'exam' | 'practice'>('exam');
  const [examResult, setExamResult] = useState<ExamAttempt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoinPinOpen, setIsJoinPinOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Verify and refresh stored auth session on mount
  useEffect(() => {
    if (api.getStoredToken()) {
      api.getMe()
        .then((user) => setCurrentUser(user))
        .catch(() => {
          api.logout();
          setCurrentUser(null);
        });
    }
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  // Bắt đầu làm bài thi
  const handleStartExam = (examId: string, mode: 'exam' | 'practice' = 'exam') => {
    setSelectedExamId(examId);
    setExamMode(mode);
    setCurrentView('exam');
  };

  // Hoàn thành bài thi
  const handleFinishExam = (result: ExamAttempt) => {
    setExamResult(result);
    setCurrentView('result');

    // Lưu vào lịch sử LocalStorage
    try {
      const historyStr = localStorage.getItem('user_exam_history');
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.unshift({
        id: result.id,
        examTitle: result.exam?.title || 'Bài thi trắc nghiệm',
        score: result.score,
        totalCorrect: result.totalCorrect,
        totalQuestions: result.totalQuestions,
        duration: result.durationSeconds,
        date: new Date().toISOString(),
      });
      localStorage.setItem('user_exam_history', JSON.stringify(history.slice(0, 30)));
    } catch {}
  };

  // Tìm thấy đề thi từ mã PIN
  const handleExamFoundFromPin = (exam: Exam) => {
    handleStartExam(exam.id, 'exam');
  };

  // Xem lại kết quả từ lịch sử thi
  const handleViewAttempt = async (attemptId: string) => {
    try {
      const attempt = await api.getAttemptResult(attemptId);
      setSelectedExamId(attempt.examId);
      setExamResult(attempt);
      setCurrentView('result');
    } catch (err: any) {
      alert('Không thể tải chi tiết kết quả bài thi: ' + err.message);
    }
  };

  // Nếu đang trong phòng thi (ExamRunnerPage), hiển thị toàn màn hình không có Sidebar/Header để thí sinh tập trung
  if (currentView === 'exam' && selectedExamId) {
    return (
      <ExamRunnerPage
        examId={selectedExamId}
        mode={examMode}
        currentUser={currentUser}
        onBack={() => setCurrentView('explore')}
        onFinish={handleFinishExam}
      />
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentView}
        onSelectTab={(tab) => setCurrentView(tab as any)}
        onOpenJoinPin={() => setIsJoinPinOpen(true)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenJoinPin={() => setIsJoinPinOpen(true)}
          onOpenCreate={() => setCurrentView('create')}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
        />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {currentView === 'explore' && (
            <ExplorePage
              onStartExam={handleStartExam}
              onOpenJoinPin={() => setIsJoinPinOpen(true)}
              onOpenCreate={() => setCurrentView('create')}
              searchQuery={searchQuery}
            />
          )}

          {currentView === 'result' && examResult && (
            <ExamResultPage
              result={examResult}
              onRetake={() => {
                if (selectedExamId) handleStartExam(selectedExamId, examMode);
              }}
              onGoHome={() => setCurrentView('explore')}
            />
          )}

          {currentView === 'create' && (
            <CreatorStudioPage
              currentUser={currentUser}
              onExamCreated={(newExamId) => {
                setCurrentView('explore');
              }}
              onCancel={() => setCurrentView('explore')}
            />
          )}

          {currentView === 'history' && (
            <HistoryPage
              onGoExplore={() => setCurrentView('explore')}
              onViewAttempt={handleViewAttempt}
            />
          )}

          {currentView === 'guide' && <GuidePage />}
        </main>
      </div>

      {/* Join PIN Modal */}
      <JoinPinModal
        isOpen={isJoinPinOpen}
        onClose={() => setIsJoinPinOpen(false)}
        onExamFound={handleExamFoundFromPin}
      />

      {/* Authentication Modal (Đăng nhập / Đăng ký) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;

