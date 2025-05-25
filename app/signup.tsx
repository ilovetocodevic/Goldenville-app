import React, { useState } from 'react';
import {Text, View, Image, ScrollView, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import {Link, useRouter} from "expo-router";
import { auth, firestore } from '../firebaseConfig'; // Adjust path if firebaseConfig.ts is elsewhere
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


const ROLES = [
    {label: 'Student', value: 'student'},
    {label: 'Teacher', value: 'teacher'},
    // {label: 'Admin', value: 'admin'} // Admin role might be assigned differently, not through self-signup
];

const CLASSES = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12']; // Expanded classes

const SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Business Studies',
    'Further Maths', 'F-Accounting', 'Commerce', 'Food and Nutrition', 'Geography', 'History',
    'Coding', 'Lit-in-English', 'Robotics', 'Computer Science', 'English Language', 'Art & Design' // Expanded subjects
];

export default function SignUp() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubjectSelection = (subject: string) => {
        setSelectedSubjects(prevSubjects =>
            prevSubjects.includes(subject)
                ? prevSubjects.filter(s => s !== subject)
                : [...prevSubjects, subject]
        );
    };

    const handleSignUp = async () => {
        setLoading(true);
        if (!username.trim()) {
            Alert.alert("Validation Error", "Please enter a username.");
            setLoading(false);
            return;
        }
        if (!email.trim()) {
            Alert.alert("Validation Error", "Please enter an email address.");
            setLoading(false);
            return;
        }
        if (!password) {
            Alert.alert("Validation Error", "Please enter a password.");
            setLoading(false);
            return;
        }
        if (role === 'student' && !selectedClass) {
            Alert.alert("Validation Error", "Please select your class.");
            setLoading(false);
            return;
        }
        if (role === 'teacher' && selectedSubjects.length === 0) {
            Alert.alert("Validation Error", "Please select at least one subject you teach.");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const user = userCredential.user;

            const userData: any = {
                uid: user.uid,
                username: username.trim(),
                email: email.trim().toLowerCase(),
                role: role,
                createdAt: serverTimestamp()
            };

            if (role === 'student') {
                userData.class = selectedClass;
            } else if (role === 'teacher') {
                userData.subjects = selectedSubjects;
            }
            // Admin role currently has no extra fields during signup via this form

            await setDoc(doc(firestore, "users", user.uid), userData);

            Alert.alert("Sign Up Successful", "Your account has been created. Please login.");
            // Clear form or navigate
            setUsername('');
            setEmail('');
            setPassword('');
            setSelectedClass('');
            setSelectedSubjects([]);
            // router.replace('/'); // Navigate to login screen after successful signup
        } catch (error: any) {
            let errorMessage = "An unknown error occurred during sign up.";
            if (error.code) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email address is already in use by another account.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'The email address you entered is not valid.';
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'The password is too weak. Please choose a stronger password.';
                        break;
                    default:
                        errorMessage = `An unexpected error occurred: ${error.message}`;
                }
            }
            Alert.alert("Sign Up Failed", errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentContainer}
                style={styles.scrollView}
                keyboardShouldPersistTaps="handled" // Ensures taps outside inputs dismiss keyboard
            >
                <Image
                    style={styles.logo}
                    source={require("../constants/images/logo.png")}/>
                <Text style={styles.title}>
                    Create Account
                </Text>
                <View>
                    {/* Username Input */}
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Choose a username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        returnKeyType="next"
                        editable={!loading}
                    />

                    {/* Email Input */}
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="your.email@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        editable={!loading}
                    />

                    {/* Password Input */}
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Create a strong password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        returnKeyType="done"
                        editable={!loading}
                    />

                    {/* Role Selection */}
                    <Text style={styles.label}>I am a:</Text>
                    <View style={styles.roleContainer}>
                        {ROLES.map(r => (
                            <Pressable
                                key={r.value}
                                onPress={() => {
                                    if (loading) return;
                                    setRole(r.value);
                                    setSelectedClass(''); // Reset class on role change
                                    setSelectedSubjects([]); // Reset subjects on role change
                                }}
                                style={[
                                    styles.roleButton,
                                    role === r.value && styles.selectedRoleButton,
                                    loading && styles.disabledButton
                                ]}
                                disabled={loading}
                            >
                                <Text style={[styles.roleButtonText, role === r.value && styles.selectedRoleButtonText]}>{r.label}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Conditional Inputs based on Role */}
                    {role === 'student' && (
                        <>
                            <Text style={styles.label}>Select Your Class:</Text>
                            <View style={styles.classContainer}>
                                {CLASSES.map(c => (
                                    <Pressable
                                        key={c}
                                        onPress={() => { if (!loading) setSelectedClass(c);}}
                                        style={[
                                            styles.classButton,
                                            selectedClass === c && styles.selectedClassButton,
                                            loading && styles.disabledButton
                                        ]}
                                        disabled={loading}
                                    >
                                        <Text style={[styles.classButtonText, selectedClass === c && styles.selectedClassButtonText]}>{c}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </>
                    )}

                    {role === 'teacher' && (
                        <>
                            <Text style={styles.label}>Select Subjects You Teach (tap to select/deselect):</Text>
                            <View style={styles.subjectContainer}>
                                {SUBJECTS.map(s => (
                                    <Pressable
                                        key={s}
                                        onPress={() => {if (!loading) handleSubjectSelection(s);}}
                                        style={[
                                            styles.subjectButton,
                                            selectedSubjects.includes(s) && styles.selectedSubjectButton,
                                            loading && styles.disabledButton
                                        ]}
                                        disabled={loading}
                                    >
                                        <Text style={[styles.subjectButtonText, selectedSubjects.includes(s) && styles.selectedSubjectButtonText]}>{s}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </>
                    )}

                    <Pressable
                        onPress={handleSignUp}
                        style={({pressed}) => [
                            styles.signUpButton,
                            {backgroundColor: pressed && !loading ? '#013601' : '#014601'},
                            loading && styles.disabledButton
                        ]}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" style={{marginRight: 10}}/>
                        ) : null}
                        <Text style={styles.signUpButtonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
                    </Pressable>
                    <View style={styles.loginLinkContainer}>
                        <Text style={styles.loginLinkText}>Already have an account?</Text>
                        <Link href="/" style={[styles.loginLink, loading && styles.disabledLink]}>Login</Link>
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
    scrollContentContainer: {
        paddingBottom: 40, // More padding at the bottom
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 25, // Slightly more horizontal padding
    },
    logo: {
        width: 100,
        height: 100,
        marginTop: 50, // Adjusted for status bar
        marginBottom: 20,
        alignSelf: 'center', // Using alignSelf
    },
    title: {
        fontSize: 28, // Slightly smaller title
        fontWeight: "bold",
        color: "#b1980d", // Maintained color
        marginBottom: 25,
        textAlign: 'center',
    },
    label: {
        fontSize: 16, // Standard label size
        color: "#495057", // Softer black
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ced4da', // Softer border
        borderRadius: 8,
        paddingVertical: 14, // Increased padding for better touch
        paddingHorizontal: 16,
        marginBottom: 18, // Consistent margin
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#495057',
    },
    roleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        justifyContent: 'space-between', // Changed to space-between for better spacing
    },
    roleButton: {
        paddingVertical: 12, // Increased padding
        paddingHorizontal: 10, // Adjusted for flex items
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        backgroundColor: 'white',
        alignItems: 'center',
        flex: 1, // Distribute space equally
        marginHorizontal: 4, // Small margin between buttons
    },
    selectedRoleButton: {
        borderColor: '#014601',
        backgroundColor: '#e6f4e6', // Softer green
        borderWidth: 1.5, // Slightly thicker border for selection
    },
    roleButtonText: {
        fontSize: 15, // Adjusted size
        color: '#495057',
    },
    selectedRoleButtonText: {
        color: '#014601',
        fontWeight: '600', // Bolder
    },
    classContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 18,
        justifyContent: 'flex-start', // Align items to start
    },
    classButton: {
        paddingVertical: 10,
        paddingHorizontal: 15, // More horizontal padding
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        backgroundColor: 'white',
        marginBottom: 10,
        marginRight: 10,
        alignItems: 'center',
    },
    selectedClassButton: {
        borderColor: '#014601',
        backgroundColor: '#e6f4e6',
        borderWidth: 1.5,
    },
    classButtonText: {
        fontSize: 14,
        color: '#495057',
    },
    selectedClassButtonText: {
        color: '#014601',
        fontWeight: '600',
    },
    subjectContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 18,
        justifyContent: 'flex-start',
    },
    subjectButton: {
        paddingVertical: 8,
        paddingHorizontal: 12, // More horizontal padding
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 20, // Pill-shaped buttons
        backgroundColor: 'white',
        marginBottom: 10,
        marginRight: 8,
        alignItems: 'center',
    },
    selectedSubjectButton: {
        borderColor: '#014601',
        backgroundColor: '#014601', // Solid green for selected subjects
    },
    subjectButtonText: {
        fontSize: 13,
        color: '#495057',
    },
    selectedSubjectButtonText: {
        color: '#fff', // White text for selected subjects
        fontWeight: '500',
    },
    signUpButton: {
        backgroundColor: '#014601', // Maintained color
        paddingVertical: 16, // Larger button
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
        flexDirection: 'row', // For ActivityIndicator
        justifyContent: 'center',
    },
    signUpButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    loginLinkText: {
        color: '#495057',
        marginRight: 5,
        fontSize: 15,
    },
    loginLink: {
        color: '#014601',
        fontSize: 15,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#e9ecef', // Grey out button when loading
        borderColor: '#ced4da',
        opacity: 0.7,
    },
    disabledLink: {
        opacity: 0.5,
    }
});
