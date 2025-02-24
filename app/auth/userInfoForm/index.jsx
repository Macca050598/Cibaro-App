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
            glutenFree: false,
            dairyFree: false,
            nutFree: false,
            lowCarb: false,
            lowFat: false,
            lowSugar: false,
            highProtein: false,
        },
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
    });

    const [dietaryPreferences, setDietaryPreferences] = useState([]);

    const handleDietaryPreferenceChange = (preference) => {
        const key = preference.toLowerCase().replace(/\s+/g, '');
        setFormData(prev => ({
            ...prev,
            dietaryPreferences: {
                ...prev.dietaryPreferences,
                [key]: !prev.dietaryPreferences[key]
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
                <View style={styles.preferencesContainer}>
                    <Text style={styles.label}>Dietary Preferences</Text>
                    
                    {['Vegan', 'Vegetarian', 'Pescatarian'].map((preference) => (
                        <View key={preference} style={styles.checkboxContainer}>
                            <Checkbox
                                value={dietaryPreferences.includes(preference)}
                                onValueChange={() => handleDietaryPreferenceChange(preference)}
                                disabled={dietaryPreferences.length > 0 && !dietaryPreferences.includes(preference)}
                                style={[
                                    styles.checkbox,
                                    dietaryPreferences.length > 0 && !dietaryPreferences.includes(preference) && 
                                    styles.disabledCheckbox
                                ]}
                            />
                            <Text style={[
                                styles.checkboxLabel,
                                dietaryPreferences.length > 0 && !dietaryPreferences.includes(preference) && 
                                styles.disabledText
                            ]}>
                                {preference}
                                {preference === 'Vegan' && (
                                    <Text style={styles.helperText}> (includes vegetarian)</Text>
                                )}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* <Text style={styles.sectionTitle}>Allergies</Text>
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
                </View> */}
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
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
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
        marginRight: 8,
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
    preferencesContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    disabledCheckbox: {
        opacity: 0.5,
        backgroundColor: '#e0e0e0',
    },
    disabledText: {
        color: '#999',
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#333',
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
});
