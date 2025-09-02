import express from 'express';
import { 
  sendEmails, 
  getEmailStatus, 
  getEmailHistory, 
  getEmailAnalytics 
} from '../controllers/emailController.js';
import { authenticate } from '../middleware/auth.js';
import { emailSendingLimiter } from '../middleware/rateLimiter.js';
import Email from '../models/Email.js';

const router = express.Router();

router.post('/send', authenticate, emailSendingLimiter, sendEmails);
router.get('/status/:id', authenticate, getEmailStatus);
router.get('/history', authenticate, getEmailHistory);
router.get('/analytics', authenticate, getEmailAnalytics);

// Real-time email campaign progress stream with authentication
router.get('/campaign/:id/stream', (req, res) => {
  // ✅ Handle authentication via query parameter for SSE
  const token = req.query.token
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }
  
  try {
    // Verify JWT token (adapt this to your JWT verification logic)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    
    // Set proper SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'Content-Encoding': 'none',
      'X-Accel-Buffering': 'no'
    })
    
    res.flushHeaders()
    
    const campaignId = req.params.id
    console.log(`🔄 SSE connection opened for campaign: ${campaignId} by user: ${req.userId}`)
    
    const sendUpdate = async () => {
      try {
        const email = await Email.findById(campaignId)
        if (!email) {
          console.log(`❌ Campaign ${campaignId} not found`)
          return
        }
        
        const data = {
          status: email.status,
          sent: email.successCount || 0,
          failed: email.failedCount || 0,
          total: email.totalRecipients,
          progress: email.totalRecipients > 0 ? Math.round((email.successCount || 0) / email.totalRecipients * 100) : 0
        }
        
        console.log(`📊 Sending SSE update for ${campaignId}:`, data)
        res.write(`data: ${JSON.stringify(data)}\n\n`)
        
        // Close connection when completed or failed
        if (email.status === 'completed' || email.status === 'failed') {
          console.log(`✅ Campaign ${campaignId} finished, closing SSE connection`)
          res.end()
          clearInterval(interval)
        }
      } catch (error) {
        console.error(`❌ SSE error for campaign ${campaignId}:`, error)
        res.write(`data: ${JSON.stringify({ error: 'Failed to get status' })}\n\n`)
      }
    }
    
    // Send update immediately, then every 2 seconds
    sendUpdate()
    const interval = setInterval(sendUpdate, 2000)
    
    // Clean up on client disconnect
    req.on('close', () => {
      console.log(`🔌 SSE client disconnected for campaign: ${campaignId}`)
      clearInterval(interval)
    })
    
  } catch (error) {
    console.error('JWT verification failed:', error)
    return res.status(401).json({ error: 'Invalid access token' })
  }
})




export default router;
