import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors';

const EULAModal = ({ visible, onAccept, onDecline }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Terms of Service & User Agreement</Text>
          <ScrollView style={styles.scrollContent}>
            <Text style={styles.text}>
              Welcome to Cibaro. By using our app, you must read and agree to the following terms. These terms constitute a legally binding agreement between you and Cibaro.
            </Text>

            <Text style={styles.emphasisText}>
              BY ACCEPTING THESE TERMS, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THIS AGREEMENT.
            </Text>

            <Text style={styles.text}>
              1. Content Guidelines and Prohibited Content{'\n'}
              • Users may only share appropriate meal suggestions and feedback{'\n'}
              • Strictly prohibited content includes but is not limited to:{'\n'}
                - Explicit, violent, or inappropriate content{'\n'}
                - Harassment or abusive behavior{'\n'}
                - Hate speech or discriminatory content{'\n'}
                - Spam or unauthorized commercial content{'\n'}
                - Content that violates any laws or regulations{'\n'}
                - Content that infringes on intellectual property rights
            </Text>

            <Text style={styles.text}>
              2. Content Moderation and Enforcement{'\n'}
              • All user-generated content is subject to review{'\n'}
              • We reserve the right to remove any content that violates our terms{'\n'}
              • Users can and should report inappropriate content{'\n'}
              • Reported content will be reviewed within 24 hours{'\n'}
              • We maintain logs of reported content and actions taken{'\n'}
              • Users who violate guidelines will face consequences including:{'\n'}
                - Content removal{'\n'}
                - Account suspension{'\n'}
                - Permanent account termination{'\n'}
              • Serious violations may be reported to relevant authorities
            </Text>

            <Text style={styles.text}>
              3. Meal Data and Recommendations{'\n'}
              • Meal recommendations are provided for convenience only{'\n'}
              • Users are responsible for checking ingredients for allergens{'\n'}
              • We do not guarantee the accuracy of nutritional information{'\n'}
              • Users should consult healthcare providers regarding dietary needs{'\n'}
              • We are not responsible for any adverse reactions to recommended meals
            </Text>

            <Text style={styles.text}>
              4. User Accountability{'\n'}
              • Users are responsible for all content they post{'\n'}
              • Users must report violations they encounter{'\n'}
              • False reporting may result in account penalties{'\n'}
              • Users must maintain appropriate community standards{'\n'}
              • Users agree to cooperate with content investigations
            </Text>

            <Text style={styles.text}>
              5. Content Storage and Privacy{'\n'}
              • User-generated content may be stored on our servers{'\n'}
              • Content may be reviewed by our moderation team{'\n'}
              • We maintain records of violations and enforcement actions{'\n'}
              • Privacy policy governs the handling of user data{'\n'}
              • Users grant us license to store and display their content
            </Text>

            <Text style={styles.emphasisText}>
              Failure to comply with these terms will result in immediate action, up to and including permanent account termination.
            </Text>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.declineButton]} 
              onPress={onDecline}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.acceptButton]} 
              onPress={onAccept}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.PRIMARY,
  },
  scrollContent: {
    marginBottom: 20,
  },
  text: {
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: Colors.PRIMARY,
  },
  declineButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emphasisText: {
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginVertical: 10,
  }
});

export default EULAModal; 