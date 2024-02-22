import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { Picker } from '@react-native-community/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import firebase from 'firebase';
import AuthContext from './AuthContext';


const CreateAssignment = ({route}) => {
  const { uid } = route.params;
  const [assignmentName, setAssignmentName] = useState('');
  const [course, setCourse] = useState('None');
  const [year, setYear] = useState('None');
  const [dueDate, setDueDate] = useState(new Date()); // Initialize with current date
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [assignments, setAssignments] = useState([]);

  console.log("UID for CA:", uid);

  const handleCreateAssignment = async () => {
    if (
      !assignmentName ||
      !course ||
      !year ||
      course === 'None' ||
      year === 'None' ||
      !dueDate ||
      !file
    ) {
      console.log('Please fill in all the fields');
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }

    const isUnique = !assignments.some((assignment) => assignment.assignmentName === assignmentName);
    if (!isUnique) {
      Alert.alert('Error', 'The assignment name must be unique.');
      return;
    }

    try {
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const fileRef = firebase.storage().ref().child(`assignments/${file.name}`);
    const uploadTask = fileRef.put(blob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes);
          setUploadProgress(progress);
          console.log(`Upload is ${progress}% complete`);
        },
        (error) => {
          console.log('File upload error:', error);
        },
        async () => {
          const downloadURL = await fileRef.getDownloadURL();

          // Save the assignment details to Firestore
          const assignmentRef = firebase
            .firestore()
            .collection('assignments')
            .doc();
          await assignmentRef.set({
            assignmentName,
            course,
            year,
            dueDate,
            fileURL: downloadURL,
            fileType: file.mimeType.split('/')[1],
            uid,
            assignmentID: assignmentRef.id
          });

          // Reset the form
          setAssignmentName('');
          setCourse('None');
          setYear('None');
          setDueDate(new Date());
          setFile(null);

          console.log('Assignment created successfully!');
          Alert.alert('Success', 'Assignment created successfully!');
        }
      );
    } catch (error) {
      console.log('Error creating assignment:', error);
      Alert.alert('Error', 'Failed to create assignment. Please try again.');
    }
  };

  const handleFileUpload = async () => {
    try {
      const fileResult = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (fileResult.type === 'success') {
        setFile(fileResult);
        console.log('File selected:', fileResult.name);
        console.log('File type:', fileResult.mimeType);
      } else {
        Alert.alert('Error', 'Please select a PDF file.');
      }
    } catch (error) {
      console.log('File selection error:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    const dateWithoutTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    setDueDate(dateWithoutTime);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Assignment</Text>
      <TextInput
        style={styles.input}
        placeholder="Assignment Name"
        value={assignmentName}
        onChangeText={setAssignmentName}
      />
      <Picker
        selectedValue={course}
        onValueChange={(itemValue) => setCourse(itemValue)}>
        <Picker.Item label="Course" value="None" />
        <Picker.Item label="BScIT" value="BScIT" />
        <Picker.Item label="BAF" value="BAF" />
        <Picker.Item label="BMS" value="BMS" />
      </Picker>
      <Picker
        selectedValue={year}
        onValueChange={(itemValue) => setYear(itemValue)}>
        <Picker.Item label="Year" value="None" />
        <Picker.Item label="FY" value="FY" />
        <Picker.Item label="SY" value="SY" />
        <Picker.Item label="TY" value="TY" />
      </Picker>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowDatePicker(true)}>
        <Text style={styles.buttonText}>Set Due Date</Text>
      </TouchableOpacity>

      <Text style={styles.dateText}>
        Due Date: {dueDate.toLocaleDateString()}
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleFileUpload}>
        <Text style={styles.buttonText}>Attach a File</Text>
      </TouchableOpacity>
      {file && <Text style={styles.fileText}>Attached File: {file.name}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleCreateAssignment}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <ProgressBar progress={uploadProgress} color={'#007BFF'} />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  fileText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default CreateAssignment;
