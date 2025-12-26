import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VoiceButton from '../components/VoiceButton';
import { chatAPI, aqiAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import * as Location from 'expo-location';

export default function ChatScreen() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Hello! I\'m your AI health advisor. Ask me anything about air quality and your health! 🌿',
            isBot: true,
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentAQI, setCurrentAQI] = useState(null);
    const [gpsLocation, setGpsLocation] = useState(null);
    const [fetchingAQI, setFetchingAQI] = useState(true);

    // Get GPS location (same as HomeScreen)
    React.useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    setGpsLocation({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude
                    });
                } else {
                    setFetchingAQI(false);
                }
            } catch (error) {
                console.error('GPS error:', error);
                setFetchingAQI(false);
            }
        })();
    }, []);

    // Fetch AQI when GPS is ready
    React.useEffect(() => {
        const fetchAQI = async () => {
            try {
                const locationToUse = gpsLocation || user?.location;
                if (locationToUse) {
                    const response = await aqiAPI.getCurrent(
                        null,  // city
                        null,  // state
                        locationToUse.latitude || locationToUse.lat,
                        locationToUse.longitude || locationToUse.lon
                    );
                    setCurrentAQI(response.data.data);
                    console.log('Chat AQI loaded:', response.data.data.aqi);
                }
            } catch (error) {
                console.log('Could not fetch AQI for chat:', error);
            } finally {
                setFetchingAQI(false);
            }
        };

        if (gpsLocation || user?.location) {
            fetchAQI();
        }
    }, [gpsLocation, user]);

    const sendMessage = async (messageText) => {
        if (!messageText || messageText.trim().length === 0) return;

        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            text: messageText,
            isBot: false,
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Send to API with current AQI
            const response = await chatAPI.sendMessage(messageText, currentAQI);
            const aiResponse = response.data.ai_response;

            // Add bot response
            const botMessage = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                isBot: true,
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            Alert.alert('Error', 'Failed to get response');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoice = async (formData) => {
        setIsLoading(true);
        try {
            const response = await chatAPI.sendVoice(formData);
            const { user_message, ai_response } = response.data;

            // Add user voice message
            const userMessage = {
                id: Date.now().toString(),
                text: `🎤 ${user_message}`,
                isBot: false,
            };
            setMessages((prev) => [...prev, userMessage]);

            // Add bot response
            const botMessage = {
                id: (Date.now() + 1).toString(),
                text: ai_response,
                isBot: true,
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Voice chat error:', error);
            Alert.alert('Error', 'Failed to process voice message');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Ionicons name="chatbubbles" size={28} color="#3b82f6" />
                <Text style={styles.headerTitle}>Health Chat</Text>
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}
            >
                <ScrollView
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                >
                    {messages.map((message) => (
                        <View
                            key={message.id}
                            style={[
                                styles.messageBubble,
                                message.isBot ? styles.botBubble : styles.userBubble,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    message.isBot ? styles.botText : styles.userText,
                                ]}
                            >
                                {message.text}
                            </Text>
                        </View>
                    ))}
                    {isLoading && (
                        <View style={[styles.messageBubble, styles.botBubble]}>
                            <Text style={styles.botText}>Typing...</Text>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask about air quality..."
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={() => sendMessage(inputText)}
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={() => sendMessage(inputText)}
                        disabled={isLoading || inputText.trim().length === 0}
                    >
                        <Ionicons name="send" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                    <VoiceButton onResponse={handleVoice} disabled={isLoading} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 8,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 12,
        color: '#1f2937',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginVertical: 4,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#e0f2fe',
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#3b82f6',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    botText: {
        color: '#1f2937',
    },
    userText: {
        color: '#ffffff',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        marginRight: 8,
    },
    sendButton: {
        marginRight: 8,
    },
});
