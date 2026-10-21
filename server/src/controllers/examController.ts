import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hàm sinh mã PIN 6 số ngẫu nhiên
function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const getExams = async (req: Request, res: Response) => {
  try {
    const { subjectId, q } = req.query;

    const whereClause: any = { isPublic: true };
    if (subjectId && typeof subjectId === 'string' && subjectId !== 'all') {
      whereClause.subjectId = subjectId;
    }
    if (q && typeof q === 'string') {
      whereClause.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { creatorName: { contains: q } },
      ];
    }

    const exams = await prisma.exam.findMany({
      where: whereClause,
      include: {
        subject: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: exams.map((exam) => ({
        ...exam,
        totalQuestions: exam._count.questions,
      })),
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đề thi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

export const getExamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = req.query; // 'exam' hoặc 'review'

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đề thi' });
    }

    // Tăng lượt xem
    await prisma.exam.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Nếu ở chế độ làm bài thi (mode === 'exam'), giấu đáp án đúng để chống gian lận
    if (mode === 'exam') {
      const sanitizedQuestions = exam.questions.map((q) => ({
        id: q.id,
        content: q.content,
        difficulty: q.difficulty,
        orderIndex: q.orderIndex,
        imageUrl: q.imageUrl,
        audioUrl: q.audioUrl,
        options: q.options.map((opt) => ({
          id: opt.id,
          content: opt.content,
          orderIndex: opt.orderIndex,
        })),
      }));

      return res.json({
        success: true,
        data: {
          ...exam,
          questions: sanitizedQuestions,
        },
      });
    }

    // Chế độ xem trước hoặc quản trị (giữ nguyên đáp án)
    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đề thi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

export const getExamByPin = async (req: Request, res: Response) => {
  try {
    const { pin } = req.params;
    const exam = await prisma.exam.findUnique({
      where: { accessCode: pin },
      include: {
        subject: true,
        _count: { select: { questions: true } },
      },
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Mã phòng thi không tồn tại hoặc đã hết hạn' });
    }

    res.json({
      success: true,
      data: {
        ...exam,
        totalQuestions: exam._count.questions,
      },
    });
  } catch (error) {
    console.error('Lỗi khi tìm đề thi qua PIN:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

export const createExam = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      subjectId,
      creatorName,
      durationMinutes,
      coverImage,
      isPublic,
      questions,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề đề thi' });
    }
    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn môn học' });
    }
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Đề thi phải có ít nhất 1 câu hỏi' });
    }

    // Sinh mã PIN 6 số duy nhất
    let accessCode = generateAccessCode();
    while (await prisma.exam.findUnique({ where: { accessCode } })) {
      accessCode = generateAccessCode();
    }

    const newExam = await prisma.exam.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        subjectId,
        creatorName: creatorName?.trim() || 'Thành viên cộng đồng',
        durationMinutes: Number(durationMinutes) || 30,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
        isPublic: isPublic !== false,
        accessCode,
        questions: {
          create: questions.map((q: any, qIdx: number) => ({
            content: q.content,
            explanation: q.explanation || null,
            difficulty: q.difficulty || 'MEDIUM',
            orderIndex: qIdx,
            imageUrl: q.imageUrl || null,
            audioUrl: q.audioUrl || null,
            options: {
              create: (q.options || []).map((opt: any, oIdx: number) => ({
                content: opt.content,
                isCorrect: Boolean(opt.isCorrect),
                orderIndex: oIdx,
              })),
            },
          })),
        },
      },
      include: {
        subject: true,
        _count: { select: { questions: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tạo đề thi thành công',
      data: newExam,
    });
  } catch (error) {
    console.error('Lỗi khi tạo đề thi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo đề' });
  }
};

export const submitAttempt = async (req: Request, res: Response) => {
  try {
    const {
      examId,
      studentName,
      studentEmail,
      durationSeconds,
      tabSwitchCount,
      answers, // Mảng: [{ questionId, selectedOptionId }]
    } = req.body;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Đề thi không tồn tại' });
    }

    // Chấm điểm
    let totalCorrect = 0;
    const totalQuestions = exam.questions.length;
    const answerRecords: any[] = [];

    const answerMap = new Map<string, string>();
    if (Array.isArray(answers)) {
      answers.forEach((ans: any) => {
        if (ans.questionId) {
          answerMap.set(ans.questionId, ans.selectedOptionId);
        }
      });
    }

    for (const question of exam.questions) {
      const selectedOptionId = answerMap.get(question.id) || null;
      const correctOption = question.options.find((opt) => opt.isCorrect);
      const isCorrect = selectedOptionId !== null && selectedOptionId === correctOption?.id;

      if (isCorrect) {
        totalCorrect += 1;
      }

      answerRecords.push({
        questionId: question.id,
        selectedOptionId,
        isCorrect,
      });
    }

    // Thang điểm 10
    const rawScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 10 : 0;
    const score = Math.round(rawScore * 10) / 10;

    // Lưu Attempt vào CSDL
    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        studentName: studentName?.trim() || 'Thí sinh ẩn danh',
        studentEmail: studentEmail?.trim() || null,
        durationSeconds: Number(durationSeconds) || 0,
        score,
        totalCorrect,
        totalQuestions,
        status: 'COMPLETED',
        tabSwitchCount: Number(tabSwitchCount) || 0,
        submittedAt: new Date(),
        answers: {
          create: answerRecords,
        },
      },
      include: {
        exam: {
          include: {
            subject: true,
            questions: {
              include: { options: true },
            },
          },
        },
        answers: {
          include: {
            question: {
              include: { options: true },
            },
            selectedOption: true,
          },
        },
      },
    });

    // Tăng lượt thi của đề
    await prisma.exam.update({
      where: { id: examId },
      data: { attemptCount: { increment: 1 } },
    });

    res.json({
      success: true,
      message: 'Nộp bài thi thành công',
      data: attempt,
    });
  } catch (error) {
    console.error('Lỗi khi nộp bài thi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi chấm bài' });
  }
};

export const getAttemptResult = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            subject: true,
            questions: {
              include: { options: true },
            },
          },
        },
        answers: {
          include: {
            question: {
              include: { options: true },
            },
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy kết quả bài thi' });
    }

    res.json({ success: true, data: attempt });
  } catch (error) {
    console.error('Lỗi khi lấy kết quả bài thi:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};
