// src/routes/groups.js
import express from 'express';
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup
} from '../controllers/groupController.js';
// Correct import path
import { requireAuth } from '../middleware/auth.js';
import { checkGroupLimit } from '../middleware/subscriptionCheck.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getGroups);
router.get('/:id', getGroupById);
router.post('/', checkGroupLimit, createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

export default router;
