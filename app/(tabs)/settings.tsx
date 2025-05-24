import {View, Text, Pressable, Switch} from "react-native"
import React, {useState} from "react"
import {Link} from "expo-router";

const Settings = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [enableNotifications, setEnableNotifications] = useState(false);

    return (
        <View style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            flex: 1
        }}>
            <View style={{padding: 20}}>
                <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    marginBottom: 20,
                    color: isDarkMode ? '#fff' : '#b1980d',
                    marginHorizontal:"auto",
                    marginTop:50,
                }}>Settings</Text>

                <View style={{marginBottom: 30}}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        marginBottom: 10,
                        color: isDarkMode ? '#fff' : '#000'
                    }}>Appearance</Text>
                    <Pressable
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 15,
                            backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                            borderRadius: 10,
                        }}>
                        <Text style={{color: isDarkMode ? '#fff' : '#000'}}>Dark Mode</Text>
                        <Switch
                            value={isDarkMode}
                            onValueChange={setIsDarkMode}
                        />
                    </Pressable>
                </View>

                <View style={{marginBottom: 30}}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        marginBottom: 10,
                        color: isDarkMode ? '#fff' : '#000'
                    }}>Account</Text>
                    <Pressable
                        style={{
                            padding: 15,
                            backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                            borderRadius: 10,
                            marginBottom: 10
                        }}>
                        <Text style={{color: isDarkMode ? '#fff' : '#000'}}>Edit Profile</Text>
                    </Pressable>
                    <Pressable
                        style={{
                            padding: 15,
                            backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                            borderRadius: 10,
                        }}>
                        <Text style={{color: isDarkMode ? '#fff' : '#000'}}>Change Password</Text>
                    </Pressable>
                </View>

                <View style={{marginBottom: 30}}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        marginBottom: 10,
                        color: isDarkMode ? '#fff' : '#000'
                    }}>Notifications</Text>
                    <Pressable
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 15,
                            backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                            borderRadius: 10,
                        }}>
                        <Text style={{color: isDarkMode ? '#fff' : '#000'}}>Push Notifications</Text>
                        <Switch
                            value={enableNotifications}
                            onValueChange={setEnableNotifications}
                        />
                    </Pressable>
                </View>

                <Pressable
                    style={({pressed}) => ({
                        backgroundColor: pressed ? '#013401' : '#014601',
                        padding: 15,
                        borderRadius: 10,
                        alignItems: 'center'
                    })}>
                    <Link
                        style={{
                            color:"#fff",
                            fontSize:20,
                        }}
                        href="/">Logout</Link>
                </Pressable>
            </View>
        </View>
    )
}
export default Settings