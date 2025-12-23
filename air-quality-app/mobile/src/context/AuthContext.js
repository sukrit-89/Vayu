import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user data from storage on mount
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('userToken');
            const storedUser = await AsyncStorage.getItem('userData');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token: newToken, user: userData } = response.data;

            // Save to state
            setToken(newToken);
            setUser(userData);

            // Save to storage
            await AsyncStorage.setItem('userToken', newToken);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { token: newToken, user: newUser } = response.data;

            // Save to state
            setToken(newToken);
            setUser(newUser);

            // Save to storage
            await AsyncStorage.setItem('userToken', newToken);
            await AsyncStorage.setItem('userData', JSON.stringify(newUser));

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            // Clear state
            setToken(null);
            setUser(null);

            // Clear storage
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateUser = async (updatedData) => {
        try {
            const updatedUser = { ...user, ...updatedData };
            setUser(updatedUser);
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Update user error:', error);
        }
    };

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
