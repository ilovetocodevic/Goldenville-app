import React from 'react';

import {Text, View, Image, ScrollView, TextInput, Pressable} from 'react-native';
import {Link} from "expo-router";

export default function Index() {
    return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: 40,
                    alignItems: 'center'
                }}
                style={{
                    flex: 1,
                    paddingHorizontal: 24,
                }}
            >
                <Image
                    style={{
                        width: 120,
                        height: 120,
                        marginTop: 80,
                        marginBottom: 32,
                    }}
                    source={require("C://Users//victo//OneDrive//Desktop//app3//GPC-App//constants//images//logo.png")}
                />
                <Text
                    style={{
                        fontSize: 32,
                        fontWeight: "700",
                        color: "#b39a0c",
                        marginBottom: 40,
                        textAlign: 'center'
                    }}
                >
                    Welcome Back
                </Text>
                <View style={{width: '100%'}}>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '500',
                            color: "#012f01",
                            marginBottom: 8
                        }}
                    >Email or Username</Text>
                    <TextInput
                        style={{
                            borderWidth: 1.5,
                            borderColor: '#e5e5e5',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 24,
                            fontSize: 16,
                            backgroundColor: '#fafafa',
                            width: '100%'
                        }}
                        placeholder="Enter your email or username"
                        placeholderTextColor="#999"
                    />
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '500',
                            color: "#012f01",
                            marginBottom: 8
                        }}
                    >Password</Text>
                    <TextInput
                        style={{
                            borderWidth: 1.5,
                            borderColor: '#e5e5e5',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 32,
                            fontSize: 16,
                            backgroundColor: '#fafafa',
                            width: '100%'
                        }}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        secureTextEntry
                    />
                    <Pressable
                        style={({pressed}) => ({
                            backgroundColor: pressed ? '#012f01' : '#b39a0c',
                            padding: 18,
                            borderRadius: 12,
                            alignItems: 'center',
                            marginBottom: 24,
                            shadowColor: '#000',
                            shadowOffset: {width: 0, height: 2},
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3
                        })}
                    >
                        <Link href="/(tabs)/home" style={{color: '#fff', fontSize: 18, fontWeight: '600'}}>Login</Link>
                    </Pressable>
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <Text style={{color: '#666', marginRight: 4, fontSize: 16}}>Don't have an account?</Text>
                        <Link href="/signup" style={{color: '#b39a0c', fontWeight: '600', fontSize: 16}}>Sign Up</Link>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}