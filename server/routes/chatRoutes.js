import express from 'express';
import { createChat, getChats, getChat, sendMessage, deleteChat } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(createChat)
  .get(getChats);

router.route('/:id')
  .get(getChat)
  .delete(deleteChat);

router.post('/:id/message', sendMessage);

export default router;