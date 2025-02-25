import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import Colors from './../../../constants/Colors';

export default function UserReviews() {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');

  const handleAddReview = () => {
    if (newReview) {
      setReviews([...reviews, newReview]);
      setNewReview('');
      Alert.alert('Thank you!', 'Your review has been added.');
    } else {
      Alert.alert('Error', 'Please enter a review.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Reviews & Ratings</Text>
      <TextInput
        style={styles.input}
        placeholder="Write a review"
        value={newReview}
        onChangeText={setNewReview}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleAddReview}>
        <Text style={styles.buttonText}>Submit Review</Text>
      </TouchableOpacity>
      <FlatList
        data={reviews}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewText}>{item}</Text>
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
  reviewItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewText: {
    fontSize: 16,
    color: '#333',
  },
}); 