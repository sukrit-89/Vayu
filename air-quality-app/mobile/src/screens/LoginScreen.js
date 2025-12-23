import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        city: '',
        state: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!formData.email || !formData.password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!isLogin && (!formData.name || !formData.city)) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                const result = await login(formData.email, formData.password);
                if (!result.success) {
                    Alert.alert('Login Failed', result.error);
                }
            } else {
                const result = await register({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    location: {
                        city: formData.city,
                        state: formData.state,
                        lat: 28.6, // Default coordinates (can be updated later)
                        lon: 77.2,
                    },
                });
                if (!result.success) {
                    Alert.alert('Registration Failed', result.error);
                }
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <Ionicons name="leaf" size={64} color="#ffffff" />
                    <Text style={styles.title}>Air Quality</Text>
                    <Text style={styles.subtitle}>Breathe Better, Live Better</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </Text>

                    {!isLogin && (
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            autoCapitalize="words"
                        />
                    )}

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={formData.password}
                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                        secureTextEntry
                    />

                    {!isLogin && (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="City"
                                value={formData.city}
                                onChangeText={(text) => setFormData({ ...formData, city: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="State (Optional)"
                                value={formData.state}
                                onChangeText={(text) => setFormData({ ...formData, state: text })}
                            />
                        </>
                    )}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {isLogin ? 'Login' : 'Register'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        <Text style={styles.switchText}>
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            <Text style={styles.switchLink}>
                                {isLogin ? 'Register' : 'Login'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#e0f2fe',
        marginTop: 8,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    button: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    switchText: {
        fontSize: 14,
        color: '#6b7280',
    },
    switchLink: {
        color: '#3b82f6',
        fontWeight: 'bold',
    },
});
