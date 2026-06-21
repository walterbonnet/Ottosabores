import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Platform } from 'react-native';
import Theme from '../theme';
import { useGlobalState } from '../services/GlobalStateContext';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'details';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card' }) => {
  const { colors } = useGlobalState();
  const [opacityAnim] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: Platform.OS !== 'web',
        })
      ])
    ).start();
  }, [opacityAnim]);

  const skeletonColor = colors.surfaceDark;

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
    borderWidth: 1.5,
    borderRadius: Theme.roundness.md,
    overflow: 'hidden',
    padding: Theme.spacing.sm,
  },
  imagePlaceholder: {
    height: 120,
    width: '100%',
    borderRadius: Theme.roundness.sm,
    marginBottom: Theme.spacing.sm,
  },
  textBlock: {
    paddingHorizontal: 2,
  },
  textLineLong: {
    height: 14,
    width: '80%',
    borderRadius: 3,
    marginBottom: Theme.spacing.xs + 2,
  },
  textLineShort: {
    height: 10,
    width: '50%',
    borderRadius: 3,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.sm,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginRight: Theme.spacing.md,
  },
  listTextCol: {
    flex: 1,
  },
  miniBtnPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  detailContainer: {
    padding: Theme.spacing.md,
  },
  largeImgPlaceholder: {
    height: 180,
    width: '100%',
    borderRadius: Theme.roundness.lg,
    marginBottom: Theme.spacing.md,
  },
  titlePlaceholder: {
    height: 24,
    width: '60%',
    borderRadius: 4,
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
    width: 18,
    height: 18,
    borderRadius: 3,
    marginRight: Theme.spacing.sm,
  },
  checkTextLine: {
    height: 12,
    width: '70%',
    borderRadius: 3,
  },
});

export default SkeletonLoader;
