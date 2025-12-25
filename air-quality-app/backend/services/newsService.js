const axios = require('axios');
const OpenAI = require('openai');
const redis = require('../config/redis');
const News = require('../models/News');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000,
    maxRetries: 3
});

/**
 * Fetch and summarize latest air pollution news from India
 * @returns {Array} Array of news articles with AI summaries
 */
async function fetchNews() {
    try {
        // Check Redis cache first (6 hour TTL)
        const cacheKey = 'news:latest';
        const cached = await redis.get(cacheKey);

        if (cached) {
            console.log('✅ Returning cached news');
            return JSON.parse(cached);
        }

        // Fetch from NewsAPI
        const newsApiKey = process.env.NEWS_API_KEY;
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: 'air pollution India OR air quality India',
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 5,
                apiKey: newsApiKey
            }
        });

        if (!response.data || !response.data.articles) {
            throw new Error('No news articles found');
        }

        const articles = response.data.articles;

        // Summarize each article using OpenAI
        const summarizedNews = await Promise.all(
            articles.map(async (article) => {
                try {
                    // Skip if no description
                    if (!article.description) {
                        return null;
                    }

                    // Generate AI summary
                    const completion = await openai.chat.completions.create({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: 'Summarize this air pollution news article in 3 concise bullet points. Focus on key facts, impacts, and any actions mentioned.'
                            },
                            {
                                role: 'user',
                                content: `Title: ${article.title}\n\nContent: ${article.description}`
                            }
                        ],
                        temperature: 0.5,
                        max_tokens: 150
                    });

                    const summary = completion.choices[0].message.content;

                    // Save to MongoDB
                    const newsDoc = await News.findOneAndUpdate(
                        { source_url: article.url },
                        {
                            title: article.title,
                            summary,
                            source_url: article.url,
                            source_name: article.source.name,
                            image_url: article.urlToImage,
                            published_at: new Date(article.publishedAt)
                        },
                        { upsert: true, new: true }
                    );

                    return {
                        id: newsDoc._id,
                        title: newsDoc.title,
                        summary: newsDoc.summary,
                        source_url: newsDoc.source_url,
                        source_name: newsDoc.source_name,
                        image_url: newsDoc.image_url,
                        published_at: newsDoc.published_at
                    };

                } catch (error) {
                    console.error(`Error summarizing article: ${article.title}`, error.message);
                    return null;
                }
            })
        );

        // Filter out null results
        const validNews = summarizedNews.filter(item => item !== null);

        // Cache for 6 hours
        await redis.setEx(cacheKey, 21600, JSON.stringify(validNews));

        console.log(`✅ Fetched and summarized ${validNews.length} news articles`);
        return validNews;

    } catch (error) {
        console.error('❌ News service error:', error.message);

        // Fallback: return latest from MongoDB
        const fallbackNews = await News.find()
            .sort({ published_at: -1 })
            .limit(5)
            .lean();

        return fallbackNews;
    }
}

module.exports = {
    fetchNews
};
