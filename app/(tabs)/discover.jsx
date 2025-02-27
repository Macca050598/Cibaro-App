import { View, Text, StyleSheet, Image, Dimensions, SafeAreaView, Alert, TouchableOpacity, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
// import Swiper from 'react-native-deck-swiper'
import { MaterialIcons } from '@expo/vector-icons'
import Colors from './../../constants/Colors'
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../../configs/FirebaseConfig'
import Swiper from 'react-native-deck-swiper'
import { useRouter } from 'expo-router'
import { useColorScheme } from 'react-native'
import { ActivityIndicator } from 'react-native'
import ConfettiCannon from 'react-native-confetti-cannon'
const { width, height } = Dimensions.get('window')

const MatchAnimation = ({ visible, mealName, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Trigger confetti
      confettiRef.current?.start();
      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.matchOverlay}>
      <ConfettiCannon
        ref={confettiRef}
        count={100}
        origin={{x: width/2, y: height}}
        autoStart={false}
        fadeOut={true}
        colors={[Colors.PRIMARY, '#FFD700', '#FF69B4', '#87CEEB']}
      />
      <Animated.View 
        style={[
          styles.matchCard,
          {
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Text style={styles.matchTitle}>It's a Match! 🎉</Text>
        <Text style={styles.matchText}>
          You and your partner both liked{'\n'}
          <Text style={styles.matchMealName}>{mealName}</Text>
        </Text>
        <TouchableOpacity 
          style={styles.matchButton}
          onPress={onClose}
        >
          <Text style={styles.matchButtonText}>Continue Swiping</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function Discover() {
  const [meals, setMeals] = useState([])
  const [matchCount, setMatchCount] = useState(0)
  const [householdData, setHouseholdData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const router = useRouter()
  const isDarkMode = useColorScheme() === 'dark'
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)
  const [matchedMealName, setMatchedMealName] = useState('')

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true)
        const userRef = doc(db, 'users', auth.currentUser.uid)
        const userSnap = await getDoc(userRef)
        const userData = userSnap.data()
        console.log('User Data:', userData.householdId)
        if (!userData?.householdId) {
          Alert.alert(
            "No Household Found",
            "Join a household to save your meal preferences and match with others!",
            [{ text: "OK", onPress: () => router.push('/auth/householdForm') }]
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
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start()
      }
    }

    initializeData()
  }, [fadeAnim])

  useEffect(() => {
    if (householdData?.currentSession?.matchedMeals) {
      setMatchCount(householdData.currentSession.matchedMeals.length);
    }
  }, [householdData]);

  // useEffect(() => {
  //   if (router.current?.params?.refresh === 'true') {
  //     console.log('Preferences changed, refreshing recipes...');
  //     if (householdData) {
  //       fetchInitialMeals(householdData);
  //     }
  //   }
  // }, [router.current?.params?.refresh]);

  const fetchInitialMeals = async (houseData) => {
    try {
      const currentUser = auth.currentUser;
      const isUser1 = houseData.users.user1.uid === currentUser.uid;
      const userField = isUser1 ? 'user1' : 'user2';
      const userPreferences = houseData.users[userField]?.mealPreferences || { liked: [], disliked: [] };
      
      // Get user's dietary preferences
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const dietaryPreferences = userData?.dietaryPreferences || {};
      const allergiesPreferences = userData?.allergiesPreferences || {};

      console.log('User Dietary Preferences:', dietaryPreferences);

      // Fetch all meals from your new API
      const response = await fetch('https://recipe-api-3isk.onrender.com/api/recipes');
      const recipes = await response.json();

      // console.log('API Response:', recipes); // Debug log

      if (!recipes || !Array.isArray(recipes)) {
        console.error('Invalid API response format:', recipes);
        return;
      }

      // Filter and format meals
      const formattedMeals = recipes
        .filter(recipe => {
          // Skip if already liked or disliked
          if (userPreferences.liked.includes(recipe._id) || 
              userPreferences.disliked.includes(recipe._id)) {
            return false;
          }

          // Check dietary preferences (mutually exclusive)
          if (dietaryPreferences.pescatarian && !recipe.dietaryInfo.pescetarian) {
            return false;
          }
          if (dietaryPreferences.vegetarian && !recipe.dietaryInfo.vegetarian) {
            return false;
          }
          if (dietaryPreferences.vegan && !recipe.dietaryInfo.vegan) {
            return false;
          }

          // Check health preferences (can have multiple)
          if (allergiesPreferences.glutenFree && !recipe.dietaryInfo.glutenFree) {
            return false;
          }
          if (allergiesPreferences.dairyFree && !recipe.dietaryInfo.dairyFree) {
            return false;
          }
          if (allergiesPreferences.nutFree && !recipe.dietaryInfo.nutFree) {
            return false;
          }
          if (allergiesPreferences.lowCarb && !recipe.dietaryInfo.lowCarb) {
            return false;
          }
          if (allergiesPreferences.lowFat && !recipe.dietaryInfo.lowFat) {
            return false;
          }
          if (allergiesPreferences.lowSugar && !recipe.dietaryInfo.lowSugar) {
            return false;
          }
          if (allergiesPreferences.highProtein && !recipe.dietaryInfo.highProtein) {
            return false;
          }

          return true;
        })
        .map(recipe => ({
          id: recipe._id,
          name: recipe.title,
          image: recipe.imageUrl,
          category: recipe.cuisine,
          cuisine: recipe.cuisine,
          difficulty: recipe.difficulty,
          preparationTime: recipe.preparationTime,
          cookingTime: recipe.cookingTime,
          servings: recipe.servings,
          nutritionalInfo: recipe.nutritionalInfo,
          ingredients: recipe.ingredients.map(ing => ({
            name: ing.item,
            measure: `${ing.amount} ${ing.unit}`
          })),
          dietaryInfo: recipe.dietaryInfo
        }));

      // console.log('Meals after filtering:', formattedMeals.map(m => ({name: m.name, category: m.category})));

      // Shuffle the meals array
      const shuffledMeals = formattedMeals
        .sort(() => Math.random() - 0.5);

      console.log('Total meals after filtering:', shuffledMeals.length);
      setMeals(shuffledMeals);
      
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const fetchMoreMeals = async () => {
    if (!householdData) return;
    fetchInitialMeals(householdData);
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
            setMatchedMealName(currentMeal.name);
            setShowMatchAnimation(true);

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
              fetchInitialMeals(householdData);
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

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#000' : Colors.WHITE }}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : Colors.WHITE }}>
      <View style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
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
                  <Image source={{ uri: card?.image }} style={styles.image} />
                  <View style={styles.cardContent}>
                    <Text style={styles.title}>{card?.name}</Text>
                    
                    {/* Cooking Info Section */}
                    <View style={styles.infoSection}>
                      <View style={styles.infoRow}>
                        <MaterialIcons name="timer" size={16} color={Colors.PRIMARY} />
                        <Text style={styles.infoText}>Prep: {card?.preparationTime}m</Text>
                        <Text style={styles.infoText}>Cook: {card?.cookingTime}m</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <MaterialIcons name="people" size={16} color={Colors.PRIMARY} />
                        <Text style={styles.infoText}>Serves: {card?.servings}</Text>
                      </View>
                    </View>

                    {/* Dietary Information */}
                    <View style={styles.dietaryInfoSection}>
                      <View style={styles.dietaryTagsContainer}>
                        {Object.entries(card.dietaryInfo).map(([key, value]) => (
                          value && (
                            <View key={key} style={styles.dietaryTag}>
                              <Text style={styles.dietaryTagText}>{key}</Text>
                            </View>
                          )
                        ))}
                      </View>
                    </View>

                    {/* Nutritional Info */}
                    <View style={styles.nutritionSection}>
                      <Text style={styles.sectionTitle}>Nutrition per serving:</Text>
                      <View style={styles.nutritionRow}>
                        <Text style={styles.nutritionItem}>Calories: {card?.nutritionalInfo?.calories}</Text>
                        <Text style={styles.nutritionItem}>Protein: {card?.nutritionalInfo?.protein}g</Text>
                        <Text style={styles.nutritionItem}>Carbs: {card?.nutritionalInfo?.carbohydrates}g</Text>
                        <Text style={styles.nutritionItem}>Fats: {card?.nutritionalInfo?.fat}g</Text>
                      </View>
                    </View>
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
              cardIndex={1}
              backgroundColor={'transparent'}
              stackSize={1}
              cardStyle={styles.cardStyle}
              infinite
              
            />
          )}
        </Animated.View>
      </View>
      <MatchAnimation 
        visible={showMatchAnimation}
        mealName={matchedMealName}
        onClose={() => setShowMatchAnimation(false)}
      />
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
    marginTop: 25,
    height: 620,
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
    height: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardContent: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoSection: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontWeight: '500',
  },
  nutritionSection: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  nutritionItem: {
    fontSize: 12,
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
  dietaryInfoSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  dietaryTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 8,
  },
  dietaryTag: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  dietaryTagText: {
    color: '#2E7D32',
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  matchCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 16,
  },
  matchText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  matchMealName: {
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  matchButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  matchButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
})