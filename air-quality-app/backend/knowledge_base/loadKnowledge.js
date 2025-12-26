#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

/**
 * Load air quality knowledge base into vector store
 * Run this script once to initialize the knowledge base:
 * node knowledge_base/loadKnowledge.js
 */

const fs = require('fs');
const path = require('path');
const vectorStore = require('../services/vectorStore');

async function loadKnowledge() {
    try {
        console.log('🚀 Starting knowledge base loading...\n');

        // Read knowledge base JSON
        const knowledgePath = path.join(__dirname, 'air_quality_knowledge.json');
        const rawData = fs.readFileSync(knowledgePath, 'utf8');
        const documents = JSON.parse(rawData);

        console.log(`📚 Found ${documents.length} knowledge documents\n`);

        // Load into vector store
        const result = await vectorStore.loadKnowledge(documents);

        console.log(`\n✅ Knowledge base loaded successfully!`);
        console.log(`   Documents: ${result.count}`);
        console.log(`   Vector Store: ChromaDB (local)`);

        // Test search
        console.log('\n🔍 Testing search functionality...');
        const testQuery = 'What should I do when AQI is above 300?';
        const results = await vectorStore.search(testQuery, 2);

        console.log(`   Query: "${testQuery}"`);
        console.log(`   Found ${results.length} relevant documents:\n`);

        results.forEach((doc, idx) => {
            console.log(`   ${idx + 1}. ${doc.content.substring(0, 100)}...`);
        });

        console.log('\n✨ RAG chatbot is ready to use!\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error loading knowledge base:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run
loadKnowledge();
