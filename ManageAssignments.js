import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native';
import firebase from 'firebase';
import * as WebBrowser from 'expo-web-browser';
import { Provider, Card , Menu } from 'react-native-paper';
import AllotedStudents from './AllotedStudents';
import React, { useState, useEffect, useContext } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ManageAssignments = ({ route, navigation }) => {
  const { uid } = route.params;
  const [assignments, setAssignments] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);


  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const querySnapshot = await firebase
          .firestore()
          .collection('assignments')
          .where('uid', '==', uid)
          .get();

        const assignmentsData = querySnapshot.docs.map((doc) => doc.data());
        setAssignments(assignmentsData);
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

  const handleDeleteAssignment = (assignmentID) => {
    Alert.alert(
      'Delete Assignment',
      'Are you sure you want to delete this assignment?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await firebase
                .firestore()
                .collection('assignments')
                .doc(assignmentID)
                .delete();

              // Remove the deleted assignment from the local state
              setAssignments(
                assignments.filter(
                  (assignment) => assignment.assignmentID !== assignmentID
                )
              );
            } catch (error) {
              console.log('Error deleting assignment:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  const renderAssignment = ({ item }) => {
    const dueDate = item.dueDate.toDate().toLocaleDateString();

    return (
      <Card style={styles.card}>
        <View style={styles.assignmentContainer}>
          <View style={styles.assignmentInfo}>
            <Text style={styles.assignmentName}>{item.assignmentName}</Text>
            <Text style={styles.assignmentDetail}>Course: {item.course}</Text>
            <Text style={styles.assignmentDetail}>Year: {item.year}</Text>
            <Text style={styles.assignmentDetail}>Due Date: {dueDate}</Text>
            <View style={styles.iconsContainer}>
              <TouchableOpacity onPress={() => handleViewFile(item.fileURL)}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={24}
                  color="black"
                />
                <Text>View File</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteAssignment(item.assignmentID)}>
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={24}
                  color="black"
                />
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.menuButton}>
           <Menu
              visible={menuVisible === item.assignmentID}
             onDismiss={() => setMenuVisible(null)}
              anchor={
              <TouchableOpacity onPress={() => setMenuVisible(item.assignmentID)}>
              <MaterialCommunityIcons
               name="dots-vertical"
               size={24}
               color="blue"
               />
              </TouchableOpacity>
            }>
             <Menu.Item
              title="Alloted Students"
              onPress={() => navigation.navigate('Alloted', {
              course: item.course,
              year: item.year,
              })}
         />
       <Menu.Item title="View Responses" onPress={() => navigation.navigate('Responses',{
        assignmentID: item.assignmentID,
        course:item.course,
        year: item.year,
        uid: uid,
       })} />
     <Menu.Item
              title="Remaining Student"
              onPress={() => navigation.navigate('Remaining', {
              course: item.course,
              year: item.year,
              assignmentID: item.assignmentID,
              })}
         />
       </Menu>
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
            keyExtractor={(item) => item.assignmentID}
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
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default ManageAssignments;
