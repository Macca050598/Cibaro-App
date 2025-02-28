import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from './../../../constants/Colors';
import { auth } from '../../../configs/FirebaseConfig';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
export default function Settings() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDarkMode = useColorScheme() === 'dark';
  const router = useRouter();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleEditProfile = () => {
    // Navigate to edit profile page
    router.push('./EditProfile');
  };

  const handleFeedback = () => {
    // Navigate to feedback page or open feedback form
    router.push('./Feedback');
  };

  const handleHelpSupport = () => {
    // Navigate to help and support page
    router.push('./HelpSupport');
  };

  const handleMealSuggestions = () => {
    // Navigate to meal suggestions page
    router.push('./MealSuggestions');
    
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : Colors.WHITE }}>
      <ScrollView style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
        </View>
          {/* <Text style={styles.headerTitle}>Settings</Text> */}

          <TouchableOpacity style={styles.option} onPress={handleEditProfile}>
            <MaterialIcons name="edit" size={24} color={Colors.PRIMARY} />
            <Text style={styles.optionText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleFeedback}>
            <MaterialIcons name="feedback" size={24} color={Colors.PRIMARY} />
            <Text style={styles.optionText}>Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleHelpSupport}>
            <MaterialIcons name="help" size={24} color={Colors.PRIMARY} />
            <Text style={styles.optionText}>Help & Support</Text>
          </TouchableOpacity>


          <TouchableOpacity style={styles.option} onPress={handleMealSuggestions}>
            <MaterialIcons name="restaurant-menu" size={24} color={Colors.PRIMARY} />
            <Text style={styles.optionText}>Meal Suggestions</Text>
          </TouchableOpacity>

          {/* Add more settings options as needed */}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 20,

  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
  },
}); 