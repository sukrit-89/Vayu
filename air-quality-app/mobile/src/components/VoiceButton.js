import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceButton({ onResponse, disabled }) {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const startRecording = async () => {
        try {
            // Request permissions
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission Required', 'Please allow microphone access to use voice chat');
                return;
            }

            // Configure audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // Start recording
            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        try {
            setIsRecording(false);
            setIsProcessing(true);

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('audio', {
                uri,
                type: 'audio/m4a',
                name: 'voice.m4a',
            });

            // Call parent callback with FormData
            if (onResponse) {
                await onResponse(formData);
            }

            setRecording(null);
        } catch (error) {
            console.error('Failed to stop recording:', error);
            Alert.alert('Error', 'Failed to process recording');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isProcessing) {
        return <ActivityIndicator size="large" color="#3b82f6" />;
    }

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isRecording && styles.recording,
                disabled && styles.disabled
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={disabled}
        >
            <Ionicons
                name={isRecording ? 'stop-circle' : 'mic'}
                size={36}
                color={isRecording ? '#ef4444' : '#3b82f6'}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    recording: {
        backgroundColor: '#fee2e2',
    },
    disabled: {
        opacity: 0.5,
    },
});
