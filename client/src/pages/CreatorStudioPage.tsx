import React, { useState, useEffect } from 'react';
import { Subject, Question } from '../types';
import { api } from '../services/api';
import { MathRenderer } from '../components/MathRenderer';
import {
  FileText,
  FileSpreadsheet,
  Plus,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  Clock,
  Send,
  HelpCircle,
} from 'lucide-react';

interface CreatorStudioPageProps {
  onExamCreated: (examId: string) => void;
  onCancel: () => void;
}

const SAMPLE_TEXT_QUIZ = `Câu 1: Giá trị của tích phân sau là bao nhiêu: $I = \\int_{0}^{2} 3x^2 dx$?
A. 8
B. 6
C. 12
D. 24
*Đáp án: A
*Lời giải: Nguyên hàm $\\int 3x^2 dx = x^3$. Thay cận từ 0 đến 2: $2^3 - 0 = 8$.

Câu 2: Trong câu điều kiện loại 2, mệnh đề If sử dụng thì nào?
A. Quá khứ đơn (Past Simple)
B. Hiện tại đơn (Present Simple)
C. Quá khứ hoàn thành (Past Perfect)
D. Tương lai đơn (Future Simple)
*Đáp án: A
*Lời giải: Cấu trúc If loại 2: If + S + V2/ed (were), S + would/could + V-bare.

Câu 3: Đâu là hàm trong JavaScript dùng để biến đổi mọi phần tử trong mảng thành một mảng mới?
A. map()
B. filter()
C. reduce()
D. push()
*Đáp án: A
*Lời giải: map() duyệt qua từng phần tử và trả về một mảng mới có cùng độ dài.`;

