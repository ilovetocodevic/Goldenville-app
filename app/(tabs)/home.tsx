import React, { useState, useEffect } from 'react';
import { Text, View, Image, ScrollView, Pressable, FlatList, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../firebaseConfig';
import { collection, query, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { Announcement } from '../../types/firestore';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
    const { userProfile, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [announcementsList, setAnnouncementsList] = useState<Announcement[]>([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

    // Keep existing events state if they are not being moved to Firestore yet
    const [events, setEvents] = useState([
        {title: "Children's Day Celebration", date: '26th May 2025'}
    ]);
     const handleDeleteEvent = (index: number) => { // Kept if events are still local
        const newEvents = [...events];
        newEvents.splice(index, 1);
        setEvents(newEvents);
    };


    useEffect(() => {
        if (authLoading) {
            return; // Wait for auth to complete
        }
        setLoadingAnnouncements(true);
        const announcementsQuery = query(collection(firestore, 'announcements'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
            const fetchedAnnouncements = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Announcement));
            setAnnouncementsList(fetchedAnnouncements);
            setLoadingAnnouncements(false);
        }, (error) => {
            console.error("Error fetching announcements: ", error);
            setLoadingAnnouncements(false);
        });

        return () => unsubscribe();
    }, [authLoading]);

    const renderAnnouncementItem = ({ item }: { item: Announcement }) => (
        <View style={styles.announcementItem}>
            <Text style={styles.announcementTitle}>{item.title}</Text>
            <Text style={styles.announcementContent}>{item.content}</Text>
            {item.createdAt && (
                <Text style={styles.announcementDate}>
                    Posted: {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
                </Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentContainer}
                style={styles.scrollViewStyle}
            >
                <Image
                    style={styles.logo}
                    source={require("../../constants/images/logo.png")} // Corrected path
                />

                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionTitle}>Announcements 📢</Text>
                    {userProfile?.role === 'admin' && (
                        <Pressable onPress={() => router.push('/createAnnouncement')} style={styles.addButton}>
                            <Text style={styles.addButtonText}>+ Add</Text>
                        </Pressable>
                    )}
                </View>
                
                {loadingAnnouncements ? (
                    <ActivityIndicator size="large" color="#012f01" style={{marginTop: 20}}/>
                ) : announcementsList.length === 0 ? (
                     <Text style={styles.noItemsText}>No announcements yet.</Text>
                ) : (
                    <FlatList
                        data={announcementsList}
                        renderItem={renderAnnouncementItem}
                        keyExtractor={(item) => item.id!}
                        scrollEnabled={false} // Disable FlatList scrolling, ScrollView handles it
                        // ListHeaderComponent={<Text style={styles.sectionTitle}>Announcements 📢</Text>} // Title now outside
                    />
                )}


                {/* Static Sections - Kept as is for now */}
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Recently Viewed Notes</Text>
                    <Text style={styles.cardContent}>MathemathicsWeek5</Text>
                    <Text style={styles.cardContent}>PhysicsWeek4</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Recently Attempted Test</Text>
                    <Text style={styles.cardContent}>No recent test</Text>
                </View>

                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                 {events.length === 0 ? (
                    <Text style={styles.noItemsText}>No upcoming events.</Text>
                ) : (
                    events.map((event, index) => (
                        <View key={index} style={styles.card}>
                             <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Text style={styles.cardTitle}>{event.title}</Text>
                                {userProfile?.role === 'admin' && ( // Example: Admin can delete local events
                                    <Pressable onPress={() => handleDeleteEvent(index)}>
                                        <Text style={{color: 'red', fontSize: 16}}>×</Text>
                                    </Pressable>
                                )}
                            </View>
                            <Text style={styles.cardContent}>Date: {event.date}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollViewStyle: {
        flex: 1,
        paddingHorizontal: 20, // Consistent padding
    },
    scrollContentContainer: {
        paddingBottom: 40, // Ensure space at bottom
    },
    logo: {
        width: 70, // Slightly smaller logo
        height: 70,
        marginTop: 30, // Adjusted margin
        marginBottom: 25,
        alignSelf: "center"
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 22, // Slightly smaller
        fontWeight: "700",
        color: "#012f01",
        // marginBottom: 12, // Moved to container or handled by spacing
    },
    addButton: {
        backgroundColor: '#b39a0c',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        elevation: 2,
    },
    addButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    announcementItem: {
        backgroundColor: "#f9f9f9", // Lighter background for items
        borderRadius: 12,
        padding: 15,
        marginBottom: 15, // Consistent margin
        borderWidth: 1,
        borderColor: '#eee',
        // shadowColor: '#000',
        // shadowOffset: {width: 0, height: 1},
        // shadowOpacity: 0.05,
        // shadowRadius: 3,
        // elevation: 1, // Subtle elevation
    },
    announcementTitle: {
        fontSize: 17, // Slightly smaller
        color: "#b39a0c",
        fontWeight: "600",
        marginBottom: 6,
    },
    announcementContent: {
        fontSize: 14, // Slightly smaller
        color: "#555", // Darker gray
        lineHeight: 20, // Improved readability
    },
    announcementDate: {
        fontSize: 12,
        color: '#777',
        marginTop: 8,
        textAlign: 'right',
    },
    noItemsText: {
        textAlign: 'center',
        color: '#777',
        marginVertical: 20,
        fontSize: 15,
    },
    // Styles for existing static cards
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20, // Consistent margin
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08, // Softer shadow
        shadowRadius: 6,
        elevation: 2, // Softer elevation
    },
    cardTitle: {
        fontSize: 18,
        color: "#b39a0c",
        fontWeight: "600",
        marginBottom: 10, // Consistent margin
    },
    cardContent: {
        fontSize: 15,
        color: "#666",
        marginBottom: 5, // Consistent margin
    }
});