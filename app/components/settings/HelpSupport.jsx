import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from './../../../constants/Colors';

export default function HelpSupport() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Help & Support</Text>
      <Text style={styles.text}>
        For any issues or questions, please contact our support team at support@example.com.
      </Text>
      <Text style={styles.text}>
        You can also visit our FAQ page for more information.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.WHITE,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 20,
    marginTop: 50,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
}); 