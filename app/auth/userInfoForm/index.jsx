import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import { auth, db } from '../../../configs/FirebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Input } from '@rneui/themed';
import Checkbox from 'expo-checkbox';
import Colors from '../../../constants/Colors';
import { Animated } from 'react-native';
import { router } from 'expo-router';



export default function UserInfoForm() {
    // const navigation = useNavigation(); // Initialize navigation hook

    const [formData, setFormData] = useState({
        email: auth.currentUser?.email || '',
        FirstName: '',
        LastName: '',
        householdId: '',
        parentId: '',
        uid: auth.currentUser?.uid || '',
        dietaryPreferences: {
            vegan: false,
            vegetarian: false,
            pescatarian: false,
        },
        allergiesPreferences: {
        Fish: false, 
        Soy: false, 
        Gluten: false, 
        Nuts: false, 
        Dairy: false,
        },
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
    });

    const handleDietaryChange = (preference) => {
        setFormData(prev => ({
            ...prev,
            dietaryPreferences: {
                ...prev.dietaryPreferences,
                [preference]: !prev.dietaryPreferences[preference]
            }
        }));
    };

    const handleAllergiesChange = (preference) => {
        setFormData(prev => ({
            ...prev,
            allergiesPreferences: {
                ...prev.allergiesPreferences,
                [preference]: !prev.allergiesPreferences[preference]
            }
        }));
    };



    const handleSubmit = async () => {
        if (!formData.uid) {
            console.error("User UID is missing. Cannot save data.");
            return;
        }

        try {
            await setDoc(doc(db, 'users', formData.uid), {
                ...formData,
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp(),
            });

            router.replace('/auth/householdForm')
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    return (
        <Animated.View style={styles.container}>
            <ScrollView style={styles.formContainer}>
                <Text style={styles.title}>User Information</Text>

                <Input
                    value={formData.FirstName}
                    onChangeText={(text) => setFormData({ ...formData, FirstName: text })}
                    label="First Name"
                    containerStyle={styles.input}
                />

                <Input
                    value={formData.LastName}
                    onChangeText={(text) => setFormData({ ...formData, LastName: text })}
                    label="Last Name"
                    containerStyle={styles.input}
                />

                <Text style={styles.sectionTitle}>Dietary Preferences</Text>
                <View style={styles.checkboxContainer}>
                    <View style={styles.checkboxRow}>
                        {['vegetarian', 'vegan', 'pescatarian'].map((diet, index) => (
                            <View key={diet} style={styles.section}>
                                <Checkbox
                                    style={styles.checkbox}
                                    value={formData.dietaryPreferences[diet]}
                                    onValueChange={() => handleDietaryChange(diet)}
                                    color="green"
                                />
                                <Text style={styles.paragraph}>{diet.charAt(0).toUpperCase() + diet.slice(1)}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Allergies</Text>
                <View style={styles.checkboxContainer}>
                    <View style={styles.checkboxRow}>
                        {['Fish', 'Soy', 'Gluten', 'Dairy', 'Nuts'].map((allergies, index) => (
                            <View key={allergies} style={styles.section}>
                                <Checkbox
                                    style={styles.checkbox}
                                    value={formData.allergiesPreferences[allergies]}
                                    onValueChange={() => handleAllergiesChange(allergies)}
                                    color="green"
                                />
                                <Text style={styles.paragraph}>{allergies.charAt(0).toUpperCase() + allergies.slice(1)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    formContainer: {
        backgroundColor: Colors.WHITE,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25,
        height: '90%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    title: {
        fontSize: 24,
        fontFamily: 'outfit-bold',
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
        display: 'flex'
    },
    input: {
        marginBottom: 15,
    },
    checkboxContainer: {
        marginBottom: 20,
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
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontFamily: 'outfit-medium',
    },
    checkboxRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
