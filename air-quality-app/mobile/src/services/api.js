import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - update this for production
const API_URL = process.env.API_URL || 'http://192.168.0.7:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error reading token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

// AQI API
export const aqiAPI = {
    getCurrent: (city, state, lat, lon) => api.get('/aqi/current', {
        params: { city, state, lat, lon }
    }),
    getForecast: (city) => api.get('/aqi/forecast', { params: { city } }),
};

// Chat API
export const chatAPI = {
    sendMessage: (message) => api.post('/chat', { message }),
    sendVoice: (formData) => api.post('/chat/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Community API
export const communityAPI = {
    getActions: () => api.get('/community/actions'),
    completeAction: (actionId) => api.post(`/community/actions/${actionId}/complete`),
};

// Products API
export const productsAPI = {
    getRecommendations: (budget, category) => api.get('/products/recommendations', {
        params: { budget, category }
    }),
    trackClick: (data) => api.post('/products/clicks', data),
};

// News API
export const newsAPI = {
    getLatest: () => api.get('/news/latest'),
};

// Notifications API
export const notificationsAPI = {
    subscribe: (expo_push_token) => api.post('/notifications/subscribe', { expo_push_token }),
    updateSettings: (settings) => api.put('/notifications/settings', settings),
};

export default api;
