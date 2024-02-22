import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import firebase from 'firebase';

const RemainingStudents = ({ route }) => {
    const course = route.params.course;
    const year = route.params.year;
    const assignmentID = route.params.assignmentID;
    const [students, setStudents] = useState([]);
   
    useEffect(() => {
      const fetchStudents = async () => {
        try {
          // Fetch completed assignments
          const completedAssignmentsSnapshot = await firebase
            .firestore()
            .collection('completed-assignments')
            .where('assignmentID', '==', assignmentID)
            .get();
   
          const completedAssignments = completedAssignmentsSnapshot.docs.map((doc) => doc.data());
   
          // Fetch all students
          const studentsSnapshot = await firebase
            .firestore()
            .collection('Student')
            .where('course', '==', course)
            .where('year', '==', year)
            .get();
   
          const allStudents = studentsSnapshot.docs.map((doc) => doc.data());
   
          // Filter out students who have completed the assignment
          const remainingStudents = allStudents.filter(
            (student) => !completedAssignments.some((assignment) => assignment.uid === student.studentID)
          );
   
          setStudents(remainingStudents);
        } catch (error) {
          console.log('Error fetching students:', error);
        }
      };
   
      fetchStudents();
    }, [course, year, assignmentID]);

    const renderStudent = ({ item }) => {
        return (
          <Card style={styles.card}>
            <View style={styles.studentContainer}>
              <Text style={styles.studentLabel}>Name:</Text>
              <Text style={styles.studentValue}>{item.name}</Text>
            </View>
            <View style={styles.studentContainer}>
              <Text style={styles.studentLabel}>Roll No.:</Text>
              <Text style={styles.studentValue}>{item.rollNo}</Text>
            </View>
          </Card>
        );
      };
    
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Remaining Students</Text>
          {students.length > 0 ? (
            <FlatList
              data={students}
              renderItem={renderStudent}
              keyExtractor={(item) => item.rollNo}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <Text style={styles.noStudentsText}>No students remaining to submit the assignment </Text>
          )}
        </View>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
      },
      title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 16,
      },
      listContainer: {
        flexGrow: 1,
      },
      card: {
        marginBottom: 16,
        elevation: 4,
        padding: 16,
      },
      studentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      },
      studentLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
      },
      studentValue: {
        fontSize: 18,
      },
      noStudentsText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 32,
      },
    });
    
    export default RemainingStudents;