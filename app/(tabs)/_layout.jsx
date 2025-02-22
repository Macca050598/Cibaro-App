import { View, Text, StatusBar, SafeAreaView } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
  return (
    
      <Tabs screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          height: 80,
          paddingBottom: 10,
          paddingTop: 10

        },
        tabBarActiveTintColor: '#3BAA57',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '500'
        }
      }}>
        <Tabs.Screen 
          name='home'
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={focused ? '#3BAA57' : 'gray'}/>
            ),
            tabBarLabel: 'Home'
          }}
        />
        <Tabs.Screen 
          name='discover'
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} size={30} color={focused ? '#3BAA57' : 'gray'} />
            ),
            tabBarLabel: 'Discover'
          }}
        />
        <Tabs.Screen 
          name='plan'
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={30} color={focused ? '#3BAA57' : 'gray'} />
            ),
            tabBarLabel: 'Plan'
          }}
        />
        <Tabs.Screen 
          name='profile'
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={30} color={focused ? '#3BAA57' : 'gray'} />
            ),
            tabBarLabel: 'Profile',
          }}
        />
      </Tabs>
  )
}