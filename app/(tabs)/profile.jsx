import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, SafeAreaView, Modal, Clipboard, Linking, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import Colors from './../../constants/Colors'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../configs/FirebaseConfig'
import { useRouter } from 'expo-router'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Checkbox from 'expo-checkbox'
export default function Profile() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [mealUpdates, setMealUpdates] = useState(true);
  const [userData, setUserData] = useState(null);
  const [houseData, setHouseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);


const availableDietaryPreferences = [
  'Vegan', 
  'Vegetarian', 
  'Pescatarian',
 
];
const availableAllergiesPreferences = [ 
  'Gluten Free',
  'Dairy Free',
  'Nut Free',
  'Low Carb',
  'Low Fat',
  'Low Sugar',
  'High Protein'];

const PreferencesModal = ({ visible, onClose, type, currentPreferences, onSave }) => {
  // Initialize localPreferences based on type
  const [localPreferences, setLocalPreferences] = useState(() => {
    if (type === 'dietary') {
      return new Set(currentPreferences);
    } else {
      // For allergies, convert from lowercase keys to proper case for display
      return new Set(
        currentPreferences.map(pref => 
          pref.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        )
      );
    }
  });
  const options = type === "dietary" ? availableDietaryPreferences : availableAllergiesPreferences;

  const handleToggle = (option) => {
    if (type === "dietary") {
      setLocalPreferences(prev => {
        const newSet = new Set(prev);
        
        // If unchecking any option, just remove it
        if (newSet.has(option)) {
          newSet.delete(option);
          return newSet;
        }

        // If checking a new option, clear all other dietary preferences first
        newSet.delete('Vegan');
        newSet.delete('Vegetarian');
        newSet.delete('Pescatarian');
        
        // Then add the new option
        newSet.add(option);
        return newSet;
      });
    } else {
      // Handle allergies normally
      setLocalPreferences(prev => {
        const newSet = new Set(prev);
        if (newSet.has(option)) {
          newSet.delete(option);
        } else {
          newSet.add(option);
        }
        return newSet;
      });
    }
  };

  const handleSave = async () => {
    await onSave(Array.from(localPreferences));
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{type === "dietary" ? "Dietary" : "Allergies"} Preferences</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            {options.map((option) => (
              <TouchableOpacity 
                key={option}
                style={styles.modalItem}
                onPress={() => handleToggle(option)}
                disabled={type === "dietary" && 
                  localPreferences.size > 0 && 
                  !localPreferences.has(option)}
              >
                <Checkbox
                  value={localPreferences.has(option)}
                  onValueChange={() => handleToggle(option)}
                  color={Colors.PRIMARY}
                  disabled={type === "dietary" && 
                    localPreferences.size > 0 && 
                    !localPreferences.has(option)}
                />
                <Text style={[
                  styles.modalItemText,
                  type === "dietary" && 
                    localPreferences.size > 0 && 
                    !localPreferences.has(option) && 
                    styles.disabledText
                ]}>
                  {option}
                  {type === "dietary" && option === "Vegan" && (
                    <Text style={styles.helperText}> (includes vegetarian)</Text>
                  )}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]} 
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserData(userData);

        if (userData.householdId) {
          const houseRef = doc(db, 'households', userData.householdId);
          const houseSnap = await getDoc(houseRef);
          if (houseSnap.exists()) {
            setHouseData(houseSnap.data());
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalType(null);
  };

  const handleSavePreferences = async (selectedPreferences) => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      // Get all available options for the current type
      const allOptions = modalType === "dietary" ? availableDietaryPreferences : availableAllergiesPreferences;
      
      // Create object with all options set to false by default
      const preferencesObj = allOptions.reduce((acc, pref) => {
        acc[pref.toLowerCase()] = false;
        return acc;
      }, {});
  
      // Then set selected ones to true
      selectedPreferences.forEach(pref => {
        preferencesObj[pref.toLowerCase()] = true;
      });
  
      await updateDoc(userRef, {
        [modalType === "dietary" ? "dietaryPreferences" : "allergiesPreferences"]: preferencesObj,
      });
  
      // Update local state
      setUserData(prev => ({
        ...prev,
        [modalType === "dietary" ? "dietaryPreferences" : "allergiesPreferences"]: preferencesObj,
      }));
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  
  const getCurrentPreferences = () => {
    const preferences = modalType === "dietary" 
      ? userData?.dietaryPreferences 
      : userData?.allergiesPreferences;
    
    return Object.entries(preferences || {})
      .filter(([_, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/Landing');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleInvitePartner = () => {
    const message = `Join my house on this new app, Picking our weekly meals has never been as fun!. House Code: ${houseData.inviteCode} - Download it here: [Your App Link]`;
    const url = `sms:?body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(err => console.error('Error opening SMS:', err));
  };

  
  const handleLeaveHouse = async () => {
    if (!userData?.householdId) return;
  
    Alert.alert(
      "Confirm Leave House",
      "Are you sure you want to leave the house you're in?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave",
          onPress: async () => {
            try {
              const houseRef = doc(db, 'households', userData.householdId);
              const householdSnap = await getDoc(houseRef);
              const householdData = householdSnap.data();
  
              // Check if both user fields will be empty after this user leaves
              const otherUserEmpty = householdData.users.user1.uid === "" || householdData.users.user2.uid === "";
              const isLastUser = otherUserEmpty;
  
              if (isLastUser) {
                // If this is the last user, delete the household
                await deleteDoc(houseRef);
              } else {
                // If other user exists, just remove this user's data
                const userField = householdData.users.user1.uid === auth.currentUser.uid ? 'user1' : 'user2';
                await updateDoc(houseRef, {
                  [`users.${userField}.email`]: "",
                  [`users.${userField}.name`]: "",
                  [`users.${userField}.personalmealPreferences`]: {
                    liked: [],
                    disliked: []
                  },
                  [`users.${userField}.uid`]: ""
                });
              }
  
              // Update user's document
              const userRef = doc(db, 'users', auth.currentUser.uid);
              await updateDoc(userRef, {
                householdId: ""
              });
  
              // Update local state
              setUserData(prev => ({ ...prev, householdId: null }));
              setHouseData(null);
  
            } catch (error) {
              console.error('Error leaving house:', error);
              Alert.alert("Error", "Failed to leave house. Please try again.");
            }
          }
        }
      ],
      { cancelable: false }
    );
  };


  // const renderSettingsItem = (icon, title, value, onPress, showArrow = true) => (
  //   <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
  //     <View style={styles.settingsItemLeft}>
  //       {icon}
  //       <Text style={styles.settingsItemText}>{title}</Text>
  //     </View>
  //     <View style={styles.settingsItemRight}>
  //       {value && <Text style={styles.settingsItemValue}>{value}</Text>}
  //       {showArrow && <MaterialIcons name="arrow-forward-ios" size={20} color="#666" />}
  //     </View>
  //   </TouchableOpacity>
  // );

  const user = {
    name: userData?.FirstName + " " + userData?.LastName || '',
    email: userData?.email || '',
    partner: (houseData?.users.user1.uid !== auth.currentUser.uid ? houseData?.users.user1.name : 
      houseData?.users.user2.uid !== auth.currentUser.uid ? houseData?.users.user2.name : '') || '',    
    houseName: houseData?.householdName || '',
    mealPreferences: {
      liked: userData?.personalmealPreferences?.liked || [],
      disliked: userData?.personalmealPreferences?.disliked || []
    },
    dietaryPreferences: Object.entries(userData?.dietaryPreferences || {})
      .filter(([_, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1)),
    allergiesPreferences: Object.entries(userData?.allergiesPreferences || {})
      .filter(([_, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1)),
    recentMeals: [
      { id: 1, name: 'Italian Pasta', date: '2024-03-15' },
      { id: 2, name: 'Grilled Chicken', date: '2024-03-14' },
      { id: 3, name: 'Vegetarian Bowl', date: '2024-03-13' },
    ],
    code: houseData?.inviteCode
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <MaterialIcons name="account-circle" size={80} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.card}>
          
  <View style={styles.cardHeader}>
    {user?.houseName && (
      <MaterialIcons name="home" size={24} color={Colors.PRIMARY} />
    )}
    {user?.houseName && (
      <Text style={styles.cardTitle}>{user.houseName}</Text>
    )}
      {user?.houseName && (
          <TouchableOpacity style={styles.leaveHouseButton} onPress={handleLeaveHouse}>
            <MaterialIcons name="logout" size={20} color={Colors.RED} />
          </TouchableOpacity>
      )}
  </View>

  {user?.partner.length < 1 &&(
    <View style={styles.householdContainer}>
      <View style={styles.infoRow}>
        <MaterialIcons name="vpn-key" size={20} color={Colors.PRIMARY} />
        <Text style={styles.infoLabel}>Invite Code:</Text>
        <Text style={styles.inviteCodeValue}>{houseData?.inviteCode}</Text>
        <TouchableOpacity style={styles.copyCodeButton} onPress={() => Clipboard.setString(houseData?.inviteCode || '')}>
          <MaterialIcons name="content-copy" size={20} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>
    </View>
  ) }

  <View style={styles.partnerSection}>
    {user?.houseName ? (
      user?.partner ? (
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={24} color={Colors.PRIMARY} />
          <Text style={styles.cardTitle}>{user.partner}</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.inviteButton} onPress={handleInvitePartner}>
          <MaterialIcons name="person-add" size={20} color="white" />
          <Text style={styles.inviteButtonText}>Invite Partner</Text>
        </TouchableOpacity>
      )
    ) : (
      <>
      <View style={styles.noHouseRow}>
      <MaterialIcons name="home" size={24} color={Colors.PRIMARY} />
      <Text style={styles.infoLabel}>You're not part of a household</Text>
      </View>
      <TouchableOpacity 
        style={styles.inviteButton} 
        onPress={() => router.push('./../auth/householdForm')}
      >
        <Text style={styles.inviteButtonText}>Create or Join a House Now</Text>
      </TouchableOpacity>
      </>
    )} 
    
  
  </View>
</View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="food-steak" size={24} color={Colors.PRIMARY} />
            <Text style={styles.cardTitle}>Dietary Preferences</Text>
            <TouchableOpacity 
              style={styles.addPreferenceButton} 
              onPress={() => handleOpenModal('dietary')}
            >
              <MaterialIcons name="add" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>
          <View style={styles.preferencesContainer}>
            {user.dietaryPreferences.map((pref, index) => (
              <View key={index} style={styles.preferenceTag}>
                <Text style={styles.preferenceText}>{pref}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="food-apple" size={24} color={Colors.PRIMARY} />
            <Text style={styles.cardTitle}>Allergy Preferences</Text>
            <TouchableOpacity 
              style={styles.addPreferenceButton} 
              onPress={() => handleOpenModal('allergies')}
            >
              <MaterialIcons name="add" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>
          <View style={styles.preferencesContainer}>
            {user.allergiesPreferences.map((pref, index) => (
              <View key={index} style={styles.preferenceTag}>
                <Text style={styles.preferenceText}>{pref}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="notifications" size={24} color={Colors.PRIMARY} />
            <Text style={styles.cardTitle}>Notifications</Text>
          </View>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: Colors.PRIMARY + '40' }}
              thumbColor={notifications ? Colors.PRIMARY : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>Meal Updates</Text>
            <Switch
              value={mealUpdates}
              onValueChange={setMealUpdates}
              trackColor={{ false: '#767577', true: Colors.PRIMARY + '40' }}
              thumbColor={mealUpdates ? Colors.PRIMARY : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="history" size={24} color={Colors.PRIMARY} />
            <Text style={styles.cardTitle}>Recent Meals</Text>
          </View>
          {user.recentMeals.map(meal => (
            <View key={meal.id} style={styles.mealItem}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealDate}>{meal.date}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <PreferencesModal
          visible={modalVisible}
          onClose={handleCloseModal}
          type={modalType}
          currentPreferences={getCurrentPreferences()}
          onSave={handleSavePreferences}
        />

    

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',  // darker semi-transparent background
    justifyContent: 'center',  // center the modal
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,  // increased padding for better spacing
    maxHeight: '80%',  // take up to 80% of screen height
    width: '90%',     // slightly reduced width for better appearance
    alignSelf: 'center',  // center the modal horizontally
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  settingsItemValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: Colors.PRIMARY + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '500',
  },
  addPreferenceButton: {
    padding: 6,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealName: {
    fontSize: 16,
    color: '#333',
  },
  mealDate: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4B4B',
    margin: 16,
    padding: 16,
    borderRadius: 30,
    marginBottom: 32,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalItem: {
    backgroundColor: Colors.PRIMARY + '20',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.PRIMARY,
    marginLeft: 10,
  },
  modalFooter: {
    flexDirection: 'row',  // Arrange buttons in a row
    justifyContent: 'space-between',  // Space between buttons
    marginTop: 20,  // Space above the buttons
  },
  modalButton: {
    flex: 1,  // Allow buttons to take equal space
    padding: 12,  // Padding for better touch area
    borderRadius: 10,  // Rounded corners
    marginHorizontal: 5,  // Space between buttons
    alignItems: 'center',  // Center text horizontally
  },
  cancelButton: {
    backgroundColor: Colors.DARK_GREY,  // Light background for cancel button
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,  // Primary color for save button
  },
  buttonText: {
    fontSize: 16,
    color: 'white',  // White text for better contrast
  },
  inviteContainer: {
    padding: 5,
    margin: 5

  },
  inviteCode: {
    fontSize: 12,
    width: '100%',
  },
  householdContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  noHouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    marginRight: 8,
  },
  houseNameValue: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontWeight: '500',
    flex: 1,
  },
  inviteCodeValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  partnerSection: {
    gap: 16,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  inviteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: '#666',
    paddingLeft: 8
  },
  modalHeader: {
    flexDirection: 'row',  // Arrange items in a row
    justifyContent: 'space-between',  // Space between items
    alignItems: 'center',  // Center items vertically
  },
  closeButton: {
    marginLeft: 'auto',  // Push the close button to the right
    marginBottom: 20
  },
  copyCodeButton: { 
    flexDirection: 'row',
    marginLeft: 'auto',
    // backgroundColor: Colors.PRIMARY,
    margin: 0,
    padding: 8,
    borderRadius: 30,
    marginBottom: 0
  },
  leaveHouseButton: {
    flexDirection: 'row',
    marginLeft: 'auto',
    // backgroundColor: '#FF4B4B',
    margin: 0,
    padding: 8,
    borderRadius: 30,
    marginBottom: 0,
  },
  leaveHouseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  preferenceItem: {
    width: '48%',
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  preferenceText: {
    fontSize: 14,
    marginLeft: 8,
  },
})