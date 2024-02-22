import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import RemainingAssignments from './RemainingAssignments';
import CompletedAssignments from './CompletedAssignments';
import AssignmentStatus from './AssignmentStatus';

const Tab = createBottomTabNavigator();

const ViewAssignments = ({ route }) => {
 const { uid } = route.params;
 return (
   <Tab.Navigator
     screenOptions={({ route }) => ({
       tabBarIcon: ({ color, size }) => {
         let iconName;

         if (route.name === 'RemainingAssignments') {
           iconName = 'file-document-outline';
         } else if (route.name === 'CompletedAssignments') {
           iconName = 'check-circle-outline';
         } else if (route.name === 'AssignmentStatus') {
           iconName = 'list-status';
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
       name="RemainingAssignments"
       component={RemainingAssignments}
       initialParams={{ uid }}
     />
     <Tab.Screen
       name="CompletedAssignments"
       component={CompletedAssignments}
       initialParams={{ uid }}
     />
     <Tab.Screen
       name="AssignmentStatus"
       component={AssignmentStatus}
       initialParams={{ uid }}
     />
   </Tab.Navigator>
 );
};

export default ViewAssignments;

