import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { auth, db } from '../../configs/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import MatchedMeals from '../components/plan/MatchedMeals';
import ShoppingList from '../components/plan/ShoppingList';
import RecipeModal from '../components/plan/RecipeModal';
import MealPlanner from '../components/plan/MealPlanner';

export default function Plan() {
  const [activeTab, setActiveTab] = useState('meals');
  const [householdData, setHouseholdData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [mealPlan, setMealPlan] = useState({});
  const [showMealPlanner, setShowMealPlanner] = useState(false);

  // Fetch household data
  useEffect(() => {
    const fetchHouseholdData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.data();
        
        if (userData?.householdId) {
          const householdDoc = await getDoc(doc(db, 'households', userData.householdId));
          const data = householdDoc.data();
          setHouseholdData(data);
          
          // Initialize meal plan from Firestore if it exists
          if (data.weeklyPlans) {
            setMealPlan(data.weeklyPlans);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching household data:', error);
        setLoading(false);
      }
    };
    
    fetchHouseholdData();
  }, []);

  // Save meal plan to Firestore when it changes
  useEffect(() => {
    const saveMealPlan = async () => {
      if (householdData && Object.keys(mealPlan).length > 0) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          const userData = userDoc.data();
          
          if (userData?.householdId) {
            await updateDoc(doc(db, 'households', userData.householdId), {
              weeklyPlans: mealPlan
            });
          }
        } catch (error) {
          console.error('Error saving meal plan:', error);
        }
      }
    };
    
    saveMealPlan();
  }, [mealPlan]);

  // Toggle shopping list item
  const toggleShoppingListItem = async (recipeName, index) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();
      
      if (userData?.householdId) {
        const householdDoc = await getDoc(doc(db, 'households', userData.householdId));
        const data = householdDoc.data();
        
        const updatedShoppingList = { ...data.currentSession.shoppingList.items };
        
        if (updatedShoppingList[recipeName] && updatedShoppingList[recipeName].ingredients) {
          updatedShoppingList[recipeName].ingredients[index].checked = 
            !updatedShoppingList[recipeName].ingredients[index].checked;
          
          await updateDoc(doc(db, 'households', userData.householdId), {
            'currentSession.shoppingList.items': updatedShoppingList,
            'currentSession.shoppingList.lastUpdated': new Date()
          });
          
          // Update local state
          setHouseholdData({
            ...householdData,
            currentSession: {
              ...householdData.currentSession,
              shoppingList: {
                ...householdData.currentSession.shoppingList,
                items: updatedShoppingList,
                lastUpdated: new Date()
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error toggling shopping list item:', error);
    }
  };

// Fetch recipe details
const fetchRecipeDetails = async (recipeId) => {
  try {
    // Find the recipe in matched meals
    const recipe = householdData.currentSession.matchedMeals.find(
      meal => meal.id === recipeId
    );
    
    if (recipe) {
      // Check if recipe already has instructions
      if (recipe.instructions || recipe.strInstructions) {
        setSelectedRecipe(recipe);
        setShowRecipeModal(true);
      } else {
        // Fetch complete recipe data from API
        const response = await fetch(`https://recipe-api-3isk.onrender.com/api/recipes/${recipe.id}`);
        
        if (response.ok) {
          const recipeData = await response.json();
          const completeRecipe = {
            ...recipe,
            instructions: recipeData.instructions || recipeData.strInstructions
          };
          setSelectedRecipe(completeRecipe);
          setShowRecipeModal(true);
        } else {
          // If API fetch fails, just show what we have
          setSelectedRecipe(recipe);
          setShowRecipeModal(true);
          console.warn('Failed to fetch recipe details from API for', recipe.id);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    // Still show the recipe even if there's an error fetching additional data
    if (recipe) {
      setSelectedRecipe(recipe);
      setShowRecipeModal(true);
    }
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Planning</Text>
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => setShowMealPlanner(true)}
        >
          <MaterialIcons name="calendar-today" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'meals' && styles.activeTab]}
          onPress={() => setActiveTab('meals')}
        >
          <Text style={[styles.tabText, activeTab === 'meals' && styles.activeTabText]}>
            Matched Meals
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'shopping' && styles.activeTab]}
          onPress={() => setActiveTab('shopping')}
        >
          <Text style={[styles.tabText, activeTab === 'shopping' && styles.activeTabText]}>
            Shopping List
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'meals' ? (
          <MatchedMeals 
            meals={householdData?.currentSession?.matchedMeals} 
            onMealPress={fetchRecipeDetails}
          />
        ) : (
          <ShoppingList 
            items={householdData?.currentSession?.shoppingList?.items}
            matchedMeals={householdData?.currentSession?.matchedMeals || []}
            onToggleItem={toggleShoppingListItem}
          />
        )}
      </ScrollView>
      
      {/* Recipe Modal */}
      <RecipeModal 
        recipe={selectedRecipe}
        visible={showRecipeModal}
        onClose={() => {
          setShowRecipeModal(false);
          setSelectedRecipe(null);
        }}
      />
      
      {/* Meal Planner Modal */}
      <MealPlanner
        visible={showMealPlanner}
        onClose={() => setShowMealPlanner(false)}
        mealPlan={mealPlan}
        setMealPlan={setMealPlan}
        householdData={householdData}
        fetchRecipeDetails={fetchRecipeDetails}
      />
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  calendarButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.PRIMARY + '20',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  activeTab: {
    borderBottomColor: Colors.PRIMARY,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});