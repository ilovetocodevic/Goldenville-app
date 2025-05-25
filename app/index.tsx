import React, { useState } from 'react';
import { Text, View, Image, ScrollView, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from "expo-router";
import { auth } from '../firebaseConfig'; // Adjust path if needed
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Index() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        if (!email.trim() || !password) {
            Alert.alert("Login Failed", "Please enter both email and password.");
            setLoading(false);
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            // On successful login, Firebase automatically manages the session.
            // Navigation to the main app area:
            router.replace('/(tabs)/home');
            // setLoading(false); // Not strictly needed due to navigation replacing the screen
        } catch (error: any) {
            let errorMessage = "An unknown error occurred.";
            if (error.code) { // Firebase auth errors have a 'code' property
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'That email address is invalid.';
                        break;
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential': // More generic error for invalid email/password
                        errorMessage = 'Invalid email or password.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This user account has been disabled.';
                        break;
                    default:
                        errorMessage = `Login failed. Please check your credentials or network. (${error.code})`;
                }
            }
            Alert.alert("Login Failed", errorMessage);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentContainer}
                style={styles.scrollView}
                keyboardShouldPersistTaps="handled"
            >
                <Image
                    style={styles.logo}
                    source={require("../constants/images/logo.png")} // Corrected path
                />
                <Text style={styles.title}>
                    Welcome Back
                </Text>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={[styles.input, loading && styles.inputDisabled]}
                        placeholder="youremail@example.com"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        editable={!loading}
                    />
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={[styles.input, loading && styles.inputDisabled]}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        returnKeyType="done"
                        editable={!loading}
                    />
                    <Pressable
                        onPress={handleLogin}
                        style={({ pressed }) => [
                            styles.loginButton,
                            (pressed || loading) && styles.loginButtonPressed,
                            loading && styles.disabledButton
                        ]}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
                        ) : null}
                        <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
                    </Pressable>
                    <View style={styles.signUpLinkContainer}>
                        <Text style={styles.signUpText}>Don't have an account?</Text>
                        <Link href="/signup" style={[styles.signUpLink, loading && styles.disabledLink]}>
                           <Text>Sign Up</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Light background for the whole screen
    },
    scrollView: {
        flex: 1,
    },
    scrollContentContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
        justifyContent: 'center', // Center content vertically
    },
    logo: {
        width: 100, // Adjusted size
        height: 100, // Adjusted size
        alignSelf: 'center',
        marginTop: 20, // Adjusted margin
        marginBottom: 30,
    },
    title: {
        fontSize: 28, // Adjusted size
        fontWeight: "700",
        color: "#b39a0c", // Maintained color
        marginBottom: 30, // Adjusted margin
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: "#343a40", // Darker, more readable text
        marginBottom: 8,
    },
    input: {
        borderWidth: 1, // Thinner border
        borderColor: '#ced4da', // Softer border color
        borderRadius: 8, // Softer radius
        paddingVertical: 14, // Increased padding
        paddingHorizontal: 16,
        marginBottom: 20, // Adjusted margin
        fontSize: 16,
        backgroundColor: '#fff', // White background for input
        color: '#495057',
    },
    inputDisabled: {
        backgroundColor: '#e9ecef', // Light grey when disabled
    },
    loginButton: {
        backgroundColor: '#b39a0c', // Maintained color
        paddingVertical: 16, // Increased padding
        borderRadius: 8, // Softer radius
        alignItems: 'center',
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    loginButtonPressed: {
        backgroundColor: '#a1880b', // Darker shade when pressed
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    spinner: {
        marginRight: 10,
    },
    signUpLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        color: '#495057', // Softer text color
        marginRight: 5, // Adjusted spacing
        fontSize: 16,
    },
    signUpLink: {
        color: '#b39a0c', // Maintained color
        fontWeight: '600',
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: '#a1880b', // Keep color but indicate loading
        opacity: 0.8,
    },
    disabledLink: {
        opacity: 0.5, // Make link less prominent when loading
    }
});