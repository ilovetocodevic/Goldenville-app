import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Image, FlatList, ActivityIndicator, StyleSheet, SafeAreaView, Alert } from "react-native";
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, Timestamp, orderBy, Query, doc, deleteDoc } from 'firebase/firestore';
import { Note } from '../../types/firestore'; // Assuming Note type is correctly defined
import { useRouter } from 'expo-router';

const Notes = () => {
    const { currentUser, userProfile, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [notesList, setNotesList] = useState<Note[]>([]);
    const [loadingNotes, setLoadingNotes] = useState(true);

    useEffect(() => {
        if (authLoading || !userProfile) {
            if (!authLoading && !userProfile && currentUser) {
                setLoadingNotes(false);
                setNotesList([]);
            }
            return;
        }

        setLoadingNotes(true);
        let notesQuery: Query | null = null;
        const baseNotesCollection = collection(firestore, 'notes');

        if (userProfile.role === 'student') {
            if (!userProfile.classId) {
                console.log("Student has no classId, cannot fetch notes.");
                setNotesList([]);
                setLoadingNotes(false);
                return;
            }
            notesQuery = query(baseNotesCollection, where('classId', '==', userProfile.classId), orderBy('createdAt', 'desc'));
        } else if (userProfile.role === 'teacher') {
            if (userProfile.subjects && userProfile.subjects.length > 0) {
                // Assuming userProfile.subjects stores subject IDs. If names, this query needs adjustment.
                // For this example, we'll assume they are IDs as per typical Firestore design.
                // If they store names, the notes would need to store subject names too, or a more complex query/data structure is needed.
                notesQuery = query(baseNotesCollection, where('subjectId', 'in', userProfile.subjects), orderBy('createdAt', 'desc'));
            } else {
                console.log("Teacher has no subjects assigned, showing no notes.");
                setNotesList([]);
                setLoadingNotes(false);
                return;
            }
        } else if (userProfile.role === 'admin') {
            notesQuery = query(baseNotesCollection, orderBy('createdAt', 'desc'));
        } else {
            console.log("User role not recognized for notes or no query constructed.");
            setNotesList([]);
            setLoadingNotes(false);
            return;
        }

        if (!notesQuery) {
            setNotesList([]);
            setLoadingNotes(false);
            return;
        }

        const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
            const fetchedNotes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Note));
            setNotesList(fetchedNotes);
            setLoadingNotes(false);
        }, (error) => {
            console.error("Error fetching notes: ", error);
            setNotesList([]);
            setLoadingNotes(false);
        });

        return () => unsubscribe();

    }, [userProfile, authLoading, currentUser]);

    const handleDeleteNote = async (noteId: string) => {
        Alert.alert(
          "Confirm Delete",
          "Are you sure you want to delete this note?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteDoc(doc(firestore, 'notes', noteId));
                  Alert.alert("Success", "Note deleted successfully.");
                  // The onSnapshot listener should automatically update the list.
                } catch (error) {
                  console.error("Error deleting note: ", error);
                  Alert.alert("Error", "Failed to delete note. Please try again.");
                }
              },
            },
          ]
        );
    };

    const renderNoteItem = ({ item }: { item: Note }) => {
        // userProfile is available from the Notes component's scope
        const canDelete = userProfile?.role === 'admin' || (userProfile?.role === 'teacher' && item.createdBy === userProfile.uid);

        return (
            <View style={styles.noteItem}>
                <View style={styles.noteContent}>
                    <Text style={styles.noteTitle}>{item.title}</Text>
                    <Text style={styles.noteMeta}>Class: {item.classId} | Subject: {item.subjectId}</Text>
                    <Text style={styles.noteMetaDate}>
                        Created: {item.createdAt?.toDate().toLocaleDateString()}
                    </Text>
                    {/* You can add a snippet of item.content here if you wish */}
                    {/* <Text numberOfLines={2} style={styles.noteSnippet}>{item.content}</Text> */}
                </View>
                {canDelete && (
                    <Pressable
                        onPress={() => handleDeleteNote(item.id!)}
                        style={styles.deleteButton}
                    >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                )}
            </View>
        );
    };

    const ListHeaderComponent = () => (
        <>
            <View style={styles.headerContainer}>
                <Image
                    style={styles.logo}
                    source={require("../../constants/images/logo.png")} // Corrected path
                />
                <Text style={styles.headerTitle}>Subject Notes</Text>
            </View>
            {(userProfile?.role === 'teacher' || userProfile?.role === 'admin') && (
                <Pressable onPress={() => router.push('/createNote')} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Add New Note</Text>
                </Pressable>
            )}
        </>
    );

    if (authLoading || loadingNotes) {
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
                data={notesList}
                renderItem={renderNoteItem}
                keyExtractor={(item) => item.id!}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={
                    <View style={styles.emptyMessageContainer}>
                        <Text style={styles.emptyMessage}>No notes found.</Text>
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
        backgroundColor: '#f0f0f0',
    },
    headerContainer: {
        paddingHorizontal: 24,
        backgroundColor: '#012f01',
        paddingBottom: 20,
        paddingTop: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        alignItems: 'center',
    },
    logo: {
        width: 70,
        height: 70,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#b39a0c',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginHorizontal: 20,
        marginTop: 15,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 50,
    },
    emptyMessage: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    listContentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    noteItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        flexDirection: 'row', // Added for side-by-side content and delete button
        justifyContent: 'space-between', // Align items with space between
        alignItems: 'center', // Vertically align items in the center
    },
    noteContent: { // New style to wrap text content
        flex: 1, // Takes available space, pushing delete button to the end
        marginRight: 10, // Add some space before the delete button
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#012f01',
        marginBottom: 5,
    },
    noteMeta: { // Combined style for class and subject
        fontSize: 13, // Slightly smaller
        color: '#555', // Darker gray
        marginBottom: 2,
    },
    noteMetaDate: { // Style for date
        fontSize: 12,
        color: '#777', // Lighter gray
        marginTop: 3,
    },
    // noteSnippet: {
    //     fontSize: 14,
    //     color: '#444',
    //     marginTop: 5,
    // },
    deleteButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#d9534f', // Bootstrap's danger color
        borderRadius: 5,
        marginLeft: 10, // Ensure some space if noteContent is short
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default Notes;