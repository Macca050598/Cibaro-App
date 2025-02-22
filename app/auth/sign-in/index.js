import { View, Text, TextInput, TouchableOpacity, Animated, StyleSheet } from 'react-native'
import React, { useEffect, useRef, useState } from 'react' 
import { useNavigation, useRouter } from 'expo-router'
import Colors from '../../../constants/Colors'
import { MaterialIcons, AntDesign } from '@expo/vector-icons'
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import {auth} from './../../../configs/FirebaseConfig'

export default function SignIn() {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to home
        router.replace('/(tabs)/home');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      presentation: 'transparentModal',
      animation: 'none',
    });
    

    // Slide up animation
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7
    }).start();
  }, [])


  const onSignIn=() => {

    if (!email&&!password){
      return
    }
    signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    router.replace('/(tabs)/home')
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage)
  });

  }



  return (
    <Animated.View 
      style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      <Animated.View style={{
        backgroundColor: Colors.WHITE,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25,
        height: '90%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        transform: [{
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [600, 0]
          })
        }]
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{marginBottom: 20}}>
          <Text style={{fontSize: 24}}>×</Text>
        </TouchableOpacity>

        <Text style={{
          fontSize: 24,
          fontFamily: 'outfit-bold',
          marginBottom: 30,
        }}>Login to Your Account</Text>

        <View style={{gap: 20}}>
          <View>
            <Text style={{
              fontSize: 14,
              color: '#666',
              marginBottom: 8
            }}>Email Address</Text>
            <TextInput 
              placeholder='Enter your email'
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                padding: 12,
                borderRadius: 8,
              }}
              keyboardType='email-address'
              onChangeText={(value)=>setEmail(value)}
            />
          </View>

          <View>
            <Text style={{
              fontSize: 14,
              color: '#666',
              marginBottom: 8
            }}>Password</Text>
            <TextInput 
              placeholder='Enter your password'
              secureTextEntry={true}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                padding: 12,
                borderRadius: 8,
              }}
              onChangeText={(value)=>setPassword(value)}
            />
          </View>

          <TouchableOpacity onPress={onSignIn}style={{
            backgroundColor: Colors.PRIMARY,
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
          }}>
            <Text style={{color: 'white', fontFamily: 'outfit-medium'}}>Login</Text>
          </TouchableOpacity>

          <View style={{flexDirection: 'row', justifyContent: 'center', gap: 4}}>
            <Text style={{color: '#666'}}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/sign-up')}>
              <Text style={{color: Colors.DARK_GREEN}}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={{gap: 10, marginTop: 5}}>
            {/* <TouchableOpacity style={{
              backgroundColor: Colors.WHITE,
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Colors.GRAY
            }}>
              <MaterialIcons name="email" size={24} color="black" style={{marginRight: 8}} />
              <Text style={{
                fontFamily: 'outfit',
                color: Colors.BLACK
              }}>Continue with Email</Text>
            </TouchableOpacity> */}

            <TouchableOpacity style={{
              backgroundColor: Colors.WHITE,
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Colors.GRAY
            }}>
              <AntDesign name="google" size={24} color="black" style={{marginRight: 8}} />
              <Text style={{
                fontFamily: 'outfit',
                color: Colors.BLACK
              }}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{
              backgroundColor: Colors.WHITE,
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Colors.GRAY
            }}>
              <AntDesign name="apple1" size={24} color="black" style={{marginRight: 8}} />
              <Text style={{
                fontFamily: 'outfit',
                color: Colors.BLACK
              }}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({

buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
},
buttonText: {
    flex: 1,
    color: Colors.dark,
    textAlign: 'center',
    fontFamily: 'outfit',
    fontSize: 16,
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