import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { exams: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: subjects.map((sub) => ({
        ...sub,
        examCount: sub._count.exams,
      })),
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách môn học:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, icon, color, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên môn học không được để trống' });
    }

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await prisma.subject.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Môn học này đã tồn tại' });
    }

    const newSubject = await prisma.subject.create({
      data: {
        name: name.trim(),
        slug,
        icon: icon || 'BookOpen',
        color: color || '#3B82F6',
        description: description?.trim(),
      },
    });

    res.status(201).json({ success: true, data: newSubject });
  } catch (error) {
    console.error('Lỗi khi tạo môn học:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};
