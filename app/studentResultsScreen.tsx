import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, ActivityIndicator,
    Alert, StyleSheet, FlatList, SafeAreaView, Platform // Added Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext'; // Adjusted path: ../context/AuthContext
import { firestore } from '../firebaseConfig'; // Adjusted path: ../firebaseConfig
import { collection, query, where, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { Result } from '../types/firestore'; // Adjusted path: ../types/firestore
import { Stack, useRouter } from 'expo-router'; // Added useRouter for back button on error

// No (Tabs.Screen) specific imports or manual step comments are needed here
// as this is a standalone screen navigated to from settings.

const StudentResultsScreen = () => {
    const { currentUser, userProfile, isLoading: authLoading } = useAuth();
    const [resultsList, setResultsList] = useState<Result[]>([]);
    const [loadingResults, setLoadingResults] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // For back navigation on critical error

    useEffect(() => {
        // Set header title using Stack.Screen
        // This will be picked up by the navigator if this screen is part of a Stack.
        // If not, this won't have an effect here but is good practice.
        // Alternatively, use router.setOptions({ title: 'My Results' });
    }, [router]);


    useEffect(() => {
        if (authLoading) {
            return; // Wait for auth state to be determined
        }
        if (!currentUser || !userProfile) {
            setLoadingResults(false);
            setResultsList([]);
            setError(userProfile === null && currentUser ? "Your profile data is currently unavailable. Please try again shortly." : "You need to be logged in to view your results.");
            return;
        }
        
        if (userProfile.role !== 'student') {
            setError("Access Denied: This section is for students only.");
            setLoadingResults(false);
            setResultsList([]);
            // Optionally navigate back if not a student and somehow reached here
            // Alert.alert("Access Denied", "This section is for students only.", [{ text: "OK", onPress: () => router.back() }]);
            return;
        }

        setLoadingResults(true);
        setError(null);

        const resultsQuery = query(
            collection(firestore, 'results'),
            where('studentId', '==', currentUser.uid),
            orderBy('sentAt', 'desc')
        );

        const unsubscribe = onSnapshot(resultsQuery, (snapshot) => {
            const fetchedResults = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Result));
            setResultsList(fetchedResults);
            setLoadingResults(false);
        }, (err) => {
            console.error("Error fetching results: ", err);
            setError("Failed to load results. Please try again.");
            setLoadingResults(false);
        });

        return () => unsubscribe();
    }, [currentUser, userProfile, authLoading, router]); // Added router to dependency array

    const renderResultItem = ({ item }: { item: Result }) => (
        <View style={styles.resultItem}>
            <Text style={styles.subjectText}>{item.subject}</Text>
            <View style={styles.detailsRow}>
                <Text style={styles.marksText}>Marks: {item.marks !== undefined ? item.marks : 'N/A'}</Text>
                {item.grade && <Text style={styles.gradeText}>Grade: {item.grade}</Text>}
            </View>
            {item.comments && <Text style={styles.commentsText}>Comments: {item.comments}</Text>}
            <Text style={styles.dateText}>
                Date Sent: {item.sentAt ? new Date(item.sentAt.seconds * 1000).toLocaleDateString() : 'N/A'}
            </Text>
        </View>
    );

    // Dynamic Header for this screen
    // This will appear if app/studentResultsScreen.tsx is used in a Stack navigator
    // If it's a top-level modal, header might be managed by how it's presented.
    // For file-based routing, Expo Router creates a Stack screen by default.
    const screenTitle = "My Academic Results";

    if (authLoading || loadingResults) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: screenTitle }} />
                <View style={styles.centeredMessageContainer}>
                    <ActivityIndicator size="large" color="#012f01" />
                    <Text style={styles.loadingText}>Loading Results...</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: "Error" }} />
                <View style={styles.centeredMessageContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable onPress={() => router.back()} style={styles.backButtonOnError}>
                        <Text style={styles.backButtonTextOnError}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: screenTitle }} />
            {/* <Text style={styles.screenTitle}>{screenTitle}</Text> // Title is now handled by Stack.Screen */}
            <FlatList
                data={resultsList}
                renderItem={renderResultItem}
                keyExtractor={(item) => item.id!}
                ListHeaderComponent={<Text style={styles.screenTitleActual}>{screenTitle}</Text>} // Keep a visible title if Stack.Screen is not effective or for style
                ListEmptyComponent={
                    <View style={styles.centeredMessageContainer}>
                        <Text style={styles.emptyMessageText}>No results found.</Text>
                    </View>
                }
                contentContainerStyle={resultsList.length === 0 ? { flexGrow: 1 } : styles.listContentContainer}
            />
        </SafeAreaView>
    );
};

// Styles are identical to what was provided by the worker in Turn 41's report
// with minor additions for error button and a visible title if Stack.Screen doesn't show one.
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8' },
    centeredMessageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    loadingText: { marginTop: 10, fontSize: 16, color: '#012f01' },
    errorText: { fontSize: 16, color: '#d32f2f', textAlign: 'center', marginBottom: 20 },
    screenTitleActual: { fontSize: 24, fontWeight: 'bold', color: '#012f01', textAlign: 'center', paddingVertical: Platform.OS === 'android' ? 20 : 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    listContentContainer: { paddingHorizontal: 15, paddingBottom: 20 },
    resultItem: { backgroundColor: '#fff', padding: 15, marginVertical: 8, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    subjectText: { fontSize: 18, fontWeight: 'bold', color: '#b39a0c', marginBottom: 8 },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
    marksText: { fontSize: 16, color: '#333' },
    gradeText: { fontSize: 16, color: '#014601', fontWeight: '500' },
    commentsText: { fontSize: 14, color: '#555', fontStyle: 'italic', marginTop: 4, marginBottom: 6, lineHeight: 20 },
    dateText: { fontSize: 12, color: '#777', textAlign: 'right', marginTop: 8 },
    emptyMessageText: { fontSize: 16, color: '#555', textAlign: 'center' },
    backButtonOnError: { marginTop: 20, backgroundColor: '#012f01', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
    backButtonTextOnError: { color: '#fff', fontSize: 16 }
});

export default StudentResultsScreen;
