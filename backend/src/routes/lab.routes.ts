import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import { labController } from '../controllers/lab.controller.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Lab Subject Routes
router.get('/subjects', labController.getSubjects);
router.get('/subjects/:id', labController.getSubject);
router.post('/subjects', requireRole(['admin']), labController.createSubject);
router.put('/subjects/:id', requireRole(['admin']), labController.updateSubject);
router.delete('/subjects/:id', requireRole(['admin']), labController.deleteSubject);

// Code Management Routes
router.get('/code/:id', labController.getCode);
router.post('/save', requireRole(['admin']), labController.saveCode);
router.post('/execute', labController.executeCode);

export default router;