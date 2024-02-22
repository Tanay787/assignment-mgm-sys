import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Provider ,ProgressBar} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as DocumentPicker from 'expo-document-picker';
import firebase from 'firebase';

const AssignmentStatus = ({ route, navigation }) => {
    const { uid } = route.params;
 const [assignments, setAssignments] = useState([]);
 const [resubmissionClicked, setResubmissionClicked] = useState({});
 const [selectedFiles, setSelectedFiles] = useState({});
 const [uploadProgress, setUploadProgress] = useState(0);


 useEffect(() => {
   const fetchAssignments = async () => {
     try {
       const query = firebase
         .firestore()
         .collection('completed-assignments')
         .where('uid', '==', uid);

       const unsubscribe = query.onSnapshot(async (querySnapshot) => {
         const assignmentsData = await Promise.all(
           querySnapshot.docs.map(async (doc) => {
             const data = doc.data();

             const assignmentDoc = await firebase
               .firestore()
               .collection('assignments')
               .doc(data.assignmentID)
               .get();

             const assignmentData = assignmentDoc.data();

             return {
               id: doc.id,
               ...data,
               assignmentName: assignmentData.assignmentName,
               course: assignmentData.course,
               year: assignmentData.year,
               fileURL: assignmentData.fileURL,
               submittedFileURL: data.fileURL,
               status:data.status,
               remark:data.remark,
             };
           })
         );

         setAssignments(assignmentsData);
       });

       return () => unsubscribe();
     } catch (error) {
       console.log('Error fetching assignments:', error);
     }
   };

   fetchAssignments();
 }, [uid]);

 const handlestatus = (status) => {
   return status ? status : 'On process of checking';
 };

 const handleremark = (remark) => {
   return remark ? remark : 'Not yet given';
 };

 const handleViewFile = async (fileURL) => {
    const googleDocsURL
 = `https://docs.google.com/viewer?url=${encodeURIComponent(fileURL)}`;
    await WebBrowser.openBrowserAsync(googleDocsURL);
 };

 const handleSelectFile = async (assignmentID) => {
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

        // Fetch the document to update
        const responseQuery = db.collection('assignment-responses')
          .where('assignmentID', '==', assignmentID)
          .where('uid', '==', uid);
        const responseSnapshot = await responseQuery.get();

        // Update the document
        if (!responseSnapshot.empty) {
          const doc = responseSnapshot.docs[0];
          await db.collection('assignment-responses').doc(doc.id).update({
            fileURL: downloadURL,
          });
        }

        // Fetch the document to update
        const completedAssignmentsQuery = db.collection('completed-assignments')
          .where('assignmentID', '==', assignmentID)
          .where('uid', '==', uid);
        const completedAssignmentsSnapshot = await completedAssignmentsQuery.get();

        // Update the document
        if (!completedAssignmentsSnapshot.empty) {
          const doc = completedAssignmentsSnapshot.docs[0];
          await db.collection('completed-assignments').doc(doc.id).update({
            fileURL: downloadURL,
            corrected: 'No',
            status: null,
            remark: null
          });
        }

        Alert.alert('Your file has been uploaded successfully!');
      }
    );
  }
};


 const renderAssignment = ({ item }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.assignmentContainer}>
        <View style={styles.assignmentInfo}>
          <Text style={styles.assignmentName}> {item.assignmentName}</Text>
          <Text style={styles.assignmentDetail}>Course: {item.course}</Text>
          <Text style={styles.assignmentDetail}>Year: {item.year}</Text>
          <Text style={styles.assignmentDetail}>Status: {handlestatus(item.status)}</Text>
          <Text style={styles.assignmentDetail}>Remarks: {handleremark(item.remark)}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => handleViewFile(item.fileURL)}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={24}
                color="black"
              />
              <Text>Answer File</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleViewFile(item.submittedFileURL)}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={24}
                color="black"
              />
              <Text>Submitted File</Text>
            </TouchableOpacity>
            {item.status === 'Reject' && (
              <TouchableOpacity onPress={() => setResubmissionClicked({ ...resubmissionClicked, [item.id]: true })}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={24}
                  color="black"
                />
                <Text>Resubmission</Text>
              </TouchableOpacity>
            )}
          </View>
          {resubmissionClicked[item.id] && item.status === 'Reject' && (
            <View style={styles.resubmissionContainer}>
              <TouchableOpacity style={styles.fileInput} onPress={() => handleSelectFile(item.assignmentID)}>
                <MaterialCommunityIcons
                  name="attachment"
                  size={24}
                  color="black"
                />
                {selectedFiles[item.assignmentID] ? (
                  <Text>Selected File: {selectedFiles[item.assignmentID].name}</Text>
                ) : (
                  <Text>Upload Response</Text>
                )}
              </TouchableOpacity>
              {selectedFiles[item.assignmentID] && (
                <TouchableOpacity onPress={() => handleSubmitFile(item.assignmentID, item)}>
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
          )}
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
           keyExtractor={(item) => item.id}
         />
       ) : (
         <Text>No assignment status available</Text>
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
     assignmentName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
     },
     assignmentDetail: {
        fontSize: 14,
        marginBottom: 4,
     },
 
    progressBarContainer: {
      marginTop: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    resubmissionContainer: {
      marginTop: 10,
    },
});

export default AssignmentStatus;
