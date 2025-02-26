import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Image, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { MaterialIcons, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'
import Colors from './../../constants/Colors'
import { router } from 'expo-router'
import { auth, db } from '../../configs/FirebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useColorScheme } from 'react-native'
import MealPlanner from '../components/plan/MealPlanner'
import RecipeModal from '../components/plan/RecipeModal'

export default function Home() {
  const [userData, setUserData] = useState(null)
  const [householdData, setHouseholdData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [partnerName, setPartnerName] = useState('')
  const fadeAnim = useRef(new Animated.Value(0)).current
  const isDarkMode = useColorScheme() === 'dark'
  const [showMealPlanner, setShowMealPlanner] = useState(false)
  const [mealPlan, setMealPlan] = useState({})
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showRecipeModal, setShowRecipeModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch user data
        const userRef = doc(db, 'users', auth.currentUser.uid)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const userDataFromDB = userSnap.data()
          setUserData(userDataFromDB)
          
          // If user has a household, fetch household data
          if (userDataFromDB.householdId) {
            const householdRef = doc(db, 'households', userDataFromDB.householdId)
            const householdSnap = await getDoc(householdRef)
            
            if (householdSnap.exists()) {
              const householdDataFromDB = householdSnap.data()
              setHouseholdData(householdDataFromDB)
              
              // Determine partner name
              const isUser1 = householdDataFromDB.users.user1.uid === auth.currentUser.uid
              const partner = isUser1 ? householdDataFromDB.users.user2 : householdDataFromDB.users.user1
              if (partner && partner.name) {
                setPartnerName(partner.name.split(' ')[0]) // Get first name only
              }

              // Initialize meal plan from Firestore if it exists
              if (householdDataFromDB.weeklyPlans) {
                setMealPlan(householdDataFromDB.weeklyPlans)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start()
      }
    }
    
    fetchData()
  }, [fadeAnim])

  // Save meal plan to Firestore when it changes
  useEffect(() => {
    const saveMealPlan = async () => {
      if (householdData && Object.keys(mealPlan).length > 0) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
          const userData = userDoc.data()
          
          if (userData?.householdId) {
            await updateDoc(doc(db, 'households', userData.householdId), {
              weeklyPlans: mealPlan
            })
          }
        } catch (error) {
          console.error('Error saving meal plan:', error)
        }
      }
    }
    
    saveMealPlan()
  }, [mealPlan])

  // Calculate meal plan progress
  const getMatchCount = () => {
    if (!householdData || !householdData.currentSession || !householdData.currentSession.matchedMeals) {
      return 0
    }
    return householdData.currentSession.matchedMeals.length
  }

  const matchCount = getMatchCount()
  const progressPercentage = Math.round((matchCount / 7) * 100)

  // Get next meal suggestion
  const getNextMealSuggestion = () => {
    if (!householdData || !householdData.currentSession || !householdData.currentSession.matchedMeals || householdData.currentSession.matchedMeals.length === 0) {
      return null
    }
    // Return the most recently matched meal
    return householdData.currentSession.matchedMeals[householdData.currentSession.matchedMeals.length - 1]
  }

  const nextMeal = getNextMealSuggestion()

  // Check if shopping list has items
  const hasShoppingList = () => {
    if (!householdData || !householdData.currentSession || !householdData.currentSession.shoppingList || !householdData.currentSession.shoppingList.items) {
      return false
    }
    return Object.keys(householdData.currentSession.shoppingList.items).length > 0
  }

  // Count unchecked shopping list items
  const countUncheckedItems = () => {
    if (!householdData || !householdData.currentSession || !householdData.currentSession.shoppingList || !householdData.currentSession.shoppingList.items) {
      return 0
    }
    
    let count = 0
    const items = householdData.currentSession.shoppingList.items
    
    Object.values(items).forEach(recipe => {
      if (recipe.ingredients) {
        recipe.ingredients.forEach(ingredient => {
          if (!ingredient.checked) {
            count++
          }
        })
      }
    })
    
    return count
  }

  const uncheckedItemsCount = countUncheckedItems()

  // Fetch recipe details for meal planner
  const fetchRecipeDetails = async (recipeId) => {
    try {
      // Find the recipe in matched meals
      const recipe = householdData.currentSession.matchedMeals.find(
        meal => meal.id === recipeId
      )
      
      if (recipe) {
        setSelectedRecipe(recipe)
        setShowRecipeModal(true)
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#000' : '#f5f5f5' }}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#f5f5f5' }}>
      <ScrollView style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header Section */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>
                Welcome back, {userData?.FirstName || 'Friend'}!
              </Text>
              {householdData && (
                <Text style={styles.householdText}>
                  {householdData.householdName || 'Your Household'}
                </Text>
              )}
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileButton}>
                <MaterialIcons name="account-circle" size={32} color={Colors.PRIMARY} />
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsButton}>
                <MaterialIcons name="settings" size={32} color={Colors.PRIMARY} />
              </TouchableOpacity> */}
            </View>
          </View>

          {/* No Household Message */}
          {!householdData && (
            <View style={styles.noHouseholdCard}>
              <MaterialIcons name="home" size={40} color={Colors.PRIMARY} />
              <Text style={styles.noHouseholdTitle}>Join a Household</Text>
              <Text style={styles.noHouseholdText}>
                Create or join a household to start matching meals with your partner!
              </Text>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/auth/householdForm')}
              >
                <Text style={styles.actionButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          )}

          {householdData && (
            <>
              {/* Weekly Progress Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="food-fork-drink" size={24} color={Colors.PRIMARY} />
                  <Text style={styles.cardTitle}>Weekly Meal Plan</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressCircle}>
                    <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
                  </View>
                  <View style={styles.progressTextContainer}>
                    <Text style={styles.progressText}>{matchCount} of 7 meals matched</Text>
                    {partnerName && (
                      <Text style={styles.partnerText}>
                        {matchCount < 7 
                          ? `Keep swiping to match with ${partnerName}!` 
                          : `Great job! You've matched all meals with ${partnerName}!`}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/plan')}
                >
                  <Text style={styles.actionButtonText}>
                    {matchCount < 7 ? 'Find More Meals' : 'View Matched Meals'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Next Meal Suggestion */}
              {nextMeal && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="food" size={24} color={Colors.PRIMARY} />
                    <Text style={styles.cardTitle}>Latest Match</Text>
                  </View>
                  <View style={styles.mealSuggestionContainer}>
                    {nextMeal.image && (
                      <Image 
                        source={{ uri: nextMeal.image }} 
                        style={styles.mealImage} 
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealName}>{nextMeal.name}</Text>
                      <View style={styles.mealDetails}>
                        <View style={styles.mealDetail}>
                          <MaterialIcons name="timer" size={16} color={Colors.PRIMARY} />
                          <Text style={styles.detailText}>{nextMeal.preparationTime + nextMeal.cookingTime} min</Text>
                        </View>
                        <View style={styles.mealDetail}>
                          <MaterialIcons name="people" size={16} color={Colors.PRIMARY} />
                          <Text style={styles.detailText}>Serves {nextMeal.servings}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => setShowMealPlanner(true)}
                  >
                    <Text style={styles.actionButtonText}>Meal Plan</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Shopping List Status */}
              {hasShoppingList() && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="cart" size={24} color={Colors.PRIMARY} />
                    <Text style={styles.cardTitle}>Shopping List</Text>
                  </View>
                  <View style={styles.shoppingListContainer}>
                    <View style={styles.shoppingListStatus}>
                      <FontAwesome5 name="shopping-basket" size={24} color={Colors.PRIMARY} />
                      <View style={styles.shoppingListTextContainer}>
                        <Text style={styles.shoppingListTitle}>
                          {uncheckedItemsCount > 0 
                            ? `${uncheckedItemsCount} items remaining` 
                            : 'All items checked!'}
                        </Text>
                        <Text style={styles.shoppingListSubtitle}>
                          {uncheckedItemsCount > 0 
                            ? 'Tap to view your shopping list' 
                            : 'Ready to cook your meals!'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => router.push('/plan')}
                  >
                    <Text style={styles.actionButtonText}>View Shopping List</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Quick Actions */}
              <View style={styles.quickActionsContainer}>
                <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity 
                    style={styles.quickActionItem}
                    onPress={() => router.push('/discover')}
                  >
                    <MaterialIcons name="thumb-up" size={28} color={Colors.PRIMARY} />
                    <Text style={styles.quickActionText}>Swipe Meals</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickActionItem}
                    onPress={() => setShowMealPlanner(true)}
                  >
                    <MaterialIcons name="calendar-today" size={28} color={Colors.PRIMARY} />
                    <Text style={styles.quickActionText}>Meal Plan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickActionItem}
                    onPress={() => router.push('/plan')}
                  >
                    <MaterialIcons name="shopping-cart" size={28} color={Colors.PRIMARY} />
                    <Text style={styles.quickActionText}>Shopping</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickActionItem}
                    onPress={() => router.push('/profile')}
                  >
                    <MaterialIcons name="settings" size={28} color={Colors.PRIMARY} />
                    <Text style={styles.quickActionText}>Profile / Settings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Meal Planner Modal */}
      <MealPlanner
        visible={showMealPlanner}
        onClose={() => setShowMealPlanner(false)}
        mealPlan={mealPlan}
        setMealPlan={setMealPlan}
        householdData={householdData}
        fetchRecipeDetails={fetchRecipeDetails}
      />
      
      {/* Recipe Modal */}
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  householdText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: Colors.PRIMARY,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.PRIMARY + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  partnerText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.WHITE,
    fontWeight: '600',
    fontSize: 16,
  },
  mealSuggestionContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mealImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  mealInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  mealDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mealDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  shoppingListContainer: {
    marginBottom: 16,
  },
  shoppingListStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shoppingListTextContainer: {
    marginLeft: 16,
  },
  shoppingListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  shoppingListSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  quickActionsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  noHouseholdCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noHouseholdTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  noHouseholdText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  settingsButton: {
    padding: 8,
    marginLeft: 10,
  },
})