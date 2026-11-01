import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { useNotifications } from '../../hooks/useNotifications';
import { CustomerGlobalHeader } from '../../components/ui/CustomerGlobalHeader';

export default function CustomerTabsLayout() {
  const { unreadCount } = useNotifications();
  const insets = useSafeAreaInsets();

  // Ensure safe area padding on Android/iOS native navigation bars while maintaining balanced web spacing
  const bottomInset = insets.bottom;
  const bottomPadding = Math.max(bottomInset, Platform.OS === 'web' ? 8 : 6);
  const tabHeight = (Platform.OS === 'web' ? 62 : 58) + bottomPadding;

  return (
    <View style={styles.rootContainer}>
      {/* 1. Global Shared Branded Header - Sticky across all customer routes */}
      <CustomerGlobalHeader />

      {/* 2. Customer Routes & Stationary Bottom Navigation */}
      <View style={styles.tabContainer}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.navy[800],
            tabBarInactiveTintColor: colors.text.secondary,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border.default,
              borderTopWidth: 1,
              height: tabHeight,
              paddingTop: 6,
              paddingBottom: bottomPadding,
              ...Platform.select({
                ios: {
                  shadowColor: colors.navy[800],
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 6,
                },
                default: {
                  boxShadow: '0 -1px 3px rgba(0, 23, 53, 0.04)',
                },
              }),
            },
            tabBarItemStyle: {
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 2,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              lineHeight: 14,
              marginTop: 2,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={22}
                  color={focused ? colors.navy[800] : color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="tickets"
            options={{
              title: 'Tickets',
              tabBarLabel: 'Tickets',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'receipt' : 'receipt-outline'}
                  size={22}
                  color={focused ? colors.navy[800] : color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="raise-issue"
            options={{
              title: 'Add Issue',
              tabBarLabel: 'Add Issue',
              tabBarIcon: () => (
                <View style={styles.addIssueButton}>
                  <Ionicons name="add" size={22} color={colors.white} />
                </View>
              ),
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '700',
                lineHeight: 14,
                marginTop: 2,
                color: colors.gold[700],
              },
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Alerts',
              tabBarLabel: 'Alerts',
              tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
              tabBarBadgeStyle: {
                backgroundColor: colors.feedback.error,
                fontSize: 10,
                lineHeight: 12,
                minWidth: 16,
                height: 16,
                color: colors.white,
              },
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'notifications' : 'notifications-outline'}
                  size={22}
                  color={focused ? colors.navy[800] : color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarLabel: 'Profile',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'person' : 'person-outline'}
                  size={22}
                  color={focused ? colors.navy[800] : color}
                />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  tabContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  addIssueButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold[400],
    ...Platform.select({
      ios: {
        shadowColor: colors.gold[700],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      default: {
        boxShadow: '0 2px 4px rgba(221, 167, 70, 0.25)',
      },
    }),
  },
});
