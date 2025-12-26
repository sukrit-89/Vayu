const OpenAI = require('openai');
const User = require('../models/User');
const { getCurrentAQI } = require('./aqiService');
const vectorStore = require('./vectorStore');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000, // 60 seconds timeout
    maxRetries: 3,   // Retry failed requests up to 3 times
});

/**
 * Handle text chat with RAG-enhanced AI health advisor
 * @param {string} userId - User ID
 * @param {string} message - User message
 * @returns {string} AI response
 */
async function handleChat(userId, message, currentAQI = null) {
    try {
        console.log('🤖 handleChat called with:', {
            userId,
            messageLength: message.length,
            receivedAQI: currentAQI?.aqi || 'none'
        });

        // Check for greeting messages
        const greetings = ['hi', 'hello', 'hey', 'namaste'];
        const isGreeting = greetings.some(greeting =>
            message.toLowerCase().trim() === greeting ||
            message.toLowerCase().trim().startsWith(greeting + ' ')
        );

        if (isGreeting) {
            return "Hi! 👋 I am Vayu Bot, here to help you with air quality advice and queries. Made by the team HackWarriors. Feel free to ask me anything about air quality, health precautions, or AQI levels!";
        }

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get current AQI for user's location
        let aqiToUse = currentAQI;
        if (!aqiToUse || !aqiToUse.aqi) {
            console.log('⚠️ No AQI provided, fetching from user profile location...');
            try {
                aqiToUse = await getCurrentAQI(user.location.city, user.location.state);
            } catch (error) {
                console.error('Unable to fetch current AQI, using default');
                aqiToUse = { aqi: 100 };
            }
        }

        console.log('📊 Using AQI:', aqiToUse.aqi, 'for chat response');

        // RAG: Search knowledge base for relevant information
        let relevantKnowledge = '';
        try {
            const searchResults = await vectorStore.search(message, 3);
            if (searchResults.length > 0) {
                relevantKnowledge = '\n\nRelevant Knowledge:\n' +
                    searchResults.map(doc => `- ${doc.content}`).join('\n');
                console.log(`📚 Retrieved ${searchResults.length} relevant docs from knowledge base`);
            }
        } catch (error) {
            console.log('⚠️ Knowledge base search failed, using base model only');
        }

        // Build context-aware system prompt with RAG
        const healthConditions = user.health_conditions.length > 0
            ? user.health_conditions.join(', ')
            : 'none reported';

        const aqiLevel = aqiToUse.aqi <= 50 ? 'Good' :
            aqiToUse.aqi <= 100 ? 'Satisfactory' :
                aqiToUse.aqi <= 200 ? 'Moderate' :
                    aqiToUse.aqi <= 300 ? 'Poor' :
                        aqiToUse.aqi <= 400 ? 'Very Poor' : 'Severe';

        const systemPrompt = `You are a helpful air quality health advisor for India following NAQI (National Air Quality Index) standards.

Current Context:
- Location: ${user.location.city || 'Unknown'}, ${user.location.state || ''}
- Current AQI: ${aqiToUse.aqi} (${aqiLevel})
- User Health Conditions: ${healthConditions}
- Language Preference: ${user.language === 'hi' ? 'Hindi (respond in Hindi)' : 'English'}
${relevantKnowledge}

Guidelines:
1. Use the relevant knowledge provided above to give ACCURATE, fact-based advice
2. Give SHORT, practical advice (2-3 sentences max)
3. Prioritize FREE or low-cost remedies first (steam inhalation, jaggery, turmeric milk)
4. Reference the current AQI level in your advice
5. For AQI > 300: strongly recommend staying indoors, N99 masks, air purifiers
6. For AQI 200-300: suggest N95 masks, limit outdoor activities
7. For AQI < 100: reassure user but mention general precautions
8. Cite specific NAQI ranges when relevant (e.g., "At AQI 350, which is Very Poor...")
${user.language === 'hi' ? '9. RESPOND IN HINDI (Devanagari script)' : ''}`;

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
