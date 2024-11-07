import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
      <Tabs screenOptions={{ tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint, headerShown: false,}}>
        <Tabs.Screen  name="Account" options={{ title: 'Account', tabBarIcon: ({ color, focused }) => ( <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} color={color} size={35}/>),}}/>
        <Tabs.Screen  name="Calendar" options={{ title: 'Calendar', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={35}/>),}}/>
        <Tabs.Screen  name="Notes" options={{ title: 'Notes(Nie dorobione i dziwne)', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'document-text' : 'document-text-outline'} color={color} size={35}/>),}}/>
      </Tabs>
  );
}