import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Colors from './../../../constants/Colors';

export default function Feedback() {
  const [feedback, setFeedback] = useState('');

  const handleSubmitFeedback = () => {
    if (feedback) {
      // Here you would send the feedback to your server or database
      Alert.alert('Thank you!', 'Your feedback has been submitted.');
      setFeedback('');
    } else {
      Alert.alert('Error', 'Please enter your feedback.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feedback</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your feedback"
        value={feedback}
        onChangeText={setFeedback}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmitFeedback}>
        <Text style={styles.buttonText}>Submit Feedback</Text>
      </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.WHITE,
    fontWeight: '600',
  },
}); 