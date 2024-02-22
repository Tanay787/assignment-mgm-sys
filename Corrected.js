import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Provider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import firebase from 'firebase';

const Corrected = ({ route, navigation }) => {
   const { uid } = route.params;
   const course = route.params.course;
   const year = route.params.year;
   const assignmentID = route.params.assignmentID;
   const [responses, setResponses] = useState([]);

   useEffect(() => {
    const fetchViewResponses = async () => {
        const assignmentRef = firebase.firestore().collection('completed-assignments');
        const studentRef = firebase.firestore().collection('Student');
      
        const unsubscribe = assignmentRef
            .where('assignmentID', '==', assignmentID)
            .where('corrected', '==', 'Yes')
            .onSnapshot(async (assignmentSnapshot) => {
                const responsePromises = assignmentSnapshot.docs.map(async doc => {
                  const uid = doc.data().uid;
                  const fileURL = doc.data().fileURL;
                  const status = doc.data().status; // Add this line
                  const remark = doc.data().remark; // Add this line 
            
                  const studentSnapshot = await studentRef.doc(uid).get();
                  const studentData = studentSnapshot.data();
                  return {
                    name: studentData.name,
                    rollNo: studentData.rollNo,
                    course: studentData.course,
                    year: studentData.year,
                    uid: uid,
                    fileURL: fileURL,
                    status: status, // Add this line
                    remark: remark, // Add this line
                    id: doc.id
                  };
                });
            
                const responses = await Promise.all(responsePromises);
                setResponses(responses);
            });
  
        // Cleanup function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    };
      
    fetchViewResponses();
  }, []);
  

   const handleViewFile = async (fileURL) => {
       const googleDocsURL = `https://docs.google.com/viewer?url=${encodeURIComponent(fileURL)}`;
       await WebBrowser.openBrowserAsync(googleDocsURL);
   };

   const renderAssignment = ({ item }) => {
       return (
           <Card style={styles.card}>
               <View style={styles.assignmentContainer}>
                  <View style={styles.assignmentInfo}>
                      <Text style={styles.studentName}>{item.name}</Text>
                      <Text style={styles.assignmentDetail}>Roll No: {item.rollNo}</Text>
                      <Text style={styles.assignmentDetail}>Course: {item.course}</Text>
                      <Text style={styles.assignmentDetail}>Year: {item.year}</Text>
                      <Text style={styles.assignmentDetail}>Status: {item.status}</Text>
                      <Text style={styles.assignmentDetail}>Remarks: {item.remark}</Text>
                      <View style={styles.iconsContainer}>
                          <TouchableOpacity onPress={() => handleViewFile(item.fileURL)}>
                              <MaterialCommunityIcons
                                 name="file-document-outline"
                                 size={24}
                                 color="black"
                              />
                              <Text>Answer File</Text>
                          </TouchableOpacity>
                      </View>
                  </View>
               </View>
           </Card>
       );
   };

   return (
       <Provider>
           <View style={styles.container}>
               {responses.length > 0 ? (
                  <FlatList
                      data={responses}
                      renderItem={renderAssignment}
                      keyExtractor={(item) => item.id}
                  />
               ) : (
                  <Text>No student has submitted assignments</Text>
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
   assignmentInfo: {
       flex: 1,
   },
   studentName: {
       fontSize: 22,
       fontWeight: 'bold',
       marginBottom: 8,
   },
   assignmentDetail: {
       fontSize: 14,
       marginBottom: 4,
   },
});

export default Corrected;
