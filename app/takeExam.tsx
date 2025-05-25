import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, ActivityIndicator,
    Alert, StyleSheet, Pressable, SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Added collection, addDoc, serverTimestamp
import { Test, Question, ExamAttempt } from '../types/firestore'; // Added ExamAttempt

const TakeExamScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { userProfile } = useAuth();

    const [testData, setTestData] = useState<Test | null>(null);
    const [studentAnswers, setStudentAnswers] = useState<Map<string, number>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const testId = params.testId;
        if (!testId || typeof testId !== 'string') {
            setError("Test ID not found or invalid.");
            setIsLoading(false);
            Alert.alert("Error", "Test ID not found. Please go back and try again.", [{ text: "OK", onPress: () => router.back() }]);
            return;
        }

        const fetchTest = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const testDocRef = doc(firestore, 'tests', testId);
                const docSnap = await getDoc(testDocRef);

                if (docSnap.exists()) {
                    const fetchedTest = { id: docSnap.id, ...docSnap.data() } as Test;
                    setTestData(fetchedTest);
                    // Initialize answers map - for now, it's empty and populates on selection.
                    // If pre-selecting or loading saved answers, this would be different.
                    setStudentAnswers(new Map()); 
                } else {
                    setError("Test not found.");
                    Alert.alert("Error", "Test not found. It may have been removed.", [{ text: "OK", onPress: () => router.back() }]);
                }
            } catch (e) {
                console.error("Error fetching test: ", e);
                setError("Failed to load the test. Please check your connection and try again.");
                Alert.alert("Error", "Could not load the test.", [{ text: "OK", onPress: () => router.back() }]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTest();
    }, [params.testId, router]);

    const handleSelectAnswer = (questionId: string, optionIndex: number) => {
        if (isSubmitting) return; // Prevent changes during/after submission
        setStudentAnswers(prev => new Map(prev).set(questionId, optionIndex));
    };

    const handleSubmitExam = async () => {
        setIsSubmitting(true);

        if (studentAnswers.size !== testData?.questions.length) {
            Alert.alert("Incomplete Exam", "Please answer all questions before submitting.");
            setIsSubmitting(false);
            return;
        }

        let newScore = 0;
        const studentAnswersArray: { questionId: string; selectedAnswerIndex: number }[] = [];

        testData?.questions.forEach(question => {
            const selectedOptionIndex = studentAnswers.get(question.id!); 
            studentAnswersArray.push({ questionId: question.id!, selectedAnswerIndex: selectedOptionIndex === undefined ? -1 : selectedOptionIndex });
            if (selectedOptionIndex !== undefined && selectedOptionIndex === question.correctAnswerIndex) {
                newScore++;
            }
        });

        if (!userProfile || !testData || !params.testId) {
            Alert.alert("Error", "User or test data is missing. Cannot submit.");
            setIsSubmitting(false);
            return;
        }

        const attemptData: Omit<ExamAttempt, 'id'> = {
            testId: params.testId as string,
            studentId: userProfile.uid,
            answers: studentAnswersArray,
            score: newScore,
            totalQuestions: testData.questions.length,
            submittedAt: serverTimestamp(),
            classId: testData.classId, 
            subjectId: testData.subjectId, 
        };

        try {
            await addDoc(collection(firestore, 'examAttempts'), attemptData);
            Alert.alert(
                "Exam Submitted!",
                `You scored ${newScore} out of ${testData.questions.length}.`,
                [{ text: "OK", onPress: () => router.back() }]
            );
            // No need to setIsSubmitting(false) here if we navigate away
        } catch (submissionError) {
            console.error("Error submitting exam: ", submissionError);
            Alert.alert("Submission Failed", "An error occurred while submitting your exam. Please try again.");
            setIsSubmitting(false); 
        }
    };

    if (isLoading || !userProfile) { // Added !userProfile check
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centeredMessageContainer}>
                    <ActivityIndicator size="large" color="#012f01" />
                    <Text style={styles.loadingText}>{isLoading ? "Loading Test..." : "Verifying user..."}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centeredMessageContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.button} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    if (!testData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centeredMessageContainer}>
                    <Text style={styles.errorText}>No test data available.</Text>
                     <Pressable style={styles.button} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                <Text style={styles.testTitle}>{testData.name}</Text>
                {testData.description && <Text style={styles.testDescription}>{testData.description}</Text>}
                
                {testData.questions.map((question, qIndex) => (
                    <View key={question.id || `q-${qIndex}`} style={styles.questionContainer}>
                        <Text style={styles.questionText}>{`${qIndex + 1}. ${question.questionText}`}</Text>
                        {question.options.map((option, oIndex) => {
                            const isSelected = studentAnswers.get(question.id!) === oIndex;
                            return (
                                <Pressable
                                    key={oIndex}
                                    style={[
                                        styles.optionButton,
                                        isSelected && styles.optionButtonSelected,
                                        isSubmitting && styles.optionButtonDisabled // Disable during submission
                                    ]}
                                    onPress={() => handleSelectAnswer(question.id!, oIndex)}
                                    disabled={isSubmitting} // Disable during submission
                                >
                                    <Text style={[
                                        styles.optionText,
                                        isSelected && styles.optionTextSelected
                                    ]}>{option}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                ))}

                <Pressable
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmitExam}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Exam</Text>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f8',
    },
    scrollContentContainer: {
        padding: 20,
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
    testTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#012f01',
        marginBottom: 10,
        textAlign: 'center',
    },
    testDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    questionContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    questionText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#222',
        marginBottom: 15,
    },
    optionButton: {
        backgroundColor: '#e9ecef',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 6,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ced4da',
    },
    optionButtonSelected: {
        backgroundColor: '#014601', 
        borderColor: '#013401',
    },
    optionButtonDisabled: { // Style for disabled options
        opacity: 0.7,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    optionTextSelected: {
        color: '#fff',
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#b39a0c', 
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40, 
    },
    submitButtonDisabled: {
        backgroundColor: '#cba744', // Lighter gold when disabled
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    }
});

export default TakeExamScreen;
