import React, { useEffect, useState } from 'react';
import firebase from 'firebase';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Hod from './Hod';
import OnboardingScreen from './onBoardingStudent';
import CreateAssignment from './CreateAssignment';
import MainStudent from './MainStudent';
import MainTeacher from './MainTeacher';
import ManageAssignments from './ManageAssignments';
import AllotedStudents from './AllotedStudents';
import ViewAssignments from './ViewAssignments';
import ViewResponses from './ViewResponses';
import RemainingAssignments from './RemainingAssignments';
import AuthContext from './AuthContext';
import Corrected from './Corrected';
import NonCorrected from './NonCorrected';
import AssignmentStatus from './AssignmentStatus';
import RemainingStudents from './RemainingStudent';

const firebaseConfig = {
  apiKey: 'AIzaSyBdU9Y2KDpvG6tvSzYrrlAZJ2RUpX3GKIY',
  authDomain: 'file-management-system-39da7.firebaseapp.com',
  projectId: 'file-management-system-39da7',
  storageBucket: 'file-management-system-39da7.appspot.com',
  messagingSenderId: '150415198400',
  appId: '1:150415198400:web:5b049796c0947eae98c525',
  //measurementId: "G-KR294CJDRB"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [uid, setUid] = useState(null);
  const [role, setRole] = useState(null);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        Nexa: require('./assets/fonts/NexaTextDemo-Bold.otf'),
      });
      setFontLoaded(true);
    }
    loadFont();

    const getStoredUserSession = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('uid');
        const storedRole = await AsyncStorage.getItem('role');
        setUid(storedUid);
        setRole(storedRole);
      } catch (error) {
        console.log('Error retrieving user session from AsyncStorage:', error);
      }
    };

    getStoredUserSession();
  }, []);

  if (!fontLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ uid, setUid, role, setRole }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerTintColor: '#ffffff',
            headerStyle: { backgroundColor: '#1e1e24' },
          }}>
          <Stack.Screen name="Create" component={CreateAssignment} />
          <Stack.Screen name="Manage" component={ManageAssignments} />
          <Stack.Screen name="Alloted" component={AllotedStudents} />
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Hod" component={Hod} />
          <Stack.Screen name="MainTeacher" component={MainTeacher} />
          <Stack.Screen name="MainStudent" component={MainStudent} />
          <Stack.Screen name="View" component={ViewAssignments} />
          <Stack.Screen name="Responses" component={ViewResponses} />
          <Stack.Screen name="Corrected" component={Corrected} />
          <Stack.Screen name="NonCorrected" component={NonCorrected} />
          <Stack.Screen name="AssignmentStatus" component={AssignmentStatus} />
          <Stack.Screen name="Remaining" component={RemainingStudents} />

          <Stack.Screen
            name="RemainingAssignments"
            component={RemainingAssignments}
          />
          <Stack.Screen name="onBoardingStudent" component={OnboardingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}