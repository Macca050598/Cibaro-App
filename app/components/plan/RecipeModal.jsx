import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../../constants/Colors';

export default function RecipeModal({ recipe, visible, onClose }) {
  if (!recipe) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{recipe.strMeal || recipe.name || 'Recipe'}</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.recipeDetails}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>
              {recipe.strInstructions || recipe.instructions || 'No instructions available.'}
            </Text>
            
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients ? (
                recipe.ingredients.map((ing, i) => (
                  <Text key={i} style={styles.ingredient}>
                    • {ing.measure} {ing.name}
                  </Text>
                ))
              ) : (
                Array.from({ length: 20 }).map((_, i) => {
                  const ingredient = recipe[`strIngredient${i + 1}`];
                  const measure = recipe[`strMeasure${i + 1}`];
                  if (ingredient && ingredient.trim()) {
                    return (
                      <Text key={i} style={styles.ingredient}>
                        • {measure} {ingredient}
                      </Text>
                    );
                  }
                  return null;
                })
              )}
            </View>
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
  recipeDetails: {
    maxHeight: '90%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginTop: 24,
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
  instructionsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
}); 