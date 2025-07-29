// src/routes/templates.js
import express from 'express';
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  generateAITemplate,
  previewTemplate
} from '../controllers/templateController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/generate-ai', generateAITemplate);
router.post('/:id/preview', previewTemplate);

export default router;
