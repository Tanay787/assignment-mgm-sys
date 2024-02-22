import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Corrected from './Corrected';
import NonCorrected from './NonCorrected';

const Tab = createBottomTabNavigator();

const ViewResponses = ({ route }) => {
  const { uid } = route.params;
  const assignmentID =route.params.assignmentID
  const course = route.params.course;
  const year = route.params.year;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'NonCorrected') {
            iconName = 'file-document-outline';
          } else if (route.name === 'Corrected') {
            iconName = 'check-circle-outline';
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
      })}
      tabBarOptions={{
        activeTintColor: 'blue',
        inactiveTintColor: 'gray',
      }}>
        <Tab.Screen
    name="NonCorrected"
    component={NonCorrected}
    initialParams={{ uid, assignmentID, course, year }}
/>
     <Tab.Screen
    name="Corrected"
    component={Corrected}
    initialParams={{ uid, assignmentID, course, year }}
/>

    </Tab.Navigator>
  );
};

export default ViewResponses;
