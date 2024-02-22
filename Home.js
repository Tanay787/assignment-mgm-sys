import React, { useContext, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Button } from 'react-native-paper';
import { Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import firebase from 'firebase';
import AuthContext from './AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const Home = ({ navigation }) => {
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const { uid, role } = useContext(AuthContext);
  const [storedRole, setStoredRole] = useState(null);

  useEffect(() => {
    setImageDimensions({ width: windowWidth, height: windowHeight });

    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is logged in, navigate to the respective screen based on role
        handleLoggedInUser(user);
      } else if (uid && role) {
        // User is logged in according to AsyncStorage, navigate based on role
        handleLoggedInUser({ uid: uid, email: 'Unknown' });
      } else {
        // User is logged out, show the Home screen
        handleLoggedOutUser();
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [uid, role]);

  const handleLoggedInUser = async (user) => {
    if (uid && role) {
      if (role === 'HOD') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Hod' }],
        });
      } else if (role === 'Teacher') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTeacher', params: { uid: uid } }],
        });
      } else {
        const studentRef = firebase.firestore().collection('Student').doc(uid);
        studentRef.get().then((docSnapshot) => {
          if (docSnapshot.exists) {
            const { FormSubmit } = docSnapshot.data();
            if (FormSubmit === 'Yes') {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainStudent', params: { uid: uid } }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [
                  { name: 'onBoardingStudent', params: { email: user.email } },
                ],
              });
            }
          } else {
            navigation.reset({
              index: 0,
              routes: [
                { name: 'onBoardingStudent', params: { email: user.email } },
              ],
            });
          }
        });
      }
    }
  };

  const handleLoggedOutUser = () => {};

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  useEffect(() => {
    // Retrieve the stored role from AsyncStorage
    const getStoredRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('role');
        setStoredRole(storedRole);
      } catch (error) {
        console.log('Error retrieving role from AsyncStorage:', error);
      }
    };

    getStoredRole();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1e1e24" barStyle="light-content" />
      <Image
        source={require('./assets/assignment-checker.png')}
        style={[styles.logo, imageDimensions, { resizeMode: 'contain' }]}
      />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Assignment Checker</Text>

        <Text style={styles.tagline}>A better way to manage assignments</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon={() => <Icon name="login" size={20} color="#fff" />}
          onPress={handleLogin}
          style={styles.button}>
          Get Started
        </Button>
      </View>
      {storedRole && (
        <Text style={styles.roleText}>Stored Role: {storedRole}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e24',
  },
  logo: {
    flex: 0.8,
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.3 }],
  },
  titleContainer: {
    justifyContent: 'flex-start',
    width: '90%',
  },
  title: {
    fontSize: 25,
    color: '#fca311ff',
    fontFamily: 'Nexa',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 28,
    color: '#e5e5e5ff',
    marginBottom: 20,
    fontFamily: 'Nexa',
  },
  buttonContainer: {
    justifyContent: 'space-around',
    width: '60%',
  },
  button: {
    margin: 20,
    backgroundColor: '#2d2d38',
    borderRadius: 30,
    position: 'relative',
    bottom: 10,
  },
  roleText: {
    fontSize: 14,
    color: '#9e9e9eff',
    marginTop: 20,
  },
});

export default Home;
