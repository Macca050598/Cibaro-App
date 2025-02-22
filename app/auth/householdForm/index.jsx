import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '@rneui/themed';
import { auth, db } from '../../../configs/FirebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { router } from 'expo-router';
import Colors from '../../../constants/Colors';
export default function HouseholdChoiceScreen({ navigation }) {
    const handleChoice = (choice) => {
        if (choice === 'create') {
            navigation.navigate('CreateHousehold');
        } else {
            navigation.navigate('JoinHousehold');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Let's get you part of a house!</Text>
                <Text style={styles.subtitle}>Would you like to create or join a household?</Text>

                    <Button
                        title="Create New Household"
                        onPress={() => router.replace("/auth/householdForm/create")}
                        containerStyle={styles.buttonContainer}
                        buttonStyle={styles.button}
                        icon={{
                            name: 'home-plus',
                            type: 'material-community',
                            color: 'white'
                        }}
                    />
                    
                    <Text style={styles.orText}>- or -</Text>

                    <Button
                        title="Join Existing Household"
                        onPress={() => router.replace("/auth/householdForm/join")}
                        containerStyle={styles.buttonContainer}
                        buttonStyle={[styles.button, styles.secondaryButton]}
                        icon={{
                            name: 'account-group',
                            type: 'material-community',
                            color: 'white'
                        }}
                    />
                </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',

    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 250
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    buttonGroup: {
        width: '100%',
        alignItems: 'center',
    },
    buttonContainer: {
        width: '80%',
        marginVertical: 10,
    },
    button: {
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 15,
        borderRadius: 8,
        zIndex: 100
    },
    secondaryButton: {
        backgroundColor: '#5856D6',
    },
    orText: {
        fontSize: 16,
        color: '#666',
        marginVertical: 15,
    }
});