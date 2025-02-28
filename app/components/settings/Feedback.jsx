import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking, Platform } from 'react-native';
import Colors from './../../../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Feedback() {
  const [feedback, setFeedback] = useState('');

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert('Error', 'Please enter your feedback.');
      return;
    }

    const subject = encodeURIComponent('App Feedback');
    const body = encodeURIComponent(feedback);
    const emailUrl = `mailto:support@cibaro.com?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        setFeedback(''); // Clear the feedback after sending
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert('Error', 'Failed to open email client');
    }
  };

  const handleRateApp = async () => {
    try {
      // App Store ID would go here
      const appStoreId = 'YOUR_APP_STORE_ID';
      const playStoreId = 'YOUR_PLAY_STORE_ID';

      if (Platform.OS === 'ios') {
        // For iOS
        await Linking.openURL(`itms-apps://itunes.apple.com/app/id${appStoreId}?action=write-review`);
      } else {
        // For Android
        await Linking.openURL(`market://details?id=${playStoreId}`);
      }
    } catch (error) {
      console.error('Error opening store:', error);
      Alert.alert('Error', 'Unable to open app store');
    }
  };

  return (
    <View style={styles.container}>
    <View style={styles.header}>
    <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <MaterialIcons name="arrow-back" size={24} color={Colors.PRIMARY} />
      </TouchableOpacity>
    
      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Send us your thoughts</Text>
        <Text style={styles.description}>
          We're always looking to improve Cibaro. Your feedback helps us make the app better for everyone.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your feedback"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmitFeedback}
        >
          <MaterialIcons name="email" size={24} color={Colors.WHITE} />
          <Text style={styles.buttonText}>Send Feedback</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ratingSection}>
        <MaterialIcons name="star" size={40} color={Colors.PRIMARY} />
        <Text style={styles.ratingTitle}>Loving Cibaro?</Text>
        <Text style={styles.ratingDescription}>
          Your feedback on the App Store means the world to us and helps other food lovers discover Cibaro!
        </Text>
        <TouchableOpacity 
          style={styles.rateButton} 
          onPress={handleRateApp}
        >
          <MaterialIcons name="star" size={24} color={Colors.WHITE} />
          <Text style={styles.buttonText}>Rate on {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}</Text>
        </TouchableOpacity>
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.WHITE,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 20,
    marginTop: 50,
  },
  feedbackSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ratingSection: {
    backgroundColor: '#f8f8f8',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginVertical: 12,
  },
  ratingDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  rateButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  buttonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: 20,
  },
}); 