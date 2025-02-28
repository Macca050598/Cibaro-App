import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import { auth, db } from '../../../configs/FirebaseConfig';
import { doc, setDoc, serverTimestamp, updateProfile } from 'firebase/firestore';
import { Input } from '@rneui/themed';
import Checkbox from 'expo-checkbox';
import Colors from '../../../constants/Colors';
import { Animated } from 'react-native';
import { router } from 'expo-router';
import EULAModal from '../../components/auth/EULAModal';

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
    const [eulaVisible, setEulaVisible] = useState(false);
    const [formDataToSubmit, setFormDataToSubmit] = useState(null);

    const handleDietaryPreferenceChange = (preference) => {
        setDietaryPreferences(prev => {
            if (prev.includes(preference)) {
                return prev.filter(item => item !== preference);
            } else {
                return [...prev, preference];
            }
        });
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

    const handleSubmit = () => {
        // Validate form data
        if (!formData.FirstName || !formData.LastName) {
            Alert.alert('Error', 'Please enter your first and last name');
            return;
        }
        
        // Store the form data to submit after EULA acceptance
        setFormDataToSubmit({
            firstName: formData.FirstName,
            lastName: formData.LastName,
            dietaryPreferences: Array.from(dietaryPreferences),
            allergiesPreferences: Array.from(Object.values(formData.allergiesPreferences))
        });
        
        // Show EULA modal
        setEulaVisible(true);
    };

    const handleEulaAccept = async () => {
        setEulaVisible(false);
        
        // Now submit the form data
        if (formDataToSubmit) {
            try {
                setLoading(true);
                
                // Your existing submission code here
                // ...
                
                // Update user profile
                await updateProfile(auth.currentUser, {
                    displayName: `${formDataToSubmit.firstName} ${formDataToSubmit.lastName}`
                });
                
                // Add user to Firestore
                await setDoc(doc(db, 'users', auth.currentUser.uid), {
                    FirstName: formDataToSubmit.firstName,
                    LastName: formDataToSubmit.lastName,
                    Email: auth.currentUser.email,
                    dietaryPreferences: formDataToSubmit.dietaryPreferences,
                    allergiesPreferences: formDataToSubmit.allergiesPreferences,
                    createdAt: serverTimestamp(),
                    eulaAccepted: true, // Add this to record EULA acceptance
                });
                
                router.replace('/auth/householdForm');
            } catch (error) {
                console.error('Error submitting form:', error);
                Alert.alert('Error', 'Failed to submit form. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEulaDecline = () => {
        setEulaVisible(false);
        Alert.alert(
            'Terms Declined',
            'You must accept the Terms of Service to use Cibaro.',
            [{ text: 'OK' }]
        );
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
                    
                    {['Vegan', 'Vegetarian', 'Pescatarian'].map((preference) => (
                        <View key={preference} style={styles.checkboxContainer}>
                            <Checkbox
                                value={dietaryPreferences.includes(preference)}
                                onValueChange={() => handleDietaryPreferenceChange(preference)}
                                style={[
                                    styles.checkbox,
                                    dietaryPreferences.length > 0 && !dietaryPreferences.includes(preference) && 
                                    styles.disabledCheckbox
                                    
                                ]}
                                color="green"
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

                <Text style={styles.sectionTitle}>Allergies</Text>
                <View style={styles.checkboxContainer}>
                    <View style={styles.checkboxRow}>
                        {['Gluten Free',
                            'Dairy Free',
                            'Nut Free',
                            'Low Carb',
                            'Low Fat',
                            'Low Sugar',
                            'High Protein'].map((allergies, index) => (
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
            <EULAModal 
                visible={eulaVisible}
                onAccept={handleEulaAccept}
                onDecline={handleEulaDecline}
            />
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
