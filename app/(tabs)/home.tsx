import React, {useState} from 'react';
import {Text, View, Image, ScrollView, Modal, TextInput, Pressable} from 'react-native';

export default function Home() {
    const [modalVisible, setModalVisible] = useState(false);
    const [announcements, setAnnouncements] = useState([
        {title: 'Tech Week', description: 'HOT 4.0 on 22nd May 2025'}
    ]);
    const [events, setEvents] = useState([
        {title: "Children's Day Celebration", date: '26th May 2025'}
    ]);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [type, setType] = useState<'announcement' | 'event'>('announcement');

    const handleAdd = () => {
        if (type === 'announcement') {
            setAnnouncements([...announcements, {title: newTitle, description: newDescription}]);
        } else {
            setEvents([...events, {title: newTitle, date: newDescription}]);
        }
        setNewTitle('');
        setNewDescription('');
        setModalVisible(false);
    };

    const handleDelete = (index: number, type: 'announcement' | 'event') => {
        if (type === 'announcement') {
            const newAnnouncements = [...announcements];
            newAnnouncements.splice(index, 1);
            setAnnouncements(newAnnouncements);
        } else {
            const newEvents = [...events];
            newEvents.splice(index, 1);
            setEvents(newEvents);
        }
    };

    return (
        <View style={{flex: 1, backgroundColor: "white"}}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 100}}
                style={{flex: 1, paddingHorizontal: 24}}
            >
                <Image
                    style={{
                        width: 80,
                        height: 80,
                        marginTop: 60,
                        marginBottom: 32,
                        alignSelf: "center"
                    }}
                    source={require("C://Users//victo//OneDrive//Desktop//app3//GPC-App//constants//images//logo.png")}
                />

                <Text style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: "#012f01",
                    marginBottom: 16,
                }}>
                    Announcements 📢
                </Text>

                {announcements.map((announcement, index) => (
                    <View key={index} style={{
                        backgroundColor: "white",
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 24,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                    }}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text style={{fontSize: 18, color: "#b39a0c", fontWeight: "600", marginBottom: 8}}>
                                {announcement.title}
                            </Text>
                            <Pressable onPress={() => handleDelete(index, 'announcement')}>
                                <Text style={{color: 'red', fontSize: 16}}>×</Text>
                            </Pressable>
                        </View>
                        <Text style={{fontSize: 15, color: "#666"}}>
                            {announcement.description}
                        </Text>
                    </View>
                ))}

                <Text style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: "#012f01",
                    marginBottom: 16,
                }}>
                    Recent Activity
                </Text>

                <View style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 24,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                }}>
                    <Text style={{fontSize: 18, color: "#b39a0c", fontWeight: "600", marginBottom: 12}}>
                        Recently Viewed Notes
                    </Text>
                    <Text style={{fontSize: 15, color: "#666", marginBottom: 8}}>
                        MathemathicsWeek5
                    </Text>
                    <Text style={{fontSize: 15, color: "#666"}}>
                        PhysicsWeek4
                    </Text>
                </View>

                <View style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 24,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                }}>
                    <Text style={{fontSize: 18, color: "#b39a0c", fontWeight: "600", marginBottom: 8}}>
                        Recently Attempted Test
                    </Text>
                    <Text style={{fontSize: 15, color: "#666"}}>
                        No recent test
                    </Text>
                </View>

                <Text style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: "#012f01",
                    marginBottom: 16,
                }}>
                    Upcoming Events
                </Text>

                {events.map((event, index) => (
                    <View key={index} style={{
                        backgroundColor: "white",
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 24,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                    }}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text style={{fontSize: 18, color: "#b39a0c", fontWeight: "600", marginBottom: 8}}>
                                {event.title}
                            </Text>
                            <Pressable onPress={() => handleDelete(index, 'event')}>
                                <Text style={{color: 'red', fontSize: 16}}>×</Text>
                            </Pressable>
                        </View>
                        <Text style={{fontSize: 15, color: "#666"}}>
                            Date: {event.date}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <Pressable
                style={{
                    position: 'absolute',
                    bottom: 90,
                    right: 20,
                    backgroundColor: '#b39a0c',
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                    zIndex: 999
                }}
                onPress={() => setModalVisible(true)}
            >
                <Text style={{fontSize: 30, color: 'white'}}>+</Text>
            </Pressable>

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
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                    }}>
                        <Text style={{fontSize: 20, fontWeight: '600', marginBottom: 15, color: '#012f01'}}>
                            Add New Item
                        </Text>

                        <View style={{flexDirection: 'row', marginBottom: 15}}>
                            <Pressable
                                style={{
                                    flex: 1,
                                    padding: 10,
                                    backgroundColor: type === 'announcement' ? '#012f01' : '#e5e5e5',
                                    borderRadius: 8,
                                    marginRight: 5,
                                    alignItems: 'center'
                                }}
                                onPress={() => setType('announcement')}
                            >
                                <Text style={{color: type === 'announcement' ? 'white' : '#666'}}>Announcement</Text>
                            </Pressable>
                            <Pressable
                                style={{
                                    flex: 1,
                                    padding: 10,
                                    backgroundColor: type === 'event' ? '#012f01' : '#e5e5e5',
                                    borderRadius: 8,
                                    marginLeft: 5,
                                    alignItems: 'center'
                                }}
                                onPress={() => setType('event')}
                            >
                                <Text style={{color: type === 'event' ? 'white' : '#666'}}>Event</Text>
                            </Pressable>
                        </View>

                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#e5e5e5',
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 10
                            }}
                            placeholder="Title"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />

                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#e5e5e5',
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 15
                            }}
                            placeholder={type === 'event' ? "Date" : "Description"}
                            value={newDescription}
                            onChangeText={setNewDescription}
                        />

                        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                            <Pressable
                                style={{
                                    padding: 10,
                                    marginRight: 10,
                                    borderRadius: 8,
                                }}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{color: '#666'}}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={{
                                    backgroundColor: '#b39a0c',
                                    padding: 10,
                                    borderRadius: 8,
                                }}
                                onPress={handleAdd}
                            >
                                <Text style={{color: 'white'}}>Add</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};