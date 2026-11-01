import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { AppCard } from '../../components/ui/AppCard';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';
import { spacing, typography } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, requestOtp, isLoading } = useAuth();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  const handleRequestOtp = async () => {
    setError(null);
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    if (cleanedNumber.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    try {
      await requestOtp(cleanedNumber);
      setStep('otp');
      setCountdown(30);
      setOtp('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to connect. Check your internet connection and try again.');
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    const cleanedOtp = otp.replace(/\D/g, '');

    if (cleanedOtp.length !== 6) {
      setError('That OTP is incorrect. Please try again.');
      return;
    }

    try {
      await login({ identifier: phoneNumber.replace(/\D/g, ''), otp: cleanedOtp });
      router.replace('/(customer)');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'That OTP is incorrect. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleRequestOtp();
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.brandHeader}>
        <BrandLogo size="md" variant="onLight" showSubtitle />
      </View>

      <AppCard style={styles.formCard} variant="elevated">
        {step === 'phone' ? (
          <>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formInstructions}>
              Access your SP Solar Solutions service account
            </Text>

            <AppInput
              label="Mobile Number"
              placeholder="98765 43210"
              value={phoneNumber}
              onChangeText={(text) => {
                setError(null);
                // Allow only numbers and spaces
                const formatted = text.replace(/[^\d ]/g, '');
                setPhoneNumber(formatted);
              }}
              keyboardType="number-pad"
              maxLength={12} // Allow space
              leftIcon={
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCodeText}>+91</Text>
                  <View style={styles.countryCodeDivider} />
                </View>
              }
              error={error || undefined}
            />

            <AppButton
              title="Get OTP"
              variant="primary"
              size="lg"
              onPress={handleRequestOtp}
              isLoading={isLoading}
              style={styles.submitButton}
            />
          </>
        ) : (
          <>
            <Text style={styles.formTitle}>Verify Your Number</Text>
            <Text style={styles.formInstructions}>
              Enter the 6-digit OTP sent to your mobile number
            </Text>

            <AppInput
              label="Six-digit OTP"
              placeholder="••••••"
              value={otp}
              onChangeText={(text) => {
                setError(null);
                setOtp(text.replace(/\D/g, ''));
                if (text.length === 6) {
                  // Optionally auto-submit, but keeping it explicit via button is fine
                }
              }}
              keyboardType="number-pad"
              maxLength={6}
              error={error || undefined}
              style={styles.otpInput}
            />

            <AppButton
              title="Verify & Continue"
              variant="primary"
              size="lg"
              onPress={handleVerifyOtp}
              isLoading={isLoading}
              style={styles.submitButton}
            />

            <View style={styles.resendContainer}>
              <TouchableOpacity 
                onPress={handleResendOtp} 
                disabled={countdown > 0 || isLoading}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.resendText,
                  (countdown > 0 || isLoading) && styles.resendTextDisabled
                ]}>
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </AppCard>

      <View style={styles.supportContainer}>
        <Text style={styles.supportText}>Need help?</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.supportLink}>Contact SP Solar Solutions</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    flexGrow: 1,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  formCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontSize: typography.headingLarge.fontSize,
    fontWeight: typography.headingLarge.fontWeight as any,
    color: colors.primary.navy,
    marginBottom: spacing.xs,
  },
  formInstructions: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.xl,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.sm,
  },
  countryCodeText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    fontWeight: '500',
  },
  countryCodeDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border.light,
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  otpInput: {
    letterSpacing: 8,
    textAlign: 'center',
    fontSize: typography.headingLarge.fontSize,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendText: {
    fontSize: typography.bodyMedium.fontSize,
    color: colors.primary.navy,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: colors.text.muted,
  },
  supportContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  supportText: {
    fontSize: typography.bodyMedium.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  supportLink: {
    fontSize: typography.bodyMedium.fontSize,
    color: colors.primary.gold,
    fontWeight: '600',
  },
});
