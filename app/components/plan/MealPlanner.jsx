import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Modal, 
  Alert 
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import Colors from '../../../constants/Colors';

export default function MealPlanner({ 
  visible, 
  onClose, 
  mealPlan, 
  setMealPlan, 
  householdData,
  fetchRecipeDetails
}) {
  const [weekStartDate, setWeekStartDate] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showWeekSelector, setShowWeekSelector] = useState(false);
  const [showAddCustomMeal, setShowAddCustomMeal] = useState(false);
  const [customMealName, setCustomMealName] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Initialize dates when component mounts
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = today.getDate() - dayOfWeek;
    const sunday = new Date(today.setDate(diff));
    
    setWeekStartDate(formatDate(sunday));
    setSelectedDay(formatDate(new Date()));
  }, []);

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get the dates for the current week
  const getWeekDates = () => {
    if (!weekStartDate) return [];
    
    const dates = [];
    const startDate = new Date(weekStartDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(formatDate(date));
    }
    
    return dates;
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const startDate = new Date(weekStartDate);
    startDate.setDate(startDate.getDate() - 7);
    setWeekStartDate(formatDate(startDate));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const startDate = new Date(weekStartDate);
    startDate.setDate(startDate.getDate() + 7);
    setWeekStartDate(formatDate(startDate));
  };

  // Format day name
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Check if a day has meals
  const dayHasMeals = (day) => {
    return mealPlan[day] && (mealPlan[day].breakfast || mealPlan[day].lunch || mealPlan[day].dinner);
  };

  // Check if a date is today
  const isToday = (dateString) => {
    const today = new Date();
    return formatDate(today) === dateString;
  };

  // Add a custom meal to the plan
  const handleAddCustomMeal = () => {
    if (!customMealName.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }
    
    const updatedMealPlan = { ...mealPlan };
    
    if (!updatedMealPlan[selectedDay]) {
      updatedMealPlan[selectedDay] = {};
    }
    
    updatedMealPlan[selectedDay][selectedMealType] = {
      meal: customMealName,
      isCustom: true
    };
    
    setMealPlan(updatedMealPlan);
    setCustomMealName('');
    setShowAddCustomMeal(false);
  };

  // Add a matched meal to the plan
  const handleAddMatchedMeal = (meal) => {
    const updatedMealPlan = { ...mealPlan };
    
    if (!updatedMealPlan[selectedDay]) {
      updatedMealPlan[selectedDay] = {};
    }
    
    updatedMealPlan[selectedDay][selectedMealType] = {
      meal: meal.name,
      id: meal.id,
      isCustom: false
    };
    
    setMealPlan(updatedMealPlan);
    setShowRecipeModal(false);
  };

  // Remove a meal from the plan
  const removeMealFromDay = (day, mealType) => {
    const updatedMealPlan = { ...mealPlan };
    
    if (updatedMealPlan[day]) {
      updatedMealPlan[day][mealType] = null;
      
      // If no meals left for this day, remove the day entry
      if (!updatedMealPlan[day].breakfast && !updatedMealPlan[day].lunch && !updatedMealPlan[day].dinner) {
        delete updatedMealPlan[day];
      }
    }
    
    setMealPlan(updatedMealPlan);
  };

  // Render the meal planner UI
  const renderMealPlanner = () => {
    const weekDates = getWeekDates();
    
    return (
      <View style={styles.mealPlannerContainer}>
        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity 
            style={styles.weekNavButton}
            onPress={goToPreviousWeek}
          >
            <MaterialIcons name="chevron-left" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.weekSelectorButton}
            onPress={() => setShowWeekSelector(true)}
          >
            <MaterialIcons name="calendar-today" size={16} color={Colors.PRIMARY} />
            <Text style={styles.weekSelectorText}>
              {weekStartDate ? `Week of ${new Date(weekStartDate).toLocaleDateString()}` : 'Select Week'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.weekNavButton}
            onPress={goToNextWeek}
          >
            <MaterialIcons name="chevron-right" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </View>
        
        {/* Days of the Week */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.daysContainer}>
            {weekDates.map((day) => (
              <TouchableOpacity 
                key={day}
                style={[
                  styles.dayItem,
                  selectedDay === day && styles.selectedDayItem,
                  isToday(day) && styles.todayItem
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.dayName,
                  selectedDay === day && styles.selectedDayText
                ]}>
                  {getDayName(day)}
                </Text>
                <View style={[
                  styles.dayNumber,
                  selectedDay === day && styles.selectedDayNumber,
                  isToday(day) && styles.todayNumber
                ]}>
                  <Text style={[
                    styles.dayNumberText,
                    selectedDay === day && styles.selectedDayNumberText,
                    isToday(day) && styles.todayNumberText
                  ]}>
                    {new Date(day).getDate()}
                  </Text>
                </View>
                {dayHasMeals(day) && (
                  <View style={styles.mealIndicator}>
                    <View style={styles.mealDot} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {/* Selected Day Meals */}
        <View style={styles.selectedDayMeal}>
          <Text style={styles.selectedDayTitle}>
            {selectedDay ? new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a day'}
          </Text>
          
          {/* Breakfast Section */}
          <View style={styles.mealTypeSection}>
            <View style={styles.mealTypeHeader}>
              <MaterialCommunityIcons name="food-croissant" size={20} color={Colors.PRIMARY} />
              <Text style={styles.mealTypeTitle}>Breakfast</Text>
            </View>
            
            {mealPlan[selectedDay]?.breakfast ? (
              <View style={styles.mealCard}>
                <View style={styles.mealCardContent}>
                  <Text style={styles.mealCardTitle}>{mealPlan[selectedDay].breakfast.meal}</Text>
                  {!mealPlan[selectedDay].breakfast.isCustom && (
                    <TouchableOpacity 
                      style={styles.viewRecipeButton}
                      onPress={() => fetchRecipeDetails(mealPlan[selectedDay].breakfast.id)}
                    >
                      <Text style={styles.viewRecipeText}>View Recipe</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.removeMealButton}
                  onPress={() => removeMealFromDay(selectedDay, 'breakfast')}
                >
                  <MaterialIcons name="delete" size={20} color="#FF4B4B" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addMealPlaceholder}
                onPress={() => {
                  setSelectedMealType('breakfast');
                  setShowAddCustomMeal(true);
                }}
              >
                <MaterialIcons name="add" size={18} color={Colors.PRIMARY} />
                <Text style={styles.addMealPlaceholderText}>Add Breakfast</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Lunch Section */}
          <View style={styles.mealTypeSection}>
            <View style={styles.mealTypeHeader}>
              <MaterialCommunityIcons name="food-drumstick" size={20} color={Colors.PRIMARY} />
              <Text style={styles.mealTypeTitle}>Lunch</Text>
            </View>
            
            {mealPlan[selectedDay]?.lunch ? (
              <View style={styles.mealCard}>
                <View style={styles.mealCardContent}>
                  <Text style={styles.mealCardTitle}>{mealPlan[selectedDay].lunch.meal}</Text>
                  {!mealPlan[selectedDay].lunch.isCustom && (
                    <TouchableOpacity 
                      style={styles.viewRecipeButton}
                      onPress={() => fetchRecipeDetails(mealPlan[selectedDay].lunch.id)}
                    >
                      <Text style={styles.viewRecipeText}>View Recipe</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.removeMealButton}
                  onPress={() => removeMealFromDay(selectedDay, 'lunch')}
                >
                  <MaterialIcons name="delete" size={20} color="#FF4B4B" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addMealPlaceholder}
                onPress={() => {
                  setSelectedMealType('lunch');
                  setShowAddCustomMeal(true);
                }}
              >
                <MaterialIcons name="add" size={18} color={Colors.PRIMARY} />
                <Text style={styles.addMealPlaceholderText}>Add Lunch</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Dinner Section */}
          <View style={styles.mealTypeSection}>
            <View style={styles.mealTypeHeader}>
              <MaterialCommunityIcons name="food-turkey" size={20} color={Colors.PRIMARY} />
              <Text style={styles.mealTypeTitle}>Dinner</Text>
            </View>
            
            {mealPlan[selectedDay]?.dinner ? (
              <View style={styles.mealCard}>
                <View style={styles.mealCardContent}>
                  <Text style={styles.mealCardTitle}>{mealPlan[selectedDay].dinner.meal}</Text>
                  {!mealPlan[selectedDay].dinner.isCustom && (
                    <TouchableOpacity 
                      style={styles.viewRecipeButton}
                      onPress={() => fetchRecipeDetails(mealPlan[selectedDay].dinner.id)}
                    >
                      <Text style={styles.viewRecipeText}>View Recipe</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.removeMealButton}
                  onPress={() => removeMealFromDay(selectedDay, 'dinner')}
                >
                  <MaterialIcons name="delete" size={20} color="#FF4B4B" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addMealPlaceholder}
                onPress={() => {
                  setSelectedMealType('dinner');
                  setShowAddCustomMeal(true);
                }}
              >
                <MaterialIcons name="add" size={18} color={Colors.PRIMARY} />
                <Text style={styles.addMealPlaceholderText}>Add Dinner</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Add Custom Meal Input */}
        {showAddCustomMeal && (
          <View style={styles.addCustomMealContainer}>
            <View style={styles.mealTypeSelector}>
              <Text style={styles.mealTypeSelectorLabel}>Meal Type:</Text>
              <View style={styles.mealTypeOptions}>
                <TouchableOpacity 
                  style={[
                    styles.mealTypeOption, 
                    selectedMealType === 'breakfast' && styles.selectedMealTypeOption
                  ]}
                  onPress={() => setSelectedMealType('breakfast')}
                >
                  <Text style={[
                    styles.mealTypeOptionText,
                    selectedMealType === 'breakfast' && styles.selectedMealTypeOptionText
                  ]}>Breakfast</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.mealTypeOption, 
                    selectedMealType === 'lunch' && styles.selectedMealTypeOption
                  ]}
                  onPress={() => setSelectedMealType('lunch')}
                >
                  <Text style={[
                    styles.mealTypeOptionText,
                    selectedMealType === 'lunch' && styles.selectedMealTypeOptionText
                  ]}>Lunch</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.mealTypeOption, 
                    selectedMealType === 'dinner' && styles.selectedMealTypeOption
                  ]}
                  onPress={() => setSelectedMealType('dinner')}
                >
                  <Text style={[
                    styles.mealTypeOptionText,
                    selectedMealType === 'dinner' && styles.selectedMealTypeOptionText
                  ]}>Dinner</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Enter meal name"
              value={customMealName}
              onChangeText={setCustomMealName}
            />
            
            <View style={styles.addItemButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddCustomMeal(false);
                  setCustomMealName('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.addItemButton}
                onPress={handleAddCustomMeal}
              >
                <Text style={styles.buttonText}>Add Meal</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TouchableOpacity 
              style={styles.addFromMatchedButton}
              onPress={() => {
                if (householdData?.currentSession?.matchedMeals?.length > 0) {
                  setShowRecipeModal(true);
                  setSelectedRecipe({ isSelecting: true });
                } else {
                  Alert.alert("No Matched Meals", "You don't have any matched meals yet. Start swiping in Discover to match meals!");
                }
              }}
            >
              <MaterialIcons name="restaurant-menu" size={18} color={Colors.WHITE} />
              <Text style={styles.addMealButtonText}>Add from Matched Meals</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Week Selector Modal */}
        <Modal
          visible={showWeekSelector}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Week</Text>
                <TouchableOpacity 
                  onPress={() => setShowWeekSelector(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color={Colors.PRIMARY} />
                </TouchableOpacity>
              </View>
              <Calendar
                onDayPress={(day) => {
                  // Set the selected day's week as the current week
                  const selectedDate = new Date(day.dateString);
                  const dayOfWeek = selectedDate.getDay();
                  const diff = selectedDate.getDate() - dayOfWeek;
                  const sunday = new Date(selectedDate.setDate(diff));
                  setWeekStartDate(formatDate(sunday));
                  setSelectedDay(day.dateString);
                  setShowWeekSelector(false);
                }}
                theme={{
                  todayTextColor: Colors.PRIMARY,
                  selectedDayBackgroundColor: Colors.PRIMARY,
                  dotColor: Colors.PRIMARY,
                }}
              />
            </View>
          </View>
        </Modal>

        {/* Recipe Modal */}
        {showRecipeModal && (
          <Modal
            visible={showRecipeModal}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  {selectedRecipe?.isSelecting ? (
                    <Text style={styles.modalTitle}>Select a Meal for {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}</Text>
                  ) : (
                    <Text style={styles.modalTitle}>{selectedRecipe?.strMeal}</Text>
                  )}
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
                
                {selectedRecipe?.isSelecting ? (
                  <ScrollView style={styles.matchedMealsList}>
                    {householdData.currentSession.matchedMeals.map((meal) => (
                      <TouchableOpacity 
                        key={meal.id}
                        style={styles.matchedMealItem}
                        onPress={() => handleAddMatchedMeal(meal)}
                      >
                        <Text style={styles.matchedMealName}>{meal.name}</Text>
                        <MaterialIcons name="add" size={24} color={Colors.PRIMARY} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
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
                  </ScrollView>
                )}
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Meal Planner</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {renderMealPlanner()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: '90%',
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
  mealPlannerContainer: {
    marginTop: 10,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekNavButton: {
    padding: 8,
  },
  weekSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  weekSelectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  daysContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayItem: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  selectedDayItem: {
    backgroundColor: Colors.PRIMARY + '20',
  },
  todayItem: {
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  selectedDayText: {
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  dayNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayNumber: {
    backgroundColor: Colors.PRIMARY,
  },
  todayNumber: {
    backgroundColor: Colors.PRIMARY + '40',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedDayNumberText: {
    color: Colors.WHITE,
  },
  todayNumberText: {
    color: '#333',
  },
  mealIndicator: {
    marginTop: 4,
  },
  mealDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.PRIMARY,
  },
  selectedDayMeal: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mealTypeSection: {
    marginBottom: 12,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginLeft: 6,
  },
  mealCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.PRIMARY,
  },
  mealCardContent: {
    flex: 1,
  },
  mealCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  viewRecipeButton: {
    alignSelf: 'flex-start',
  },
  viewRecipeText: {
    fontSize: 12,
    color: Colors.PRIMARY,
    fontWeight: '500',
  },
  removeMealButton: {
    padding: 6,
  },
  addMealPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.PRIMARY + '60',
    borderStyle: 'dashed',
  },
  addMealPlaceholderText: {
    fontSize: 14,
    color: Colors.PRIMARY,
    marginLeft: 6,
  },
  addCustomMealContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  mealTypeSelector: {
    marginBottom: 12,
  },
  mealTypeSelectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  mealTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealTypeOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedMealTypeOption: {
    backgroundColor: Colors.PRIMARY,
  },
  mealTypeOptionText: {
    fontSize: 12,
    color: '#333',
  },
  selectedMealTypeOptionText: {
    color: Colors.WHITE,
    fontWeight: '600',
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
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 12,
  },
  addFromMatchedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addMealButtonText: {
    color: Colors.WHITE,
    fontWeight: '500',
    fontSize: 14,
  },
  matchedMealsList: {
    maxHeight: '80%',
  },
  matchedMealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchedMealName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});