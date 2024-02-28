import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import firebase from 'firebase';
import AuthContext from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const Form = ({
  email,
  name,
  setName,
  rollNo,
  setRollNo,
  course,
  setCourse,
  year,
  setYear,
}) => {
  const handleNameChange = (text) => {
    setName(text);
  };

  const handleRollNoChange = (text) => {
    setRollNo(text);
  };

  const handleCourseChange = (value) => {
    setCourse(value);
  };

  const handleYearChange = (value) => {
    setYear(value);
  };

  return (
    <SafeAreaView style={styles.Formcontainer}>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={handleNameChange}
      />

      <Text style={styles.label}>Roll No:</Text>
      <TextInput
        style={styles.input}
        value={rollNo}
        onChangeText={handleRollNoChange}
      />

      <Text style={styles.label}>Course:</Text>
      <Picker
        style={styles.input}
        selectedValue={course}
        onValueChange={handleCourseChange}>
        <Picker.Item label="None" value="None" />
        <Picker.Item label="BScIT" value="BScIT" />
        <Picker.Item label="B.Com" value="B.Com" />
        <Picker.Item label="BMS" value="BMS" />
        <Picker.Item label="BBA" value="BBA" />
        <Picker.Item label="BMM" value="BMM" />
      </Picker>

      <Text style={styles.label}>Year:</Text>
      <Picker
        style={styles.input}
        selectedValue={year}
        onValueChange={handleYearChange}>
        <Picker.Item label="None" value="None" />
        <Picker.Item label="FY" value="FY" />
        <Picker.Item label="SY" value="SY" />
        <Picker.Item label="TY" value="TY" />
      </Picker>
    </SafeAreaView>
  );
};

const OnboardingScreen = ({ route, navigation }) => {

const [uid, setUid] = useState(null);

   useEffect(() => {
   const getUid = async () => {
     const uid = await AsyncStorage.getItem('uid');
     setUid(uid);
   };

   getUid();
 }, []);

  console.log('uid for OBS: ',uid);
  const studentID = uid;
  const [currentSlide, setCurrentSlide] = useState(1);
  const { email } = route.params;
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [course, setCourse] = useState('None');
  const [year, setYear] = useState('None');

  const handleNext = () => {
    setCurrentSlide(currentSlide + 1);
  };

  const handlePrev = () => {
    setCurrentSlide(currentSlide - 1);
  };

  const handleSubmit = async () => {
    try {
      // Check if a student with the same name already exists
      /* const duplicateNameCheckQuery = firebase
        .firestore()
        .collection('Student')
        .where('name', '==', name);
      const duplicateNameCheckSnapshot = await duplicateNameCheckQuery.get();

      if (!duplicateNameCheckSnapshot.empty) {
        // A student with the same name already exists
        Alert.alert('Error', 'A student with the same name already exists.');
        return;
      } */

      // Check if a student with the same rollNo already exists
      const duplicateRollNoCheckQuery = firebase
        .firestore()
        .collection('Student')
        .where('rollNo', '==', rollNo);
      const duplicateRollNoCheckSnapshot =
        await duplicateRollNoCheckQuery.get();

      if (!duplicateRollNoCheckSnapshot.empty) {
        // A student with the same rollNo already exists
        Alert.alert(
          'Error',
          'A student with the same roll number already exists.'
        );
        return;
      }

      if (course === 'None' || year === 'None') {
        Alert.alert(
          'Error',
          'Please select a valid option for Course and Year.'
        );
        return;
      }

      // Check if the form has already been submitted for the given email
      const studentQuery = firebase
        .firestore()
        .collection('Student')
        .where('email', '==', email);
      const querySnapshot = await studentQuery.get();

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const studentData = querySnapshot.docs[0].data();

        if (studentData.FormSubmit === 'Yes') {
          // The form has already been submitted for this email
          Alert.alert(
            'Error',
            'This form has already been submitted for the given email.'
          );
          return;
        }

        await docRef.update({ name, rollNo, course, year, FormSubmit: 'Yes', studentID });
        Alert.alert('Form submitted successfully!');

        try {
          await AsyncStorage.setItem('course', course);
          await AsyncStorage.setItem('year', year);
        } catch (error) {
          console.log('Error storing options:', error);
        }
         navigation.reset({
            index: 0,
            routes: [{ name: 'MainStudent', params: { uid: uid } }],
          }); // Navigate to the Student screen
      } else {
        Alert.alert('User does not exist');
      }
    } catch (error) {
      console.error('Error updating student details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.slideContainer}>
        {currentSlide === 1 && (
          <View style={styles.slideContent}>
            <Text>Slide 1 - Information</Text>
          </View>
        )}

        {currentSlide === 2 && (
          <View style={styles.slideContent}>
            <Text>Slide 2 - Information</Text>
          </View>
        )}

        {currentSlide === 3 && (
          <View style={styles.wrapper}>
            <Text>Student Info</Text>
            <Form
              email={email}
              name={name}
              setName={setName}
              rollNo={rollNo}
              setRollNo={setRollNo}
              course={course}
              setCourse={setCourse}
              year={year}
              setYear={setYear}
            />
          </View>
        )}
      </View>

      {currentSlide === 3 ? (
        <View style={styles.buttonContainer}>
          <Button
            title="Previous"
            onPress={handlePrev}
            disabled={currentSlide === 1}
          />
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <Button
            title="Previous"
            onPress={handlePrev}
            disabled={currentSlide === 1}
          />
          <Button
            title="Next"
            onPress={handleNext}
            disabled={currentSlide === 3}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  Formcontainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    elevation: 4,
    width: '50%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 16,
    fontSize: 16,
    paddingVertical: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: height * 0.1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '150%',
  },
});

export default OnboardingScreen;
