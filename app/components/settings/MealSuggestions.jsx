import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import Colors from './../../../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';

export default function MealSuggestions() {
  const [suggestion, setSuggestion] = useState('');

  const handleSubmitSuggestion = async () => {
    if (!suggestion.trim()) {
      Alert.alert('Error', 'Please enter a meal suggestion.');
      return;
    }

    const subject = encodeURIComponent('Meal Suggestion');
    const body = encodeURIComponent(suggestion);
    const emailUrl = `mailto:support@cibaro.com?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        setSuggestion(''); // Clear the input after sending
        Alert.alert('Success', 'Thank you for your suggestion!');
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert('Error', 'Failed to send suggestion');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meal Suggestions</Text>
      
      <View style={styles.contentSection}>
        <Text style={styles.description}>
          Have a meal you'd love to see in Cibaro? We're always looking to expand our recipe collection with your favorite dishes!
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Describe the meal you'd like to see..."
          value={suggestion}
          onChangeText={setSuggestion}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmitSuggestion}
        >
          <MaterialIcons name="send" size={24} color={Colors.WHITE} />
          <Text style={styles.buttonText}>Submit Suggestion</Text>
        </TouchableOpacity>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsHeader}>Tips for great suggestions:</Text>
          <Text style={styles.tipItem}>• Include the name of the dish</Text>
          <Text style={styles.tipItem}>• Mention key ingredients if possible</Text>
          <Text style={styles.tipItem}>• Note any dietary considerations (e.g., vegetarian, gluten-free)</Text>
          <Text style={styles.tipItem}>• Tell us why you love this meal!</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 20,
    marginTop: 50,
    paddingHorizontal: 16,
  },
  contentSection: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 120,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
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
  buttonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  tipsSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  tipsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
}); 