import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, TextInput } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import firebase from 'firebase';

const NonCorrected = ({ route, navigation }) => {
 const { uid } = route.params;
 const course = route.params.course;
 const year = route.params.year;
 const assignmentID = route.params.assignmentID;
 const [responses, setResponses] = useState([]);
 const [remark, setRemark] = useState('');
 const [activeItemId, setActiveItemId] = useState(null);

 useEffect(() => {
  const fetchViewResponses = async () => {
      const assignmentRef = firebase.firestore().collection('completed-assignments');
      const studentRef = firebase.firestore().collection('Student');
    
      const unsubscribe = assignmentRef
          .where('assignmentID', '==', assignmentID)
          .where('corrected', '==', 'No')
          .onSnapshot(async (assignmentSnapshot) => {
              const responsePromises = assignmentSnapshot.docs.map(async doc => {
                const uid = doc.data().uid;
                const fileURL = doc.data().fileURL;
          
                const studentSnapshot = await studentRef.doc(uid).get();
                const studentData = studentSnapshot.data();
                return {
                    name: studentData.name,
                    rollNo: studentData.rollNo,
                    course: studentData.course,
                    year: studentData.year,
                    uid:uid,
                    fileURL: fileURL,
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

 const handleRemarkChange = (text) => {
  setRemark(text);
 };

 const handleSubmit = async (uid, status) => {
   console.log(uid); // Check if uid is passed correctly
 
   if (!remark) {
     alert('Please enter a remark');
     return;
   }
  
   try {
     console.log(assignmentID, uid); // Check if assignmentID and uid are defined
 
     const querySnapshot = await firebase.firestore().collection('completed-assignments')
       .where('assignmentID', '==', assignmentID)
       .where('uid', '==', uid)
       .get();
  
       querySnapshot.forEach(doc => {
        doc.ref.set({
          status: status,
          remark: remark,
          corrected: 'Yes'
        }, { merge: true });
      });
      
  
     setRemark('');
     setActiveItemId(null);
   } catch (error) {
     console.error("Error updating document: ", error);
     alert('An error occurred while updating the document. Please try again.');
   }
};

 const renderButton = (title, onPress, disabled) => (
   <Button title={title} onPress={() => onPress()} disabled={disabled} />
 );
 

 const renderAssignment = ({ item }) => {
     return (
       <Card style={styles.card}>
       <View style={styles.assignmentContainer}>
         <View style={styles.assignmentInfo}>
           <Text style={styles.studentName}>{item.name}</Text>
           <Text style={styles.assignmentDetail}>Roll No: {item.rollNo}</Text>
           <Text style={styles.assignmentDetail}>Course: {item.course}</Text>
           <Text style={styles.assignmentDetail}>Year: {item.year}</Text>
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
           <Button title="Add remark" onPress={() => setActiveItemId(item.id)} />
  
           {activeItemId === item.id && (
             <View>
               <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                onChangeText={handleRemarkChange}
                value={remark}
               />
             </View>
           )}
  
  <View style={styles.buttonsContainer}>
 {renderButton('Accept', () => handleSubmit(item.uid, 'Accept'), !remark)}
 {renderButton('Reject', () => handleSubmit(item.uid, 'Reject'), !remark)}
</View>

         </View>
       </View>
     </Card>
     );
 };

 return (
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
   buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
   },  
});

export default NonCorrected;
