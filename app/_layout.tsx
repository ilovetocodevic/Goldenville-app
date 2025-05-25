import { Stack, useRouter, useSegments, SplashScreen } from "expo-router";
import "./globals.css";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Adjusted path
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Initialize global state for tests - keep this if it's used elsewhere
if (typeof global !== 'undefined') {
    // @ts-ignore
    global.testsData = global.testsData || [];
}

// Prevent the splash screen from auto-hiding before auth check is complete
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const { currentUser, isLoading, userProfile } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) {
            // Still loading, SplashScreen is visible
            return;
        }

        SplashScreen.hideAsync(); // Hide splash screen now that loading is done

        const inAuthScreens = segments.length === 0 || segments[0] === 'index' || segments[0] === 'signup';
        const inAppScreens = segments[0] === '(tabs)' || segments[0] === 'createTest'; // Add other main app screens/groups

        if (!currentUser) {
            // User is not logged in
            if (inAppScreens) {
                // If trying to access app screens without being logged in, redirect to login
                router.replace('/index');
            }
            // If already on 'index' or 'signup', no need to redirect
        } else {
            // User is logged in
            if (inAuthScreens) {
                // If on login ('index') or signup page, redirect to home
                router.replace('/(tabs)/home');
            }
            // Additional role-based checks can be added here if needed
            // e.g., if (userProfile?.role === 'student' && segments[0] === 'createTest') { router.replace('/(tabs)/home'); }
        }
    }, [currentUser, isLoading, segments, router, userProfile]);

    if (isLoading) {
        // Can return a global loading spinner here if needed, but SplashScreen handles it.
        // For an explicit spinner:
        // return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}><ActivityIndicator size="large" color="#012f01" /></View>;
        return null; // Return null or a minimal view while SplashScreen is active
    }

    // Based on your existing structure:
    return (
        <Stack>
            <Stack.Screen
                name="(tabs)"
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="index" // Login screen
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="signup"
                options={{headerShown: false, presentation: 'modal'}} // Modal presentation for signup
            />
            <Stack.Screen
                name="createTest" // This screen should be protected
                options={{
                    title: "Create New Test",
                    headerTintColor: 'white',
                    headerStyle: {
                        backgroundColor: '#012f01',
                    },
                }}
            />
            {/* Add any other screens or groups here.
                Example:
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            */}
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}