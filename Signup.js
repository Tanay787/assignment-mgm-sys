import React, { useState } from 'react';
import {
 StyleSheet,
 Text,
 View,
 TouchableOpacity,
 TextInput,
 SafeAreaView,
 StatusBar,
 Alert
} from 'react-native';
import firebase from 'firebase';

const Signup = ({ navigation }) =>{
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        Alert.alert('Success', 'Account created successfully');
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

    const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1e1e24" barStyle="light-content" />
      <Text style={styles.title}>Sign up</Text>
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
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignup}>
        <Text style={styles.signUpText}>Signup</Text>
      </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Already have an Account?</Text>
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
 signUpButton: {
    width: '80%',
    backgroundColor: '#2d2d38',
    borderRadius: 30,
    padding: 10,
    marginBottom: 20,
 },
 signUpText: {
    color: '#e5e5e5ff',
    fontSize: 18,
    textAlign: 'center',
 },
   loginButton: {
    width: '80%',
  },
  loginText: {
    color: '#fca311ff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Signup;
