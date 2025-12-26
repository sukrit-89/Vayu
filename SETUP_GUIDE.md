# Vayu - Air Quality App Setup Guide

Complete end-to-end setup instructions for the Vayu air quality monitoring application.

---

## 📋 Prerequisites

### Required Software
1. **Node.js** (v18+): https://nodejs.org/
2. **MongoDB** (v6+): https://www.mongodb.com/try/download/community
3. **Redis** (v7+): https://redis.io/download
4. **Git**: https://git-scm.com/downloads
5. **Android Studio** (for Android) or **Xcode** (for iOS)
6. **Expo Go** app on your mobile device

### API Keys Required
1. **OpenWeatherMap**: https://openweathermap.org/api
2. **WAQI (Air Quality)**: https://aqicn.org/api/
3. **Gemini AI**: https://aistudio.google.com/app/apikey
4. **OpenAI** (optional, for voice chat): https://platform.openai.com/api-keys

---

## 🚀 Step 1: Clone & Install

### Clone Repository
```bash
cd d:\
git clone https://github.com/your-username/Vayu.git
cd Vayu
```

### Backend Setup
```bash
cd air-quality-app\backend
npm install
```

### Mobile Setup
```bash
cd ..\mobile
npm install
```

---

## 🔧 Step 2: Database Setup

### MongoDB Setup

**Windows:**
1. Install MongoDB from: https://www.mongodb.com/try/download/community
2. MongoDB starts automatically as a service
3. Verify: `mongod --version`

**Default connection:** `mongodb://localhost:27017`

### Redis Setup

**Windows (using WSL or Docker):**

**Option 1: Docker**
```bash
docker run -d -p 6379:6379 redis:latest
```

**Option 2: Download Redis for Windows**
```bash
# Download from: https://github.com/tporadowski/redis/releases
# Run redis-server.exe
```

**Verify Redis:**
```bash
redis-cli ping
# Should return: PONG
```

---

## 🔑 Step 3: Configure Environment Variables

### Backend `.env` File

Create `air-quality-app\backend\.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/vayu
REDIS_URL=redis://localhost:6379

# API Keys
OPENWEATHER_API_KEY=your_openweather_key_here
WAQI_API_KEY=70568c15320c76a607b4a1fc1c025ffa1d6b1438
GEMINI_API_KEY=your_gemini_key_here

# Optional - Voice Chat
OPENAI_API_KEY=your_openai_key_here

# JWT Secret (generate random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### Get API Keys:

**1. OpenWeatherMap**
- Visit: https://openweathermap.org/api
- Sign up → API Keys
- Copy key to `OPENWEATHER_API_KEY`

**2. WAQI**
- Visit: https://aqicn.org/api/
- Request token
- Or use provided: `70568c15320c76a607b4a1fc1c025ffa1d6b1438`

**3. Gemini AI**
- Visit: https://aistudio.google.com/app/apikey
- Create API key
- Copy to `GEMINI_API_KEY`

**4. OpenAI (Optional)**
- Visit: https://platform.openai.com/api-keys
- Create key
- Copy to `OPENAI_API_KEY`
- **Note:** Requires billing setup for voice chat

### Mobile `.env` File

Create `air-quality-app\mobile\.env`:

```env
API_URL=http://192.168.0.7:5000
```

**Replace `192.168.0.7` with your computer's local IP:**
```bash
# Windows
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

---

## 📚 Step 4: Load RAG Knowledge Base

This initializes the chatbot's knowledge base (one-time setup):

```bash
cd d:\Vayu\air-quality-app\backend
node knowledge_base/loadKnowledge.js
```

**Expected output:**
```
🚀 Starting knowledge base loading...
📚 Found 30 knowledge documents
📝 Generating embeddings for 30 documents...
   Progress: 30/30 documents
💾 Saved vector store
✅ Knowledge base loaded successfully!
```

---

## ▶️ Step 5: Run the Application

### Terminal 1: Start Backend
```bash
cd d:\Vayu\air-quality-app\backend
npm run dev
```

**Expected output:**
```
✅ MongoDB connected
✅ Redis connected
🚀 Server running on port 5000
```

### Terminal 2: Start Mobile App
```bash
cd d:\Vayu\air-quality-app\mobile
npx expo start
```

**Expected output:**
```
› Metro waiting on exp://192.168.0.7:8081
› Scan QR code with Expo Go app
```

---

## 📱 Step 6: Test on Mobile Device

### Android
1. Install **Expo Go** from Play Store
2. Scan QR code from terminal
3. App will load on your phone

### iOS
1. Install **Expo Go** from App Store
2. Scan QR code with Camera app
3. Open in Expo Go

