import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import Colors from './../../../constants/Colors';

export default function MealSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState('');

  const handleAddSuggestion = () => {
    if (newSuggestion) {
      setSuggestions([...suggestions, newSuggestion]);
      setNewSuggestion('');
      Alert.alert('Thank you!', 'Your suggestion has been added.');
    } else {
      Alert.alert('Error', 'Please enter a suggestion.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meal Suggestions</Text>
      <TextInput
        style={styles.input}
        placeholder="Suggest a meal"
        value={newSuggestion}
        onChangeText={setNewSuggestion}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleAddSuggestion}>
        <Text style={styles.buttonText}>Submit Suggestion</Text>
      </TouchableOpacity>
      <FlatList
        data={suggestions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.suggestionItem}>
            <Text style={styles.suggestionText}>{item}</Text>
          </View>
        )}
      />
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
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.WHITE,
    fontWeight: '600',
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
}); 