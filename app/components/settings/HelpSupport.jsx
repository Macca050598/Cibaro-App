import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import Colors from './../../../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
export default function HelpSupport() {
  const [expandedId, setExpandedId] = useState(null);

  const handleEmailSupport = async () => {
    const emailUrl = 'mailto:support@cibaro.com?subject=Support%20Request';
    try {
      await Linking.openURL(emailUrl);
    } catch (error) {
      console.error('Error opening email:', error);
    }
  };

  const FAQs = [
    {
      id: 1,
      question: "How do I create a household?",
      answer: "To create a household, go to your profile and tap 'Create Household'. You'll get a unique invite code that you can share with your partner to join your household."
    },
    {
      id: 2,
      question: "How do I join my partner's household?",
      answer: "Ask your partner for their household invite code. Then go to your profile, tap 'Join Household', and enter the code they shared with you."
    },
    {
      id: 3,
      question: "How does meal planning work?",
      answer: "Each week, you and your partner will be shown recipe cards. Swipe right to like, left to dislike. When you both like the same recipe, it's added to your meal plan!"
    },
    {
      id: 4,
      question: "How do dietary preferences work?",
      answer: "In your profile settings, you can set dietary preferences (vegan, vegetarian, etc.) and allergies. The app will only show you recipes that match your preferences."
    },
    {
      id: 5,
      question: "Can I leave a household?",
      answer: "Yes, you can leave a household at any time from your profile settings. Note that this will remove your access to shared meal plans."
    },
    {
      id: 6,
      question: "How do I reset my password?",
      answer: "On the login screen, tap 'Forgot Password' and follow the instructions sent to your email address."
    }
  ];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container}>
    <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
      
      <View style={styles.supportSection}>
        <Text style={styles.subHeader}>Need Help?</Text>
        <Text style={styles.description}>
          Having trouble with Cibaro? Our support team is here to help!
        </Text>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleEmailSupport}
        >
          <MaterialIcons name="email" size={24} color={Colors.WHITE} />
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.faqSection}>
        <Text style={styles.subHeader}>Frequently Asked Questions</Text>
        
        {FAQs.map((faq) => (
          <TouchableOpacity 
            key={faq.id}
            style={styles.faqItem}
            onPress={() => toggleExpand(faq.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.question}>{faq.question}</Text>
              <MaterialIcons 
                name={expandedId === faq.id ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color={Colors.PRIMARY}
              />
            </View>
            {expandedId === faq.id && (
              <Text style={styles.answer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 20,
    marginTop: 80,
    paddingHorizontal: 16,
  },
  supportSection: {
    padding: 0,
    marginBottom: 20,
    marginTop: 20,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  contactButton: {
    backgroundColor: Colors.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  faqSection: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  answer: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    lineHeight: 20,
  },
}); 