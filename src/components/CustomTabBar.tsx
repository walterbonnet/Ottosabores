import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../theme';
import { useGlobalState } from '../services/GlobalStateContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = 85;

export const CustomTabBar: React.FC<any> = ({
  state,
  descriptors,
  navigation,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { colors, isDarkMode } = useGlobalState();

  // Auto-scroll to center the active tab
  useEffect(() => {
    const activeIndex = state.index;
    const targetX = activeIndex * TAB_WIDTH - SCREEN_WIDTH / 2 + TAB_WIDTH / 2;
    
    // Wrap in a tiny timeout to ensure Layout is completed
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: Math.max(0, targetX),
        animated: true,
      });
    }, 100);
  }, [state.index]);

  const getTabDetails = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return { label: 'Inicio', icon: 'home' as const };
      case 'fiestas':
        return { label: 'Fiestas', icon: 'sparkles' as const };
      case 'mapa':
        return { label: 'Mapa', icon: 'map' as const };
      case 'recetas':
        return { label: 'Recetas', icon: 'restaurant' as const };
      case 'multimedia':
        return { label: 'Multimedia', icon: 'musical-notes' as const };
      case 'trivia':
        return { label: 'Trivia', icon: 'trophy' as const };
      case 'saboresar':
        return { label: 'Sabores AR', icon: 'qr-code' as const };
      case 'perfil':
        return { label: 'Perfil', icon: 'person' as const };
      default:
        return { label: routeName, icon: 'help-circle' as const };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'rgba(41, 37, 36, 0.98)' : 'rgba(255, 253, 249, 0.98)', borderColor: colors.border }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={TAB_WIDTH}
        decelerationRate="fast"
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const { label, icon } = getTabDetails(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const activeColor = colors.primary;
          const inactiveColor = colors.textSecondary;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabButton}
            >
              <View style={[styles.iconWrapper, isFocused && styles.activeIconWrapper, isFocused && { backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.16)' : 'rgba(200, 92, 56, 0.08)' }]}>
                <Ionicons
                  name={isFocused ? icon : (`${icon}-outline` as any)}
                  size={22}
                  color={isFocused ? colors.primary : inactiveColor}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.primary : inactiveColor },
                  isFocused && styles.activeTabLabel,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
              {isFocused && <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 12,
    right: 12,
    height: 72,
    borderRadius: Theme.roundness.xl,
    borderWidth: 1.5,
    ...Theme.shadows.md,
    overflow: 'hidden',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
  },
  tabButton: {
    width: TAB_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
    position: 'relative',
  },
  iconWrapper: {
    padding: Theme.spacing.xs,
    borderRadius: Theme.roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(200, 92, 56, 0.08)',
  },
  tabLabel: {
    fontSize: Theme.typography.sizes.xs - 1,
    fontWeight: Theme.typography.weights.medium,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  activeTabLabel: {
    fontWeight: Theme.typography.weights.bold,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 24,
    height: 3,
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.roundness.round,
  },
});

export default CustomTabBar;
