import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, Pressable, ScrollView,
    ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Note, SchoolClass, Subject } from '../types/firestore';
import { useRouter } from 'expo-router';

// Data Constants (Ideally, these would be fetched or from a central constants file)
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

const CreateNoteScreen = () => {
    const { userProfile } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Determine available subjects based on user role
    useEffect(() => {
        if (userProfile) {
            if (userProfile.role === 'admin') {
                setAvailableSubjects(ALL_SUBJECTS_DATA);
            } else if (userProfile.role === 'teacher' && userProfile.subjects) {
                // Assuming userProfile.subjects stores subject names. If IDs, adjust logic.
                const teacherSubjectNames = userProfile.subjects;
                const teacherSubjects = ALL_SUBJECTS_DATA.filter(s => teacherSubjectNames.includes(s.name));
                setAvailableSubjects(teacherSubjects);
            } else {
                setAvailableSubjects([]);
            }
        } else {
            // Redirect or show error if userProfile is not available (e.g. not logged in/authorized)
            // This screen should ideally be protected by navigation setup in _layout.tsx
            Alert.alert("Access Denied", "You must be logged in as a teacher or admin to create notes.");
            if(router.canGoBack()) router.back(); else router.replace('/(tabs)/notes');
        }
    }, [userProfile, router]);

    const handleSaveNote = async () => {
        setIsLoading(true);
        setError(null);

        if (!title.trim() || !content.trim() || !selectedClassId || !selectedSubjectId) {
            setError('Please fill in all fields and select a class and subject.');
            setIsLoading(false);
            return;
        }

        if (!userProfile) {
            setError('User profile not found. Cannot save note.');
            setIsLoading(false);
            return;
        }

        const newNoteData: Omit<Note, 'id' | 'createdAt'> = {
            title: title.trim(),
            content: content.trim(),
            classId: selectedClassId,
            subjectId: selectedSubjectId,
            createdBy: userProfile.uid,
            // `updatedAt` can be added if needed, typically on edit.
        };

        try {
            await addDoc(collection(firestore, 'notes'), {
                ...newNoteData,
                createdAt: serverTimestamp(),
            });
            setIsLoading(false);
            Alert.alert('Success', 'Note saved successfully!');
            router.back(); // Go back to the notes list or previous screen
        } catch (e) {
            console.error("Error adding document: ", e);
            setError('Failed to save note. Please try again.');
            setIsLoading(false);
        }
    };
    
    // Render function for simulated picker items
    const renderPickerItem = (item: SchoolClass | Subject, type: 'class' | 'subject', isSelected: boolean) => (
        <Pressable
            key={item.id}
            style={[
                styles.pickerItem,
                isSelected && styles.pickerItemSelected,
            ]}
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
            <Text style={styles.headerTitle}>Create New Note</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.label}>Title</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter note title"
                value={title}
                onChangeText={setTitle}
                editable={!isLoading}
            />

            <Text style={styles.label}>Content</Text>
            <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Enter note content"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!isLoading}
            />

            <Text style={styles.label}>Select Subject</Text>
            <View style={styles.pickerContainer}>
                {availableSubjects.length > 0 ? (
                    availableSubjects.map(subject => renderPickerItem(subject, 'subject', selectedSubjectId === subject.id))
                ) : (
                    <Text style={styles.infoText}>No subjects available for selection. Teachers must have subjects assigned.</Text>
                )}
            </View>
            
            <Text style={styles.label}>Select Class</Text>
            <View style={styles.pickerContainer}>
                {SCHOOL_CLASSES.map(schoolClass => renderPickerItem(schoolClass, 'class', selectedClassId === schoolClass.id))}
            </View>

            <Pressable
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSaveNote}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Note</Text>
                )}
            </Pressable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40, // Ensure space for the button
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#012f01', // Dark green
        textAlign: 'center',
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#343a40',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 10, // Reduced margin for tighter layout
        color: '#495057',
    },
    multilineInput: {
        height: 150, // Adjust height for content
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 5,
        borderWidth: 1,
        borderColor: '#ced4da',
    },
    pickerItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#e9ecef',
        borderRadius: 20, // Pill shape
        margin: 5,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    pickerItemSelected: {
        backgroundColor: '#014601', // Dark green for selected
        borderColor: '#013401',
    },
    pickerItemText: {
        fontSize: 14,
        color: '#495057',
    },
    pickerItemSelectedText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#014601',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    saveButtonDisabled: {
        backgroundColor: '#a5d6a7', // Lighter green when disabled
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    errorText: {
        color: '#d32f2f', // Red for errors
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
    },
    infoText: {
        fontSize: 14,
        color: '#6c757d',
        padding: 10,
        fontStyle: 'italic',
    }
});

export default CreateNoteScreen;
