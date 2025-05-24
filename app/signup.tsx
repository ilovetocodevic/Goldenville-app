import React from 'react';
import {Text, View, Image, ScrollView, TextInput, Pressable} from 'react-native';
import {Link} from "expo-router";

export default function SignUp() {
    return (
        <View>
            <ScrollView showsVerticalScrollIndicator={false}
                        contentContainerStyle={{minHeight: "100%", paddingBottom: 10}}
                        style={{
                            flex: 1,
                            paddingHorizontal: 20,
                        }}
            >
                <Image
                    style={{
                        width: 100,
                        height: 100,
                        marginTop: 80,
                        marginBottom: 20,
                        marginLeft: "auto",
                        marginRight: "auto",
                    }}
                    source={require("C://Users//victo//OneDrive//Desktop//app3//GPC-App//constants//images//logo.png")}/>
                <Text
                    style={{
                        fontSize: 30,
                        fontWeight: "bold",
                        color: "#b1980d",
                        marginBottom: 20,
                        marginHorizontal: "auto",
                    }}
                >
                    Sign Up
                </Text>
                <View>
                    <Text
                        style={{
                            fontSize: 20,
                            color: "#000000",
                            marginBottom: 10
                        }}
                    >Username</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            padding: 10,
                            marginBottom: 20
                        }}
                        placeholder="Enter your username"
                    />
                    <Text
                        style={{
                            fontSize: 20,
                            color: "#000000",
                            marginBottom: 10
                        }}
                    >Email</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            padding: 10,
                            marginBottom: 20
                        }}
                        placeholder="Enter your email"
                    />
                    <Text
                        style={{
                            fontSize: 20,
                            color: "#000000",
                            marginBottom: 10
                        }}
                    >Password</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            padding: 10,
                            marginBottom: 20
                        }}
                        placeholder="Enter your password"
                        secureTextEntry
                    />
                    <Pressable
                        style={({pressed}) => ({
                            backgroundColor: pressed ? '#013601' : '#014601',
                            padding: 15,
                            borderRadius: 10,
                            alignItems: 'center',
                            marginBottom: 20
                        })}
                    >
                        <Link href="/(tabs)/home" style={{color: '#fff', fontSize: 16}}>Sign Up</Link>
                    </Pressable>
                    <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 20}}>
                        <Text style={{color: '#000000', marginRight: 5}}>Already have an account?</Text>
                        <Link href="/" style={{color: '#014601'}}>Login</Link>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}
