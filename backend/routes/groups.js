import express from 'express';
import { 
  createGroup, 
  getGroups, 
  getGroup, 
  updateGroup, 
  deleteGroup,
  addContactToGroup,
  removeContactFromGroup
} from '../controllers/groupController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createGroup);
router.get('/', authenticate, getGroups);
router.get('/:id', authenticate, getGroup);
router.put('/:id', authenticate, updateGroup);
router.delete('/:id', authenticate, deleteGroup);
router.post('/:id/contacts', authenticate, addContactToGroup);
router.delete('/:id/contacts/:contactId', authenticate, removeContactFromGroup);

export default router;
