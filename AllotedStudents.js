import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { Card } from 'react-native-paper';
import XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import firebase from 'firebase';

const AllotedStudents = ({ route }) => {
  const course = route.params.course;
  const year = route.params.year;
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await firebase
          .firestore()
          .collection('Student')
          .where('course', '==', course)
          .where('year', '==', year)
          .get();

        const studentsData = querySnapshot.docs.map((doc) => doc.data());
        setStudents(studentsData);
      } catch (error) {
        console.log('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, [course, year]);

const generateExcel = async (students) => {
 // Convert the students data to a format that can be written to an Excel file
 const data = students.map((student) => ({
   Name: student.name,
   RollNo: student.rollNo,
   // Add more fields as needed
 }));

 // Create a new workbook and add a worksheet with the students data
 const workbook = XLSX.utils.book_new();
 const worksheet = XLSX.utils.json_to_sheet(data);
 XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

 // Write the workbook to a base64 string
 const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

 // Save the base64 string to a file in the device's cache directory
 const uri = FileSystem.cacheDirectory + 'students.xlsx';
 await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });

 return uri;
};

const shareExcelFile = async (uri) => {
 const result = await Sharing.shareAsync(uri, {
   mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
   dialogTitle: 'Share Excel File',
 });
};

 const handleShare = async () => {
   const uri = await generateExcel(students);
   await shareExcelFile(uri);
 };

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
      <Text style={styles.title}>Alloted Students</Text>
      <Button title="Share as Excel" onPress={handleShare} />
      {students.length > 0 ? (
        <FlatList
          data={students}
          renderItem={renderStudent}
          keyExtractor={(item) => item.rollNo}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noStudentsText}>No students found.</Text>
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

export default AllotedStudents;
