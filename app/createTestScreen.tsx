import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, Pressable, ScrollView,
    ActivityIndicator, Alert, StyleSheet, TouchableOpacity
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Test, Question, SchoolClass, Subject } from '../types/firestore';
import { useRouter } from 'expo-router';

// Data Constants (Ideally, these would be fetched or from a central constants file)
// For simplicity, these are slightly reduced. Expand as needed.
const SCHOOL_CLASSES: SchoolClass[] = [
    { id: 'year-7', name: 'Year 7' }, { id: 'year-8', name: 'Year 8' },
    { id: 'year-9', name: 'Year 9' }, { id: 'year-10', name: 'Year 10' },
    { id: 'year-11', name: 'Year 11' }, { id: 'year-12', name: 'Year 12' },
];

const ALL_SUBJECTS_DATA: Subject[] = [
    { id: 'math', name: 'Mathematics' }, { id: 'phy', name: 'Physics' },
    { id: 'chem', name: 'Chemistry' }, { id: 'bio', name: 'Biology' },
    { id: 'econ', name: 'Economics' }, { id: 'biz', name: 'Business Studies'},
    { id: 'fmath', name: 'Further Maths' }, { id: 'facc', name: 'F-Accounting' },
    { id: 'comm', name: 'Commerce' }, { id: 'fandn', name: 'Food and Nutrition' },
    { id: 'geo', name: 'Geography'}, {id: 'hist', name: 'History'},
    { id: 'coding', name: 'Coding' }, { id: 'lit', name: 'Lit-in-English' },
    { id: 'robo', name: 'Robotics' }, {id: 'cs', name: 'Computer Science'},
    {id: 'eng', name: 'English Language'}, {id: 'art', name: 'Art & Design'}
];

