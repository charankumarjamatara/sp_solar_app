import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { borderRadius, layout, spacing, typography } from '../../constants/theme';

export interface SelectOption<T = string> {
  id?: string;
  label: string;
  value: T;
  description?: string;
}

export interface SelectInputProps<T = string> {
  label?: string;
  placeholder?: string;
  options: SelectOption<T>[];
  value?: T;
  selectedId?: string;
  onSelect: (value: T, option?: SelectOption<T>) => void;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export const SelectInput = <T extends string = string>({
  label,
  placeholder = 'Select an option',
  options,
  value,
  selectedId,
  onSelect,
  error,
  disabled = false,
  containerStyle,
}: SelectInputProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(selectedId);

  const effectiveSelectedId = selectedId !== undefined ? selectedId : internalSelectedId;

  const selectedOption = value === undefined
    ? undefined
    : effectiveSelectedId
      ? (options.find(opt => opt.id === effectiveSelectedId && opt.value === value) ||
         options.find(opt => opt.id === effectiveSelectedId) ||
         options.find(opt => opt.value === value))
      : options.find(opt => opt.value === value);

  const handleSelect = (option: SelectOption<T>) => {
    setInternalSelectedId(option.id);
    onSelect(option.value, option);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        onPress={() => setIsOpen(true)}
        style={[
          styles.selector,
          Boolean(error) && styles.errorSelector,
          disabled && styles.disabledSelector,
        ]}
      >
        <Text
          style={[styles.valueText, !selectedOption && styles.placeholderText]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={item => item.id || `${String(item.value)}_${item.label}`}
              renderItem={({ item }) => {
                const isSelected = selectedOption
                  ? (item.id && selectedOption.id ? item.id === selectedOption.id : item.value === selectedOption.value)
                  : false;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.selectedOption]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.selectedOptionLabel,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.description ? (
                        <Text style={styles.optionDescription}>{item.description}</Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark" size={20} color={colors.gold[600]} />
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

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
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: borderRadius.medium,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
  },
  errorSelector: {
    borderColor: colors.feedback.error,
  },
  disabledSelector: {
    backgroundColor: colors.surfaceDisabled,
    opacity: 0.7,
  },
  valueText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: colors.text.muted,
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    color: colors.feedback.error,
    marginTop: spacing.xxs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    maxHeight: 480,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  modalTitle: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    color: colors.text.primary,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  selectedOption: {
    backgroundColor: colors.gold[50],
  },
  optionContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  optionLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text.primary,
  },
  selectedOptionLabel: {
    color: colors.navy[900],
    fontWeight: typography.button.fontWeight,
  },
  optionDescription: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
