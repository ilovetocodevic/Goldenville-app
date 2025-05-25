import {View, Text, Pressable, Switch, StyleSheet, ActivityIndicator, Alert} from "react-native"
import React, {useState} from "react"
import { useRouter } from 'expo-router'; // Ensure useRouter is imported
import { useAuth } from '../../context/AuthContext'; 

const Settings = () => {
    const router = useRouter(); // Initialize router
    const { logout, currentUser, userProfile } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Use userProfile for role-specific settings display if needed
    // const userRole = userProfile?.role;

    const [isDarkMode, setIsDarkMode] = useState(false); // Assuming this is local UI state
    const [enableNotifications, setEnableNotifications] = useState(false); // Assuming this is local UI state

    const handleLogout = async () => {
      setIsLoggingOut(true);
      try {
        await logout();
        // Navigation to login screen will be handled by the logic in `app/_layout.tsx`
      } catch (error) {
        console.error("Logout failed", error);
        Alert.alert("Logout Failed", "An error occurred while trying to log out. Please try again.");
        setIsLoggingOut(false); // Only set to false on error, as success leads to unmount
      }
    };

    // Dynamic styles based on isDarkMode
    const styles = StyleSheet.create({
        container: {
            backgroundColor: isDarkMode ? '#121212' : '#f0f0f0', // Darker dark, lighter light
            flex: 1,
            paddingTop: 50, // Safe area consideration
        },
        contentContainer: {
            paddingHorizontal: 20,
            paddingBottom: 30,
        },
        title: {
            fontSize: 28, // Larger title
            fontWeight: 'bold',
            marginBottom: 30, // Increased margin
            color: isDarkMode ? '#fff' : '#b1980d',
            textAlign: 'center', // Centered title
        },
        sectionTitle: {
            fontSize: 20, // Slightly larger section titles
            fontWeight: '600',
            marginBottom: 15, // Increased margin
            color: isDarkMode ? '#e0e0e0' : '#333', // Softer dark mode text
        },
        settingItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 18, // Increased padding
            paddingHorizontal: 15,
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', // Card-like background
            borderRadius: 12, // More rounded corners
            marginBottom: 12, // Space between items
            shadowColor: '#000', // Shadow for light mode
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDarkMode ? 0 : 0.05, // No shadow in dark mode
            shadowRadius: 2,
            elevation: isDarkMode ? 0 : 1,
        },
        settingText: {
            fontSize: 17, // Slightly larger text
            color: isDarkMode ? '#fff' : '#000',
        },
        logoutButton: {
            backgroundColor: isLoggingOut ? '#c62828' : '#d32f2f', // Red color for logout
            paddingVertical: 18,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 20, // Space above logout button
            opacity: isLoggingOut ? 0.7 : 1,
        },
        logoutButtonText: {
            color: "#fff",
            fontSize: 18, // Slightly larger
            fontWeight: '600',
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Settings</Text>

                {currentUser && userProfile && (
                    <View style={styles.settingItem}>
                        <Text style={styles.settingText}>Logged in as: {userProfile.username} ({userProfile.role})</Text>
                    </View>
                )}


                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>Dark Mode</Text>
                    <Switch
                        value={isDarkMode}
                        onValueChange={setIsDarkMode}
                        trackColor={{ false: "#767577", true: "#b1980d" }}
                        thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
                    />
                </View>

                {/* Placeholder for Account Section Items - can be expanded */}
                <Text style={styles.sectionTitle}>Account</Text>
                <Pressable style={styles.settingItem} onPress={() => Alert.alert("Edit Profile", "This feature is not yet implemented.")}>
                    <Text style={styles.settingText}>Edit Profile</Text>
                </Pressable>
                <Pressable style={styles.settingItem} onPress={() => Alert.alert("Change Password", "This feature is not yet implemented.")}>
                    <Text style={styles.settingText}>Change Password</Text>
                </Pressable>
                {userProfile?.role === 'student' && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.settingItem,
                        pressed && styles.settingItemPressed, // You might need to define settingItemPressed or use existing pressed styles
                      ]}
                      onPress={() => router.push('/studentResultsScreen')}
                    >
                      <Text style={styles.settingText}>View My Results</Text>
                    </Pressable>
                )}


                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>Push Notifications</Text>
                    <Switch
                        value={enableNotifications}
                        onValueChange={setEnableNotifications}
                        trackColor={{ false: "#767577", true: "#b1980d" }}
                        thumbColor={enableNotifications ? "#fff" : "#f4f3f4"}
                    />
                </View>

                {currentUser && (
                    <Pressable
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        )}
                    </Pressable>
                )}
            </View>
        </View>
    )
}
export default Settings