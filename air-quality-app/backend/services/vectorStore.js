const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Use Gemini for FREE embeddings!
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class SimpleVectorStore {
    constructor() {
        this.documents = [];
        this.embeddings = [];
        this.storePath = path.join(__dirname, '../knowledge_base/vector_store.json');
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        // Try to load existing store
        if (fs.existsSync(this.storePath)) {
            const data = JSON.parse(fs.readFileSync(this.storePath, 'utf8'));
            this.documents = data.documents;
            this.embeddings = data.embeddings;
            console.log(`✅ Loaded ${this.documents.length} documents from store`);
        }

        this.initialized = true;
    }

    /**
     * Get embedding for text using Gemini (FREE!)
     */
    async getEmbedding(text) {
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);
        return result.embedding.values;
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(a, b) {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    /**
     * Search for relevant documents
     */
    async search(query, topK = 3) {
        await this.initialize();

        if (this.documents.length === 0) {
            console.log('⚠️  No documents in vector store');
            return [];
        }

        // Get query embedding
        const queryEmbedding = await this.getEmbedding(query);

        // Calculate similarities
        const results = this.documents.map((doc, idx) => ({
            content: doc.content,
            metadata: doc.metadata,
            similarity: this.cosineSimilarity(queryEmbedding, this.embeddings[idx])
        }));

        // Sort by similarity and return top K
        return results
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
    }

    /**
     * Load knowledge base from JSON
     */
    async loadKnowledge(documents) {
        console.log(`📝 Generating embeddings for ${documents.length} documents...`);

        this.documents = documents.map(doc => ({
            content: doc.content,
            metadata: {
                id: doc.id,
                category: doc.category,
                ...doc
            }
        }));

        // Generate embeddings (with progress)
        this.embeddings = [];
        for (let i = 0; i < documents.length; i++) {
            const embedding = await this.getEmbedding(documents[i].content);
            this.embeddings.push(embedding);

            if ((i + 1) % 5 === 0 || i === documents.length - 1) {
                console.log(`   Progress: ${i + 1}/${documents.length} documents`);
            }
        }

        // Save to disk
        const storeData = {
            documents: this.documents,
            embeddings: this.embeddings,
            updated: new Date().toISOString()
        };

        fs.writeFileSync(this.storePath, JSON.stringify(storeData, null, 2));
        console.log(`💾 Saved vector store to ${this.storePath}`);

        this.initialized = true;
        return { success: true, count: documents.length };
    }

    /**
     * Get store stats
     */
    async getStats() {
        await this.initialize();
        return {
            exists: this.documents.length > 0,
            documentCount: this.documents.length,
            storePath: this.storePath
        };
    }
}

// Singleton
const vectorStore = new SimpleVectorStore();
module.exports = vectorStore;
