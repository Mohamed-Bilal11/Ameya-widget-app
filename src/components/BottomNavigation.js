import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BottomNavigation = () => {
    const navigation = useNavigation();
    const [showGuidelines, setShowGuidelines] = useState(false);

    const handleMicPress = async () => {
        // Check if this is the first time using the mic
        const hasUsedMic = await AsyncStorage.getItem('hasUsedMic');

        if (!hasUsedMic) {
            // First time - show guidelines
            setShowGuidelines(true);
            await AsyncStorage.setItem('hasUsedMic', 'true');
        } else {
            // Not first time - navigate directly
            navigation.navigate('MicInput');
        }
    };

    const handleStartRecording = () => {
        setShowGuidelines(false);
        navigation.navigate('MicInput');
    };

    const handleTabPress = (screenName) => {
        navigation.navigate(screenName);
    };

    return (
        <>
            <View style={styles.navigationContainer}>
                {/* Elevated Mic Button */}
                <TouchableOpacity
                    style={styles.micButton}
                    onPress={handleMicPress}
                >
                    <Ionicons name="mic" size={36} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Navigation Bar */}
                <View style={styles.navBar}>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => handleTabPress('Home')}
                    >
                        <Ionicons name="home" size={24} color="#7c3aed" />
                        <Text style={styles.tabLabel}>Home</Text>
                    </TouchableOpacity>
                    {/* Food Log Tab */}
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => handleTabPress('FoodLogs')}
                    >
                        <Ionicons name="restaurant" size={24} color="#467267" />
                        <Text style={styles.tabLabel}>Food</Text>
                    </TouchableOpacity>
                    {/* Spacer for mic button */}
                    <View style={styles.micSpacer} />
                    {/* Movement Tab */}
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => handleTabPress('Movements')}
                    >
                        <Ionicons name="walk" size={24} color="#1E88E5" />
                        <Text style={styles.tabLabel}>Movement</Text>
                    </TouchableOpacity>



                    {/* Activity Tab */}
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => handleTabPress('Activity')}
                    >
                        <Ionicons name="fitness" size={24} color="#DB7670" />
                        <Text style={styles.tabLabel}>Activity</Text>
                    </TouchableOpacity>

                    {/* Home Tab */}

                </View>
            </View>

            {/* Guidelines Modal */}
            <Modal
                visible={showGuidelines}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowGuidelines(false)}
            >
                <View style={styles.modalOverlay}>
                    <Card style={styles.guidelinesCard}>
                        <Card.Content>
                            <Text style={styles.guidelinesTitle}>🎤 Voice & Text Input</Text>
                            <Text style={styles.guidelinesSubtitle}>Quick guide to get started</Text>

                            <View style={styles.guidelinesContent}>
                                <Text style={styles.guidelinesSectionTitle}>🎤 Voice Input</Text>
                                <Text style={styles.guidelinesText}>
                                    • Click the microphone to start recording
                                </Text>
                                <Text style={styles.guidelinesText}>
                                    • Speak about your activities naturally
                                </Text>
                                <Text style={styles.guidelinesText}>
                                    • Click the microphone again to stop
                                </Text>

                                <Text style={styles.guidelinesSectionTitle}>⌨️ Text Input</Text>
                                <Text style={styles.guidelinesText}>
                                    • Type your activity information
                                </Text>
                                <Text style={styles.guidelinesText}>
                                    • System will extract data automatically
                                </Text>

                                <Text style={styles.guidelinesSectionTitle}>✨ Examples</Text>
                                <Text style={styles.guidelinesExample}>• "I completed 10,000 steps today"</Text>
                                <Text style={styles.guidelinesExample}>• "I walked 5 kilometers"</Text>
                                <Text style={styles.guidelinesExample}>• "I did yoga for 30 minutes"</Text>
                                <Text style={styles.guidelinesExample}>• "I had breakfast"</Text>
                            </View>

                            <View style={styles.guidelinesButtons}>
                                <Button
                                    mode="outlined"
                                    onPress={() => setShowGuidelines(false)}
                                    style={styles.guidelinesButton}
                                >
                                    Maybe Later
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleStartRecording}
                                    style={[styles.guidelinesButton, styles.startButton]}
                                    buttonColor="#467267"
                                >
                                    Start Recording
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    navigationContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    navBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'space-around',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 4,
        width: '90%',
        borderRadius: 20,
        marginBottom: 8,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        minWidth: 60,
    },
    micSpacer: {
        width: 70, // Same width as mic button to maintain spacing
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        marginTop: 4,
    },
    micButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#467267',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 12,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        position: 'absolute',
        top: -35, // Position above the nav bar
        zIndex: 10, // Ensure it's above other elements
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    guidelinesCard: {
        width: '100%',
        maxWidth: 400,
        elevation: 8,
        borderRadius: 16,
    },
    guidelinesTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    guidelinesSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    guidelinesContent: {
        marginBottom: 24,
    },
    guidelinesSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#467267',
        marginTop: 16,
        marginBottom: 8,
    },
    guidelinesText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        lineHeight: 20,
    },
    guidelinesExample: {
        fontSize: 14,
        color: '#DB7670',
        marginBottom: 4,
        fontStyle: 'italic',
    },
    guidelinesButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    guidelinesButton: {
        flex: 1,
    },
    startButton: {
        elevation: 2,
    },
});

export default BottomNavigation;
