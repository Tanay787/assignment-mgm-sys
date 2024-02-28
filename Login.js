import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import firebase from 'firebase';
import AuthContext from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUid } = useContext(AuthContext);

  // Inside the handleLogin function in Login.js
  const handleLogin = async () => {
    try {
      const userCredential = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      setUid(uid);
      await AsyncStorage.setItem('uid', uid); //Setting UId

      let role = 'Student'; // Default role is Student

      // Check if the email matches the HOD email
      if (email === 'hod1@gmail.com') {
        //password: hod@123
        role = 'HOD';
      }

      // Check if the email belongs to a Teacher
      const teacherQuery = firebase
        .firestore()
        .collection('Teacher')
        .where('email', '==', email);
      const teacherSnapshot = await teacherQuery.get();
      if (!teacherSnapshot.empty) {
        role = 'Teacher';
      }

      // Check if the email belongs to a Student
      const studentRef = firebase.firestore().collection('Student').doc(uid);
      const docSnapshot = await studentRef.get();
      if (docSnapshot.exists) {
        role = 'Student';
      }
      await AsyncStorage.setItem('role', role); //Setting Role
      // Navigate to the appropriate screen based on the role and FormSubmit value
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
        // Add the student to the 'Student' collection if not already present
        if (role === 'Student' && !docSnapshot.exists) {
          studentRef
            .set({
              email: email,
              FormSubmit: 'No',
            })
            .then(() => {
              console.log('Student added to Firestore');
            })
            .catch((error) => {
              console.error('Error adding student to Firestore:', error);
            });
        }

        // Check the value of FormSubmit and navigate accordingly
        if (docSnapshot.exists && docSnapshot.data().FormSubmit === 'Yes') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainStudent', params: { uid: uid } }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'onBoardingStudent',
                params: { email: email },
              },
            ],
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1e1e24" barStyle="light-content" />
      <Text style={styles.title}>Login</Text>
      <Text style={styles.tagline}>Welcome back!</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          value={email}
          onChangeText={(text) => setEmail(text)}
          placeholder="Email"
          placeholderTextColor="#8d8d93"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.inputField}
          value={password}
          onChangeText={(text) => setPassword(text)}
          placeholder="Password"
          placeholderTextColor="#8d8d93"
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
        />
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    color: '#e5e5e5ff',
    fontFamily: 'Nexa',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#fca311ff',
    marginBottom: 20,
  },
  inputContainer: {
    width: '80%',
  },
  inputField: {
    backgroundColor: '#1e1e24',
    borderBottomColor: '#e5e5e5ff',
    borderBottomWidth: 1,
    color: '#e5e5e5ff',
    fontSize: 16,
    padding: 10,
    marginBottom: 20,
  },
  loginButton: {
    width: '80%',
    backgroundColor: '#2d2d38',
    borderRadius: 30,
    padding: 10,
    marginBottom: 20,
  },
  loginText: {
    color: '#e5e5e5ff',
    fontSize: 18,
    textAlign: 'center',
  },
  signupButton: {
    width: '80%',
  },
  signupText: {
    color: '#fca311ff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Login;  
