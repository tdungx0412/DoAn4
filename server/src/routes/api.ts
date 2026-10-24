import { Router } from 'express';
import multer from 'multer';
import { getSubjects, createSubject } from '../controllers/subjectController.js';
import {
  getExams,
  getExamById,
  getExamByPin,
  createExam,
  submitAttempt,
  getAttemptResult,
  getSystemStats,
  deleteExam,
  getExamLeaderboard,
} from '../controllers/examController.js';
import { parseRawText, parseExcelFile, parseDocumentFile } from '../controllers/uploadController.js';
import { register, login, getMe } from '../controllers/authController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

// Xác thực & Tài khoản (Authentication)
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', getMe);

// Thống kê hệ thống
router.get('/stats', getSystemStats);

// Môn học (Subjects)
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);

// Đề thi (Exams)
router.get('/exams', getExams);
router.get('/exams/pin/:pin', getExamByPin);
router.get('/exams/:id', getExamById);
router.get('/exams/:id/leaderboard', getExamLeaderboard);
router.post('/exams', createExam);
router.delete('/exams/:id', deleteExam);
router.post('/exams/submit', submitAttempt);
router.get('/exams/attempts/:attemptId', getAttemptResult);


// Parser & Upload (Word, Excel, Text)
router.post('/upload/parse-text', parseRawText);
router.post('/upload/parse-excel', upload.single('file'), parseExcelFile);
router.post('/upload/parse-document', upload.single('file'), parseDocumentFile);

export default router;
