const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const verifyToken = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimit');
const { handleChat, handleVoiceChat } = require('../services/chatService');

// Configure multer for audio file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/m4a', 'audio/mp4', 'audio/mpeg', 'audio/wav'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files allowed.'));
        }
    }
});

/**
 * POST /api/chat
 * Text-based chatbot
 */
router.post('/', verifyToken, chatLimiter, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        const response = await handleChat(req.userId, message);

        res.json({
            success: true,
            user_message: message,
            ai_response: response
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Chat request failed', message: error.message });
    }
});

/**
 * POST /api/chat/voice
 * Voice-based chatbot (audio upload)
 */
router.post('/voice', verifyToken, chatLimiter, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Audio file required' });
        }

        // Pass file path to service (Whisper API needs file stream)
        const response = await handleVoiceChat(req.userId, req.file.path);

        // Delete uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            ...response
        });

    } catch (error) {
        console.error('Voice chat error:', error);

        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: 'Voice chat failed', message: error.message });
    }
});

module.exports = router;
