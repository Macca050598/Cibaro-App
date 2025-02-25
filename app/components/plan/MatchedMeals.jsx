import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../../constants/Colors';

export default function MatchedMeals({ meals, onMealPress }) {
  if (!meals) {
    return (
      <View style={styles.noMealsContainer}>
        <Text style={styles.noMealsText}>No matched meals yet</Text>
        <Text style={styles.noMealsSubtext}>Start swiping in Discover to match meals!</Text>
      </View>
    );
  }

  return (
    <View style={styles.matchedMealsContainer}>
      {meals.map((meal, index) => (
        <TouchableOpacity 
          key={meal.id} 
          style={styles.mealCard}
          onPress={() => onMealPress(meal.id)}
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
}

const styles = StyleSheet.create({
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
}); 