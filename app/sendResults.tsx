import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, Pressable, ScrollView,
    ActivityIndicator, Alert, StyleSheet, SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Result, UserProfile, SchoolClass } from '../types/firestore';
import { useRouter, Stack } from 'expo-router';

// Data Constants
const SCHOOL_CLASSES: SchoolClass[] = [
    { id: 'year-7', name: 'Year 7' }, { id: 'year-8', name: 'Year 8' },
    { id: 'year-9', name: 'Year 9' }, { id: 'year-10', name: 'Year 10' },
    { id: 'year-11', name: 'Year 11' }, { id: 'year-12', name: 'Year 12' },
];

const SendResultsScreen = () => {
    const { userProfile } = useAuth();
    const router = useRouter();

    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [studentsInClass, setStudentsInClass] = useState<UserProfile[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    
    const [subject, setSubject] = useState('');
    const [marks, setMarks] = useState('');
    const [grade, setGrade] = useState('');
    const [comments, setComments] = useState('');

    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userProfile && userProfile.role !== 'admin') {
            Alert.alert("Access Denied", "You do not have permission to send results.", [{ text: "OK", onPress: () => router.back() }]);
        }
    }, [userProfile, router]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedClassId) {
                setStudentsInClass([]);
                setSelectedStudentId(null);
                return;
            }
            setIsLoadingStudents(true);
            setError(null);
            try {
                const studentsQuery = query(
                    collection(firestore, 'users'),
                    where('role', '==', 'student'),
                    where('classId', '==', selectedClassId)
                );
                const studentsSnapshot = await getDocs(studentsQuery);
                const studentsData = studentsSnapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
                setStudentsInClass(studentsData);
            } catch (e) {
                console.error("Error fetching students: ", e);
                setError("Failed to load students for the selected class.");
                setStudentsInClass([]);
            } finally {
                setIsLoadingStudents(false);
                setSelectedStudentId(null); // Reset student selection when class changes
            }
        };
        fetchStudents();
    }, [selectedClassId]);

    const handleSendResults = async () => {
        setIsSubmitting(true);
        setError(null);

        if (!selectedClassId || !selectedStudentId || !subject.trim() || !marks.trim()) {
            setError('Please select class, student, and fill in subject and marks.');
            setIsSubmitting(false);
            return;
        }
        const parsedMarks = parseFloat(marks);
        if (isNaN(parsedMarks)) {
            setError('Marks must be a valid number.');
            setIsSubmitting(false);
            return;
        }

        if (!userProfile || userProfile.role !== 'admin') {
            setError('Permission denied. Ensure you are logged in as an admin.');
            setIsSubmitting(false);
            return;
        }

        const resultData: Omit<Result, 'id' | 'sentAt'> = {
            studentId: selectedStudentId!,
            classId: selectedClassId!,
            subject: subject.trim(),
            marks: parsedMarks,
            grade: grade.trim(), // Grade can be empty
            comments: comments.trim(), // Comments can be empty
            sentBy: userProfile.uid,
        };

        try {
            await addDoc(collection(firestore, 'results'), {
                ...resultData,
                sentAt: serverTimestamp(),
            });
            setIsSubmitting(false);
            Alert.alert('Success', 'Results sent successfully!');
            // Clear form
            setSelectedClassId(null); // This will also clear students and selectedStudentId via useEffect
            setSubject('');
            setMarks('');
            setGrade('');
            setComments('');
            // Optionally navigate back or to another screen
            // router.back();
        } catch (e) {
            console.error("Error sending results: ", e);
            setError('Failed to send results. Please try again.');
            setIsSubmitting(false);
        }
    };

    const renderClassPickerItem = (item: SchoolClass, isSelected: boolean) => (
        <Pressable
            key={item.id}
            style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
            onPress={() => {
                if (isSubmitting) return;
                setSelectedClassId(isSelected ? null : item.id); // Toggle selection
            }}
            disabled={isSubmitting}
        >
            <Text style={[styles.pickerItemText, isSelected && styles.pickerItemSelectedText]}>{item.name}</Text>
        </Pressable>
    );
    
    const renderStudentPickerItem = (item: UserProfile, isSelected: boolean) => (
        <Pressable
            key={item.uid}
            style={[styles.pickerItem, styles.studentPickerItem, isSelected && styles.pickerItemSelected]}
            onPress={() => {
                if (isSubmitting) return;
                setSelectedStudentId(isSelected ? null : item.uid); // Toggle selection
            }}
            disabled={isSubmitting}
        >
            <Text style={[styles.pickerItemText, isSelected && styles.pickerItemSelectedText]}>{item.username} ({item.email})</Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: 'Send Student Results' }} />
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
                
                {error && <Text style={styles.errorText}>{error}</Text>}

                <Text style={styles.label}>Select Class</Text>
                <View style={styles.pickerContainer}>
                    {SCHOOL_CLASSES.map(cls => renderClassPickerItem(cls, selectedClassId === cls.id))}
                </View>

                {isLoadingStudents && <ActivityIndicator size="small" color="#012f01" style={{marginVertical: 10}} />}
                
                {selectedClassId && !isLoadingStudents && (
                    <>
                        <Text style={styles.label}>Select Student</Text>
                        {studentsInClass.length > 0 ? (
                            <View style={styles.pickerContainer}>
                                {studentsInClass.map(student => renderStudentPickerItem(student, selectedStudentId === student.uid))}
                            </View>
                        ) : (
                            <Text style={styles.infoText}>No students found in this class.</Text>
                        )}
                    </>
                )}

                <Text style={styles.label}>Subject</Text>
                <TextInput style={styles.input} placeholder="e.g., Mathematics" value={subject} onChangeText={setSubject} editable={!isSubmitting} />

                <Text style={styles.label}>Marks</Text>
                <TextInput style={styles.input} placeholder="e.g., 85" value={marks} onChangeText={setMarks} keyboardType="numeric" editable={!isSubmitting} />

                <Text style={styles.label}>Grade (Optional)</Text>
                <TextInput style={styles.input} placeholder="e.g., A+" value={grade} onChangeText={setGrade} editable={!isSubmitting} />
                
                <Text style={styles.label}>Comments (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Additional comments or feedback"
                    value={comments}
                    onChangeText={setComments}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!isSubmitting}
                />

                <Pressable
                    style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
                    onPress={handleSendResults}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.sendButtonText}>Send Results</Text>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    container: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 60 },
    // Header title style is managed by Stack.Screen
    label: { fontSize: 16, fontWeight: '500', color: '#343a40', marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 10, color: '#495057' },
    multilineInput: { minHeight: 100, textAlignVertical: 'top' },
    pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 10, backgroundColor: '#fff', borderRadius: 8, padding: 5, borderWidth: 1, borderColor: '#ced4da' },
    pickerItem: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#e9ecef', borderRadius: 20, margin: 5, borderWidth: 1, borderColor: '#dee2e6' },
    studentPickerItem: { minWidth: '45%', justifyContent: 'center' }, // Ensure student items are wide enough
    pickerItemSelected: { backgroundColor: '#014601', borderColor: '#013401' },
    pickerItemText: { fontSize: 14, color: '#495057', textAlign: 'center' },
    pickerItemSelectedText: { color: '#fff', fontWeight: 'bold' },
    infoText: { fontSize: 14, color: '#6c757d', padding: 10, fontStyle: 'italic', textAlign: 'center' },
    sendButton: { backgroundColor: '#014601', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 25 },
    sendButtonDisabled: { backgroundColor: '#a5d6a7' },
    sendButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    errorText: { color: '#d32f2f', fontSize: 14, textAlign: 'center', marginBottom: 15, fontWeight: '500' }
});

export default SendResultsScreen;
