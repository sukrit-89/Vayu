# Air Quality App 🌿

A comprehensive full-stack mobile application providing real-time air quality monitoring for India with AI-powered health chatbot, community actions, news summaries, and product recommendations.

## 🎯 Features

### Mobile App (React Native + Expo)
- ✅ **Real-time AQI Display** - Live air quality data from CPCB (800+ stations across India)
- 🤖 **AI Health Chatbot** - Context-aware health advice powered by OpenAI GPT-4o-mini
- 🎤 **Voice Chat** - Hindi/English voice support using Whisper API
- 👥 **Community Actions** - Petitions, reports, and social campaigns to fight air pollution
- 📰 **AI News Summaries** - Automatically summarized air pollution news
- 🛒 **Product Recommendations** - Free and paid solutions (masks, purifiers, etc.)
- ⚙️ **Profile & Settings** - Customizable AQI alerts and health tracking

### Backend (Node.js + Express)
- 🇮🇳 **CPCB API Integration** - India's official air quality data source
- 💾 **MongoDB + Redis** - Data persistence and caching (10min TTL for AQI)
- 🔐 **JWT Authentication** - Secure user authentication
- 🚦 **Rate Limiting** - 100 req/15min (general), 10 req/min (chat)
- ⏰ **Cron Jobs** - Auto-update AQI (30min), alerts (hourly), news (6hr)
- 📱 **Push Notifications** - Expo push notifications for AQI alerts

## 📁 Project Structure

```
air-quality-app/
├── backend/
│   ├── config/          # Database & Redis configuration
│   ├── models/          # Mongoose schemas (7 models)
│   ├── routes/          # API endpoints (6 route modules)
│   ├── services/        # Business logic (CPCB, OpenAI, News)
│   ├── middleware/      # Auth & rate limiting
│   ├── cron/            # Scheduled jobs
│   ├── server.js        # Express app entry point
│   └── package.json
│
├── mobile/
│   └── src/
│       ├── screens/     # 5 main screens (Login, Home, Chat, Community, Profile)
│       ├── components/  # 5 reusable components
│       ├── navigation/  # Bottom tab navigator
│       ├── services/    # API client with axios
│       ├── context/     # AuthContext for state management
│       └── App.js       # Mobile app entry point
│
└── docker-compose.yml   # MongoDB + Redis containers
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **MongoDB** running (or use Docker)
- **Redis** running (or use Docker)
- **Expo CLI** for mobile development
- **API Keys**:
  - CPCB API key from [data.gov.in](https://data.gov.in)
  - OpenAI API key from [platform.openai.com](https://platform.openai.com)
  - NewsAPI key from [newsapi.org](https://newsapi.org)

### Step 1: Start MongoDB & Redis (Using Docker)

```bash
# From project root
docker-compose up -d
```

This starts:
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your API keys:
# - CPCB_API_KEY (from data.gov.in)
# - OPENAI_API_KEY
# - NEWS_API_KEY
# - JWT_SECRET (any random string)

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

**Test the API:**
```bash
curl http://localhost:5000
```

### Step 3: Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update API_URL in .env if needed (default: http://localhost:5000/api)

# Start Expo development server
npx expo start
```

**Run on Device/Emulator:**
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app (iOS/Android)

## 📌 API Endpoints

### Backend authentication
```http
POST /api/auth/register
POST /api/auth/login
```

### Air Quality
```http
GET /api/aqi/current?city=Delhi&state=Delhi
GET /api/aqi/forecast?city=Delhi
```

### Chatbot
```http
POST /api/chat              # Text chat
POST /api/chat/voice        # Voice chat (FormData with audio file)
```

### Community
```http
GET /api/community/actions
POST /api/community/actions/:id/complete
```

### News & Products
```http
GET /api/news/latest
GET /api/products/recommendations?budget=free
POST /api/products/clicks
```

### Notifications
```http
POST /api/notifications/subscribe
PUT /api/notifications/settings
```

## 🔑 Obtaining API Keys

