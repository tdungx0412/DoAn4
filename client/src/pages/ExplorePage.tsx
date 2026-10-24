import React, { useState, useEffect, useMemo } from 'react';
import { Subject, Exam, SystemStats } from '../types';
import { CategoryChips } from '../components/CategoryChips';
import { QuizCard } from '../components/QuizCard';
import { api } from '../services/api';
import { KeyRound, Plus, BookOpen, Compass, Layers, HelpCircle, Users, ArrowUpDown, Filter } from 'lucide-react';

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
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('all');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats>({ totalExams: 0, totalQuestions: 0, totalAttempts: 0, totalSubjects: 0 });

  // Bộ lọc bổ sung
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'questions'>('newest');

  // Tải danh mục môn học & Thống kê
  useEffect(() => {
    Promise.all([
      api.getSubjects(),
      api.getStats(),
    ]).then(([subjectsData, statsData]) => {
      setSubjects(subjectsData);
      setStats(statsData);
    }).catch((err) => console.error('Lỗi khi tải dữ liệu ban đầu:', err));
  }, []);

  // Debounce tìm kiếm để tối ưu hóa tần suất gọi API
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Tải danh sách đề thi theo bộ lọc và tìm kiếm đã debounce
  useEffect(() => {
    setLoading(true);
    api.getExams(selectedSubjectId, debouncedSearch, selectedGradeLevel)
      .then((data) => setExams(data))
      .catch((err) => console.error('Lỗi khi tải đề thi:', err))
      .finally(() => setLoading(false));
  }, [selectedSubjectId, debouncedSearch, selectedGradeLevel]);


  // Lọc và sắp xếp phía client
  const filteredExams = useMemo(() => {
    let result = [...exams];

    // Lọc theo thời lượng
    if (durationFilter === 'short') {
      result = result.filter((e) => (e.durationMinutes || 0) <= 15);
    } else if (durationFilter === 'medium') {
      result = result.filter((e) => (e.durationMinutes || 0) > 15 && (e.durationMinutes || 0) <= 45);
    } else if (durationFilter === 'long') {
      result = result.filter((e) => (e.durationMinutes || 0) > 45);
    }

    // Sắp xếp
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.attemptCount || 0) - (a.attemptCount || 0));
    } else if (sortBy === 'questions') {
      result.sort((a, b) => (b.totalQuestions || 0) - (a.totalQuestions || 0));
    }

    return result;
  }, [exams, durationFilter, sortBy]);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Hero Banner - Sleek Professional Academic Style */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 40px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
      }}>
        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(79, 70, 229, 0.15)',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 700,
            color: '#a5b4fc',
            marginBottom: '16px',
          }}>
            <span>Hệ Thống Khảo Thí & Ôn Luyện Đa Môn Học</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Nền Tảng Đề Thi Trắc Nghiệm Chuẩn Hóa
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Luyện thi trực tuyến với đồng hồ đếm ngược, hỗ trợ công thức Toán - Lý - Hóa LaTeX sắc nét, hệ thống tự động chấm điểm và báo cáo chi tiết.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenJoinPin}
              className="btn-primary"
              style={{ background: '#0284c7', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)' }}
            >
              <KeyRound size={16} />
              <span>Vào thi bằng mã PIN</span>
            </button>

            <button
              onClick={onOpenCreate}
              className="btn-secondary"
            >
              <Plus size={16} />
              <span>Biên soạn đề mới</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid on Right */}
        <div style={{
          position: 'absolute',
          top: '32px',
          right: '40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          zIndex: 2,
        }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 18px', textAlign: 'center', minWidth: '110px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{stats.totalExams || exams.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Đề thi mở</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 18px', textAlign: 'center', minWidth: '110px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8' }}>{stats.totalSubjects || subjects.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Môn học</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 18px', textAlign: 'center', minWidth: '110px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>{stats.totalQuestions || 24}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Câu hỏi</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 18px', textAlign: 'center', minWidth: '110px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>{stats.totalAttempts || 15}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Lượt nộp</div>
          </div>
        </div>
      </div>

      {/* Grade Level Selector (Bậc học & Cấp học) */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--primary)" />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Phân loại theo cấp học</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Đầy đủ các cấp: Tiểu học, THCS, THPT, Đại học & Chứng chỉ
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
        }}>
          {[
            { key: 'all', title: 'Tất cả các cấp', desc: 'Toàn bộ ngân hàng đề', color: '#6366f1' },
            { key: 'PRIMARY', title: 'Cấp 1 • Tiểu học', desc: 'Lớp 1 đến Lớp 5', color: '#f97316' },
            { key: 'SECONDARY', title: 'Cấp 2 • THCS', desc: 'Lớp 6 đến Lớp 9 & Vào 10', color: '#0284c7' },
            { key: 'HIGH_SCHOOL', title: 'Cấp 3 • THPT', desc: 'Lớp 10 đến 12 & THPTQG', color: '#8b5cf6' },
            { key: 'UNIVERSITY', title: 'Đại học & Chứng chỉ', desc: 'CNTT, TOEIC, Triết học', color: '#10b981' },
          ].map((lvl) => {
            const isActive = selectedGradeLevel === lvl.key;
            return (
              <button
                key={lvl.key}
                onClick={() => setSelectedGradeLevel(lvl.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isActive ? lvl.color : 'var(--border-subtle)'}`,
                  background: isActive ? 'rgba(79, 70, 229, 0.16)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 4px 14px ${lvl.color}25` : 'none',
                }}
              >
                <div style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  marginBottom: '2px',
                }}>
                  {lvl.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  {lvl.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Pills Filter */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color="var(--text-muted)" />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Danh mục môn học</span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
            Hiển thị {filteredExams.length} đề thi
          </span>
        </div>

        <CategoryChips
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={setSelectedSubjectId}
        />
      </div>

      {/* Filter & Sorting Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        padding: '12px 18px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '28px',
      }}>
        {/* Lọc thời lượng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>Thời lượng:</span>
          {(['all', 'short', 'medium', 'long'] as const).map((filterKey) => {
            const labels = {
              all: 'Tất cả',
              short: '≤ 15 phút',
              medium: '15 - 45 phút',
              long: '> 45 phút',
            };
            return (
              <button
                key={filterKey}
                onClick={() => setDurationFilter(filterKey)}
                className={`palette-filter-pill ${durationFilter === filterKey ? 'active' : ''}`}
              >
                {labels[filterKey]}
              </button>
            );
          })}
        </div>

        {/* Sắp xếp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 10px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="newest">Mới cập nhật</option>
            <option value="popular">Nhiều lượt thi nhất</option>
            <option value="questions">Số câu hỏi nhiều nhất</option>
          </select>
        </div>
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
      ) : filteredExams.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-subtle)',
        }}>
          <BookOpen size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            Không tìm thấy đề thi phù hợp
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
            Không có đề thi nào khớp với bộ lọc hiện tại. Thử chọn danh mục khác hoặc tạo đề thi mới ngay!
          </p>
          <button onClick={onOpenCreate} className="btn-primary">
            <Plus size={16} />
            <span>Biên soạn đề thi mới</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredExams.map((exam) => (
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

