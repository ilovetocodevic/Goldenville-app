import {View, Text, Pressable, ScrollView, Image} from "react-native"
import React from "react"

interface SubjectButtonProps {
    title: string;
    onPress?: () => void;
    style?: object;
}

const SubjectButton = ({title, onPress}: SubjectButtonProps) => (
    <Pressable
        style={({pressed}) => ({
            backgroundColor: pressed ? '#012f01' : 'white',
            padding: 20,
            borderRadius: 16,
            width: '47%',
            marginBottom: 15,
            alignItems: 'center',
            justifyContent: "center",
            height: 110,
            transform: [{scale: pressed ? 0.98 : 1}],
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
        })}
        onPress={onPress}
    >
        <Text style={{
            color: onPress ? 'white' : '#b39a0c',
            fontSize: 17,
            fontWeight: '600',
            textAlign: 'center'
        }}>{title}</Text>
    </Pressable>
)

const Notes = () => {
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                paddingBottom: 100,
                backgroundColor: 'white'
            }}
            style={{
                flex: 1,
                backgroundColor: 'white'
            }}
        >
            <View style={{
                paddingHorizontal: 24,
                backgroundColor: '#012f01',
                paddingBottom: 40,
                borderBottomLeftRadius: 30,
                borderBottomRightRadius: 30,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
            }}>
                <Image
                    style={{
                        width: 80,
                        height: 80,
                        marginTop: 80,
                        marginBottom: 20,
                        alignSelf: "center"
                    }}
                    source={require("C://Users//victo//OneDrive//Desktop//app3//GPC-App//constants//images//logo.png")}/>
                <Text style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: 10
                }}>Subject Notes</Text>
            </View>

            <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 30
            }}>
                <SubjectButton title="Mathematics"/>
                <SubjectButton title="Physics"/>
                <SubjectButton title="Chemistry"/>
                <SubjectButton title="Biology"/>
                <SubjectButton title="Economics"/>
                <SubjectButton title="Further Maths"/>
                <SubjectButton title="F-Accounting"/>
                <SubjectButton title="Commerce"/>
                <SubjectButton title="Food and Nutrition"/>
                <SubjectButton title="Coding"/>
                <SubjectButton title="Lit-in-English"/>
                <SubjectButton title="Robotics"/>
            </View>
        </ScrollView>
    )
}
export default Notes