import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { auth, db } from '../../../configs/FirebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Colors from '../../../constants/Colors';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { router } from 'expo-router';
export default function CreateHouseholdScreen({ navigation }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        householdName: '',
    });
    const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    useEffect(() => {
        const fetchUserData = async () => {
          if (!auth.currentUser) return;
    
          try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
    
            if (userSnap.exists()) {
              setUserData(userSnap.data());
            } else {
              console.warn('User document does not exist');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserData();
      }, []);

   
    //   console.log(userData)
    const handleSubmit = async () => {
        try {
            const currentUser = auth.currentUser;
            const householdData = {
                createdAt: serverTimestamp(),
                users: {
                    user1: {
                        uid: userData.uid,
                        name: userData.FirstName + " " + userData.LastName,
                        email: userData.email,
                    },
                    user2: {
                        uid: "",
                        name: "",
                        email: "",
                    }
                },
                currentSession: {
                    startDate: serverTimestamp(),
                    status: "pending"
                },
                weeklyPlans: {},
                mealPreferences: {
                    liked: {},
                    disliked: {}
                },
                householdName: formData.householdName,
                inviteCode: generateInviteCode(), // Function to generate unique code
                status: 'active'
            };

            const docRef = await addDoc(collection(db, 'households'), householdData);
            // Update user's document with householdId
            await setDoc(doc(db, 'users', userData.uid), {
                ...userData,
                householdId: docRef.id, // Store the household ID
            }, { merge: true });
            router.replace('/(tabs)/home');

            // Update user's document with householdId
            // Navigate to next screen
            // navigation.navigate('InvitePartner', { householdId: docRef.id });

        } catch (error) {
            console.error("Error creating household: ", error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Create Your Household</Text>
                <Text style={styles.subtitle}>Give your household a name to get started</Text>

                <Input
                    value={formData.householdName}
                    onChangeText={(text) => setFormData({...formData, householdName: text})}
                    label="Household Name"
                    placeholder="e.g., Smith Family Kitchen"
                    containerStyle={styles.input}
                />

                <Button
                    title="Create Household"
                    onPress={handleSubmit}
                    containerStyle={styles.buttonContainer}
                    buttonStyle={styles.button}
                    loading={false} // Add loading state
                />
            </View>
            
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.WHITE,
        padding: 20,
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 250,
    },
    formContainer: {
        backgroundColor: Colors.WHITE,
    },
    title: {
        fontSize: 32,
        fontFamily: 'outfit-bold',
        marginBottom: 15,
        color: Colors.PRIMARY,
    },
    subtitle: {
        fontSize: 14,
        color: '#777',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginTop:10,
        marginBottom: 10,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    checkboxContainer: {
        marginBottom: 20,
        width: '80%'
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 15,
        color: '#666',
    },
    checkbox: {
        margin: 8,
    },
    button: {
        backgroundColor: Colors.PRIMARY,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: 'white',
        fontFamily: 'outfit-medium',
        fontSize: 20,
    },
    buttonContainer: {
        width: '80%',
        marginVertical: 10,
    },
    checkboxRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
