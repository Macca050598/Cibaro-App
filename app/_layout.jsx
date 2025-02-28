import { Stack } from "expo-router";
import {useFonts} from "expo-font"; 

import React from "react";
export default function RootLayout() {

  useFonts({
    'outfit':require('./../assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium':require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-bold':require('./../assets/fonts/Outfit-Bold.ttf'),

  })


  return (

  <Stack screenOptions={{headerShown:false}}>
          <Stack.Screen name="Landing" /> 
          <Stack.Screen name="(tabs)" />

   </Stack>

      
      );
}