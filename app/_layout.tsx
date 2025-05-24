import {Stack} from "expo-router";
import "./globals.css";

// Initialize global state for tests
if (typeof global !== 'undefined') {
    // @ts-ignore
    global.testsData = global.testsData || [];
}

export default function RootLayout(){
    return <Stack>
        <Stack.Screen
            name="(tabs)"
            options={{headerShown: false}}
        />
        <Stack.Screen
            name="index"
            options={{headerShown: false}}
        />
        <Stack.Screen
            name="signup"
            options={{headerShown: false}}
        />
        <Stack.Screen
            name="createTest"
            options={{
                title: "Create New Test",
                headerTintColor: 'white',
                headerStyle: {
                    backgroundColor: '#012f01',
                },
            }}
        />
    </Stack>
}