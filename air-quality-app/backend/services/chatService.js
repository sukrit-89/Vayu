const OpenAI = require('openai');
const User = require('../models/User');
const { getCurrentAQI } = require('./aqiService');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000, // 60 seconds timeout
    maxRetries: 3,   // Retry failed requests up to 3 times
});

/**
 * Handle text chat with context-aware AI health advisor
 * @param {string} userId - User ID
 * @param {string} message - User message
 * @returns {string} AI response
 */
async function handleChat(userId, message) {
    try {
        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get current AQI for user's location
        let currentAQI = { aqi: 100 };
        try {
            currentAQI = await getCurrentAQI(user.location.city, user.location.state);
        } catch (error) {
            console.error('Unable to fetch current AQI, using default');
        }

        // Build context-aware system prompt
        const healthConditions = user.health_conditions.length > 0
            ? user.health_conditions.join(', ')
            : 'none reported';

        const aqiLevel = currentAQI.aqi <= 50 ? 'Good' :
            currentAQI.aqi <= 100 ? 'Moderate' :
                currentAQI.aqi <= 200 ? 'Unhealthy for Sensitive Groups' :
                    currentAQI.aqi <= 300 ? 'Unhealthy' : 'Hazardous';

        const systemPrompt = `You are a helpful air quality health advisor for India. 

Current Context:
- Location: ${user.location.city}, ${user.location.state}
- Current AQI: ${currentAQI.aqi} (${aqiLevel})
- User Health Conditions: ${healthConditions}
- Language Preference: ${user.language === 'hi' ? 'Hindi (respond in Hindi)' : 'English'}

Guidelines:
1. Give SHORT, practical advice (2-3 sentences max)
2. Prioritize FREE or low-cost remedies first
3. Reference the current AQI in your advice
4. Be empathetic and supportive
5. If AQI is hazardous, strongly recommend staying indoors
6. Suggest masks, air purifiers, or medical consultation when appropriate
7. Include simple home remedies like steam inhalation, breathing exercises
${user.language === 'hi' ? '8. RESPOND IN HINDI (Devanagari script)' : ''}`;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 200
        });

        return completion.choices[0].message.content;

    } catch (error) {
        console.error('❌ Chat service error:', error.message);
        throw new Error('Unable to process chat request');
    }
}

/**
 * Handle voice chat (audio transcription + response)
 * @param {string} userId - User ID
 * @param {string} audioFilePath - Path to audio file
 * @returns {Object} Text response and optional voice URL
 */
async function handleVoiceChat(userId, audioFilePath) {
    const fs = require('fs');

    try {
        // Validate file exists
        if (!fs.existsSync(audioFilePath)) {
            console.error('❌ Audio file not found:', audioFilePath);
            throw new Error('Audio file not found');
        }

        // Check file size
        const stats = fs.statSync(audioFilePath);
        console.log(`📁 Audio file: ${audioFilePath}, Size: ${stats.size} bytes`);

        if (stats.size === 0) {
            console.error('❌ Audio file is empty');
            throw new Error('Audio file is empty');
        }

        // Transcribe audio using OpenAI Whisper
        console.log('🎤 Starting Whisper transcription...');
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioFilePath),
            model: 'whisper-1'
        });

        const userMessage = transcription.text;
        console.log(`✅ Transcribed: "${userMessage}"`);

        // Get text response
        const aiResponse = await handleChat(userId, userMessage);

        return {
            user_message: userMessage,
            ai_response: aiResponse,
            voice_url: null // Can integrate ElevenLabs here for voice synthesis
        };

    } catch (error) {
        console.error('❌ Voice chat error details:');
        console.error('  Error name:', error.name);
        console.error('  Error message:', error.message);
        console.error('  Error stack:', error.stack);

        // Log OpenAI specific errors
        if (error.response) {
            console.error('  OpenAI API Response:', {
                status: error.response.status,
                data: error.response.data
            });
        }

        // Return user-friendly error
        if (error.message.includes('API key')) {
            throw new Error('OpenAI API key is invalid or missing');
        } else if (error.message.includes('quota')) {
            throw new Error('OpenAI API quota exceeded');
        } else if (error.message.includes('file')) {
            throw new Error('Audio file processing failed');
        } else {
            throw new Error(`Unable to process voice chat: ${error.message}`);
        }
    }
}

module.exports = {
    handleChat,
    handleVoiceChat
};
