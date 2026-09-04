import React from 'react';
import { StyleSheet, View, Pressable, ViewStyle, StyleProp, Platform } from 'react-native';
import Theme from '../theme';
import { useGlobalState } from '../services/GlobalStateContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  accessibilityRole?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 'sm',
  border = true,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}) => {
  const { colors, isDarkMode } = useGlobalState();

  const cardStyle = [
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.border },
    border && styles.border,
    elevation !== 'none' && !isDarkMode && Theme.shadows[elevation],
    isDarkMode && styles.darkBorderHighlight,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
          Platform.OS === 'web' && (styles as any).webHover,
        ]}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View 
      style={cardStyle}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Theme.roundness.lg,
    padding: Theme.spacing.md,
    overflow: 'hidden',
  },
  border: {
    borderWidth: 1,
  },
  darkBorderHighlight: {
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  ...(Platform.OS === 'web' ? {
    webHover: {
      cursor: 'pointer',
      transitionDuration: '200ms',
    }
  } : {})
});

export default Card;
