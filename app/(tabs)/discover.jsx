import { View, Text, StyleSheet, Image, Dimensions, SafeAreaView, Alert, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
// import Swiper from 'react-native-deck-swiper'
import { MaterialIcons } from '@expo/vector-icons'
import Colors from './../../constants/Colors'
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../../configs/FirebaseConfig'
import Swiper from 'react-native-deck-swiper'
import { useRouter } from 'expo-router'
const { width } = Dimensions.get('window')

const CURATED_MEAL_IDS = [
  '52772', // Teriyaki Chicken Casserole
  '52771', // Spicy Arrabiata Penne
  '52770', // Spaghetti Carbonara
  '52775', // Beef Wellington
  '52773', // Honey Teriyaki Salmon
  '52765', // Chicken Enchilada Casserole
  '52785', // Dal fry
  '52774', // Pad See Ew
  '52764', // Mediterranean Pasta Salad
  '52767', // Baked salmon with fennel & tomatoes
  '52855', // Banana Pancakes
  '52953', // Beef Stroganoff
  '52898', // Chicken Marengo
  '52893', // Apple & Blackberry Crumble
  '52768', // Apple Frangipan Tart
  '52769', // Kapsalon
  '52863', // Shakshuka
  '52949', // Sweet and Sour Pork
  '52887', // Kedgeree
  '52891', // Tuna Nicoise
  // Add more popular meals as needed
];

export default function Discover() {
  const [meals, setMeals] = useState([])
  const [matchCount, setMatchCount] = useState(0)
  const [householdData, setHouseholdData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true)
        const userRef = doc(db, 'users', auth.currentUser.uid)
        const userSnap = await getDoc(userRef)
        const userData = userSnap.data()

        if (!userData?.householdId) {
          Alert.alert(
            "No Household Found",
            "Join a household to save your meal preferences and match with others!",
            [{ text: "OK" }]
          )
          setIsLoading(false)
          return
        }

        // Get household data
        const householdRef = doc(db, 'households', userData.householdId)
        const householdSnap = await getDoc(householdRef)
        const houseData = householdSnap.data()
        setHouseholdData({ ...houseData, uid: userData.householdId })
        
        // Only fetch meals after we have household data
        await fetchInitialMeals({ ...houseData, uid: userData.householdId })
      } catch (error) {
        console.error('Error initializing data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [])

  useEffect(() => {
    if (householdData?.currentSession?.matchedMeals) {
      setMatchCount(householdData.currentSession.matchedMeals.length);
    }
  }, [householdData]);

  const fetchInitialMeals = async (houseData) => {
    try {
      const currentUser = auth.currentUser;
      const isUser1 = houseData.users.user1.uid === currentUser.uid;
      const userField = isUser1 ? 'user1' : 'user2';
      const userPreferences = houseData.users[userField]?.mealPreferences || { liked: [], disliked: [] };
      
      // Shuffle the meal IDs array
      const shuffledIds = [...CURATED_MEAL_IDS]
        .sort(() => Math.random() - 0.5)
        .filter(id => !userPreferences.liked.includes(id) && !userPreferences.disliked.includes(id));
      
      // Fetch meals by ID
      const mealPromises = shuffledIds.slice(0, 15).map(id => 
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`).then(res => res.json())
      );
      
      const mealResults = await Promise.all(mealPromises);
      
      const formattedMeals = mealResults
        .filter(result => result.meals && result.meals[0]) // Ensure valid response
        .map(result => ({
          id: result.meals[0].idMeal,
          name: result.meals[0].strMeal,
          image: result.meals[0].strMealThumb,
          category: result.meals[0].strCategory,
          ingredients: Object.keys(result.meals[0])
            .filter(key => key.startsWith('strIngredient') && result.meals[0][key])
            .map(key => ({
              name: result.meals[0][key],
              measure: result.meals[0][`strMeasure${key.slice(13)}`]
            }))
        }));

      setMeals(formattedMeals);
    } catch (error) {
      console.error('Error fetching initial meals:', error);
    }
  };

  const fetchMoreMeals = async () => {
    if (!householdData) return;
    
    try {
      const currentUser = auth.currentUser;
      const isUser1 = householdData.users.user1.uid === currentUser.uid;
      const userField = isUser1 ? 'user1' : 'user2';
      const userPreferences = householdData.users[userField]?.mealPreferences || { liked: [], disliked: [] };
      
      // Same logic as fetchInitialMeals
      const shuffledIds = [...CURATED_MEAL_IDS]
        .sort(() => Math.random() - 0.5)
        .filter(id => !userPreferences.liked.includes(id) && !userPreferences.disliked.includes(id));
      
      const mealPromises = shuffledIds.slice(0, 15).map(id => 
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`).then(res => res.json())
      );
      
      const mealResults = await Promise.all(mealPromises);
      
      const formattedMeals = mealResults
        .filter(result => result.meals && result.meals[0]) // Ensure valid response
        .map(result => ({
          id: result.meals[0].idMeal,
          name: result.meals[0].strMeal,
          image: result.meals[0].strMealThumb,
          category: result.meals[0].strCategory,
          ingredients: Object.keys(result.meals[0])
            .filter(key => key.startsWith('strIngredient') && result.meals[0][key])
            .map(key => ({
              name: result.meals[0][key],
              measure: result.meals[0][`strMeasure${key.slice(13)}`]
            }))
        }));

      setMeals(formattedMeals);
    } catch (error) {
      console.error('Error fetching more meals:', error);
    }
  };

  const handleSwipe = async (direction) => {
    if (!householdData) return;

    // Check if already reached 7 matches and trying to swipe right
    if (direction === 'right' && matchCount >= 7) {
        Alert.alert(
            "Maximum Matches Reached",
            "You've already matched 7 meals! Reset your household's preferences to start matching new meals.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Reset Now",
                    onPress: handleResetPreferences
                }
            ]
        );
        return;
    }

    const currentMeal = meals[0];
    setMeals(prevMeals => prevMeals.slice(1));
    
    setIsLoading(true);
    try {
        const currentUser = auth.currentUser;
        const isUser1 = householdData.users.user1.uid === currentUser.uid;
        const userField = isUser1 ? 'user1' : 'user2';
        const otherUserField = isUser1 ? 'user2' : 'user1';

        const householdRef = doc(db, 'households', householdData.uid);
        const currentLiked = householdData.users[userField]?.mealPreferences?.liked || [];
        const currentDisliked = householdData.users[userField]?.mealPreferences?.disliked || [];

        if (direction === 'right') {
          // Add to liked meals while preserving existing ones
          const newLiked = [...currentLiked, currentMeal.id];
          
          await setDoc(householdRef, {
            users: {
              [userField]: {
                ...householdData.users[userField],
                mealPreferences: {
                  liked: newLiked,
                  disliked: currentDisliked
                }
              }
            }
          }, { merge: true });

          // Check if other user has liked this meal
          const otherUserLiked = householdData.users[otherUserField]?.mealPreferences?.liked?.includes(currentMeal.id);
          
          if (otherUserLiked) {
            const currentMatches = householdData.currentSession?.matchedMeals || [];
            const newMatchCount = Math.min(currentMatches.length + 1, 7);
            
            // Add the full meal object to matched meals
            await setDoc(householdRef, {
              currentSession: {
                matchedMeals: [...currentMatches, currentMeal],
                status: newMatchCount === 7 ? 'completed' : 'pending',
                ...(newMatchCount === 7 && {
                  shoppingList: {
                    items: generateShoppingList([...currentMatches, currentMeal]),
                    lastUpdated: serverTimestamp(),
                    status: 'active'
                  }
                })
              }
            }, { merge: true });

            setMatchCount(newMatchCount);

            if (newMatchCount === 7) {
              Alert.alert(
                "Congratulations!",
                "You've matched on 7 meals! Check your meal plan to see your matches and shopping list.",
                [
                  { 
                    text: "View Plan",
                    onPress: () => router.push("/plan")
                  }
                ]
              );
            }
          }
        } else if (direction === 'left') {
          // Add to disliked meals while preserving existing ones
          const newDisliked = [...currentDisliked, currentMeal.id];
          
          await setDoc(householdRef, {
            users: {
              [userField]: {
                ...householdData.users[userField],
                mealPreferences: {
                  liked: currentLiked,
                  disliked: newDisliked
                }
              }
            }
          }, { merge: true });
        }

        // Fetch updated household data
        const updatedHouseholdSnap = await getDoc(householdRef);
        setHouseholdData({ ...updatedHouseholdSnap.data(), uid: householdData.uid });

    } catch (error) {
        console.error('Error updating preferences:', error);
    } finally {
        setIsLoading(false);
        // If running low on meals, fetch more
        if (meals.length < 5) {
            fetchMoreMeals();
        }
    }
  };

  const generateShoppingList = (matchedMeals) => {
    const shoppingList = {};
    
    matchedMeals.forEach(meal => {
      // Use meal name as the key
      shoppingList[meal.name] = {
        ingredients: meal.ingredients.map(ingredient => ({
          name: ingredient.name,
          measure: ingredient.measure,
          checked: false
        }))
      };
    });
    
    return shoppingList;
  };

  const handleResetPreferences = async () => {
    Alert.alert(
      "Reset All Preferences",
      "This will reset all liked and disliked meals for everyone in your household and clear the shopping list. This action cannot be undone.",
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
              await setDoc(householdRef, {
                users: {
                  user1: {
                    ...householdData.users.user1,
                    mealPreferences: {
                      liked: [],
                      disliked: []
                    }
                  },
                  user2: {
                    ...householdData.users.user2,
                    mealPreferences: {
                      liked: [],
                      disliked: []
                    }
                  }
                },
                currentSession: {
                  matchedMeals: [],
                  status: 'pending',
                  shoppingList: {
                    items: {},
                    lastUpdated: serverTimestamp()
                  }
                }
              }, { merge: true });

              // Refresh household data
              const updatedHouseholdSnap = await getDoc(householdRef);
              setHouseholdData({ ...updatedHouseholdSnap.data(), uid: householdData.uid });
              setMatchCount(0);
              
              Alert.alert("Success", "All preferences and shopping list have been reset!");
            } catch (error) {
              console.error('Error resetting preferences:', error);
              Alert.alert("Error", "Failed to reset preferences. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <View style={styles.container}>
        {/* Progress Header */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Matched: {matchCount}/7 meals
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(matchCount / 7) * 100}%` }]} />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetPreferences}
          >
            <MaterialIcons name="refresh" size={24} color={Colors.WHITE} />
          </TouchableOpacity>
        </View>


        {meals.length > 0 && (
          <Swiper
            cards={meals}
            renderCard={(card) => (
              <View style={styles.card}>
                <Image source={{ uri: card?.image || 'Sorry, no image available.' }} style={styles.image} />
                <View style={styles.cardContent}>
                  <Text style={styles.title}>{card?.name}</Text>
                  <Text style={styles.category}>{card?.category}</Text>
                </View>
                <View style={styles.overlay}>
                  <View style={styles.leftAction}>
                    <MaterialIcons name="close" size={40} color="#FF4B4B" />
                  </View>
                  <View style={styles.rightAction}>
                    <MaterialIcons name="check" size={40} color="#4CAF50" />
                  </View>
                </View>
              </View>
            )}
            onSwipedLeft={() => handleSwipe('left')}
            onSwipedRight={() => handleSwipe('right')}
            onSwipedAll={() => fetchMoreMeals()}
            cardIndex={0}
            backgroundColor={'transparent'}
            stackSize={3}
            cardStyle={styles.cardStyle}
            infinite
            
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressContainer: {
    flex: 1,
    marginRight: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.PRIMARY,
    marginBottom: 20
  },
  progressBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 3,
  },
  card: {
    marginLeft: 30,
    marginTop: 100,
    height: 500,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  cardStyle: {
    top: 40,
    left: 0,
    right: 0,
    width: width - 32,
  },
  image: {
    width: '100%',
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#666',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    pointerEvents: 'none',
  },
  leftAction: {
    padding: 16,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    opacity: 0,
  },
  rightAction: {
    padding: 16,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    opacity: 0,
  },
  resetButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY,
  },
})