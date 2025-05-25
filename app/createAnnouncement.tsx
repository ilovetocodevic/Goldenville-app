import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, Pressable, ScrollView,
    ActivityIndicator, Alert, StyleSheet, SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Announcement } from '../types/firestore'; // Omit will be handled in function
import { useRouter, Stack } from 'expo-router';

const CreateAnnouncementScreen = () => {
    const { userProfile } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // useEffect to check admin role early, though primary control is via navigation access
    useEffect(() => {
        if (userProfile && userProfile.role !== 'admin') {
            Alert.alert("Access Denied", "You do not have permission to create announcements.", [{ text: "OK", onPress: () => router.back() }]);
        }
    }, [userProfile, router]);


    const handlePostAnnouncement = async () => {
        setIsLoading(true);
        setError(null);

        if (!title.trim() || !content.trim()) {
            setError('Please fill in both title and content.');
            setIsLoading(false);
            return;
        }

        if (!userProfile || userProfile.role !== 'admin') {
            setError('Permission denied or user profile not found. Ensure you are logged in as an admin.');
            setIsLoading(false);
            Alert.alert("Error", "Permission denied or user profile not found.");
            return;
        }

        const newAnnouncementData: Omit<Announcement, 'id' | 'createdAt'> = {
            title: title.trim(),
            content: content.trim(),
            createdBy: userProfile.uid,
        };

        try {
            await addDoc(collection(firestore, 'announcements'), {
                ...newAnnouncementData,
                createdAt: serverTimestamp(),
            });
            setIsLoading(false);
            Alert.alert('Success', 'Announcement posted successfully!');
            router.back(); 
        } catch (e) {
            console.error("Error adding announcement: ", e);
            setError('Failed to post announcement. Please try again.');
            setIsLoading(false);
            Alert.alert("Error", "Failed to post announcement.");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: 'Create Announcement' }} />
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
                
                {error && <Text style={styles.errorText}>{error}</Text>}

                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter announcement title"
                    value={title}
                    onChangeText={setTitle}
                    editable={!isLoading}
                />

                <Text style={styles.label}>Content</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Enter announcement content"
                    value={content}
                    onChangeText={setContent}
                    multiline
                    numberOfLines={8} // Increased for more content
                    textAlignVertical="top"
                    editable={!isLoading}
                />

                <Pressable
                    style={[styles.postButton, isLoading && styles.postButtonDisabled]}
                    onPress={handlePostAnnouncement}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.postButtonText}>Post Announcement</Text>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Consistent background
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40, 
    },
    // Header title is set by Stack.Screen, no specific style needed here for that
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#343a40', // Dark gray
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ced4da', // Light gray border
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 20, // Increased margin for better spacing
        color: '#495057', // Standard input text color
    },
    multilineInput: {
        minHeight: 150, // Good height for content
    },
    postButton: {
        backgroundColor: '#014601', // Primary green color
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 25, // Space above the button
    },
    postButtonDisabled: {
        backgroundColor: '#a5d6a7', // Lighter green when disabled/loading
    },
    postButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    errorText: {
        color: '#d32f2f', // Standard error red
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
        fontWeight: '500',
    }
});

export default CreateAnnouncementScreen;