const CreateTestScreen = () => {
    const { userProfile } = useAuth();
    const router = useRouter();

    const [testName, setTestName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
    
    const [questions, setQuestions] = useState<Question[]>([]);
    const [deadline, setDeadline] = useState(''); // Simple string input for deadline

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userProfile) {
            if (userProfile.role === 'admin') {
                setAvailableSubjects(ALL_SUBJECTS_DATA);
            } else if (userProfile.role === 'teacher' && userProfile.subjects) {
                const teacherSubjectNames = userProfile.subjects; // Assuming names are stored
                const teacherSubjects = ALL_SUBJECTS_DATA.filter(s => teacherSubjectNames.includes(s.name));
                setAvailableSubjects(teacherSubjects);
            } else {
                setAvailableSubjects([]);
                 if (userProfile.role !== 'student') { // Students shouldn't see this screen anyway
                    Alert.alert("Notice", "You have no subjects assigned. Please contact an admin.");
                }
            }
        } else {
            // This screen should be protected by navigation in _layout.tsx
            // If somehow accessed without profile, redirect.
            Alert.alert("Access Denied", "User profile not available.");
            if(router.canGoBack()) router.back(); else router.replace('/(tabs)/tests');
        }
    }, [userProfile, router]);

    // --- Question Management Functions ---
    const handleAddQuestion = useCallback(() => {
        setQuestions(prevQuestions => [
            ...prevQuestions,
            { id: '', questionText: '', options: ['', '', '', ''], correctAnswerIndex: -1 } // Default 4 empty options
        ]);
    }, []);

    const handleQuestionTextChange = useCallback((text: string, questionIndex: number) => {
        setQuestions(prevQuestions =>
            prevQuestions.map((q, i) => (i === questionIndex ? { ...q, questionText: text } : q))
        );
    }, []);

    const handleOptionTextChange = useCallback((text: string, questionIndex: number, optionIndex: number) => {
        setQuestions(prevQuestions =>
            prevQuestions.map((q, i) =>
                i === questionIndex
                    ? { ...q, options: q.options.map((opt, oi) => (oi === optionIndex ? text : opt)) }
                    : q
            )
        );
    }, []);

    const handleSetCorrectAnswer = useCallback((questionIndex: number, optionIndex: number) => {
        setQuestions(prevQuestions =>
            prevQuestions.map((q, i) => (i === questionIndex ? { ...q, correctAnswerIndex: optionIndex } : q))
        );
    }, []);

    const handleRemoveQuestion = useCallback((questionIndex: number) => {
        setQuestions(prevQuestions => prevQuestions.filter((_, i) => i !== questionIndex));
    }, []);


    const handleSaveTest = async () => {
        setIsLoading(true);
        setError(null);

        if (!testName.trim() || !selectedClassId || !selectedSubjectId) {
            setError('Test Name, Class, and Subject are required.');
            setIsLoading(false);
            return;
        }
        if (questions.length === 0) {
            setError('Please add at least one question.');
            setIsLoading(false);
            return;
        }
        for (const q of questions) {
            if (!q.questionText.trim()) {
                setError('All questions must have text.');
                setIsLoading(false);
                return;
            }
            if (q.options.filter(opt => opt.trim() !== "").length < 2) {
                setError(`Question "${q.questionText.substring(0,20)}..." must have at least two non-empty options.`);
                setIsLoading(false);
                return;
            }
            if (q.correctAnswerIndex === -1 || q.options[q.correctAnswerIndex]?.trim() === "") {
                setError(`Question "${q.questionText.substring(0,20)}..." must have a valid correct answer selected.`);
                setIsLoading(false);
                return;
            }
        }

        if (!userProfile) {
            setError('User profile not found. Cannot save test.');
            setIsLoading(false);
            return;
        }

        const newTestData: Omit<Test, 'id' | 'createdAt' | 'updatedAt'> = {
            name: testName.trim(),
            description: description.trim(),
            classId: selectedClassId,
            subjectId: selectedSubjectId,
            questions: questions.map((q, index) => ({
                id: `q_${index}_${Date.now()}`, // Simple unique ID
                questionText: q.questionText.trim(),
                options: q.options.map(opt => opt.trim()).filter(opt => opt !== ""), // Store only non-empty options
                correctAnswerIndex: q.correctAnswerIndex,
            })),
            createdBy: userProfile.uid,
        };
        if (deadline.trim()) {
            // Basic date string validation (e.g., YYYY-MM-DD) - can be improved
            if (/^\d{4}-\d{2}-\d{2}$/.test(deadline.trim())) {
                newTestData.deadline = Timestamp.fromDate(new Date(deadline.trim()));
            } else {
                setError('Invalid deadline format. Please use YYYY-MM-DD.');
                setIsLoading(false);
                return;
            }
        }

        try {
            await addDoc(collection(firestore, 'tests'), {
                ...newTestData,
                createdAt: serverTimestamp(),
            });
            setIsLoading(false);
            Alert.alert('Success', 'Test saved successfully!');
            router.back();
        } catch (e) {
            console.error("Error adding document: ", e);
            setError('Failed to save test. Please try again.');
            setIsLoading(false);
        }
    };
    
    // Render function for simulated picker items (similar to createNote)
    const renderPickerItem = (item: SchoolClass | Subject, type: 'class' | 'subject', isSelected: boolean) => (
        <Pressable
            key={item.id}
            style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
            onPress={() => {
                if (type === 'class') setSelectedClassId(item.id);
                if (type === 'subject') setSelectedSubjectId(item.id);
            }}
        >
            <Text style={[styles.pickerItemText, isSelected && styles.pickerItemSelectedText]}>{item.name}</Text>
        </Pressable>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
            <Text style={styles.headerTitle}>Create New Test</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.label}>Test Name</Text>
            <TextInput style={styles.input} placeholder="e.g., Midterm Physics Test" value={testName} onChangeText={setTestName} editable={!isLoading} />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput style={[styles.input, styles.multilineInput]} placeholder="Brief overview of the test" value={description} onChangeText={setDescription} multiline editable={!isLoading} />
            
            <Text style={styles.label}>Deadline (Optional, YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="e.g., 2024-12-31" value={deadline} onChangeText={setDeadline} editable={!isLoading} keyboardType="numeric" />

            <Text style={styles.label}>Select Subject</Text>
            <View style={styles.pickerContainer}>
                {availableSubjects.length > 0 ? (
                    availableSubjects.map(subject => renderPickerItem(subject, 'subject', selectedSubjectId === subject.id))
                ) : (
                    <Text style={styles.infoText}>No subjects available. Teachers must have subjects assigned via admin.</Text>
                )}
            </View>
            
            <Text style={styles.label}>Select Class</Text>
            <View style={styles.pickerContainer}>
                {SCHOOL_CLASSES.map(schoolClass => renderPickerItem(schoolClass, 'class', selectedClassId === schoolClass.id))}
            </View>

            <Text style={styles.sectionTitle}>Questions</Text>
            {questions.map((question, qIndex) => (
                <View key={qIndex} style={styles.questionContainer}>
                    <Text style={styles.questionHeader}>Question {qIndex + 1}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={`Enter text for question ${qIndex + 1}`}
                        value={question.questionText}
                        onChangeText={text => handleQuestionTextChange(text, qIndex)}
                        multiline
                        editable={!isLoading}
                    />
                    <Text style={styles.optionsLabel}>Options (Mark correct one):</Text>
                    {question.options.map((option, oIndex) => (
                        <View key={oIndex} style={styles.optionInputContainer}>
                            <TextInput
                                style={styles.optionInput}
                                placeholder={`Option ${oIndex + 1}`}
                                value={option}
                                onChangeText={text => handleOptionTextChange(text, qIndex, oIndex)}
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.correctAnswerButton,
                                    question.correctAnswerIndex === oIndex && styles.correctAnswerButtonSelected
                                ]}
                                onPress={() => handleSetCorrectAnswer(qIndex, oIndex)}
                                disabled={isLoading}
                            >
                                <Text style={styles.correctAnswerButtonText}>
                                    {question.correctAnswerIndex === oIndex ? 'Correct' : 'Mark'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                     <Pressable style={styles.removeQuestionButton} onPress={() => handleRemoveQuestion(qIndex)} disabled={isLoading}>
                        <Text style={styles.removeQuestionButtonText}>Remove Question {qIndex + 1}</Text>
                    </Pressable>
                </View>
            ))}

            <Pressable style={styles.addQuestionButton} onPress={handleAddQuestion} disabled={isLoading}>
                <Text style={styles.addQuestionButtonText}>+ Add Question</Text>
            </Pressable>

            <Pressable
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSaveTest}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Test</Text>}
            </Pressable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    contentContainer: { padding: 20, paddingBottom: 60 },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#012f01', textAlign: 'center', marginBottom: 25 },
    label: { fontSize: 16, fontWeight: '500', color: '#343a40', marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 10, color: '#495057' },
    multilineInput: { minHeight: 80, textAlignVertical: 'top' },
    pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 10, backgroundColor: '#fff', borderRadius: 8, padding: 5, borderWidth: 1, borderColor: '#ced4da' },
    pickerItem: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#e9ecef', borderRadius: 20, margin: 5, borderWidth: 1, borderColor: '#dee2e6' },
    pickerItemSelected: { backgroundColor: '#014601', borderColor: '#013401' },
    pickerItemText: { fontSize: 14, color: '#495057' },
    pickerItemSelectedText: { color: '#fff', fontWeight: 'bold' },
    infoText: { fontSize: 14, color: '#6c757d', padding: 10, fontStyle: 'italic' },
    
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#012f01', marginTop: 25, marginBottom: 10, borderTopColor: '#e0e0e0', borderTopWidth:1, paddingTop:15 },
    questionContainer: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#dee2e6' },
    questionHeader: { fontSize: 17, fontWeight: '500', color: '#343a40', marginBottom: 10 },
    optionsLabel: { fontSize: 15, fontWeight: '500', color: '#495057', marginTop: 10, marginBottom: 5 },
    optionInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    optionInput: { flex: 1, borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, marginRight: 10, backgroundColor: '#fff' },
    correctAnswerButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#6c757d', borderRadius: 6 },
    correctAnswerButtonSelected: { backgroundColor: '#28a745' }, // Green for selected
    correctAnswerButtonText: { color: '#fff', fontSize: 13, fontWeight: '500' },
    
    addQuestionButton: { backgroundColor: '#007bff', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom:25 },
    addQuestionButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
    removeQuestionButton: { backgroundColor: '#dc3545', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginTop: 10 },
    removeQuestionButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },

    saveButton: { backgroundColor: '#014601', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    saveButtonDisabled: { backgroundColor: '#a5d6a7' },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    errorText: { color: '#d32f2f', fontSize: 14, textAlign: 'center', marginBottom: 15 }
});

export default CreateTestScreen;
