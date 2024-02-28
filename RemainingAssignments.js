import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert
} from 'react-native';
import firebase from 'firebase';
import * as WebBrowser from 'expo-web-browser';
import { Divider, Provider, Card, ProgressBar } from 'react-native-paper';

import AllotedStudents from './AllotedStudents';
import React, { useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RemainingAssignments = ({ route, navigation }) => {
  const { uid } = route.params;

  const [assignments, setAssignments] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [submittedAssignments, setSubmittedAssignments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    let assignmentsData = [];
    let responseData = [];
   
    const fetchAssignments = async () => {
      try {
        let course = await AsyncStorage.getItem('course');
        let year = await AsyncStorage.getItem('year');
   
        // If course and year are null, fetch them from the students collection
        if (!course || !year) {
          const studentDoc = await firebase
            .firestore()
            .collection('Student')
            .doc(uid)
            .get();
   
          const studentData = studentDoc.data();
          course = studentData.course;
          year = studentData.year;
   
          // Save course and year in AsyncStorage for future use
          await AsyncStorage.setItem('course', course);
          await AsyncStorage.setItem('year', year);
        }
   
        console.log('Course:', course);
        console.log('Year:', year);
   
        const assignmentsRef = firebase
          .firestore()
          .collection('assignments')
          .where('course', '==', course)
          .where('year', '==', year);
   
        const responsesRef = firebase
          .firestore()
          .collection('assignment-responses')
          .where('uid', '==', uid);
   
        const assignmentsListener = assignmentsRef.onSnapshot((querySnapshot) => {
          assignmentsData = querySnapshot.docs.map((doc) => doc.data());
        });
   
        const responsesListener = responsesRef.onSnapshot(
          (responseSnapshot) => {
            responseData = responseSnapshot.docs.map((doc) => doc.data());
   
            // Filter out assignments that have already been submitted by the user
            const filteredAssignments = assignmentsData.filter((assignment) => {
              return !responseData.some(
                (response) => response.assignmentID === assignment.assignmentID
              );
            });
   
            setAssignments(filteredAssignments);
          }
        );
   
        // Clean up the listener when the component unmounts
        return () => {
          assignmentsListener();
          responsesListener();
        };
      } catch (error) {
        console.log('Error fetching assignments:', error);
      }
    };
   
    fetchAssignments();
   }, [uid]);
   
  

  const handleViewFile = async (fileURL) => {
    const googleDocsURL = `https://docs.google.com/viewer?url=${encodeURIComponent(
      fileURL
    )}`;
    await WebBrowser.openBrowserAsync(googleDocsURL);
  };

  const openMenuHandler = (event, assignmentID) => {
    setOpenMenu(assignmentID);
  };

  const closeMenuHandler = () => {
    setOpenMenu(null);
  };

  const handleSelectFile = async (assignmentID, dueDate) => {
    const currentDate = new Date();
    const dueDateObj = new Date(dueDate);
   
    if (currentDate.getTime() <= dueDateObj.getTime()) {
      let result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
   
      if (!result.cancelled) {
        setSelectedFiles((prevFiles) => ({
          ...prevFiles,
          [assignmentID]: result,
        }));
      }
    } else {
      Alert.alert('The due date has passed. You cannot upload a response.');
    }
   };
   
 
   

  const handleSubmitFile = async (assignmentID, item) => {
    const selectedFile = selectedFiles[assignmentID];
  
    if (selectedFile) {
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();
  
      const storageRef = firebase
        .storage()
        .ref(`assignment-responses/${selectedFile.name}`);
      const uploadTask = storageRef.put(blob);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          setUploadProgress(progress);
        },
        (error) => {
          console.log('Error uploading file:', error);
        },
        async () => {
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          const db = firebase.firestore();
          const responseDocRef = await db.collection('assignment-responses').add({
            assignmentID: item.assignmentID,
            uid: uid,
            fileURL: downloadURL,
          });
          await db.collection('completed-assignments').add({
            assignmentID: item.assignmentID,
            assignmentResponseID: responseDocRef.id, // use the id from the DocumentReference
            fileURL: downloadURL,
            uid: uid,
            corrected: 'No', // add the new field here
            status: null, // add the status field and set default as null
            remark: null // add the remark field and set default as null
        });
        
     
          Alert.alert('Your file has been uploaded successfully!');
        }
      );
    }
  };
  

  const renderAssignment = ({ item }) => {
    const dueDate = item.dueDate.toDate();

    return (
      <Card style={styles.card}>
        <View style={styles.assignmentContainer}>
          <View style={styles.assignmentInfo}>
            <Text style={styles.assignmentName}>{item.assignmentName}</Text>
            <Text style={styles.assignmentDetail}>Course: {item.course}</Text>
            <Text style={styles.assignmentDetail}>Year: {item.year}</Text>
            <Text style={styles.assignmentDetail}> Due Date: {dueDate.toLocaleDateString()}</Text>
            <View style={styles.iconsContainer}>
              <TouchableOpacity onPress={() => handleViewFile(item.fileURL)}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={24}
                  color="black"
                />
                <Text>View File</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.iconsContainer}>
              <TouchableOpacity
                style={styles.fileInput}
                onPress={() => handleSelectFile(item.assignmentID , dueDate)}>
                <MaterialCommunityIcons
                  name="attachment"
                  size={24}
                  color="black"
                />
                {selectedFiles[item.assignmentID] ? (
                  <Text>
                    Selected File: {selectedFiles[item.assignmentID].name}
                  </Text>
                ) : (
                  <Text>Upload Response</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.iconsContainer}>
              {selectedFiles[item.assignmentID] && (
                <TouchableOpacity
                  onPress={() => handleSubmitFile(item.assignmentID, item)}>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={24}
                    color="green"
                  />
                  <Text>Submit</Text>

                  <View style={styles.progressBarContainer}>
                    <ProgressBar progress={uploadProgress} color="green" />
                    <Text>Uploading: {Math.round(uploadProgress * 100)}%</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

        </View>
      </Card>
    );
  };

  return (
    <Provider>
      <View style={styles.container}>
        {assignments.length > 0 ? (
          <FlatList
            data={assignments}
            renderItem={renderAssignment}
            keyExtractor={(item) => item.assignmentName}
          />
        ) : (
          <Text>No assignments found.</Text>
        )}
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  assignmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  progressBarContainer: {
    marginTop: 10,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  assignmentDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default RemainingAssignments;
