import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import firebase from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HodPage = ( {navigation} ) => {
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const snapshot = await firebase.firestore().collection('Teacher').get();
        const fetchedTeachers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTeachers(fetchedTeachers);
      } catch (error) {
        console.error('Error fetching teachers from Firestore:', error);
      }
    };
  
    fetchTeachers();
  }, []);
  

  const handleAddTeacher = async () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newTeacherEmail);
    if (!isValidEmail) {
      Alert.alert('Invalid email', 'Please enter a valid email.');
      return;
    }

    const teacherExists = teachers.some((teacher) => teacher.email === newTeacherEmail);
    if (teacherExists) {
      Alert.alert('Teacher already exists');
      return;
    }
  
    try {
      const teacherQuery = firebase.firestore().collection('Teacher').where('email', '==', newTeacherEmail);
      const querySnapshot = await teacherQuery.get();
      
      if (!querySnapshot.empty) {
        Alert.alert('Teacher already exists');
        return;
      }
  
      const docRef = await firebase.firestore().collection('Teacher').add({ email: newTeacherEmail });
      const newTeacher = { id: docRef.id, email: newTeacherEmail };
      console.log('Added document with ID:', docRef.id);
  
      setTeachers((prevTeachers) => [...prevTeachers, newTeacher]);
      setNewTeacherEmail('');
    } catch (error) {
      console.error('Error adding teacher to Firestore:', error);
    }
  };
  
  

  const handleRemoveTeacher = async (teacherId, teacherEmail) => {
    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove teacher `,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await firebase.firestore().collection('Teacher').doc(teacherId).delete();
              console.log(`Document with ID ${teacherId} deleted`);
              setTeachers((prevTeachers) => prevTeachers.filter((teacher) => teacher.id !== teacherId));
            } catch (error) {
              console.error('Error deleting teacher from Firestore:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('role');
    // Add any additional AsyncStorage items to remove here

    // Navigate to the Home screen or any other desired screen
    navigation.navigate('Home');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>HOD</Text>
      </View>
      <View style={styles.content}>
        <TextInput
          placeholder="Teacher Email"
          value={newTeacherEmail}
          onChangeText={(text) => setNewTeacherEmail(text)}
          style={styles.input}
        />
        <Button title="Add Teacher" onPress={handleAddTeacher} />
      </View>
      <Text style={styles.sectionHeader}>Teachers:</Text>
      {teachers.map((teacher) => (
        <View key={teacher.id} style={styles.teacher}>
          <Text style={styles.teacherEmail}>{teacher.email}</Text>
          {teacher.id && <Button title="Remove" onPress={() => handleRemoveTeacher(teacher.id)} />}
        </View>

      ))}
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
         <Text style={styles.logoutButtonText}>Logout</Text>
         </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    borderWidth: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  teacher: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  teacherEmail: {
    flex: 1,
    marginRight: 10,
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
});

export default HodPage;
