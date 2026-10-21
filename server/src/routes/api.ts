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
} from '../controllers/examController.js';
import { parseRawText, parseExcelFile } from '../controllers/uploadController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

// Môn học (Subjects)
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);

// Đề thi (Exams)
router.get('/exams', getExams);
router.get('/exams/pin/:pin', getExamByPin);
router.get('/exams/:id', getExamById);
router.post('/exams', createExam);
router.post('/exams/submit', submitAttempt);
router.get('/exams/attempts/:attemptId', getAttemptResult);

// Parser & Upload
router.post('/upload/parse-text', parseRawText);
router.post('/upload/parse-excel', upload.single('file'), parseExcelFile);

export default router;