### 1. CPCB API Key (FREE)
1. Visit [data.gov.in](https://data.gov.in)
2. Click "Register" → Create account
3. Login → Go to "My Account"
4. Copy your 40-character API key
5. Resource ID: `3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69`

### 2. OpenAI API Key
1. Visit [platform.openai.com](https://platform.openai.com)
2. Sign up and go to API Keys section
3. Create new API key (starts with `sk-`)
4. Model used: `gpt-4o-mini` (cost-effective)

### 3. NewsAPI Key
1. Visit [newsapi.org](https://newsapi.org)
2. Sign up for free tier
3. Copy your API key

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: MongoDB 7.0 (Mongoose ODM)
- **Cache**: Redis 7.0
- **Authentication**: JWT + bcryptjs
- **AI**: OpenAI API (GPT-4o-mini, Whisper)
- **External APIs**: CPCB (data.gov.in), NewsAPI
- **Job Scheduler**: node-cron
- **Rate Limiting**: express-rate-limit

### Mobile
- **Framework**: React Native 0.73 + Expo 50
- **Navigation**: React Navigation 6 (Bottom Tabs)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Victory Native
- **Audio**: expo-av
- **Gradients**: expo-linear-gradient
- **Storage**: AsyncStorage

## 📊 Database Models

1. **User** - Auth, location, health conditions, notification settings
2. **AQIData** - Historical air quality data for forecasting
3. **Alert** - Notification history
4. **CommunityAction** - Petitions, campaigns, reports
5. **UserAction** - User participation tracking
6. **ProductClick** - Analytics for product recommendations
7. **News** - AI-summarized news articles

## 🔄 Cron Jobs

- **Update AQI** - Every 30 minutes (fetches data for 10 major cities)
- **Send Alerts** - Every hour (checks user thresholds)
- **Update News** - Every 6 hours (fetches & summarizes latest news)

## 🎨 Mobile Screens

1. **Login/Register** - User onboarding with gradient UI
2. **Home** - AQI card, health tips, quick actions, news preview
3. **Chat** - Text + voice chatbot with bilingual support
4. **Community** - List of active campaigns and actions
5. **Profile** - User settings, notification preferences, logout

## 🌐 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/airquality
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
CPCB_API_KEY=your_data_gov_in_key
CPCB_RESOURCE_ID=3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69
OPENAI_API_KEY=sk-your_key
NEWS_API_KEY=your_newsapi_key
```

### Mobile `.env`
```env
API_URL=http://localhost:5000/api
```

**Note:** For Android emulator, use `http://10.0.2.2:5000/api`

## 🚨 Important Notes

1. **CPCB API Rate Limits**: 1,000 requests/hour (FREE tier)
2. **OpenAI Costs**: GPT-4o-mini is very cost-effective (~$0.15/1M tokens)
3. **Redis Caching**: AQI data cached for 10 minutes to reduce API calls
4. **Voice Chat**: Requires microphone permissions on mobile
5. **Push Notifications**: Requires Expo push token (placeholder implementation)

## 🧪 Testing

### Backend
```bash
cd backend
npm test  # Run tests (to be implemented)
```

### Manual API Testing
Use Thunder Client, Postman, or curl:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "location": {"city": "Delhi", "state": "Delhi", "lat": 28.6, "lon": 77.2}
  }'

# Get AQI for Delhi
curl "http://localhost:5000/api/aqi/current?city=Delhi&state=Delhi" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Mobile
Test on real devices for best experience:
```bash
npx expo start --tunnel  # Creates public URL for testing on any device
```

## 📦 Deployment

### Backend (Railway / Heroku / DigitalOcean)
1. Set environment variables in platform
2. Connect MongoDB Atlas (cloud MongoDB)
3. Connect Redis Cloud or Upstash
4. Deploy from GitHub

### Mobile (Expo EAS Build)
```bash
cd mobile
npx eas build --platform android
npx eas build --platform ios
```

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running: `docker ps`
- Check Redis is running: `redis-cli ping`
- Verify environment variables in `.env`

### Mobile app can't connect to API
- iOS Simulator: Use `http://localhost:5000/api`
- Android Emulator: Use `http://10.0.2.2:5000/api`
- Real Device: Use your computer's local IP (e.g., `http://192.168.1.10:5000/api`)

### CPCB API errors
- Verify API key is correct (40 characters)
- Check rate limits (1000/hour)
- Some cities may not have recent data

## 📄 License

MIT License - free to use for personal and commercial projects

## 🙏 Acknowledgments

- **CPCB** - Central Pollution Control Board of India
- **OpenAI** - GPT-4o-mini and Whisper API
- **NewsAPI** - News aggregation
- **data.gov.in** - Open Government Data Platform

## 🤝 Contributing

Contributions welcome! Please open issues or submit PRs.

---

**Built with ❤️ using CPCB data to help Indians breathe better**
