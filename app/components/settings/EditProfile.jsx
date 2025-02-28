import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Modal, FlatList } from 'react-native';
import { auth, db } from './../../../configs/FirebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from './../../../constants/Colors';
import { router } from 'expo-router';
const AVATARS = [
  { id: '1', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=1' },
  { id: '2', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=2' },
  { id: '3', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=3' },
  { id: '4', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=4' },
  { id: '5', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=5' },
  { id: '6', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=6' },
  { id: '7', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=7' },
  { id: '8', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=8' },
  { id: '9', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=9' },
  { id: '10', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=10' },
  { id: '11', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=11' },
  { id: '12', uri: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=12' },
];

export default function EditProfile({ visible, onClose }) {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    email: '',
    password: '',
    avatarUri: '',
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const data = userDoc.data();
        setUserData(data);
        setFormData({
          FirstName: data.FirstName || '',
          LastName: data.LastName || '',
          email: data.email || '',
          password: '',
          avatarUri: data.avatarUri || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    fetchUserData();
  }, []);

  const handleSelectAvatar = (uri) => {
    setFormData(prev => ({ ...prev, avatarUri: uri }));
    setShowAvatarPicker(false);
  };

  const handleUpdateProfile = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        FirstName: formData.FirstName,
        LastName: formData.LastName,
        avatarUri: formData.avatarUri,
      });

      // Handle email update if changed
      if (formData.email !== userData.email) {
        await auth.currentUser.updateEmail(formData.email);
      }

      // Handle password update if provided
      if (formData.password) {
        await auth.currentUser.updatePassword(formData.password);
      }

      Alert.alert('Success', 'Profile updated successfully');
      router.replace('/profile');
      onClose && onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message);
    }
  };

  const AvatarPicker = () => (
    <Modal
      visible={showAvatarPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAvatarPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.avatarPickerContainer}>
          <View style={styles.avatarPickerHeader}>
            <Text style={styles.avatarPickerTitle}>Choose an Avatar</Text>
            <TouchableOpacity onPress={() => setShowAvatarPicker(false)}>
              <MaterialIcons name="close" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={AVATARS}
            numColumns={3}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.avatarOption}
                onPress={() => handleSelectAvatar(item.uri)}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.avatarOptionImage}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Edit Profile</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={() => setShowAvatarPicker(true)} style={styles.avatar}>
          {formData.avatarUri ? (
            <Image 
              source={{ uri: formData.avatarUri }} 
              style={styles.avatarImage} 
            />
          ) : (
            <MaterialIcons name="account-circle" size={80} color={Colors.PRIMARY} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.changeAvatarButton} 
          onPress={() => setShowAvatarPicker(true)}
        >
          <Text style={styles.changeAvatarText}>Choose Avatar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>First Name</Text>
          <TextInput
            style={styles.input}
            value={formData.FirstName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, FirstName: text }))}
            placeholder="Enter first name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={formData.LastName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, LastName: text }))}
            placeholder="Enter last name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            placeholder="Enter email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>New Password (optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
            placeholder="Enter new password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleUpdateProfile}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      <AvatarPicker />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 50,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  avatarContainer: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  changeAvatarButton: {
    padding: 8,
  },
  changeAvatarText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  avatarPickerContainer: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '70%',
  },
  avatarPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  avatarOption: {
    flex: 1/3,
    aspectRatio: 1,
    padding: 8,
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ddd',
  },
}); 