import React from 'react';
import { StyleSheet, View, Pressable, ViewStyle, StyleProp } from 'react-native';
import Theme from '../theme';

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
  const cardStyle = [
    styles.card,
    border && styles.border,
    elevation !== 'none' && Theme.shadows[elevation],
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
        ]}
        accessibilityRole={accessibilityRole}
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
    backgroundColor: Theme.colors.cardBg,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md,
    overflow: 'hidden',
  },
  border: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

export default Card;
