import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import { authAPI, aqiAPI } from '../services/api';

const LocationPicker = ({ visible, onClose, onLocationUpdate, currentLocation }) => {
    const [city, setCity] = useState(currentLocation?.city || '');
    const [state, setState] = useState(currentLocation?.state || '');
    const [loading, setLoading] = useState(false);

    // Indian states for quick selection
    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
    ];

    const handleSave = async () => {
        if (!city.trim() || !state.trim()) {
            Alert.alert('Error', 'Please enter both city and state');
            return;
        }

        setLoading(true);

        try {
            // Geocode the city to get coordinates
            const geocodeResponse = await aqiAPI.geocode(city.trim(), state.trim());
            const { lat, lon } = geocodeResponse.data.location;

            const response = await authAPI.updateLocation({
                city: city.trim(),
                state: state.trim(),
                lat,
                lon
            });

            if (response.data.success) {
                Alert.alert('Success', `Location updated to ${city}, ${state}`);
                onLocationUpdate(response.data.user, response.data.aqi);
                onClose();
            }
        } catch (error) {
            console.error('Location update error:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to update location. Please check the city/state name.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Change Location</Text>

                    <Text style={styles.label}>City</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter city name"
                        value={city}
                        onChangeText={setCity}
                    />

                    <Text style={styles.label}>State</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter state name"
                        value={state}
                        onChangeText={setState}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#1e293b',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f8fafc',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f1f5f9',
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#10b981',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LocationPicker;
