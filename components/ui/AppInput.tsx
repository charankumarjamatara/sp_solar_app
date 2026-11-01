import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, typography, layout } from '../../constants/theme';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  isPassword?: boolean;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  isPassword = false,
  secureTextEntry,
  editable = true,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          Boolean(error) && styles.errorInput,
          !editable && styles.disabledInput,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}

        <TextInput
          style={[styles.textInput, inputStyle]}
          placeholderTextColor={colors.text.muted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          editable={editable}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.rightIconWrapper}
            onPress={() => setShowPassword(prev => !prev)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconWrapper}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

// Also export alias `Input`
export const Input = AppInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.xs - 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: borderRadius.medium,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
  },
  focusedInput: {
    borderColor: colors.gold[500],
    backgroundColor: colors.surface,
  },
  errorInput: {
    borderColor: colors.feedback.error,
  },
  disabledInput: {
    backgroundColor: colors.surfaceDisabled,
    opacity: 0.7,
  },
  textInput: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  leftIconWrapper: {
    marginRight: spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: spacing.sm,
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    color: colors.feedback.error,
    marginTop: spacing.xxs,
  },
  helperText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.muted,
    marginTop: spacing.xxs,
  },
});
