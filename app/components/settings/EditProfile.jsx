import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from './../../../configs/FirebaseConfig';
import Colors from './../../../constants/Colors';

export default function EditProfile() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleUpdateEmail = () => {
    if (email) {
      auth.currentUser.updateEmail(email)
        .then(() => Alert.alert('Success', 'Email updated successfully'))
        .catch(error => Alert.alert('Error', error.message));
    }
  };

  const handleUpdatePassword = () => {
    if (password) {
      auth.currentUser.updatePassword(password)
        .then(() => Alert.alert('Success', 'Password updated successfully'))
        .catch(error => Alert.alert('Error', error.message));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="New Email"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateEmail}>
        <Text style={styles.buttonText}>Update Email</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
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
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: Colors.WHITE,
    fontWeight: '600',
  },
}); 