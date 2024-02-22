import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const categories = [
  { id: 1, title: 'Create Assingments' },
  { id: 2, title: 'Manage Assingments' },
];

const MainTeacher = ({ navigation, route }) => {
  const uid = route.params.uid;
  console.log('uid for MT: ', uid);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const renderCategoryCard = (category) => {
    const isSelected = selectedCategory === category.id;

    const handleCategoryPress = (categoryId) => {
      setSelectedCategory(categoryId);
      if (categoryId === 1) {
        navigation.navigate('Create', { uid: uid });
      }
      if (categoryId === 2) {
        navigation.navigate('Manage', { uid: uid });
      }
    };

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => handleCategoryPress(category.id)}>
        <Text
          style={[styles.cardTitle, isSelected && styles.selectedCardTitle]}>
          {category.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleLogout = async () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Navigate to the Splash screen after logout
      });
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('role');
      // Add any additional AsyncStorage items to remove here

      // Navigate to the Home screen or any other desired screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfile = () => {};

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Teacher's Desk</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>Welcome :) </Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleProfile}>
              <Text style={styles.profileButtonText}>Profile</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            {categories.map((category) => (
              <View key={category.id} style={styles.row}>
                {renderCategoryCard(category)}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#f4511e',
    padding: 10,
    marginBottom: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    paddingVertical: 100,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    position: 'absolute',
    top: 16,
    left: 16,
  },
  content: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '95%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    paddingVertical: 60,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#f4511e',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  selectedCardTitle: {
    color: '#f4511e',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#f4511e',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#f4511e',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  profileButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MainTeacher;
