import React, { useState, useEffect, useRef } from 'react';
import { Subject, Question, Option, User } from '../types';
import { api } from '../services/api';
import { MathRenderer } from '../components/MathRenderer';
import {
  FileText,
  FileSpreadsheet,
  Plus,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  Send,
  Edit3,
  Download,
  X,
  Layers,
  Copy,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Clock,
  UploadCloud,
  RefreshCw,
  Check,
  Printer,
} from 'lucide-react';


interface CreatorStudioPageProps {
  onExamCreated: (examId: string) => void;
  onCancel: () => void;
  currentUser?: User | null;
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

const COVER_PRESETS = [
  { label: 'Toán học', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80' },
  { label: 'Tiếng Anh', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80' },
  { label: 'Ngữ văn', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80' },
  { label: 'Khoa học', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80' },
  { label: 'Công nghệ', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Thi cử', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80' },
];

export const CreatorStudioPage: React.FC<CreatorStudioPageProps> = ({
  onExamCreated,
  onCancel,
  currentUser,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'word' | 'excel' | 'text'>('word');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [creatorName, setCreatorName] = useState(currentUser?.name || 'Thành viên cộng đồng');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [gradeLevel, setGradeLevel] = useState<'PRIMARY' | 'SECONDARY' | 'HIGH_SCHOOL' | 'UNIVERSITY'>('HIGH_SCHOOL');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);

  useEffect(() => {
    if (currentUser?.name && (creatorName === 'Thành viên cộng đồng' || !creatorName)) {
      setCreatorName(currentUser.name);
    }
  }, [currentUser]);

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const wordFileInputRef = useRef<HTMLInputElement>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // Text Parser
  const [rawText, setRawText] = useState(SAMPLE_TEXT_QUIZ);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // New Subject Modal/Input
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Manual Question Builder Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [qContent, setQContent] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [qOptions, setQOptions] = useState<Option[]>([
    { content: '', isCorrect: true },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
  ]);

  // Tải danh mục môn học
  useEffect(() => {
    api.getSubjects().then((data) => {
      setSubjects(data);
      if (data.length > 0) setSubjectId(data[0].id);
    });
  }, []);

  // Tự động nạp mẫu văn bản ban đầu
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
      if (!title && res.questions.length > 0) {
        setTitle('Đề ôn luyện trắc nghiệm trực tuyến');
      }
    } catch (err: any) {
      setError('Lỗi khi phân tích cú pháp: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    setParsing(true);
    setError(null);
    try {
      const res = await api.parseDocumentFile(file);
      setParsedQuestions(res.questions);
      setUploadedFileName(file.name);

      // Tự động lấy tên file làm tiêu đề đề thi nếu chưa có tiêu đề
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch (err: any) {
      setError('Lỗi khi đọc file: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleDocumentUpload(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleDocumentUpload(file);
  };

  // Tải file mẫu CSV / Excel chuẩn Wayground
  const handleDownloadExcelTemplate = () => {
    const csvContent =
      '\uFEFF' +
      'Câu hỏi,Phương án A,Phương án B,Phương án C,Phương án D,Đáp án đúng,Lời giải thích\n' +
      'Giá trị của tích phân sau là bao nhiêu: $I = \\int_{0}^{2} 3x^2 dx$?,8,6,12,24,A,Nguyên hàm là x^3 thay cận từ 0 đến 2 = 8.\n' +
      'Mệnh đề If trong câu điều kiện loại 2 dùng thì gì?,Quá khứ đơn,Hiện tại đơn,Quá khứ hoàn thành,Tương lai đơn,A,Cấu trúc If + S + V2/ed.\n' +
      'Hàm JavaScript nào dùng để tạo mảng mới từ mảng cũ?,map(),filter(),reduce(),push(),A,map() trả về mảng mới cùng độ dài.\n' +
      'Tập xác định của hàm số $y = \\log_2(x - 3)$ là gì?,(3; +∞),[3; +∞),(-∞; 3),R \\ {3},A,Biểu thức trong logarit phải lớn hơn 0.\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_De_Thi_Excel_Wayground.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Tải file mẫu Word (.txt / .doc format)
  const handleDownloadWordTemplate = () => {
    const wordContent =
      'Câu 1: Giá trị của tích phân sau là bao nhiêu: $I = \\int_{0}^{2} 3x^2 dx$?\n' +
      'A. 8\n' +
      'B. 6\n' +
      'C. 12\n' +
      'D. 24\n' +
      '*Đáp án: A\n' +
      '*Lời giải: Nguyên hàm là x^3 thay cận từ 0 đến 2 cho kết quả 8.\n\n' +
      'Câu 2: Trong câu điều kiện loại 2, mệnh đề If sử dụng thì nào?\n' +
      'A. Quá khứ đơn (Past Simple)\n' +
      'B. Hiện tại đơn (Present Simple)\n' +
      'C. Quá khứ hoàn thành (Past Perfect)\n' +
      'D. Tương lai đơn (Future Simple)\n' +
      '*Đáp án: A\n' +
      '*Lời giải: Cấu trúc If loại 2: If + S + V2/ed, S + would/could + V-inf.\n\n' +
      'Câu 3: Đâu là hàm trong JavaScript dùng để lọc các phần tử thỏa mãn điều kiện?\n' +
      'A. filter()\n' +
      'B. map()\n' +
      'C. reduce()\n' +
      'D. forEach()\n' +
      '*Đáp án: A\n' +
      '*Lời giải: filter() trả về mảng mới chứa các phần tử thỏa mãn predicate.\n';

    const blob = new Blob([wordContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_De_Thi_Word_Wayground.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Mở modal thêm câu hỏi mới
  const handleOpenAddQuestion = () => {
    setEditingIndex(null);
    setQContent('');
    setQExplanation('');
    setQDifficulty('MEDIUM');
    setQOptions([
      { content: '', isCorrect: true },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
    ]);
    setShowQuestionModal(true);
  };

  // Mở modal chỉnh sửa câu hỏi hiện có
  const handleOpenEditQuestion = (index: number) => {
    const q = parsedQuestions[index];
    if (!q) return;

    setEditingIndex(index);
    setQContent(q.content);
    setQExplanation(q.explanation || '');
    setQDifficulty(q.difficulty || 'MEDIUM');
    setQOptions(
      q.options.length >= 2
        ? q.options.map((opt) => ({ ...opt }))
        : [
            { content: '', isCorrect: true },
            { content: '', isCorrect: false },
            { content: '', isCorrect: false },
            { content: '', isCorrect: false },
          ]
    );
    setShowQuestionModal(true);
  };

  // Nhân bản câu hỏi
  const handleDuplicateQuestion = (index: number) => {
    const q = parsedQuestions[index];
    if (!q) return;
    const duplicated: Question = {
      ...q,
      content: `${q.content} (Bản sao)`,
      options: q.options.map((opt) => ({ ...opt })),
    };
    setParsedQuestions((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, duplicated);
      return next;
    });
  };

  // Di chuyển thứ tự câu hỏi
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= parsedQuestions.length) return;

    setParsedQuestions((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // Xóa câu hỏi khỏi danh sách
  const handleDeleteQuestion = (index: number) => {
    if (confirm(`Bạn có chắc chắn muốn xóa câu số ${index + 1}?`)) {
      setParsedQuestions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Lưu câu hỏi từ modal (thêm mới hoặc sửa)
  const handleSaveQuestion = () => {
    if (!qContent.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    const validOptions = qOptions.filter((opt) => opt.content.trim());
    if (validOptions.length < 2) {
      alert('Vui lòng nhập ít nhất 2 phương án trả lời');
      return;
    }

    if (!validOptions.some((opt) => opt.isCorrect)) {
      validOptions[0].isCorrect = true;
    }

    const newQuestion: Question = {
      content: qContent.trim(),
      explanation: qExplanation.trim() || undefined,
      difficulty: qDifficulty,
      orderIndex: editingIndex !== null ? editingIndex : parsedQuestions.length,
      options: validOptions.map((opt, idx) => ({
        content: opt.content.trim(),
        isCorrect: opt.isCorrect,
        orderIndex: idx,
      })),
    };

    if (editingIndex !== null) {
      setParsedQuestions((prev) => {
        const next = [...prev];
        next[editingIndex] = newQuestion;
        return next;
      });
    } else {
      setParsedQuestions((prev) => [...prev, newQuestion]);
    }

    setShowQuestionModal(false);
  };

  const handleCreateNewSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      const newSub = await api.createSubject({ name: newSubjectName.trim(), color: '#4f46e5' });
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
      setError('Đề thi chưa có câu hỏi nào. Hãy tải lên file Word, Excel hoặc tạo câu hỏi thủ công');
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
        creatorId: currentUser?.id,
        durationMinutes,
        gradeLevel,
        coverImage,
        questions: parsedQuestions,
      });

      alert(`Đã xuất bản đề thi thành công! Mã phòng PIN vào thi: ${newExam.accessCode}`);
      onExamCreated(newExam.id);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xuất bản đề thi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 28px', width: '100%' }}>
      {/* Top Bar Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
          }}>
            <Layers size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', margin: 0 }}>
              Biên Soạn & Tạo Đề Thi Chuẩn Wayground
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Hỗ trợ nhập trực tiếp từ tài liệu Word, bảng tính Excel, dán văn bản tự do hoặc soạn thảo từng câu
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onCancel} className="btn-secondary" style={{ height: '42px', padding: '0 18px' }}>
            Hủy bỏ
          </button>

          {parsedQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="btn-secondary"
              style={{ height: '42px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
              title="Xuất bản in đề thi A4 và Phiếu đáp án"
            >
              <Printer size={16} />
              <span>In đề A4 & Đáp án</span>
            </button>
          )}

          <button
            onClick={handlePublish}
            disabled={submitting || parsedQuestions.length === 0}
            className="btn-primary"
            style={{
              height: '42px',
              padding: '0 22px',
              background: '#059669',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
              opacity: parsedQuestions.length === 0 ? 0.6 : 1,
            }}
          >
            <Send size={16} />
            <span>{submitting ? 'Đang xuất bản...' : `Xuất bản đề thi (${parsedQuestions.length} câu)`}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(225, 29, 72, 0.12)',
          border: '1px solid rgba(225, 29, 72, 0.35)',
          color: '#fb7185',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          fontSize: '14px',
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Settings (360px) & Right Interactive Question Engine */}
      <div style={{ display: 'grid', gridTemplateColumns: '370px 1fr', gap: '28px', alignItems: 'flex-start' }}>
        
        {/* Left Column: Cấu hình thông tin đề thi */}
        <div className="glass-card" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Cấu hình thông tin đề thi</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tiêu đề */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Tiêu đề đề thi <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Đề thi khảo sát chất lượng môn Toán..."
                style={{
                  width: '100%',
                  height: '42px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  color: '#fff',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Cấp học */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Cấp học / Bậc giáo dục <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '42px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  color: '#fff',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              >
                <option value="PRIMARY">🎒 Cấp 1 • Tiểu học (Lớp 1 - 5)</option>
                <option value="SECONDARY">📘 Cấp 2 • THCS (Lớp 6 - 9 & Thi vào 10)</option>
                <option value="HIGH_SCHOOL">🎓 Cấp 3 • THPT (Lớp 10 - 12 & THPTQG)</option>
                <option value="UNIVERSITY">💼 Đại học & Chứng chỉ chuyên nghiệp</option>
              </select>
            </div>

            {/* Môn học */}
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
                  fontSize: '13.5px',
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

            {/* Thời gian làm bài */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Thời gian làm bài
              </label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${durationMinutes === mins ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: durationMinutes === mins ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: durationMinutes === mins ? '#a5b4fc' : 'var(--text-muted)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {mins}p
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={240}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                placeholder="Số phút"
                style={{
                  width: '100%',
                  height: '38px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  color: '#fff',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Ảnh bìa & Preset */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Ảnh bìa đề thi
              </label>
              <div style={{
                height: '110px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                marginBottom: '8px',
                border: '1px solid var(--border-subtle)',
                position: 'relative',
              }}>
                <img src={coverImage} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {COVER_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setCoverImage(p.url)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${coverImage === p.url ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: coverImage === p.url ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                      color: coverImage === p.url ? '#a5b4fc' : 'var(--text-dim)',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tác giả biên soạn */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Tác giả biên soạn
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Tên giáo viên hoặc trường..."
                style={{
                  width: '100%',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  color: '#fff',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Wayground Ingestion Engine & Live Question Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Methods to Create (Word, Excel, Text) */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Phương thức nhập đề thi
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>
                  Chọn một trong các cách nhập dưới đây để tự động tạo ngân hàng câu hỏi
                </p>
              </div>

              {uploadedFileName && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  color: '#34d399',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                  <Check size={14} />
                  <span>Đã nạp: {uploadedFileName}</span>
                </div>
              )}
            </div>

            {/* Mode Switchers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('word')}
                className={`wayground-tab-btn ${activeTab === 'word' ? 'active' : ''}`}
                style={{ justifyContent: 'center' }}
              >
                <FileText size={16} color="#38bdf8" />
                <span>Nhập từ file Word (.docx)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('excel')}
                className={`wayground-tab-btn ${activeTab === 'excel' ? 'active' : ''}`}
                style={{ justifyContent: 'center' }}
              >
                <FileSpreadsheet size={16} color="#10b981" />
                <span>Bảng tính Excel (.xlsx / .csv)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`wayground-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
                style={{ justifyContent: 'center' }}
              >
                <Edit3 size={16} color="#f59e0b" />
                <span>Dán văn bản tự do</span>
              </button>
            </div>

            {/* TAB 1: WORD (.docx / .doc / .txt) */}
            {activeTab === 'word' && (
              <div>
                <input
                  type="file"
                  ref={wordFileInputRef}
                  accept=".docx, .doc, .txt"
                  onChange={onFileInputChange}
                  style={{ display: 'none' }}
                />

                <div
                  className={`wayground-dropzone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => wordFileInputRef.current?.click()}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <UploadCloud size={28} color="#38bdf8" />
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                    Kéo & thả file Word (.docx) vào đây, hoặc click để duyệt file
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                    Hỗ trợ tệp Microsoft Word (.docx, .doc) và tệp văn bản thô (.txt)
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ background: '#0284c7', pointerEvents: 'none' }}
                    >
                      <span>Chọn file từ máy tính</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadWordTemplate();
                      }}
                      className="btn-secondary"
                    >
                      <Download size={14} />
                      <span>Tải file Word mẫu</span>
                    </button>
                  </div>
                </div>

                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <HelpCircle size={15} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span>
                    Định dạng câu hỏi nhận diện chuẩn: <code>Câu 1: [Nội dung]</code> kèm các dòng phương án <code>A. [Đáp án]</code>, <code>B. [Đáp án]</code> và dòng <code>*Đáp án: A</code> (hoặc <code>*Lời giải: ...</code>).
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: EXCEL (.xlsx / .csv) */}
            {activeTab === 'excel' && (
              <div>
                <input
                  type="file"
                  ref={excelFileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={onFileInputChange}
                  style={{ display: 'none' }}
                />

                <div
                  className={`wayground-dropzone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => excelFileInputRef.current?.click()}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <FileSpreadsheet size={28} color="#10b981" />
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                    Tải lên file bảng tính Excel hoặc CSV chuẩn Wayground
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                    Hỗ trợ 7 cột chuẩn: Câu hỏi | Phương án A | B | C | D | Đáp án đúng (A hoặc 1) | Lời giải
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ background: '#059669', pointerEvents: 'none' }}
                    >
                      <span>Chọn file Excel từ máy</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadExcelTemplate();
                      }}
                      className="btn-secondary"
                    >
                      <Download size={14} />
                      <span>Tải file Excel / CSV mẫu</span>
                    </button>
                  </div>
                </div>

                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>
                    Tương thích 100% với file xuất từ Quizizz / Wayground. Cột đáp án đúng chấp nhận cả <code>A, B, C, D</code> lẫn số thứ tự <code>1, 2, 3, 4</code>.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: DÁN VĂN BẢN TRỰC TIẾP */}
            {activeTab === 'text' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                    Cú pháp chuẩn: <code>Câu 1: ... A. ... B. ... *Đáp án: A *Lời giải: ...</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRawText(SAMPLE_TEXT_QUIZ);
                      setTimeout(handleParseText, 50);
                    }}
                    style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Chèn văn bản mẫu KaTeX
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Dán câu hỏi trắc nghiệm của bạn vào đây..."
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    outline: 'none',
                    marginBottom: '14px',
                  }}
                />

                <button
                  type="button"
                  onClick={handleParseText}
                  disabled={parsing}
                  className="btn-primary"
                  style={{ width: '100%', background: '#0284c7', height: '42px' }}
                >
                  <RefreshCw size={15} />
                  <span>{parsing ? 'Đang phân tích...' : 'Trích xuất câu hỏi từ văn bản'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive Live Question Stream (Wayground Style) */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Eye size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Ngân hàng câu hỏi trong đề ({parsedQuestions.length} câu)
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {parsedQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xóa tất cả câu hỏi?')) {
                        setParsedQuestions([]);
                      }
                    }}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px', color: '#fb7185' }}
                  >
                    Xóa tất cả
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenAddQuestion}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12.5px' }}
                >
                  <Plus size={14} />
                  <span>Thêm câu hỏi</span>
                </button>
              </div>
            </div>

            {parsedQuestions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 20px',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-dim)',
              }}>
                <FileText size={42} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                  Chưa có câu hỏi nào trong đề
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px' }}>
                  Hãy tải lên file Word, file Excel hoặc dán nội dung văn bản ở khung phía trên để tự động nhận diện câu hỏi.
                </p>
                <button type="button" onClick={handleOpenAddQuestion} className="btn-secondary">
                  <Plus size={14} />
                  <span>Tự soạn câu hỏi mới</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {parsedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Question Card Top Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: 'rgba(79, 70, 229, 0.2)',
                          color: '#a5b4fc',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          fontWeight: 800,
                        }}>
                          Câu {idx + 1}
                        </span>

                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: q.difficulty === 'EASY' ? 'rgba(16, 185, 129, 0.15)' : q.difficulty === 'HARD' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: q.difficulty === 'EASY' ? '#34d399' : q.difficulty === 'HARD' ? '#fb7185' : '#fbbf24',
                        }}>
                          {q.difficulty === 'EASY' ? 'Dễ' : q.difficulty === 'HARD' ? 'Khó' : 'Trung bình'}
                        </span>
                      </div>

                      {/* Tool buttons: Reorder, Duplicate, Edit, Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(idx, 'up')}
                          disabled={idx === 0}
                          title="Di chuyển lên"
                          className="btn-secondary"
                          style={{ padding: '5px', opacity: idx === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(idx, 'down')}
                          disabled={idx === parsedQuestions.length - 1}
                          title="Di chuyển xuống"
                          className="btn-secondary"
                          style={{ padding: '5px', opacity: idx === parsedQuestions.length - 1 ? 0.3 : 1 }}
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateQuestion(idx)}
                          title="Nhân bản câu này"
                          className="btn-secondary"
                          style={{ padding: '5px' }}
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditQuestion(idx)}
                          title="Chỉnh sửa câu hỏi"
                          className="btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '11px', gap: '4px' }}
                        >
                          <Edit3 size={13} />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(idx)}
                          title="Xóa câu hỏi"
                          className="btn-secondary"
                          style={{ padding: '5px 8px', color: '#fb7185', fontSize: '11px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div style={{ fontSize: '14.5px', color: '#fff', fontWeight: 600, lineHeight: 1.5, marginBottom: '14px' }}>
                      <MathRenderer content={q.content} />
                    </div>

                    {/* Options Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                      {q.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        return (
                          <div
                            key={oIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              background: opt.isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                              border: `1px solid ${opt.isCorrect ? '#10b981' : 'var(--border-subtle)'}`,
                              color: opt.isCorrect ? '#34d399' : 'var(--text-muted)',
                              fontSize: '13px',
                            }}
                          >
                            <span style={{
                              fontWeight: 800,
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: opt.isCorrect ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                              color: opt.isCorrect ? '#fff' : 'var(--text-dim)',
                              fontSize: '11px',
                            }}>
                              {letter}
                            </span>
                            <div style={{ flex: 1, minWidth: 0, fontWeight: opt.isCorrect ? 700 : 500 }}>
                              <MathRenderer content={opt.content} />
                            </div>
                            {opt.isCorrect && <Check size={14} color="#10b981" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        fontSize: '12.5px',
                        color: '#fbbf24',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                      }}>
                        <HelpCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <strong>Lời giải:</strong> <MathRenderer content={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add question bottom banner */}
                <button
                  type="button"
                  onClick={handleOpenAddQuestion}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px dashed var(--border-subtle)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <Plus size={18} />
                  <span>Thêm câu hỏi mới vào đề</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual / Edit Question Modal */}
      {showQuestionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>
                {editingIndex !== null ? `Chỉnh sửa câu hỏi số #${editingIndex + 1}` : 'Thêm câu hỏi mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Nội dung câu hỏi (hỗ trợ công thức LaTeX $...$) <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={qContent}
                  onChange={(e) => setQContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Options */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Các phương án trả lời (Tick vào nút tròn để chọn đáp án ĐÚNG)
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {qOptions.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setQOptions((prev) =>
                              prev.map((o, i) => ({
                                ...o,
                                isCorrect: i === idx,
                              }))
                            );
                          }}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: `2px solid ${opt.isCorrect ? '#10b981' : 'var(--border-subtle)'}`,
                            background: opt.isCorrect ? '#10b981' : 'transparent',
                            color: opt.isCorrect ? '#fff' : 'var(--text-dim)',
                            fontSize: '12px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          {opt.isCorrect ? <Check size={16} /> : letter}
                        </button>

                        <input
                          type="text"
                          value={opt.content}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQOptions((prev) =>
                              prev.map((o, i) => (i === idx ? { ...o, content: val } : o))
                            );
                          }}
                          placeholder={`Phương án ${letter}...`}
                          style={{
                            flex: 1,
                            height: '40px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${opt.isCorrect ? '#10b981' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 12px',
                            color: '#fff',
                            fontSize: '13.5px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lời giải */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Lời giải thích chi tiết (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Giải thích vì sao đáp án đó đúng..."
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Độ khó */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Mức độ khó
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setQDifficulty(diff)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${qDifficulty === diff ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        background: qDifficulty === diff ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: qDifficulty === diff ? '#a5b4fc' : 'var(--text-muted)',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {diff === 'EASY' ? 'Dễ' : diff === 'HARD' ? 'Khó' : 'Trung bình'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}>
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="btn-primary"
              >
                Lưu câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal In Đề Thi & Đáp Án A4 Chuẩn Bộ Giáo Dục */}
      {showPrintModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          zIndex: 120,
          padding: '24px 16px',
          overflowY: 'auto',
        }}>
          {/* Print Controls Header (Hidden during actual print) */}
          <div className="no-print" style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 24px',
            width: '100%',
            maxWidth: '900px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Printer size={20} color="var(--primary)" />
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Xem Trước Bản In Đề Thi & Phiếu Đáp Án A4
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Định dạng chuẩn để in giấy phát cho học sinh làm bài hoặc xuất file PDF
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="btn-secondary"
                style={{ height: '38px', padding: '0 16px' }}
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-primary"
                style={{ height: '38px', padding: '0 20px', background: '#0284c7' }}
              >
                <Printer size={16} />
                <span>In ngay / Lưu PDF</span>
              </button>
            </div>
          </div>

          {/* Printable Sheet (Pure White Background, Dark Text for crystal clarity) */}
          <div className="printable-a4" style={{
            background: '#ffffff',
            color: '#111827',
            width: '100%',
            maxWidth: '900px',
            padding: '48px',
            borderRadius: '4px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            fontSize: '13.5px',
            lineHeight: 1.6,
          }}>
            {/* Header Trường / Kỳ thi */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #111827', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>
                  TRƯỜNG / ĐƠN VỊ: {creatorName || 'BAN CHUYÊN MÔN'}
                </div>
                <div style={{ fontSize: '12px', color: '#4b5563' }}>
                  MÃ ĐỀ THI: <strong>101</strong> • SỐ CÂU: <strong>{parsedQuestions.length}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>
                  KỲ THI KHẢO SÁT CHẤT LƯỢNG HỌC KỲ
                </div>
                <div style={{ fontSize: '12px', color: '#4b5563' }}>
                  Năm học 2026 - 2027
                </div>
              </div>
            </div>

            {/* Tiêu đề & Thông tin đề thi */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 800, textTransform: 'uppercase', color: '#111827', marginBottom: '6px' }}>
                {title || 'ĐỀ THI TRẮC NGHIỆM CHUẨN HÓA'}
              </h2>
              <div style={{ fontSize: '13px', color: '#374151', fontStyle: 'italic' }}>
                Môn: <strong>{subjects.find((s) => s.id === subjectId)?.name || 'Kiến thức tổng hợp'}</strong> • Thời gian làm bài: <strong>{durationMinutes} phút</strong> (Không kể thời gian phát đề)
              </div>
            </div>

            {/* Dòng điền thông tin thí sinh */}
            <div style={{
              border: '1px dashed #9ca3af',
              padding: '12px 16px',
              borderRadius: '4px',
              marginBottom: '24px',
              fontSize: '12.5px',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>Họ và tên thí sinh: ............................................................................</div>
              <div>Lớp: .........................</div>
              <div>Số báo danh: .........................</div>
            </div>

            {/* Phiếu tô đáp án OMR mẫu */}
            <div style={{ marginBottom: '28px', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', color: '#1f2937' }}>
                PHIẾU TÔ ĐÁP ÁN TRẮC NGHIỆM (Thí sinh tô đen vào một ô tròn tương ứng)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '11.5px' }}>
                {parsedQuestions.slice(0, Math.min(20, parsedQuestions.length)).map((_, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <strong style={{ width: '24px' }}>{idx + 1}.</strong>
                    {['A', 'B', 'C', 'D'].map((letter) => (
                      <span
                        key={letter}
                        style={{
                          display: 'inline-flex',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '1px solid #4b5563',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 600,
                        }}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách câu hỏi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {parsedQuestions.map((q, idx) => (
                <div key={idx} className="question-item-print" style={{ fontSize: '13.5px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px', color: '#111827' }}>
                    <span>Câu {idx + 1}: </span>
                    <MathRenderer content={q.content} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', paddingLeft: '16px' }}>
                    {(q.options || []).map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      return (
                        <div key={oIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <strong style={{ minWidth: '18px', color: '#111827' }}>{letter}.</strong>
                          <div style={{ color: '#1f2937' }}>
                            <MathRenderer content={opt.content} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Trang phụ lục: Bảng đáp án & Lời giải cho giáo viên */}
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '2px dashed #9ca3af', pageBreakBefore: 'always' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', color: '#111827', margin: 0 }}>
                  ĐÁP ÁN & HƯỚNG DẪN CHẤM CHI TIẾT
                </h3>
                <span style={{ fontSize: '12px', color: '#4b5563' }}>(Dành cho cán bộ chấm thi & giáo viên bộ môn)</span>
              </div>

              {/* Bảng tóm tắt đáp án đúng */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '6px', marginBottom: '24px' }}>
                {parsedQuestions.map((q, idx) => {
                  const correctIdx = q.options.findIndex((opt) => opt.isCorrect);
                  const correctLetter = correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : 'A';
                  return (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid #d1d5db',
                        padding: '4px 8px',
                        textAlign: 'center',
                        borderRadius: '3px',
                        background: '#f9fafb',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: '#4b5563' }}>Câu {idx + 1}: </span>
                      <strong style={{ fontSize: '12.5px', color: '#047857' }}>{correctLetter}</strong>
                    </div>
                  );
                })}
              </div>

              {/* Lời giải chi tiết */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
                {parsedQuestions.map((q, idx) => {
                  if (!q.explanation) return null;
                  return (
                    <div key={idx} style={{ background: '#f3f4f6', padding: '10px 14px', borderRadius: '4px' }}>
                      <strong style={{ color: '#1e40af' }}>Lời giải câu {idx + 1}: </strong>
                      <MathRenderer content={q.explanation} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

