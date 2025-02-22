import { View, Text, TextInput, TouchableOpacity, Animated } from 'react-native'
import React, { useEffect, useRef, useState } from 'react' 
import { useNavigation, useRouter } from 'expo-router'
import Colors from '../../../constants/Colors'
import { MaterialIcons, AntDesign } from '@expo/vector-icons'
import {createUserWithEmailAndPassword} from 'firebase/auth';
import { auth } from '../../../configs/FirebaseConfig'

export default function SignUp() {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [email, setEmail]=useState();
  const [password, setPassword]=useState();



  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      presentation: 'transparentModal',
      animation: 'none',
    });
    
    // Slide up animations
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 5
    }).start();
  }, [])


  const OnCreateAccount = () =>{

    if(!email || !password) {
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    // console.log(user)
    router.replace('/auth/userInfoForm')
    // router.replace('/(tabs)/home');

    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage, errorCode)
    // ..
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
        opacity: slideAnim
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
        }}>Create Your Account</Text>

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
              onChangeText={(text)=>setEmail(text)}

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
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                padding: 12,
                borderRadius: 8,
              }}
              onChangeText={(text)=>setPassword(text)}

            />
          </View>

          {/* <View>
            <Text style={{
              fontSize: 14,
              color: '#666',
              marginBottom: 8
            }}>Confirm Password</Text>
            <TextInput 
              placeholder='Confirm your password'
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                padding: 12,
                borderRadius: 8,
              }}
            />
          </View> */}

          <TouchableOpacity onPress={OnCreateAccount} style={{
            backgroundColor: Colors.PRIMARY,
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 5,
          }}>
            <Text  style={{color: 'white', fontFamily: 'outfit-medium'}}>Sign Up</Text>
          </TouchableOpacity>

          <View style={{flexDirection: 'row', justifyContent: 'center', gap: 4}}>
            <Text style={{color: '#666'}}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/sign-in')}>
              <Text style={{color: Colors.DARK_GREEN}}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={{gap: 10, marginTop: 0}}>
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