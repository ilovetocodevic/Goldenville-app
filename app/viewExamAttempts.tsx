import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, ActivityIndicator,
    Alert, StyleSheet, FlatList, SafeAreaView, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { ExamAttempt, UserProfile } from '../types/firestore';

interface EnrichedAttempt {
    id: string;
    username: string;
    score: number;
    totalQuestions: number;
    submittedAt: Timestamp;
}

const ViewExamAttemptsScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { testId, testName } = params;

    const [attemptsWithUsernames, setAttemptsWithUsernames] = useState<EnrichedAttempt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!testId || typeof testId !== 'string') {
            setError("Test ID not found or invalid.");
            setIsLoading(false);
            Alert.alert("Error", "Invalid test information provided.", [{ text: "OK", onPress: () => router.back() }]);
            return;
        }

        const fetchAttempts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const attemptsQuery = query(collection(firestore, 'examAttempts'), where('testId', '==', testId));
                const attemptsSnapshot = await getDocs(attemptsQuery);
                const attemptsData = attemptsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as ExamAttempt));

                if (attemptsData.length === 0) {
                    setAttemptsWithUsernames([]);
                    setIsLoading(false);
                    return; // No attempts, no need to fetch usernames
                }
                
                const enrichedAttemptsPromises = attemptsData.map(async (attempt) => {
                    const userDocRef = doc(firestore, 'users', attempt.studentId);
                    const userDocSnap = await getDoc(userDocRef);
                    const username = userDocSnap.exists() ? (userDocSnap.data() as UserProfile).username : 'Unknown Student';
                    return {
                        id: attempt.id!,
                        username,
                        score: attempt.score,
                        totalQuestions: attempt.totalQuestions,
                        submittedAt: attempt.submittedAt,
                    };
                });

                const resolvedEnrichedAttempts = await Promise.all(enrichedAttemptsPromises);
                
                // Sort by score (descending) then by submission time (ascending)
                resolvedEnrichedAttempts.sort((a, b) => b.score - a.score || a.submittedAt.toMillis() - b.submittedAt.toMillis());
                
                setAttemptsWithUsernames(resolvedEnrichedAttempts);

            } catch (e) {
                console.error("Error fetching exam attempts: ", e);
                setError("Failed to load exam attempts. Please try again.");
                Alert.alert("Error", "Could not load attempts data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttempts();
    }, [testId, router]);

    const renderAttemptItem = ({ item }: { item: EnrichedAttempt }) => (
        <View style={styles.attemptItem}>
            <Text style={styles.usernameText}>{item.username}</Text>
            <Text style={styles.scoreText}>Score: {item.score} / {item.totalQuestions}</Text>
            <Text style={styles.dateText}>
                Submitted: {item.submittedAt ? new Date(item.submittedAt.seconds * 1000).toLocaleString() : 'N/A'}
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: testName ? `Attempts: ${testName as string}` : 'Loading Attempts...' }} />
                <View style={styles.centeredMessageContainer}>
                    <ActivityIndicator size="large" color="#012f01" />
                    <Text style={styles.loadingText}>Loading Attempts...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                 <Stack.Screen options={{ title: 'Error' }} />
                <View style={styles.centeredMessageContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.button} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: testName ? `Attempts: ${testName as string}` : 'Exam Attempts' }} />
            <FlatList
                data={attemptsWithUsernames}
                renderItem={renderAttemptItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <Text style={styles.listHeader}>
                        {attemptsWithUsernames.length > 0 ? `Showing ${attemptsWithUsernames.length} Attempt(s)` : ''}
                    </Text>
                }
                ListEmptyComponent={
                    <View style={styles.centeredMessageContainer}>
                        <Text style={styles.emptyMessageText}>No attempts yet for this exam.</Text>
                    </View>
                }
                contentContainerStyle={styles.listContentContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f8',
    },
    centeredMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#012f01',
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#012f01',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#012f01',
        paddingHorizontal: 15,
        paddingVertical: 10,
        textAlign: 'center',
        backgroundColor: '#e9ecef',
        marginBottom: 5,
    },
    listContentContainer: {
        paddingBottom: 20,
    },
    attemptItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    usernameText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
    },
    scoreText: {
        fontSize: 15,
        color: '#014601', // Dark green for score
        marginVertical: 4,
    },
    dateText: {
        fontSize: 13,
        color: '#666',
    },
    emptyMessageText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginTop: 20, // Add some margin if header is present
    },
});

export default ViewExamAttemptsScreen;
