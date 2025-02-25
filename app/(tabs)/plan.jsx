import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, TextInput, Modal, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Calendar } from 'react-native-calendars'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import Colors from './../../constants/Colors'
import { auth, db } from '../../configs/FirebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import Checkbox from 'expo-checkbox'
import { useColorScheme } from 'react-native'
import { ActivityIndicator } from 'react-native'

export default function Plan() {
  const [selectedDate, setSelectedDate] = useState('')
  const [householdData, setHouseholdData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current
  const isDarkMode = useColorScheme() === 'dark'
  
  // // Dummy data - replace with your actual data
  // const mealPlan = {
  //   '2024-03-18': { meal: 'Italian Pasta', matched: true },
  //   '2024-03-19': { meal: 'Grilled Chicken', matched: true },
  //   '2024-03-20': { meal: 'Vegetarian Bowl', matched: true },
  // }

  // const shoppingList = [
  //   { id: 1, item: 'Pasta', quantity: '500g' },
  //   { id: 2, item: 'Tomatoes', quantity: '4' },
  //   { id: 3, item: 'Chicken Breast', quantity: '2' },
  // ]

  // const markedDates = Object.keys(mealPlan).reduce((acc, date) => {
  //   acc[date] = {
  //     marked: true,
  //     dotColor: Colors.PRIMARY,
  //     selected: date === selectedDate,
  //     selectedColor: Colors.PRIMARY + '40',
  //   }
  //   return acc
  // }, {})

  useEffect(() => {
    const fetchHouseholdData = async () => {
      try {
        setIsLoading(true)
        const userRef = doc(db, 'users', auth.currentUser.uid)
        const userSnap = await getDoc(userRef)
        const userData = userSnap.data()

        if (userData?.householdId) {
          const householdRef = doc(db, 'households', userData.householdId)
          const householdSnap = await getDoc(householdRef)
          setHouseholdData(householdSnap.data())
        }
      } catch (error) {
        console.error('Error fetching household data:', error)
      } finally {
        setIsLoading(false)
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start()
      }
    }

    fetchHouseholdData()
  }, [fadeAnim])

  const toggleItemChecked = async (recipeName, ingredientIndex) => {
    try {
      const householdRef = doc(db, 'households', householdData.uid);
      const currentItems = householdData.currentSession.shoppingList.items;
      
      // Create a deep copy of the current items
      const updatedItems = {
        ...currentItems,
        [recipeName]: {
          ...currentItems[recipeName],
          ingredients: currentItems[recipeName].ingredients.map((ingredient, index) => 
            index === ingredientIndex 
              ? { ...ingredient, checked: !ingredient.checked }
              : ingredient
          )
        }
      };

      // Update Firebase
      await updateDoc(householdRef, {
        'currentSession.shoppingList.items': updatedItems
      });

      // Update local state
      setHouseholdData({
        ...householdData,
        currentSession: {
          ...householdData.currentSession,
          shoppingList: {
            ...householdData.currentSession.shoppingList,
            items: updatedItems
          }
        }
      });
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert("Error", "Failed to update item. Please try again.");
    }
  };

  // Add this function to handle adding new items
  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    try {
      const householdRef = doc(db, 'households', householdData.uid);
      const currentItems = householdData.currentSession.shoppingList.items;
      
      // Add or update the "Other Items" section
      const otherItems = currentItems["Other Items"] || { ingredients: [] };
      
      const updatedItems = {
        ...currentItems,
        "Other Items": {
          ingredients: [
            ...otherItems.ingredients,
            {
              name: newItemName.trim(),
              measure: newItemQuantity.trim() || '1',
              checked: false
            }
          ]
        }
      };

      await updateDoc(householdRef, {
        'currentSession.shoppingList.items': updatedItems
      });

      setHouseholdData({
        ...householdData,
        currentSession: {
          ...householdData.currentSession,
          shoppingList: {
            ...householdData.currentSession.shoppingList,
            items: updatedItems
          }
        }
      });

      setNewItemName('');
      setNewItemQuantity('');
      setShowAddItem(false);
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert("Error", "Failed to add item. Please try again.");
    }
  };

  // Add this function to handle resetting the shopping list
  const handleResetShoppingList = () => {
    Alert.alert(
      "Reset Shopping List",
      "This will clear all items and their checked status. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              const householdRef = doc(db, 'households', householdData.uid);
              await updateDoc(householdRef, {
                'currentSession.shoppingList.items': {}
              });

              setHouseholdData({
                ...householdData,
                currentSession: {
                  ...householdData.currentSession,
                  shoppingList: {
                    ...householdData.currentSession.shoppingList,
                    items: {}
                  }
                }
              });

              Alert.alert("Success", "Shopping list has been reset!");
            } catch (error) {
              console.error('Error resetting shopping list:', error);
              Alert.alert("Error", "Failed to reset shopping list. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Update the Shopping List section
  const renderShoppingList = () => {
    if (!householdData?.currentSession?.shoppingList?.items) {
      return <Text style={styles.noItemsText}>No items in shopping list yet</Text>;
    }

    // Get matched meals array to determine order
    const matchedMeals = householdData.currentSession.matchedMeals || [];
    
    // Separate "Other Items" from recipe items
    const { "Other Items": otherItems, ...recipeItems } = householdData.currentSession.shoppingList.items;
    
    // Create an ordered array of recipe entries
    const orderedRecipes = Object.entries(recipeItems)
      .sort((a, b) => {
        const indexA = matchedMeals.findIndex(meal => meal.name === a[0]);
        const indexB = matchedMeals.findIndex(meal => meal.name === b[0]);
        return indexA - indexB;
      });

    return (
      <>
        {/* Recipe Items */}
        {orderedRecipes.map(([recipeName, recipeData]) => {
          if (!recipeData || !recipeData.ingredients || !Array.isArray(recipeData.ingredients)) {
            return null;
          }

          return (
            <View key={recipeName} style={styles.recipeSection}>
              <Text style={styles.recipeTitle}>{recipeName}</Text>
              {recipeData.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.ingredientInfo}>
                    <Text style={[styles.itemName, ingredient.checked && styles.checkedItem]}>
                      {ingredient.name}
                    </Text>
                    <Text style={[styles.itemQuantity, ingredient.checked && styles.checkedItem]}>
                      {ingredient.measure}
                    </Text>
                  </View>
                  <Checkbox
                    value={ingredient.checked}
                    onValueChange={() => toggleItemChecked(recipeName, index)}
                    color={ingredient.checked ? Colors.PRIMARY : undefined}
                    style={styles.checkbox}
                  />
                </View>
              ))}
            </View>
          );
        })}

        {/* Other Items Section */}
        {otherItems && otherItems.ingredients.length > 0 && (
          <View style={[styles.recipeSection, styles.otherItemsSection]}>
            <Text style={styles.recipeTitle}>Other Items</Text>
            {otherItems.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.ingredientInfo}>
                  <Text style={[styles.itemName, ingredient.checked && styles.checkedItem]}>
                    {ingredient.name}
                  </Text>
                  <Text style={[styles.itemQuantity, ingredient.checked && styles.checkedItem]}>
                    {ingredient.measure}
                  </Text>
                </View>
                <Checkbox
                  value={ingredient.checked}
                  onValueChange={() => toggleItemChecked("Other Items", index)}
                  color={ingredient.checked ? Colors.PRIMARY : undefined}
                  style={styles.checkbox}
                />
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  // Add function to render matched meals
  const renderMatchedMeals = () => {
    if (!householdData?.currentSession?.matchedMeals) {
      return (
        <View style={styles.noMealsContainer}>
          <Text style={styles.noMealsText}>No matched meals yet</Text>
          <Text style={styles.noMealsSubtext}>Start swiping in Discover to match meals!</Text>
        </View>
      );
    }

    return (
      <View style={styles.matchedMealsContainer}>
        {householdData.currentSession.matchedMeals.map((meal, index) => (
          <TouchableOpacity 
            key={meal.id} 
            style={styles.mealCard}
            onPress={() => fetchRecipeDetails(meal.id)}
          >
            <View style={styles.mealNumberBadge}>
              <Text style={styles.mealNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.mealName} numberOfLines={1} ellipsizeMode="tail">
              {meal.name}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.PRIMARY} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Add this function to fetch recipe details
  const fetchRecipeDetails = async (mealId) => {
    try {
      const response = await fetch(`https://recipe-api-3isk.onrender.com/api/recipes/${mealId}`);
      const data = await response.json();
      if (data) {
        setSelectedRecipe(data);
        setShowRecipeModal(true);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      Alert.alert("Error", "Failed to load recipe details");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#000' : Colors.WHITE }}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : Colors.WHITE }}>
      <ScrollView style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Weekly Meals</Text>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => setShowCalendar(true)}
            >
              <MaterialIcons name="calendar-today" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Matched Meals Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="food" size={24} color={Colors.PRIMARY} />
              <Text style={styles.cardTitle}>Your Matched Meals</Text>
            </View>
            {renderMatchedMeals()}
          </View>

          {/* Calendar Modal */}
          <Modal
            visible={showCalendar}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Meal Calendar</Text>
                  <TouchableOpacity 
                    onPress={() => setShowCalendar(false)}
                    style={styles.closeButton}
                  >
                    <MaterialIcons name="close" size={24} color={Colors.PRIMARY} />
                  </TouchableOpacity>
                </View>
                <Calendar
                  onDayPress={day => setSelectedDate(day.dateString)}
                  theme={{
                    todayTextColor: Colors.PRIMARY,
                    selectedDayBackgroundColor: Colors.PRIMARY,
                    dotColor: Colors.PRIMARY,
                  }}
                />
              </View>
            </View>
          </Modal>

          {/* Shopping List */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <MaterialIcons name="shopping-cart" size={24} color={Colors.PRIMARY} />
                <Text style={styles.cardTitle}>Shopping List</Text>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleResetShoppingList}
                >
                  <MaterialIcons name="refresh" size={24} color={Colors.PRIMARY} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => setShowAddItem(true)}
                >
                  <MaterialIcons name="add" size={24} color={Colors.PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>

            {showAddItem && (
              <View style={styles.addItemContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Item name"
                  value={newItemName}
                  onChangeText={setNewItemName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Quantity (optional)"
                  value={newItemQuantity}
                  onChangeText={setNewItemQuantity}
                />
                <View style={styles.addItemButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowAddItem(false);
                      setNewItemName('');
                      setNewItemQuantity('');
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.addItemButton}
                    onPress={handleAddItem}
                  >
                    <Text style={styles.buttonText}>Add Item</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {renderShoppingList()}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Recipe Modal */}
      {showRecipeModal && selectedRecipe && (
        <Modal
          visible={showRecipeModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedRecipe.strMeal}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowRecipeModal(false);
                    setSelectedRecipe(null);
                  }}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color={Colors.PRIMARY} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.recipeDetails}>
                <View style={styles.instructionsContainer}>
                  <Text style={styles.sectionTitle}>Instructions</Text>
                  {(() => {
                    const instructions = selectedRecipe?.strInstructions || selectedRecipe?.instructions || '';
                    
                    if (!instructions) {
                      return <Text style={styles.stepText}>No instructions available.</Text>;
                    }

                    // Convert to string if it's an array
                    const instructionText = Array.isArray(instructions) ? instructions.join(' ') : instructions;
                    
                    return instructionText
                      .split('.')
                      .filter(step => step.trim().length > 0)
                      .map((step, index) => (
                        <View key={index} style={styles.instructionStep}>
                          <Text style={styles.stepNumber}>{index + 1}.</Text>
                          <Text style={styles.stepText}>{step.trim()}</Text>
                        </View>
                      ));
                  })()}
                </View>
                
                {/* <Text style={styles.sectionTitle}>Ingredients</Text>
                <View style={styles.ingredientsList}>
                  {Array.from({ length: 20 }).map((_, i) => {
                    const ingredient = selectedRecipe[`strIngredient${i + 1}`];
                    const measure = selectedRecipe[`strMeasure${i + 1}`];
                    if (ingredient && ingredient.trim()) {
                      return (
                        <Text key={i} style={styles.ingredient}>
                          • {measure} {ingredient}
                        </Text>
                      );
                    }
                    return null;
                  })}
                </View> */}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  shareButton: {
    padding: 8,
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  mealContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  recipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  recipeButtonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.PRIMARY,
    marginBottom: 8,
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY,
    flex: 1,
    textAlign: 'left',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 8,
  },
  exportButtonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  checkbox: {
    marginLeft: -20,
  },
  checkedItem: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  noItemsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    paddingVertical: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.PRIMARY,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.PRIMARY,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  addItemContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addItemButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  addItemButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.PRIMARY,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  matchedMealsContainer: {
    marginTop: 5,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 6,
  },
  mealNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  mealNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  mealName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  noMealsContainer: {
    padding: 12,
    alignItems: 'center',
  },
  noMealsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  noMealsSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  recipeSection: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.PRIMARY,
    paddingBottom: 8,
  },
  ingredientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otherItemsSection: {
    borderTopWidth: 2,
    borderTopColor: Colors.PRIMARY + '40',
    marginTop: 20,
  },
  recipeDetails: {
    maxHeight: '90%',
  },
  instructionsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingRight: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY,
    width: 25,
    marginRight: 8,
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginTop: 0,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.PRIMARY + '40',
    paddingBottom: 8,
  },
  ingredientsList: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  ingredient: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 8,
  },
})