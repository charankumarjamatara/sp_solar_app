import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../constants/colors';

export default function TicketsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Tickets' }} />
      <Stack.Screen
        name="new"
        options={{
          title: 'Raise Issue',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="[id]/index" options={{ title: 'Ticket Details' }} />
      <Stack.Screen
        name="[id]/feedback"
        options={{
          title: 'Provide Feedback',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
