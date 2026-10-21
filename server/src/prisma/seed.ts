import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu...');

  // 1. Dọn sạch dữ liệu cũ
  await prisma.attemptAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // 2. Tạo User tác giả
  const teacherNam = await prisma.user.create({
    data: {
      name: 'Thầy Nam (Chuyên Toán)',
      email: 'nam.math@wayground.edu.vn',
      role: 'TEACHER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teacherLinh = await prisma.user.create({
    data: {
      name: 'Cô Mai Linh (IELTS 8.5)',
      email: 'linh.english@wayground.edu.vn',
      role: 'TEACHER',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teacherDev = await prisma.user.create({
    data: {
      name: 'DevMaster Academy',
      email: 'dev@wayground.edu.vn',
      role: 'TEACHER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 3. Tạo các môn học
  const mathSubject = await prisma.subject.create({
    data: {
      name: 'Toán Học',
      slug: 'toan-hoc',
      icon: 'Calculator',
      color: '#3B82F6', // Blue
      description: 'Hàm số, tích phân, hình học không gian, xác suất thống kê',
    },
  });

  const englishSubject = await prisma.subject.create({
    data: {
      name: 'Tiếng Anh',
      slug: 'tieng-anh',
      icon: 'Languages',
      color: '#EC4899', // Pink
      description: 'Luyện thi THPTQG, TOEIC, IELTS, ngữ pháp & từ vựng',
    },
  });

  const itSubject = await prisma.subject.create({
    data: {
      name: 'Công Nghệ Thông Tin',
      slug: 'tin-hoc-cntt',
      icon: 'Code',
      color: '#10B981', // Green
      description: 'JavaScript, Python, CSDL SQL, Cấu trúc dữ liệu & Thuật toán',
    },
  });

  const scienceSubject = await prisma.subject.create({
    data: {
      name: 'Vật Lý & Hóa Học',
      slug: 'vat-ly-hoa-hoc',
      icon: 'Atom',
      color: '#8B5CF6', // Purple
      description: 'Dao động cơ, sóng ánh sáng, hóa hữu cơ & vô cơ',
    },
  });

  // 4. Tạo đề thi 1: Toán Giải tích THPT Quốc Gia (Có KaTeX)
  const examMath = await prisma.exam.create({
    data: {
      title: 'Đề Ôn Luyện Giải Tích & Tích Phân Chuẩn Cấu Trúc THPTQG',
      description: 'Bộ 5 câu hỏi trọng tâm về nguyên hàm, đạo hàm và tích phân ứng dụng thực tế có công thức LaTeX.',
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
      subjectId: mathSubject.id,
      creatorId: teacherNam.id,
      creatorName: teacherNam.name,
      durationMinutes: 15,
      accessCode: '101101',
      isPublic: true,
      viewCount: 340,
      attemptCount: 128,
      questions: {
        create: [
          {
            content: 'Tính tích phân sau: $I = \\int_{0}^{1} (2x + 1) dx$',
            explanation: 'Áp dụng công thức nguyên hàm: $\\int (2x + 1) dx = x^2 + x$. Thay cận từ 0 đến 1: $(1^2 + 1) - (0) = 2$.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'I = 2', isCorrect: true, orderIndex: 0 },
                { content: 'I = 1', isCorrect: false, orderIndex: 1 },
                { content: 'I = 3', isCorrect: false, orderIndex: 2 },
                { content: 'I = 4', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Cho hàm số $y = x^3 - 3x^2 + 2$. Điểm cực đại của đồ thị hàm số là:',
            explanation: 'Đạo hàm $y\' = 3x^2 - 6x = 3x(x - 2)$. $y\' = 0 \\iff x = 0$ hoặc $x = 2$. Tại $x = 0$, $y\'$ đổi dấu từ dương sang âm nên $x = 0$ là điểm cực đại $\\implies y(0) = 2$. Điểm cực đại là $(0; 2)$.',
            difficulty: 'MEDIUM',
            orderIndex: 1,
            options: {
              create: [
                { content: '(0; 2)', isCorrect: true, orderIndex: 0 },
                { content: '(2; -2)', isCorrect: false, orderIndex: 1 },
                { content: '(1; 0)', isCorrect: false, orderIndex: 2 },
                { content: '(0; 0)', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Nghiệm của phương trình $2^{x + 1} = 16$ là:',
            explanation: 'Ta có $16 = 2^4$. Suy ra $x + 1 = 4 \\iff x = 3$.',
            difficulty: 'EASY',
            orderIndex: 2,
            options: {
              create: [
                { content: 'x = 3', isCorrect: true, orderIndex: 0 },
                { content: 'x = 4', isCorrect: false, orderIndex: 1 },
                { content: 'x = 2', isCorrect: false, orderIndex: 2 },
                { content: 'x = 5', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Thể tích $V$ của khối nón có bán kính đáy $r$ và chiều cao $h$ là:',
            explanation: 'Công thức thể tích khối nón là $V = \\frac{1}{3}\\pi r^2 h$.',
            difficulty: 'EASY',
            orderIndex: 3,
            options: {
              create: [
                { content: 'V = \\frac{1}{3}\\pi r^2 h', isCorrect: true, orderIndex: 0 },
                { content: 'V = \\pi r^2 h', isCorrect: false, orderIndex: 1 },
                { content: 'V = \\frac{4}{3}\\pi r^3', isCorrect: false, orderIndex: 2 },
                { content: 'V = 2\\pi r h', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Tập xác định của hàm số $y = \\log_2 (x - 3)$ là:',
            explanation: 'Điều kiện xác định của $\\log_a b$ là biểu thức trong logarit $b > 0 \\iff x - 3 > 0 \\iff x > 3$. Do đó tập xác định là $(3; +\\infty)$.',
            difficulty: 'MEDIUM',
            orderIndex: 4,
            options: {
              create: [
                { content: '(3; +\\infty)', isCorrect: true, orderIndex: 0 },
                { content: '[3; +\\infty)', isCorrect: false, orderIndex: 1 },
                { content: '(-\\infty; 3)', isCorrect: false, orderIndex: 2 },
                { content: '\\mathbb{R} \\setminus \\{3\\}', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // 5. Tạo đề thi 2: Tiếng Anh Ngữ Pháp & Từ Vựng Cốt Lõi (TOEIC/THPTQG)
  const examEnglish = await prisma.exam.create({
    data: {
      title: 'Thử Thách Ngữ Pháp Tiếng Anh Trọng Điểm (B2 - C1)',
      description: 'Tổng hợp các câu hỏi phân biệt thì, câu điều kiện, mệnh đề quan hệ rút gọn hay gặp trong các đề thi chuẩn hóa.',
      coverImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80',
      subjectId: englishSubject.id,
      creatorId: teacherLinh.id,
      creatorName: teacherLinh.name,
      durationMinutes: 10,
      accessCode: '202202',
      isPublic: true,
      viewCount: 520,
      attemptCount: 245,
      questions: {
        create: [
          {
            content: 'If she _______ harder during the course, she would have passed the final exam with distinction.',
            explanation: 'Đây là câu điều kiện loại 3 (Third Conditional) diễn tả điều kiện trái với thực tế trong quá khứ: If + had + V3/ed, S + would have + V3/ed.',
            difficulty: 'MEDIUM',
            orderIndex: 0,
            options: {
              create: [
                { content: 'had studied', isCorrect: true, orderIndex: 0 },
                { content: 'studied', isCorrect: false, orderIndex: 1 },
                { content: 'studies', isCorrect: false, orderIndex: 2 },
                { content: 'would study', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'The company decided to postpone the product launch _______ the unexpected technical difficulties.',
            explanation: '"due to" + cụm danh từ (Noun Phrase) mang nghĩa là "bởi vì / do". Các từ "because", "although" phải đi kèm mệnh đề (S + V).',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'due to', isCorrect: true, orderIndex: 0 },
                { content: 'because', isCorrect: false, orderIndex: 1 },
                { content: 'in spite', isCorrect: false, orderIndex: 2 },
                { content: 'even though', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Hardly _______ into the room when the alarm went off.',
            explanation: 'Cấu trúc đảo ngữ với Hardly: Hardly + had + S + V3/ed + when + S + V2/ed (Vừa mới... thì...).',
            difficulty: 'HARD',
            orderIndex: 2,
            options: {
              create: [
                { content: 'had he stepped', isCorrect: true, orderIndex: 0 },
                { content: 'he had stepped', isCorrect: false, orderIndex: 1 },
                { content: 'did he step', isCorrect: false, orderIndex: 2 },
                { content: 'has he stepped', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'The man _______ next to Mr. David is our new Chief Technology Officer.',
            explanation: 'Rút gọn mệnh đề quan hệ dạng chủ động (The man who is sitting $\\implies$ The man sitting).',
            difficulty: 'MEDIUM',
            orderIndex: 3,
            options: {
              create: [
                { content: 'sitting', isCorrect: true, orderIndex: 0 },
                { content: 'sat', isCorrect: false, orderIndex: 1 },
                { content: 'is sitting', isCorrect: false, orderIndex: 2 },
                { content: 'who sitting', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // 6. Tạo đề thi 3: Lập Trình Web & JavaScript Cơ Bản
  const examIT = await prisma.exam.create({
    data: {
      title: 'Kiểm Tra Kiến Thức Nền Tảng JavaScript & Web Development',
      description: 'Trắc nghiệm nhanh về ES6, Promise, Closure, Scope và DOM API dành cho lập trình viên Frontend.',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      subjectId: itSubject.id,
      creatorId: teacherDev.id,
      creatorName: teacherDev.name,
      durationMinutes: 12,
      accessCode: '303303',
      isPublic: true,
      viewCount: 680,
      attemptCount: 310,
      questions: {
        create: [
          {
            content: 'Trong JavaScript, kết quả của biểu thức: `typeof null` là gì?',
            explanation: '`typeof null` trả về `"object"`. Đây là một lỗi thiết kế lịch sử (historical bug) được giữ lại để tương thích ngược.',
            difficulty: 'MEDIUM',
            orderIndex: 0,
            options: {
              create: [
                { content: '"object"', isCorrect: true, orderIndex: 0 },
                { content: '"null"', isCorrect: false, orderIndex: 1 },
                { content: '"undefined"', isCorrect: false, orderIndex: 2 },
                { content: '"boolean"', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Phương thức nào trong mảng JavaScript trả về một mảng mới chỉ gồm các phần tử thỏa mãn điều kiện?',
            explanation: 'Phương thức `Array.prototype.filter()` lặp qua mảng và trả về mảng mới chứa các phần tử mà callback trả về true.',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'filter()', isCorrect: true, orderIndex: 0 },
                { content: 'map()', isCorrect: false, orderIndex: 1 },
                { content: 'forEach()', isCorrect: false, orderIndex: 2 },
                { content: 'find()', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Từ khóa nào trong ES6 dùng để khai báo biến có phạm vi khối (block scope) và không thể gán lại giá trị?',
            explanation: '`const` tạo ra biến có block scope và không thể gán lại (re-assign) giá trị tham chiếu mới.',
            difficulty: 'EASY',
            orderIndex: 2,
            options: {
              create: [
                { content: 'const', isCorrect: true, orderIndex: 0 },
                { content: 'let', isCorrect: false, orderIndex: 1 },
                { content: 'var', isCorrect: false, orderIndex: 2 },
                { content: 'static', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Hoàn thành Seed dữ liệu mẫu:');
  console.log(`- 4 môn học: Toán, Tiếng Anh, Tin học, Vật Lý/Hóa`);
  console.log(`- 3 đề thi: Mã PIN [101101], [202202], [303303]`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
