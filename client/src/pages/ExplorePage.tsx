import React, { useState, useEffect } from 'react';
import { Subject, Exam } from '../types';
import { CategoryChips } from '../components/CategoryChips';
import { QuizCard } from '../components/QuizCard';
import { api } from '../services/api';
import { Sparkles, KeyRound, Plus, BookOpen, Flame, Compass } from 'lucide-react';

interface ExplorePageProps {
  onStartExam: (examId: string, mode: 'exam' | 'practice') => void;
  onOpenJoinPin: () => void;
  onOpenCreate: () => void;
  searchQuery: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onStartExam,
  onOpenJoinPin,
  onOpenCreate,
  searchQuery,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  // Tải danh mục môn học
  useEffect(() => {
    api.getSubjects()
      .then((data) => setSubjects(data))
      .catch((err) => console.error('Lỗi khi tải môn học:', err));
  }, []);

  // Tải danh sách đề thi theo bộ lọc và tìm kiếm
  useEffect(() => {
    setLoading(true);
    api.getExams(selectedSubjectId, searchQuery)
      .then((data) => setExams(data))
      .catch((err) => console.error('Lỗi khi tải đề thi:', err))
      .finally(() => setLoading(false));
  }, [selectedSubjectId, searchQuery]);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Hero Banner (Wayground style) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(236, 72, 153, 0.25), rgba(15, 17, 26, 0.8))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 40px',
        marginBottom: '36px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 700,
            color: '#cbd5e1',
            marginBottom: '16px',
            backdropFilter: 'blur(8px)',
          }}>
            <Sparkles size={14} color="#ec4899" />
            <span>Nền tảng khảo thí trắc nghiệm đa môn học thế hệ mới</span>
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: '14px', letterSpacing: '-0.5px' }}>
            Học tập, Luyện thi & Chia sẻ Đề thi Không Giới Hạn
          </h2>

          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Tham gia phòng thi bằng mã PIN, tự do đẩy đề thi của bạn lên bằng công cụ Import thông minh (Word/Excel/Text) hoặc ôn tập trực tiếp các môn THPTQG, Ngoại ngữ và CNTT.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenJoinPin}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)' }}
            >
              <KeyRound size={17} />
              <span>Vào thi bằng mã PIN</span>
            </button>

            <button
              onClick={onOpenCreate}
              className="btn-secondary"
            >
              <Plus size={17} />
              <span>Đẩy đề thi mới lên</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Category Pills Filter */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color="#8b5cf6" />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Khám phá theo danh mục môn học</span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
            Tìm thấy {exams.length} đề thi
          </span>
        </div>

        <CategoryChips
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={setSelectedSubjectId}
        />
      </div>

      {/* Grid of Exams */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              style={{
                height: '340px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                animation: 'pulse-subtle 1.5s infinite',
                border: '1px solid var(--border-subtle)',
              }}
            />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-subtle)',
        }}>
          <BookOpen size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            Chưa tìm thấy đề thi phù hợp
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
            Hiện chưa có đề thi nào trong danh mục này hoặc khớp với từ khóa tìm kiếm. Bạn hãy là người đầu tiên đóng góp đề thi nhé!
          </p>
          <button onClick={onOpenCreate} className="btn-primary">
            <Plus size={16} />
            <span>Tạo đề thi ngay</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {exams.map((exam) => (
            <QuizCard
              key={exam.id}
              exam={exam}
              onStartExam={(id) => onStartExam(id, 'exam')}
              onPractice={(id) => onStartExam(id, 'practice')}
            />
          ))}
        </div>
      )}
    </div>
  );
};
