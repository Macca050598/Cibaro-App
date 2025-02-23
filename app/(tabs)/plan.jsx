import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import Colors from './../../constants/Colors'
import { auth, db } from '../../configs/FirebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import MatchedMeals from '../../components/plan/MatchedMeals'
import ShoppingList from '../../components/plan/ShoppingList'
import RecipeModal from '../../components/plan/RecipeModal'

export default function Plan() {
  const [householdData, setHouseholdData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showRecipeModal, setShowRecipeModal] = useState(false)

  useEffect(() => {
    fetchHouseholdData()
  }, [])

  const fetchHouseholdData = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid)
      const userSnap = await getDoc(userRef)
      const userData = userSnap.data()

      if (userData?.householdId) {
        const householdRef = doc(db, 'households', userData.householdId)
        const householdSnap = await getDoc(householdRef)
        setHouseholdData({ ...householdSnap.data(), uid: userData.householdId })
      }
    } catch (error) {
      console.error('Error fetching household data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItemName.trim()) return

    try {
      const householdRef = doc(db, 'households', householdData.uid)
      const currentItems = householdData.currentSession.shoppingList.items
      
      const otherItems = currentItems["Other Items"] || { ingredients: [] }
      
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
      }

      await updateDoc(householdRef, {
        'currentSession.shoppingList.items': updatedItems
      })

      setHouseholdData({
        ...householdData,
        currentSession: {
          ...householdData.currentSession,
          shoppingList: {
            ...householdData.currentSession.shoppingList,
            items: updatedItems
          }
        }
      })

      setNewItemName('')
      setNewItemQuantity('')
      setShowAddItem(false)
    } catch (error) {
      console.error('Error adding item:', error)
      Alert.alert("Error", "Failed to add item. Please try again.")
    }
  }

  const toggleItemChecked = async (recipeName, ingredientIndex) => {
    try {
      const householdRef = doc(db, 'households', householdData.uid)
      const currentItems = householdData.currentSession.shoppingList.items
      
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
      }

      await updateDoc(householdRef, {
        'currentSession.shoppingList.items': updatedItems
      })

      setHouseholdData({
        ...householdData,
        currentSession: {
          ...householdData.currentSession,
          shoppingList: {
            ...householdData.currentSession.shoppingList,
            items: updatedItems
          }
        }
      })
    } catch (error) {
      console.error('Error updating item:', error)
      Alert.alert("Error", "Failed to update item. Please try again.")
    }
  }

  const fetchRecipeDetails = async (mealId) => {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
      const data = await response.json()
      if (data.meals && data.meals[0]) {
        setSelectedRecipe(data.meals[0])
        setShowRecipeModal(true)
      }
    } catch (error) {
      console.error('Error fetching recipe:', error)
      Alert.alert("Error", "Failed to load recipe details")
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Weekly Meals</Text>
        </View>

        {/* Matched Meals Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="food" size={24} color={Colors.PRIMARY} />
            <Text style={styles.cardTitle}>Your Matched Meals</Text>
          </View>
          <MatchedMeals 
            meals={householdData?.currentSession?.matchedMeals}
            onMealPress={fetchRecipeDetails}
          />
        </View>

        {/* Shopping List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <MaterialIcons name="shopping-cart" size={24} color={Colors.PRIMARY} />
              <Text style={styles.cardTitle}>Shopping List</Text>
            </View>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowAddItem(true)}
            >
              <MaterialIcons name="add" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
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
                    setShowAddItem(false)
                    setNewItemName('')
                    setNewItemQuantity('')
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

          <ShoppingList 
            items={householdData?.currentSession?.shoppingList?.items}
            matchedMeals={householdData?.currentSession?.matchedMeals || []}
            onToggleItem={toggleItemChecked}
          />
        </View>
      </ScrollView>

      <RecipeModal 
        recipe={selectedRecipe}
        visible={showRecipeModal}
        onClose={() => {
          setShowRecipeModal(false)
          setSelectedRecipe(null)
        }}
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
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
})