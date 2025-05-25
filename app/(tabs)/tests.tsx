import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Image, FlatList, ActivityIndicator, StyleSheet, Alert, SafeAreaView } from "react-native";
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, doc, deleteDoc, Timestamp, orderBy, Query } from 'firebase/firestore';
import { Test } from '../../types/firestore';
import { useRouter } from 'expo-router';

const TestsScreen = () => {
    const { userProfile, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [testsList, setTestsList] = useState<Test[]>([]);
    const [loadingTests, setLoadingTests] = useState(true);

    useEffect(() => {
        if (authLoading || !userProfile) {
            if (!authLoading && !userProfile) { // Only set loading false if auth is done and still no profile
                setLoadingTests(false);
                setTestsList([]);
            }
            return;
        }

        setLoadingTests(true);
        let testsQuery: Query | null = null;
        const baseTestsCollection = collection(firestore, 'tests');

        if (userProfile.role === 'student') {
            if (!userProfile.classId) {
                console.log("Student has no classId, cannot fetch tests.");
                setTestsList([]);
                setLoadingTests(false);
                return;
            }
            testsQuery = query(baseTestsCollection, where('classId', '==', userProfile.classId), orderBy('createdAt', 'desc'));
        } else if (userProfile.role === 'teacher') {
            if (userProfile.subjects && userProfile.subjects.length > 0) {
                // Assuming userProfile.subjects stores subject IDs
                testsQuery = query(baseTestsCollection, where('subjectId', 'in', userProfile.subjects), orderBy('createdAt', 'desc'));
            } else {
                console.log("Teacher has no subjects assigned, showing no tests.");
                setTestsList([]);
                setLoadingTests(false);
                return;
            }
        } else if (userProfile.role === 'admin') {
            testsQuery = query(baseTestsCollection, orderBy('createdAt', 'desc'));
        } else {
            console.log("User role not recognized for tests or no query constructed.");
            setTestsList([]);
            setLoadingTests(false);
            return;
        }

        if (!testsQuery) {
            setTestsList([]);
            setLoadingTests(false);
            return;
        }

        const unsubscribe = onSnapshot(testsQuery, (snapshot) => {
            const fetchedTests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Test));
            setTestsList(fetchedTests);
            setLoadingTests(false);
        }, (error) => {
            console.error("Error fetching tests: ", error);
            setTestsList([]);
            setLoadingTests(false);
        });

        return () => unsubscribe();
    }, [userProfile, authLoading]);

    const handleDeleteTest = async (testId: string) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this test?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(firestore, 'tests', testId));
                            Alert.alert("Success", "Test deleted successfully.");
                        } catch (error) {
                            console.error("Error deleting test: ", error);
                            Alert.alert("Error", "Failed to delete test. Please try again.");
                        }
                    },
                },
            ]
        );
    };

    const renderTestItem = ({ item }: { item: Test }) => {
        // userProfile and router are available from the TestsScreen component's scope.
        const canDelete = userProfile?.role === 'admin' || (userProfile?.role === 'teacher' && item.createdBy === userProfile.uid);

        const onTestPress = () => {
            if (userProfile?.role === 'student') {
              router.push({ pathname: '/takeExam', params: { testId: item.id } });
            } else if (userProfile?.role === 'teacher' && item.createdBy === userProfile.uid) {
              // Navigate teacher to a new screen to view attempts for this test
              router.push({ pathname: '/viewExamAttempts', params: { testId: item.id, testName: item.name } });
            } else if (userProfile?.role === 'admin') {
              // Admin might also navigate to view attempts or an edit screen.
              // For now, let's also navigate admin to view attempts.
              router.push({ pathname: '/viewExamAttempts', params: { testId: item.id, testName: item.name } });
            }
            // Other roles or teachers not owning the test will have no action if disabled prop is used correctly.
          };

        return (
            <Pressable 
                onPress={onTestPress} 
                style={styles.testItemContainer} 
                disabled={!(userProfile?.role === 'student' || (userProfile?.role === 'teacher' && item.createdBy === userProfile.uid) || userProfile?.role === 'admin')}
            >
                <View style={styles.testItemContent}>
                    <Text style={styles.testItemName}>{item.name}</Text>
                    <Text style={styles.testItemMeta}>Subject: {item.subjectId} | Class: {item.classId}</Text>
                    {item.description && <Text style={styles.testItemDescription} numberOfLines={2}>{item.description}</Text>}
                    {item.deadline && <Text style={styles.testItemDeadline}>Deadline: {item.deadline.toDate().toLocaleDateString()}</Text>}
                </View>
                {canDelete && (
                    <Pressable
                        onPress={() => handleDeleteTest(item.id!)} 
                        style={styles.deleteButton}
                    >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                )}
            </Pressable>
        );
    };

    const ListHeaderComponent = () => (
        <>
            <View style={styles.headerContainer}>
                <Image
                    style={styles.logo}
                    source={require("../../constants/images/logo.png")} // Corrected path
                />
                <Text style={styles.headerTitle}>Tests & Assignments</Text>
            </View>
            {(userProfile?.role === 'teacher' || userProfile?.role === 'admin') && (
                 <Pressable onPress={() => router.push('/createTest')} style={styles.createButton}>
                    <Text style={styles.createButtonText}>+ Create New Test/Assignment</Text>
                </Pressable>
            )}
        </>
    );

    if (authLoading || loadingTests) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ListHeaderComponent />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#012f01" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={testsList}
                renderItem={renderTestItem}
                keyExtractor={(item) => item.id!}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={
                    <View style={styles.emptyMessageContainer}>
                        <Text style={styles.emptyMessageText}>No tests or assignments found.</Text>
                    </View>
                }
                contentContainerStyle={styles.listContentContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f4f8', // Light background for the screen
    },
    headerContainer: {
        backgroundColor: '#012f01', // Dark green
        paddingBottom: 20,
        paddingTop: Platform.OS === 'android' ? 25 : 20, // Handle status bar for Android
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 60, // Slightly smaller logo
        height: 60,
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 24, // Slightly smaller title
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: '#b39a0c', // Gold color
        paddingVertical: 14, // Increased padding
        paddingHorizontal: 20,
        borderRadius: 30, // More rounded
        marginHorizontal: 20,
        marginTop: 20, // Space from header
        marginBottom: 20, // Space before list
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 30,
    },
    emptyMessageText: {
        fontSize: 17,
        color: '#555', // Darker gray for better readability
        textAlign: 'center',
    },
    listContentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    testItemContainer: { // Changed from testItem to reflect it's a Pressable container
        backgroundColor: 'white',
        padding: 18,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    testItemContent: { // Changed from testContent
        flex: 1,
        marginRight: 10,
    },
    testItemName: { // Changed from testTitle
        fontSize: 18,
        fontWeight: 'bold',
        color: '#012f01',
        marginBottom: 6,
    },
    testItemMeta: { // Changed from testMeta
        fontSize: 13,
        color: '#454545',
        marginBottom: 4,
    },
    testItemDescription: { // Changed from testDescription
        fontSize: 14,
        color: '#606060',
        marginBottom: 6,
    },
    testItemDeadline: { // Changed from testDeadline
        fontSize: 13,
        color: '#c0392b',
        fontWeight: '500',
    },
    deleteButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#e74c3c', // Softer red
        borderRadius: 6,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default TestsScreen;