import {View, Text, ImageBackground, Image} from "react-native"
import React from "react"
import {Tabs} from "expo-router"

interface TabIconProps {
    focused: boolean;
    icon: any;
    title: string;
}

const TabIcon = ({focused, icon, title}: TabIconProps) => {
    if (focused){
        return (
            <ImageBackground>
                <Image source={icon} tintColor="#014601"
                    style={{
                        width: 20,
                        height: 20,
                        marginLeft:10,
                    }}
                    />
                <Text
                    style={{
                        fontSize:15,
                        fontWeight:"bold",
                        marginTop:2,
                        color:"#014601",
                    }}
                >{title}</Text>
            </ImageBackground>
        )
    }

    return (
        <View
            style={{
                width:"100%",
                justifyContent:"center",
                alignItems:"center",
                marginTop:4,
                borderRadius:9999,
            }}
        >
            <Image source={icon} tintColor="#8c8f8c"
                   style={{
                       width: 20,
                       height: 20,
                   }}
            />
        </View>
    )

}

const _Layout = () => {
    return(
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: "100%",
                    height:"100%",
                    justifyContent:"center",
                    alignItems:"center",
                },
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderRadius:50,
                    marginHorizontal:10,
                    marginBottom:36,
                    height: 60,
                    position:"absolute",
                    overflow:"hidden",
                    boxShadow: "0px 0px 10px #0000001a",
                    paddingTop:10,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={require("C://Users//victo//OneDrive//Desktop//app3//GPC-App//constants//images//icons8-home-64.png")}
                            title="Home"/>
                    )
                }}
            />
            <Tabs.Screen
                name="notes"
                options={{
                    title: "Notes",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={require("C://Users//victo//OneDrive//Desktop//app3//GPC-App//constants//images//icons8-book-48.png")}
                            title="Notes"/>
                    )
                }}
            />
            <Tabs.Screen
                name="tests"
                options={{
                    title: "Tests",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={require("C://Users//victo//OneDrive//Desktop//app3//GPC-App//constants//images//icons8-test-100.png")}
                            title="Tests"/>
                    )
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={require("C://Users//victo//OneDrive//Desktop//app3//GPC-App//constants//images//icons8-male-user-64.png")}
                            title="Settings"/>
                    )
                }}
            />
        </Tabs>
    )
}
export default  _Layout

