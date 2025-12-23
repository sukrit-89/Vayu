require('dotenv').config();

console.log('Testing environment variables...\n');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('OPENAI_API_KEY starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-'));
console.log('\nFirst 10 chars:', process.env.OPENAI_API_KEY?.substring(0, 10));
console.log('\nAll loaded env vars:', Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('MONGO') || k.includes('REDIS')));
