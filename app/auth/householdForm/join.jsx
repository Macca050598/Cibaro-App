import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { auth, db } from '../../../configs/FirebaseConfig';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Colors from '../../../constants/Colors';
import { router } from 'expo-router';

export default function JoinHouseholdScreen() {
    const [householdCode, setHouseholdCode] = useState('');
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);

    const handleJoinHousehold = async () => {
        const currentUser = auth.currentUser;
        try {
            // Create a query to find the household by invite code
            const householdsRef = collection(db, 'households');
            const q = query(householdsRef, where('inviteCode', '==', householdCode));
            const querySnapshot = await getDocs(q);
          
            setUserData(userData);
            if (!querySnapshot.empty) {
                const householdDoc = querySnapshot.docs[0]; // Get the first matching document
                const householdData = householdDoc.data();
                const currentUser = auth.currentUser;
                const userRef = doc(db, "users", auth.currentUser.uid);
                const userSnap = await getDoc(userRef);
                const usersData = userSnap.data();
                // Update user's document with householdId
                await setDoc(doc(db, 'users', currentUser.uid), {
                    householdId: householdDoc.id, // Store the household ID
                }, { merge: true });
                
                // Prepare user data to be added to the household
                const userData = {
                    uid: currentUser.uid,
                    name: usersData.FirstName + " " + usersData.LastName, // Ensure userData is fetched correctly
                    email: currentUser.email, // Ensure userData is fetched correctly
                    mealPreferences: {  // Add this structure
                        liked: [],
                        disliked: []
                    }
                };

                // Update household users array
                await setDoc(householdDoc.ref, {
                    users: {
                        ...householdData.users,
                        user2: userData // Add the user to user2 field
                    }
                }, { merge: true });

                router.replace('/(tabs)/home');
            } else {
                setError('Household not found. Please check the code.');
            }
        } catch (error) {
            console.error("Error joining household: ", error);
            setError('An error occurred while joining the household.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Join a Household</Text>
                <Input
                    value={householdCode}
                    onChangeText={(text) => setHouseholdCode(text)}
                    label="Household Code"
                    placeholder="Enter the household code..."
                    containerStyle={styles.input}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Button
                    title="Join Household"
                    onPress={handleJoinHousehold}
                    containerStyle={styles.buttonContainer}
                    buttonStyle={styles.button}
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
    title: {
        fontSize: 32,
        fontFamily: 'outfit-bold',
        marginBottom: 15,
        color: Colors.DARK_PURPLE,
    },
    input: {
        marginTop: 10,
        marginBottom: 10,
        padding: 12,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    button: {
        backgroundColor: Colors.DARK_PURPLE,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonContainer: {
        width: '80%',
        marginVertical: 10,
    },
});