### First Run
1. Grant location permissions when prompted
2. Create an account or login
3. App will fetch AQI for your GPS location

---

## ✅ Step 7: Verify Everything Works

### Test Checklist

**Backend:**
- [ ] Server running on http://localhost:5000
- [ ] MongoDB connected
- [ ] Redis connected
- [ ] Can access http://localhost:5000 (shows "Vayu API Running")

**Mobile App:**
- [ ] App loads successfully
- [ ] Location permission granted
- [ ] Current AQI displays for your location
- [ ] Hourly chart shows forecast
- [ ] News feed loads
- [ ] Chat works with accurate responses

**RAG Chatbot:**
- [ ] Ask: "What to do at AQI 300?"
- [ ] Should get accurate NAQI-based response
- [ ] Mentions staying indoors, N95 masks, etc.

---

## 🐛 Troubleshooting

### Backend won't start

**MongoDB not connected:**
```bash
# Verify MongoDB is running
mongod --version
# Start MongoDB service if needed (Windows)
net start MongoDB
```

**Redis not connected:**
```bash
# Verify Redis
redis-cli ping
# Start Redis (Docker)
docker start redis
```

**Port 5000 in use:**
```env
# Change port in backend/.env
PORT=5001
```

### Mobile app can't connect to backend

**Check API_URL in mobile/.env:**
```bash
# Get your local IP
ipconfig
# Update mobile/.env
API_URL=http://YOUR_LOCAL_IP:5000
```

**Firewall blocking:**
- Allow Node.js through Windows Firewall
- Both devices on same WiFi network

### RAG chatbot giving generic responses

**Knowledge base not loaded:**
```bash
cd backend
node knowledge_base/loadKnowledge.js
```

**Check vector store exists:**
```bash
# Should exist:
ls knowledge_base/vector_store.json
```

### GPS location not working

**Permissions:**
- Check app permissions in phone settings
- Grant location access

**Fallback to manual entry:**
- If GPS fails, app uses user profile location
- Can update in Profile screen

---

## 📁 Project Structure

```
Vayu/
├── air-quality-app/
│   ├── backend/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   ├── aqiService.js
│   │   │   ├── chatService.js  # RAG chatbot
│   │   │   └── vectorStore.js  # Knowledge search
│   │   ├── knowledge_base/  # RAG knowledge
│   │   │   ├── air_quality_knowledge.json
│   │   │   └── vector_store.json
│   │   ├── .env             # Configuration
│   │   └── server.js        # Entry point
│   └── mobile/
│       ├── src/
│       │   ├── screens/     # App screens
│       │   ├── components/  # Reusable components
│       │   └── services/    # API calls
│       ├── .env             # Mobile config
│       └── app.json         # Expo config
└── README.md
```

---

## 🔒 Security Notes

### Production Deployment

**Never commit `.env` files!**
- Already in `.gitignore`
- Use environment variables on server

**Change JWT_SECRET:**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**MongoDB in production:**
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/vayu
```

**Redis in production:**
```env
REDIS_URL=redis://username:password@host:port
```

---

## 💡 Development Tips

### Hot Reload
- Backend: `nodemon` auto-restarts on changes
- Mobile: Expo hot reloads automatically

### Debug Backend
```bash
# View logs
cd backend
npm run dev

# Test API endpoint
curl http://localhost:5000/api/aqi/current?lat=28.6&lon=77.2
```

### Debug Mobile
```bash
# Clear cache
cd mobile
npx expo start -c
```

### Update Knowledge Base
```bash
# Edit: backend/knowledge_base/air_quality_knowledge.json
# Reload:
node knowledge_base/loadKnowledge.js
# Restart backend
```

---

## 📊 Monitoring

### Check AQI Updates
```
Backend logs show:
✅ WAQI: Delhi AQI = 192
✅ Updated AQI for Delhi
```

### Check RAG Responses
```
Backend logs show:
📚 Retrieved 3 relevant docs from knowledge base
```

---

## 🎯 Quick Start Summary

```bash
# 1. Install dependencies
cd backend && npm install
cd ../mobile && npm install

# 2. Configure .env files
# (Add API keys as shown above)

# 3. Load knowledge base
cd backend
node knowledge_base/loadKnowledge.js

# 4. Start backend
npm run dev

# 5. Start mobile (new terminal)
cd ../mobile
npx expo start

# 6. Scan QR code with Expo Go
```

---

## 📞 Support

**Issues:** Open on GitHub  
**Documentation:** Check `/docs` folder  
**Updates:** Run `git pull` to get latest changes

**Your Vayu app is now ready to use!** 🎉
