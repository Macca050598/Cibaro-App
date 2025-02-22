import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import React from 'react'
import Colors from '../constants/Colors'
import { useRouter } from 'expo-router'
import { MaterialIcons, AntDesign } from '@expo/vector-icons'

export default function Landing() {


    const router=useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.WHITE }} >
      <Image source={require('./../assets/images/iphone-food.jpg')} style={{width: '100%', height: 400, marginTop: -60}} />
      
      <View style={styles.container}>
        <Text style={{fontSize: 35, fontFamily: 'outfit-bold', textAlign: 'center', marginBottom: 10, marginTop: 10}}>Cibaro</Text>
        <Text style={{
            fontFamily: 'outfit',
            fontSize: 17,
            textAlign: 'center',
            color:Colors.dark,
            padding: 20
        }}>Discover the new fun way to pick your weekly meals with your partner or friends!</Text>

               <TouchableOpacity style={styles.button} onPress={() => router.push('auth/sign-in')}>
                   <MaterialIcons name="email" size={24} color="black" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Continue with Email</Text>
                </TouchableOpacity>
               <TouchableOpacity style={styles.button} onPress={() => router.push('auth/sign-in')}>
                    <AntDesign name="google" size={24} color="black" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Continue with Google</Text>
                 </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => router.push('auth/sign-in')}>
                   <AntDesign name="apple1" size={24} color="black" style={styles.buttonIcon} />
                   <Text style={styles.buttonText}>Continue with Apple</Text>
                </TouchableOpacity>

                <View style={styles.signInContainer}>
                    <Text style={styles.signInText}>Already have an account? </Text>
                      <TouchableOpacity onPress={() => router.push('auth/sign-in')}>
                         <Text style={styles.signInLink}>SignIn</Text>
                     </TouchableOpacity>
                 </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    backgroundColor: Colors.WHITE,
    marginTop:0,
    borderTopLeftRadius: 20,
    borderTopRightRadius:20,
    padding: 15
  },
  button: {
    padding: 15, 
    backgroundColor: Colors.PRIMARY,
    borderRadius: 99,
    marginTop: '15%'
  },
  contentContainer: {
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
},
title: {
    fontSize: 28,
    fontFamily: 'outfit-bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 10,
},
subtitle: {
    fontFamily: 'outfit',
    fontSize: 16,
    textAlign: 'center',
    color: Colors.dark,
    marginBottom: 30,
},
button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.WHITE,
    borderRadius: 30,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
},
buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
},
buttonText: {
    flex: 1,
    color: Colors.dark,
    textAlign: 'center',
    fontFamily: 'outfit',
    fontSize: 16,
},
signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
},
signInText: {
    fontFamily: 'outfit',
    color: Colors.dark,
},
signInLink: {
    fontFamily: 'outfit',
    color: '#6366F1',
}
})

