import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../../constants/Colors';

export default function ShoppingList({ items, matchedMeals, onToggleItem, onAddCustomItem }) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemQuantity, setCustomItemQuantity] = useState('');

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }
    
    onAddCustomItem(customItemName, customItemQuantity);
    setCustomItemName('');
    setCustomItemQuantity('');
    setShowAddItem(false);
  };

  if (!items > 1) {
    return (
      <View>
        <Text style={styles.noItemsText}>No items in shopping list yet</Text>
        <TouchableOpacity 
          style={styles.addItemButton}
          onPress={() => setShowAddItem(true)}
        >
          <MaterialIcons name="add" size={18} color={Colors.WHITE} />
          <Text style={styles.addItemButtonText}>Add Custom Item</Text>
        </TouchableOpacity>
        
        {showAddItem && renderAddItemForm()}
      </View>
    );
  }

  // Separate "Other Items" from recipe items
  const { "Other Items": otherItems = { ingredients: [] }, ...recipeItems } = items;
  
  // Create an ordered array of recipe entries
  const orderedRecipes = Object.entries(recipeItems)
    .sort((a, b) => {
      const indexA = matchedMeals.findIndex(meal => meal.name === a[0]);
      const indexB = matchedMeals.findIndex(meal => meal.name === b[0]);
      return indexA - indexB;
    });

  const renderAddItemForm = () => (
    <View style={styles.addItemForm}>
      <TextInput
        style={styles.input}
        placeholder="Item name"
        value={customItemName}
        onChangeText={setCustomItemName}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity (optional)"
        value={customItemQuantity}
        onChangeText={setCustomItemQuantity}
      />
      <View style={styles.addItemButtons}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => {
            setShowAddItem(false);
            setCustomItemName('');
            setCustomItemQuantity('');
          }}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddCustomItem}
        >
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      {/* Add Item Button */}
      <TouchableOpacity 
        style={styles.addItemButton}
        onPress={() => setShowAddItem(true)}
      >
        <MaterialIcons name="add" size={18} color={Colors.WHITE} />
        <Text style={styles.addItemButtonText}>Add Custom Item</Text>
      </TouchableOpacity>
      
      {/* Add Item Form */}
      {showAddItem && renderAddItemForm()}
      
      {/* Other Items Section */}
      {otherItems.ingredients.length > 0 && (
        <View style={styles.recipeSection}>
          <Text style={styles.recipeTitle}>Other Items</Text>
          {otherItems?.ingredients.map((ingredient, index) => (
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

      {/* Recipe Items Sections */}
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
    </>
  );
}

const styles = StyleSheet.create({
  noItemsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  recipeSection: {
    marginBottom: 20,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ingredientInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  checkedItem: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  checkbox: {
    marginLeft: 10,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addItemButtonText: {
    color: Colors.WHITE,
    fontWeight: '600',
    marginLeft: 8,
  },
  addItemForm: {
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
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.PRIMARY,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 