import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { Calendar } from 'react-native-calendars'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import Colors from './../../constants/Colors'

export default function Plan() {
  const [selectedDate, setSelectedDate] = useState('')
  
  // Dummy data - replace with your actual data
  const mealPlan = {
    '2024-03-18': { meal: 'Italian Pasta', matched: true },
    '2024-03-19': { meal: 'Grilled Chicken', matched: true },
    '2024-03-20': { meal: 'Vegetarian Bowl', matched: true },
  }

  const shoppingList = [
    { id: 1, item: 'Pasta', quantity: '500g' },
    { id: 2, item: 'Tomatoes', quantity: '4' },
    { id: 3, item: 'Chicken Breast', quantity: '2' },
  ]

  const markedDates = Object.keys(mealPlan).reduce((acc, date) => {
    acc[date] = {
      marked: true,
      dotColor: Colors.PRIMARY,
      selected: date === selectedDate,
      selectedColor: Colors.PRIMARY + '40',
    }
    return acc
  }, {})

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meal Plan</Text>
          <TouchableOpacity style={styles.shareButton}>
            <MaterialIcons name="share" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.card}>
          <Calendar
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              todayTextColor: Colors.PRIMARY,
              selectedDayBackgroundColor: Colors.PRIMARY,
              dotColor: Colors.PRIMARY,
            }}
          />
        </View>

        {/* Selected Day Meal */}
        {selectedDate && mealPlan[selectedDate] && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="food" size={24} color={Colors.PRIMARY} />
              <Text style={styles.cardTitle}>Today's Meal</Text>
            </View>
            <View style={styles.mealContainer}>
              <Text style={styles.mealTitle}>{mealPlan[selectedDate].meal}</Text>
              <TouchableOpacity style={styles.recipeButton}>
                <Text style={styles.recipeButtonText}>View Recipe</Text>
                <MaterialIcons name="arrow-forward" size={20} color={Colors.PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Shopping List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="shopping-cart" size={24} color={Colors.PRIMARY} />
            <Text style={styles.cardTitle}>Shopping List</Text>
          </View>
          {shoppingList.map(item => (
            <View key={item.id} style={styles.listItem}>
              <Text style={styles.itemName}>{item.item}</Text>
              <Text style={styles.itemQuantity}>{item.quantity}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.exportButton}>
            <Text style={styles.exportButtonText}>Export List</Text>
            <MaterialIcons name="file-download" size={20} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  shareButton: {
    padding: 8,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  mealContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  recipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  recipeButtonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 16,
    color: '#666',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 8,
  },
  exportButtonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
})