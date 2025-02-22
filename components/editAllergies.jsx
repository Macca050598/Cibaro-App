import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Button, CheckBox, ScrollView } from 'react-native';

// Sample options for allergies and dietary preferences
const options = {
  allergies: ['Peanuts', 'Dairy', 'Gluten', 'Shellfish'],
  dietary: ['Vegan', 'Vegetarian', 'Paleo', 'Keto'],
};

const PreferencesModal = ({ visible, onClose, type, selectedOptions, setSelectedOptions }) => {
  const handleToggle = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{type} Preferences</Text>
        <ScrollView>
          {options[type].map((option) => (
            <View key={option} style={styles.checkboxContainer}>
              <CheckBox
                value={selectedOptions.includes(option)}
                onValueChange={() => handleToggle(option)}
              />
              <Text>{option}</Text>
            </View>
          ))}
        </ScrollView>
        <Button title="Done" onPress={onClose} />
      </View>
    </Modal>
  );
};