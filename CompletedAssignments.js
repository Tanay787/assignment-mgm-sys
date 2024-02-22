import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Provider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import firebase from 'firebase';

const CompletedAssignments = ({ route, navigation }) => {
 const { uid } = route.params;
 const [completedAssignments, setCompletedAssignments] = useState([]);
 useEffect(() => {
  const fetchCompletedAssignments = async () => {
    try {
      const query = firebase
        .firestore()
        .collection('completed-assignments')
        .where('uid', '==', uid);
 
      const unsubscribe = query.onSnapshot(async (querySnapshot) => {
        const completedAssignmentsData = await Promise.all(
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
              submittedFileURL: data.fileURL, // Corrected here
            };
          })
        );
 
        setCompletedAssignments(completedAssignmentsData);
      });
 
      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    } catch (error) {
      console.log('Error fetching completed assignments:', error);
    }
  };
 
  fetchCompletedAssignments();
 }, []);
 


   

 const handleViewFile = async (fileURL) => {
    const googleDocsURL
 = `https://docs.google.com/viewer?url=${encodeURIComponent(fileURL)}`;
    await WebBrowser.openBrowserAsync(googleDocsURL);
 };

 const renderAssignment = ({ item }) => {
    return (
      <Card style={styles.card}>
        <View style={styles.assignmentContainer}>
          <View style={styles.assignmentInfo}>
            <Text style={styles.assignmentName}>{item.assignmentName}</Text>
            <Text style={styles.assignmentDetail}>Course: {item.course}</Text>
            <Text style={styles.assignmentDetail}>Year: {item.year}</Text>
            <View style={styles.iconsContainer}>
              <TouchableOpacity onPress={() => handleViewFile(item.fileURL)}>
                <MaterialCommunityIcons
                 name="file-document-outline"
                 size={24}
                 color="black"
                />
                <Text>Question File</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleViewFile(item.submittedFileURL)}>
                <MaterialCommunityIcons
                 name="file-document-outline"
                 size={24}
                 color="black"
                />
                <Text>Submitted File</Text>
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
        {completedAssignments.length > 0 ? (
          <FlatList
            data={completedAssignments}
            renderItem={renderAssignment}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Text>No completed assignments found.</Text>
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
});

export default CompletedAssignments;