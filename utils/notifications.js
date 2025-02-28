import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export async function sendMealMatchNotification(partnerName) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Meal Plan Complete! 🎉",
      body: `You and ${partnerName} have matched all 7 meals for the week! Check out your meal plan.`,
      data: { screen: 'plan' },
    },
    trigger: null, // Send immediately
  });
}

// export async function testLocalNotification() {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "Test Notification 🔔",
//       body: "This is a test notification from Cibaro!",
//       data: { screen: 'plan' },
//     },
//     trigger: null, // null means send immediately
//   });
// } 