import { View, Text, StyleSheet, Image, Dimensions, SafeAreaView } from 'react-native'
import React, { useState, useEffect } from 'react'
// import Swiper from 'react-native-deck-swiper'
import { MaterialIcons } from '@expo/vector-icons'
import Colors from './../../constants/Colors'

const { width } = Dimensions.get('window')

export default function Discover() {
  const [meals, setMeals] = useState([])
  const [matchCount, setMatchCount] = useState(0)

  useEffect(() => {
    fetchMeals()
  }, [])

  const fetchMeals = async () => {
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
      const data = await response.json()
      // Fetch multiple meals
      const mealPromises = Array(10).fill().map(() => 
        fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(res => res.json())
      )
      const mealResults = await Promise.all(mealPromises)
      const formattedMeals = mealResults.map(result => ({
        id: result.meals[0].idMeal,
        name: result.meals[0].strMeal,
        image: result.meals[0].strMealThumb,
        category: result.meals[0].strCategory,
      }))
      setMeals(formattedMeals)
    } catch (error) {
      console.error('Error fetching meals:', error)
    }
  }

  const handleSwipe = (direction) => {
    if (direction === 'right') {
      setMatchCount(prev => Math.min(prev + 1, 7))
    }
  }

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
        </View>

        {/* Swiper
        {meals.length > 0 && (
          <Swiper
            cards={meals}
            renderCard={(card) => (
              <View style={styles.card}>
                <Image source={{ uri: card.image }} style={styles.image} />
                <View style={styles.cardContent}>
                  <Text style={styles.title}>{card.name}</Text>
                  <Text style={styles.category}>{card.category}</Text>
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
            onSwipedAll={() => fetchMeals()}
            cardIndex={0}
            backgroundColor={'transparent'}
            stackSize={3}
            cardStyle={styles.cardStyle}
            infinite
            
          />
        )} */}
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
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressContainer: {
    marginTop: 8,
    marginBottom: 20,
    height: '100%'
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
})