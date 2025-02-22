import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import React from 'react'
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import Colors from './../../constants/Colors'
import { router } from 'expo-router'
export default function Home() {
  // Dummy data - replace with your actual data
  const weeklyProgress = 0.7
  const currentMatches = [
    { id: 1, name: 'Italian Pasta', matchRate: '95%' },
    { id: 2, name: 'Grilled Chicken', matchRate: '88%' },
    { id: 3, name: 'Vegetarian Bowl', matchRate: '85%' },
  ]

  return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity onPress={() => router.replace('/profile')} style={styles.profileButton}>
            <MaterialIcons name="account-circle" size={32} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Weekly Progress Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="food-fork-drink" size={24} color={Colors.PRIMARY} />
            <Text style={styles.cardTitle}>Weekly Meal Plan</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>70%</Text>
            </View>
            <Text style={styles.progressText}>5 of 7 meals selected</Text>
          </View>
        </View>

        {/* Quick Matches Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash" size={24} color={Colors.PRIMARY} />
            <Text style={styles.cardTitle}>Top Matches</Text>
          </View>
          {currentMatches.map(match => (
            <View key={match.id} style={styles.matchItem}>
              <Text style={styles.matchName}>{match.name}</Text>
              <Text style={styles.matchRate}>{match.matchRate}</Text>
            </View>
          ))}
        </View>

        {/* Start New Session Button */}
        <TouchableOpacity onPress={() => router.replace('/discover')} style={styles.startButton}>
          <Text style={styles.startButtonText}>Start New Plan</Text>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  profileButton: {
    padding: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  progressContainer: {
    alignItems: 'center',
    padding: 16,
  },
  progressText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  matchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchName: {
    fontSize: 16,
    color: '#333',
  },
  matchRate: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: Colors.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 30,
    marginVertical: 16,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
})