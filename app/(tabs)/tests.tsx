import {View, Text, Pressable, Image, ScrollView, Modal, TextInput, Platform} from "react-native"
import React, {useState} from "react"
import * as DocumentPicker from 'expo-document-picker';

const Tests = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [testName, setTestName] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [ongoingTests, setOngoingTests] = useState([]);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*'
            });
            if (result.assets && result.assets[0]) {
                setSelectedFile(result.assets[0].name);
            }
        } catch (err) {
            console.log('Document picker error:', err);
        }
    };

    const handleCreateTest = () => {
        const newTest = {
            name: testName,
            description: description,
            deadline: deadline,
            file: selectedFile
        };
        setOngoingTests(prevTests => [...prevTests, newTest]);
        setModalVisible(false);
        setTestName('');
        setDescription('');
        setDeadline('');
        setSelectedFile(null);
    };

    return (
        <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
            <View style={{
                backgroundColor: '#012f01',
                paddingHorizontal: 24,
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
                }}>Tests & Assignments</Text>
            </View>

            <View style={{padding: 20, marginTop: 10}}>
                <Pressable
                    style={({pressed}) => ({
                        backgroundColor: pressed ? '#013601' : '#012f01',
                        padding: 16,
                        borderRadius: 12,
                        marginBottom: 30,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    })}
                    onPress={() => setModalVisible(true)}>
                    <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>Create New Test/Assignment</Text>
                </Pressable>

                <View style={{marginBottom: 25}}>
                    <Text style={{fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#b39a0c'}}>Ongoing
                        Tests</Text>
                    {ongoingTests.length > 0 ? (
                        ongoingTests.map((test, index) => (
                            <Pressable
                                key={index}
                                style={{
                                    backgroundColor: 'white',
                                    padding: 16,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: '#e0e0e0',
                                    marginBottom: 10,
                                    shadowColor: '#000',
                                    shadowOffset: {width: 0, height: 1},
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                            >
                                <Text style={{fontSize: 16, fontWeight: '600', color: '#012f01'}}>{test.name}</Text>
                                <Text style={{color: '#666', marginTop: 5}}>{test.description}</Text>
                                <Text style={{color: '#b39a0c', marginTop: 5}}>Deadline: {test.deadline}</Text>
                            </Pressable>
                        ))
                    ) : (
                        <Pressable
                            style={{
                                backgroundColor: 'white',
                                padding: 16,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: '#e0e0e0',
                                shadowColor: '#000',
                                shadowOffset: {width: 0, height: 1},
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 2,
                            }}
                        >
                            <Text style={{color: '#666', fontSize: 15}}>No ongoing tests</Text>
                        </Pressable>
                    )}
                </View>

                <View style={{marginBottom: 25}}>
                    <Text style={{fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#b39a0c'}}>Recently
                        Attempted</Text>
                    <View style={{
                        backgroundColor: 'white',
                        padding: 16,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#e0e0e0',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 1},
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                    }}>
                        <Text style={{color: '#666', fontSize: 15}}>No recent attempts</Text>
                    </View>
                </View>

                <View>
                    <Text style={{fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#b39a0c'}}>Recent
                        Results</Text>
                    <View style={{
                        backgroundColor: 'white',
                        padding: 16,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#e0e0e0',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 1},
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                    }}>
                        <Text style={{color: '#666', fontSize: 15}}>No recent results</Text>
                    </View>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 20,
                        padding: 20,
                        width: '90%',
                        maxHeight: '80%'
                    }}>
                        <Text style={{fontSize: 20, fontWeight: '600', marginBottom: 20, color: '#012f01'}}>Create New
                            Test</Text>

                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#e0e0e0',
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 15
                            }}
                            placeholder="Test Name"
                            value={testName}
                            onChangeText={setTestName}
                        />

                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#e0e0e0',
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 15,
                                height: 100,
                                textAlignVertical: 'top'
                            }}
                            placeholder="Description"
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />

                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#e0e0e0',
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 15
                            }}
                            placeholder="Deadline (e.g., 2024-03-20)"
                            value={deadline}
                            onChangeText={setDeadline}
                        />

                        <Pressable
                            style={{
                                backgroundColor: '#012f01',
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 15,
                                alignItems: 'center'
                            }}
                            onPress={pickDocument}
                        >
                            <Text style={{color: 'white'}}>Select Test File</Text>
                        </Pressable>
                        {selectedFile && (
                            <Text style={{marginBottom: 15, color: '#666'}}>Selected: {selectedFile}</Text>
                        )}

                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Pressable
                                style={{
                                    backgroundColor: '#ff3b30',
                                    padding: 12,
                                    borderRadius: 8,
                                    width: '48%',
                                    alignItems: 'center'
                                }}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{color: 'white'}}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={{
                                    backgroundColor: '#012f01',
                                    padding: 12,
                                    borderRadius: 8,
                                    width: '48%',
                                    alignItems: 'center'
                                }}
                                onPress={handleCreateTest}
                            >
                                <Text style={{color: 'white'}}>Create</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    )
}
export default Tests