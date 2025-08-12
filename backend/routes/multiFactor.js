import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  setupTwoFactor, 
  enableTwoFactor, 
  disableTwoFactor, 
  regenerateBackupCodes 
} from '../controllers/mfaController.js';

const router = express.Router();

router.post('/setup', authenticate, setupTwoFactor);
router.post('/enable', authenticate, enableTwoFactor);
router.post('/disable', authenticate, disableTwoFactor);
router.post('/backup-codes', authenticate, regenerateBackupCodes);

export default router;
