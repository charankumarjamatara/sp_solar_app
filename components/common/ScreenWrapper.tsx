import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleProp,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../constants/colors';
import { layout } from '../../constants/theme';
import { AppHeader, AppHeaderProps } from '../ui/AppHeader';

export interface ScreenWrapperProps {
  children: React.ReactNode;
  headerProps?: AppHeaderProps;
  scrollable?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  backgroundColor?: string;
  statusBarStyle?: 'light' | 'dark' | 'auto';
  disableContentPadding?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  headerProps,
  scrollable = false,
  onRefresh,
  isRefreshing = false,
  style,
  contentContainerStyle,
  edges = ['left', 'right'],
  backgroundColor = colors.background,
  statusBarStyle = 'dark',
  disableContentPadding = false,
}) => {
  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor }, style]}>
      <StatusBar style={statusBarStyle} />

      {headerProps ? <AppHeader {...headerProps} /> : null}

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              disableContentPadding && styles.noPadding,
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.gold[500]}
                  colors={[colors.gold[500]]}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.fixedContent,
              disableContentPadding && styles.noPadding,
              contentContainerStyle,
            ]}
          >
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
    flexGrow: 1,
  },
  fixedContent: {
    flex: 1,
    padding: layout.screenPadding,
  },
  noPadding: {
    padding: 0,
  },
});
