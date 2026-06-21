import React from 'react';
import { Tabs, usePathname } from 'expo-router';
import { View, Text, Pressable, Image, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomTabBar from '../components/CustomTabBar';
import { GlobalStateProvider, useGlobalState } from '../services/GlobalStateContext';
import Theme from '../theme';

function FloatingGlobalPlayer() {
  const { currentAudio, isPlaying, audioProgress, pauseAudio, resumeAudio, stopAudio } = useGlobalState();
  const pathname = usePathname();

  if (!currentAudio || pathname?.includes('multimedia') || pathname?.includes('saboresar')) return null;

  return (
    <View style={styles.playerContainer}>
      {/* Sleek top progress bar indicator */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${audioProgress * 100}%` }]} />
      </View>

      <View style={styles.playerBody}>
        <Image source={{ uri: currentAudio.image }} style={styles.playerThumbnail} />
        <View style={styles.playerDetails}>
          <Text style={styles.playerTitle} numberOfLines={1}>
            {currentAudio.title}
          </Text>
          <Text style={styles.playerArtist} numberOfLines={1}>
            {currentAudio.artist}
          </Text>
        </View>

        <View style={styles.controlsRow}>
          <Pressable
            onPress={isPlaying ? pauseAudio : resumeAudio}
            style={styles.controlBtn}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color={Theme.colors.primary}
            />
          </Pressable>
          
          <Pressable
            onPress={stopAudio}
            style={[styles.controlBtn, styles.closeBtn]}
          >
            <Ionicons name="close" size={18} color={Theme.colors.textSecondary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function AppLayoutContent() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true, // Keep tab bar hidden when keyboard is open
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="fiestas" />
        <Tabs.Screen name="mapa" />
        <Tabs.Screen name="recetas" />
        <Tabs.Screen name="multimedia" />
        <Tabs.Screen name="trivia" />
        <Tabs.Screen name="saboresar" />
        <Tabs.Screen name="perfil" />
      </Tabs>
      
      {/* Floating Global Audio Player overlay above TabBar */}
      <FloatingGlobalPlayer />
    </View>
  );
}

export default function AppLayout() {
  return (
    <GlobalStateProvider>
      <AppLayoutContent />
    </GlobalStateProvider>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 104 : 96,
    left: 12,
    right: 12,
    height: 58,
    backgroundColor: 'rgba(255, 253, 249, 0.96)',
    borderRadius: Theme.roundness.md,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 226, 213, 0.9)',
    overflow: 'hidden',
    ...Theme.shadows.md,
    zIndex: 999,
  },
  progressBarBg: {
    width: '100%',
    height: 3.5,
    backgroundColor: 'rgba(232, 226, 213, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  playerBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm + 4,
    paddingTop: 3.5, // leave room for progress bar
  },
  playerThumbnail: {
    width: 38,
    height: 38,
    borderRadius: Theme.roundness.xs,
    backgroundColor: Theme.colors.surfaceDark,
  },
  playerDetails: {
    flex: 1,
    marginLeft: Theme.spacing.sm + 2,
    justifyContent: 'center',
  },
  playerTitle: {
    fontSize: Theme.typography.sizes.sm - 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  playerArtist: {
    fontSize: 10.5,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(200, 92, 56, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.sm,
  },
  closeBtn: {
    backgroundColor: 'transparent',
  },
});