export const CreatorStudioPage: React.FC<CreatorStudioPageProps> = ({
  onExamCreated,
  onCancel,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'text' | 'excel'>('text');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [creatorName, setCreatorName] = useState('Thành viên cộng đồng');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80');

  // Text Parser
  const [rawText, setRawText] = useState(SAMPLE_TEXT_QUIZ);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Subject Modal/Input
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Tải danh mục môn học
  useEffect(() => {
    api.getSubjects().then((data) => {
      setSubjects(data);
      if (data.length > 0) setSubjectId(data[0].id);
    });
  }, []);

  // Tự động parse văn bản ban đầu
  useEffect(() => {
    handleParseText();
  }, []);

  const handleParseText = async () => {
    if (!rawText.trim()) return;
    setParsing(true);
    setError(null);
    try {
      const res = await api.parseRawText(rawText);
      setParsedQuestions(res.questions);
    } catch (err: any) {
      setError('Lỗi khi phân tích cú pháp: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setError(null);
    try {
      const res = await api.parseExcelFile(file);
      setParsedQuestions(res.questions);
      alert(`Đã nạp thành công ${res.questions.length} câu hỏi từ file Excel!`);
    } catch (err: any) {
      setError('Lỗi khi đọc file Excel: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleCreateNewSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      const newSub = await api.createSubject({ name: newSubjectName.trim(), color: '#8b5cf6' });
      setSubjects((prev) => [...prev, newSub]);
      setSubjectId(newSub.id);
      setNewSubjectName('');
      setShowNewSubject(false);
    } catch (err: any) {
      alert(err.message || 'Không thể tạo môn học');
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề đề thi');
      return;
    }
    if (!subjectId) {
      setError('Vui lòng chọn môn học');
      return;
    }
    if (parsedQuestions.length === 0) {
      setError('Đề thi chưa có câu hỏi nào. Hãy dán văn bản hoặc tải file Excel');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const newExam = await api.createExam({
        title,
        description,
        subjectId,
        creatorName,
        durationMinutes,
        coverImage,
        questions: parsedQuestions,
      });

      alert(`🎉 Đã xuất bản đề thi thành công! Mã phòng PIN vào thi: ${newExam.accessCode}`);
      onExamCreated(newExam.id);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xuất bản đề thi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px', width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color="#ec4899" />
            <span>Creator Studio - Tạo & Đẩy Đề Thi Lên Hệ Thống</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Nạp đề thi siêu tốc bằng bộ trích xuất văn bản thông minh (Text & Excel Parser)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} className="btn-secondary">
            Hủy bỏ
          </button>
          <button
            onClick={handlePublish}
            disabled={submitting}
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)' }}
          >
            <Send size={16} />
            <span>{submitting ? 'Đang xuất bản...' : 'Xuất bản đề thi'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fb7185',
          padding: '12px 18px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '24px',
          fontSize: '14px',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Left Column (Metadata) & Right Column (Parser & Preview) */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '28px' }}>
        {/* Left Column: Cấu hình thông tin đề */}
        <div className="glass-card" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>
            Thông tin đề thi
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Tiêu đề đề thi <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Đề thi thử THPT Quốc Gia Môn Toán..."
                style={{
                  width: '100%',
                  height: '42px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Môn học <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewSubject(!showNewSubject)}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Thêm môn mới
                </button>
              </div>

              {showNewSubject && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="Tên môn học mới..."
                    style={{
                      flex: 1,
                      height: '36px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 10px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button onClick={handleCreateNewSubject} className="btn-primary" style={{ padding: '0 12px', fontSize: '12px' }}>
                    Thêm
                  </button>
                </div>
              )}

              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Thời gian làm bài (Phút)
              </label>
              <input
                type="number"
                min={1}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '42px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Tên tác giả / Giáo viên biên soạn
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="VD: Thầy Nam, Cô Linh, Bạn Minh..."
                style={{
                  width: '100%',
                  height: '42px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Mô tả ngắn đề thi
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả phạm vi kiến thức, đối tượng thi..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Ingestion Engine */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            {/* Tab switchers */}
            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '18px' }}>
              <button
                onClick={() => setActiveTab('text')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === 'text' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'text' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <FileText size={16} />
                <span>Dán văn bản thô (Word / Markdown / KaTeX)</span>
              </button>

              <button
                onClick={() => setActiveTab('excel')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === 'excel' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'excel' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <FileSpreadsheet size={16} />
                <span>Tải lên file Excel (.xlsx / .csv)</span>
              </button>
            </div>

            {activeTab === 'text' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                    Cú pháp chuẩn: <code>Câu 1: [Nội dung] A. [PA] B. [PA] *Đáp án: A *Lời giải: ...</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRawText(SAMPLE_TEXT_QUIZ);
                      setTimeout(handleParseText, 50);
                    }}
                    style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Chèn văn bản mẫu
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Dán câu hỏi trắc nghiệm của bạn vào đây..."
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    outline: 'none',
                    marginBottom: '16px',
                  }}
                />

                <button
                  type="button"
                  onClick={handleParseText}
                  disabled={parsing}
                  className="btn-primary"
                  style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                >
                  <Sparkles size={16} />
                  <span>{parsing ? 'Đang phân tích cú pháp...' : 'Trích xuất & Xem trước câu hỏi'}</span>
                </button>
              </div>
            ) : (
              <div style={{ padding: '30px 20px', textAlign: 'center', border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <FileSpreadsheet size={48} color="#10b981" style={{ marginBottom: '12px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                  Kéo thả hoặc tải lên file Excel chứa đề thi
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  Hỗ trợ định dạng .xlsx, .xls. Các cột: Câu hỏi | A | B | C | D | Đáp án đúng | Giải thích
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="excel-file-input"
                />
                <label htmlFor="excel-file-input" className="btn-primary" style={{ cursor: 'pointer' }}>
                  Chọn file từ máy tính
                </label>
              </div>
            )}
          </div>

          {/* Live Preview Box */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="#10b981" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                  Xem trước câu hỏi đã nhận diện ({parsedQuestions.length} câu)
                </h3>
              </div>
            </div>

            {parsedQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '14px' }}>
                Chưa có câu hỏi nào được trích xuất. Hãy dán văn bản và nhấn "Trích xuất & Xem trước câu hỏi".
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto' }}>
                {parsedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '10px' }}>
                      Câu {idx + 1}: <MathRenderer content={q.content} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      {q.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        return (
                          <div
                            key={oIdx}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '4px',
                              background: opt.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                              border: `1px solid ${opt.isCorrect ? '#10b981' : 'var(--border-subtle)'}`,
                              fontSize: '13px',
                              color: opt.isCorrect ? '#34d399' : 'var(--text-main)',
                            }}
                          >
                            <strong>{letter}.</strong> <MathRenderer content={opt.content} />
                            {opt.isCorrect && ' ✓'}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        Lời giải: <MathRenderer content={q.explanation} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
