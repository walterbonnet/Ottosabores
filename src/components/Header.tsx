import React from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../theme';
import { useGlobalState } from '../services/GlobalStateContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showDivider?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showDivider = true,
}) => {
  const { colors, isDarkMode, toggleDarkMode } = useGlobalState();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.headerTopRow}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
        <Pressable 
          onPress={toggleDarkMode} 
          style={({ pressed }) => [
            styles.toggleBtn,
            { backgroundColor: isDarkMode ? 'rgba(214, 104, 67, 0.16)' : 'rgba(200, 92, 56, 0.08)' },
            pressed && styles.pressed,
            Platform.OS === 'web' && (styles as any).webHover,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <Ionicons 
            name={isDarkMode ? "sunny" : "moon"} 
            size={20} 
            color={colors.primary} 
          />
        </Pressable>
      </View>
      {showDivider && (
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerPrimary, { backgroundColor: colors.primary }]} />
          <View style={[styles.dividerAccent, { backgroundColor: colors.accent }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Theme.spacing.lg + 4,
    paddingBottom: Theme.spacing.sm + 4,
    paddingHorizontal: Theme.spacing.md,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  toggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  title: {
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.bold,
    letterSpacing: Theme.typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    marginTop: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    height: 3,
    marginTop: Theme.spacing.sm + 2,
    borderRadius: Theme.roundness.xs,
    overflow: 'hidden',
  },
  dividerPrimary: {
    flex: 3,
  },
  dividerAccent: {
    flex: 1,
  },
  ...(Platform.OS === 'web' ? {
    webHover: {
      cursor: 'pointer',
    }
  } : {})
});

export default Header;
