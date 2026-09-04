import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Animated, Platform } from 'react-native';
import Theme from '../theme';
import { useGlobalState } from '../services/GlobalStateContext';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'details';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card' }) => {
  const { colors, isDarkMode } = useGlobalState();
  const [opacityAnim] = useState(() => new Animated.Value(0.35));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        })
      ])
    ).start();
  }, [opacityAnim]);

  const skeletonColor = isDarkMode ? colors.border : colors.surfaceDark;

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      {type === 'card' && (
        <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.imagePlaceholder, { backgroundColor: skeletonColor }]} />
          <View style={styles.textBlock}>
            <View style={[styles.textLineLong, { backgroundColor: skeletonColor }]} />
            <View style={[styles.textLineShort, { backgroundColor: skeletonColor }]} />
          </View>
        </View>
      )}

      {type === 'list' && (
        <View style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: skeletonColor }]} />
          <View style={styles.listTextCol}>
            <View style={[styles.textLineLong, { backgroundColor: skeletonColor }]} />
            <View style={[styles.textLineShort, { backgroundColor: skeletonColor }]} />
          </View>
          <View style={[styles.miniBtnPlaceholder, { backgroundColor: skeletonColor }]} />
        </View>
      )}

      {type === 'details' && (
        <View style={styles.detailContainer}>
          <View style={[styles.largeImgPlaceholder, { backgroundColor: skeletonColor }]} />
          <View style={[styles.titlePlaceholder, { backgroundColor: skeletonColor }]} />
          <View style={styles.detailsChecklist}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.checkLineRow}>
                <View style={[styles.checkSquare, { backgroundColor: skeletonColor }]} />
                <View style={[styles.checkTextLine, { backgroundColor: skeletonColor }]} />
              </View>
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: Theme.spacing.xs,
  },
  cardContainer: {
    borderWidth: 1,
    borderRadius: Theme.roundness.lg,
    overflow: 'hidden',
    padding: Theme.spacing.sm + 2,
  },
  imagePlaceholder: {
    height: 140,
    width: '100%',
    borderRadius: Theme.roundness.md,
    marginBottom: Theme.spacing.sm,
  },
  textBlock: {
    paddingHorizontal: 2,
  },
  textLineLong: {
    height: 16,
    width: '80%',
    borderRadius: Theme.roundness.xs,
    marginBottom: Theme.spacing.xs + 2,
  },
  textLineShort: {
    height: 12,
    width: '50%',
    borderRadius: Theme.roundness.xs,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Theme.roundness.lg,
    padding: Theme.spacing.sm + 2,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Theme.roundness.sm,
    marginRight: Theme.spacing.md,
  },
  listTextCol: {
    flex: 1,
  },
  miniBtnPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  detailContainer: {
    padding: Theme.spacing.md,
  },
  largeImgPlaceholder: {
    height: 200,
    width: '100%',
    borderRadius: Theme.roundness.xl,
    marginBottom: Theme.spacing.md,
  },
  titlePlaceholder: {
    height: 28,
    width: '65%',
    borderRadius: Theme.roundness.xs,
    marginBottom: Theme.spacing.lg,
  },
  detailsChecklist: {
    marginTop: Theme.spacing.sm,
  },
  checkLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  checkSquare: {
    width: 20,
    height: 20,
    borderRadius: Theme.roundness.xs,
    marginRight: Theme.spacing.sm,
  },
  checkTextLine: {
    height: 14,
    width: '75%',
    borderRadius: Theme.roundness.xs,
  },
});

export default SkeletonLoader;
