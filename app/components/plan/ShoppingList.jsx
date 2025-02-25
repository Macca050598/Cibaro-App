import { View, Text, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';
import Colors from '../../../constants/Colors';

export default function ShoppingList({ items, matchedMeals, onToggleItem }) {
  if (!items) {
    return <Text style={styles.noItemsText}>No items in shopping list yet</Text>;
  }

  // Separate "Other Items" from recipe items
  const { "Other Items": otherItems, ...recipeItems } = items;
  
  // Create an ordered array of recipe entries
  const orderedRecipes = Object.entries(recipeItems)
    .sort((a, b) => {
      const indexA = matchedMeals.findIndex(meal => meal.name === a[0]);
      const indexB = matchedMeals.findIndex(meal => meal.name === b[0]);
      return indexA - indexB;
    });

  return (
    <>
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
                  onValueChange={() => onToggleItem(recipeName, index)}
                  color={ingredient.checked ? Colors.PRIMARY : undefined}
                  style={styles.checkbox}
                />
              </View>
            ))}
          </View>
        );
      })}

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
                onValueChange={() => onToggleItem("Other Items", index)}
                color={ingredient.checked ? Colors.PRIMARY : undefined}
                style={styles.checkbox}
              />
            </View>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  recipeSection: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ingredientInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 16,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 16,
    color: '#666',
    minWidth: 80,
    textAlign: 'right',
    paddingLeft: 10,
  },
  checkedItem: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  checkbox: {
    marginLeft: 10,
  },
  otherItemsSection: {
    borderTopWidth: 2,
    borderTopColor: Colors.PRIMARY + '40',
    marginTop: 20,
  },
  noItemsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    paddingVertical: 20,
  },
}); 