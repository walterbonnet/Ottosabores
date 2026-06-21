import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  Modal,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import { MULTIMEDIA_ITEMS, FESTIVALS, RECIPES } from '../services/mockData';
import { Festival, Recipe } from '../types';
import { useGlobalState } from '../services/GlobalStateContext';
import SkeletonLoader from '../components/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_VIDEOS = [
  {
    id: 'v1',
    title: 'Clase Magistral: Cómo trenzar el Chicharrón',
    duration: '05:32',
    instructor: 'Don Sosa de San Luis del Palmar',
    thumbnail: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=500&auto=format&fit=crop&q=70',
    description: 'Aprende el arte ancestral de trenzar la carne de falda con grasa vacuna y rebozarla con gofio correntino para cocinarla al fuego.',
    festivalRelacionado: '3'
  },
  {
    id: 'v2',
    title: 'Cocción del Chipá Mbocá a las brasas',
    duration: '03:45',
    instructor: 'Abuela Cata de San Cosme',
    thumbnail: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=70',
    description: 'El secreto de envolver la masa del chipá en una caña tacuara y dorarlo lentamente al calor del espinillo.',
    festivalRelacionado: '1'
  },
  {
    id: 'v3',
    title: 'Elaboración del Mbaipy de Maíz Criollo',
    duration: '08:12',
    instructor: 'Panchi Quevedo (Cocinero de Estero)',
    thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop&q=70',
    description: 'Paso a paso de la polenta guaraní original, utilizando maíz colorado molido a mano en mortero de madera.',
    festivalRelacionado: '2'
  }
];

const MOCK_PHOTOS = [
  { id: 'f1', title: 'Esteros del Iberá al amanecer', url: 'https://images.unsplash.com/photo-1542362567-b07eac79094f?w=600&auto=format&fit=crop&q=70' },
  { id: 'f2', title: 'Fuego lento en olla de hierro', url: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&auto=format&fit=crop&q=70' },
  { id: 'f3', title: 'Amasado de chipá casero', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=70' },
  { id: 'f4', title: 'Pescados del Paraná listos para asar', url: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&auto=format&fit=crop&q=70' },
  { id: 'f5', title: 'Mandioca fresca recién cosechada', url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=70' },
  { id: 'f6', title: 'Frutos dorados del mamón', url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=70' }
];

const getGrandmaTip = (recipeId: string): string => {
  switch (recipeId) {
    case 'r1':
      return 'El gran secreto de las abuelas correntinas es agregar una cucharada de jugo de naranja natural al amasar. Esto ayuda a que el chipá quede esponjoso.';
    case 'r2':
      return 'Revolver siempre en sentido de las agujas del reloj y usando una cuchara de madera de espinillo para que no se corte la textura.';
    case 'r3':
      return 'Para el guiso, agrega un chorrito de jugo de limón al apagar el fuego. Realza los sabores de la carne and el arroz de manera espectacular.';
    case 'r4':
      return 'Servilo siempre bien frío del refrigerador con una rodaja gruesa de queso de campo correntino (queso criollo).';
    case 'r5':
      return 'Humedecer la carne constantemente con salmuera de romero y ajo para que conserve su jugosidad en la estaca.';
    case 'r6':
      return 'Pinchá varias veces con un tenedor el chipá cuerito antes de tirarlo al aceite hirviendo para que no se infle desparejo.';
    default:
      return 'Cocinar siempre con leña o fuego de carbón vegetal para conservar el aroma tradicional del litoral.';
  }
};

export const MultimediaScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audios' | 'videos' | 'fotos'>('audios');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    favorites,
    toggleFavorite,
    recipeProgress,
    updateIngredientProgress,
    updateStepProgress,
    addRecentlyViewed,
    currentAudio,
    isPlaying,
    audioProgress,
    currentTimeStr,
    durationStr,
    waveHeights,
    playAudio,
    pauseAudio,
    resumeAudio,
    seekAudio,
    skipForward,
    skipBackward,
    markAudioPlayed,
    colors,
    isDarkMode
  } = useGlobalState();

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsLoading(true);
    }, 0);
    const timer2 = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeTab]);

  const activeAudio = currentAudio || MULTIMEDIA_ITEMS[0];

  // Video Player Modal State
  const [selectedVideo, setSelectedVideo] = useState<typeof MOCK_VIDEOS[0] | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [videoTimeStr, setVideoTimeStr] = useState<string>('0:00');
  const [videoProgressBarWidth, setVideoProgressBarWidth] = useState<number>(200);
  const [progressBarWidth, setProgressBarWidth] = useState<number>(300);

  // Photo Lightbox Modal State
  const [selectedPhoto, setSelectedPhoto] = useState<typeof MOCK_PHOTOS[0] | null>(null);

  // Linked Fiestas and Recipes details states
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<number>(0);
  const [isPlayingFestivalVideo, setIsPlayingFestivalVideo] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const relatedRecipe = selectedFestival ? RECIPES.find(r => r.id === selectedFestival.recetaRelacionada) : undefined;

  // Helper for duration strings
  const getDurationInSeconds = (durationStr: string) => {
    const parts = durationStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  const formatSecondsStr = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = Math.floor(totalSecs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Video progress bar simulation
  useEffect(() => {
    let interval: any;
    if (selectedVideo && isVideoPlaying) {
      const durationSecs = getDurationInSeconds(selectedVideo.duration);
      let currentSecs = Math.floor(videoProgress * durationSecs);
      
      interval = setInterval(() => {
        currentSecs += 1;
        if (currentSecs >= durationSecs) {
          currentSecs = 0;
          setIsVideoPlaying(false);
        }
        setVideoProgress(currentSecs / durationSecs);
        setVideoTimeStr(formatSecondsStr(currentSecs));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [selectedVideo, isVideoPlaying, videoProgress]);

  const triggerPlayVideo = (video: typeof MOCK_VIDEOS[0]) => {
    setSelectedVideo(video);
    setIsVideoPlaying(true);
    setVideoProgress(0.0);
    setVideoTimeStr('0:00');
  };

  const handleOpenRecipe = (recipe: Recipe) => {
    addRecentlyViewed(recipe.id, 'recipe');
    setSelectedRecipe(recipe);
  };

  const handleOpenFestival = (festival: Festival) => {
    addRecentlyViewed(festival.id, 'festival');
    setSelectedFestival(festival);
    setModalActiveTab(0);
    setIsPlayingFestivalVideo(false);
  };

  const handleProgressPress = (event: any) => {
    const width = progressBarWidth || 300;
    const clickX = event.nativeEvent.locationX;
    const progress = Math.max(0, Math.min(1, clickX / width));
    seekAudio(progress);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Galería Multimedia" 
        subtitle="Videos, audios y postales con identidad litoraleña" 
        showDivider={true}
      />

      {/* Segmented Controller Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(['audios', 'videos', 'fotos'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && [styles.tabButtonActive, { borderBottomColor: colors.primary }]
            ]}
          >
            <Ionicons 
              name={tab === 'audios' ? 'musical-notes' : tab === 'videos' ? 'play-circle' : 'images'} 
              size={18} 
              color={activeTab === tab ? colors.primary : colors.textSecondary} 
              style={{ marginRight: 6 }}
            />
            <Text style={[
              styles.tabButtonText, 
              { color: colors.textSecondary },
              activeTab === tab && [styles.tabButtonTextActive, { color: colors.primary }]
            ]}>
              {tab === 'audios' ? 'Audios' : tab === 'videos' ? 'Videos' : 'Fotos'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          activeTab === 'audios' ? { paddingBottom: 220 } : { paddingBottom: 110 }
        ]}
      >
        {isLoading ? (
          <View style={{ padding: Theme.spacing.md }}>
            {activeTab === 'audios' && (
              <>
                <SkeletonLoader type="list" />
                <SkeletonLoader type="list" />
                <SkeletonLoader type="list" />
                <SkeletonLoader type="list" />
              </>
            )}
            {activeTab === 'videos' && (
              <>
                <SkeletonLoader type="card" />
                <SkeletonLoader type="card" />
              </>
            )}
            {activeTab === 'fotos' && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <View style={{ width: '48%' }}><SkeletonLoader type="card" /></View>
                <View style={{ width: '48%' }}><SkeletonLoader type="card" /></View>
                <View style={{ width: '48%' }}><SkeletonLoader type="card" /></View>
                <View style={{ width: '48%' }}><SkeletonLoader type="card" /></View>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* 1. AUDIOS SECTION */}
            {activeTab === 'audios' && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Relatos de Cocineros</Text>
                {MULTIMEDIA_ITEMS.map((item) => {
                  const isCurrent = activeAudio.id === item.id;
                  const isItemPlaying = isCurrent && isPlaying;
                  return (
                    <Card
                      key={item.id}
                      style={[
                        styles.audioItemCard, 
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        isCurrent && [styles.audioItemCardActive, { borderColor: colors.primary, backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.12)' : 'rgba(200, 92, 56, 0.04)' }]
                      ]}
                      elevation="sm"
                      border={true}
                      onPress={() => {
                        playAudio(item);
                        markAudioPlayed(item.id);
                      }}
                    >
                      <View style={styles.audioRow}>
                        <View style={styles.audioImageContainer}>
                          <Image source={{ uri: item.image }} style={styles.audioImage} />
                          {isItemPlaying && (
                            <View style={styles.playingIndicatorMask}>
                              <Ionicons name="volume-medium" size={20} color={colors.white} />
                            </View>
                          )}
                        </View>
                        <View style={styles.audioDetails}>
                          <Text style={[styles.audioCategory, { color: colors.primary }]}>{item.type === 'podcast' ? 'Podcast' : 'Relato'}</Text>
                          <Text style={[styles.audioCardTitle, { color: colors.text }, isCurrent && { color: colors.primary }]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={[styles.audioArtist, { color: colors.textSecondary }]}>{item.artist}</Text>
                        </View>
                        {isItemPlaying ? (
                          <View style={styles.listWaveform}>
                            {waveHeights.slice(0, 6).map((h, i) => (
                              <View 
                                key={i} 
                                style={[styles.listWaveBar, { backgroundColor: colors.primary, height: h * 0.5 }]} 
                              />
                            ))}
                          </View>
                        ) : (
                          <Text style={[styles.audioTime, { color: colors.textSecondary }]}>{item.duration}</Text>
                        )}
                      </View>
                    </Card>
                  );
                })}
              </View>
            )}

            {/* 2. VIDEOS SECTION */}
            {activeTab === 'videos' && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Clases de Cocina en Video</Text>
                {MOCK_VIDEOS.map((video) => (
                  <Card
                    key={video.id}
                    style={[styles.videoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    elevation="sm"
                    border={true}
                    onPress={() => triggerPlayVideo(video)}
                  >
                    <View style={styles.videoThumbnailContainer}>
                      <Image source={{ uri: video.thumbnail }} style={styles.videoImage} />
                      <View style={styles.videoCardPlayOverlay}>
                        <View style={[styles.videoMiniPlayCircle, { backgroundColor: colors.primary }]}>
                          <Ionicons name="play" size={20} color={colors.white} style={{ marginLeft: 2 }} />
                        </View>
                      </View>
                      <View style={styles.videoDurationBadge}>
                        <Text style={styles.videoDurationText}>{video.duration}</Text>
                      </View>
                    </View>
                    <View style={styles.videoTextBody}>
                      <Text style={[styles.videoCardInstructor, { color: colors.primary }]}>Con {video.instructor}</Text>
                      <Text style={[styles.videoCardTitle, { color: colors.text }]}>{video.title}</Text>
                      <Text style={[styles.videoCardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{video.description}</Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* 3. FOTOS SECTION */}
            {activeTab === 'fotos' && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Postales de Nuestra Tierra</Text>
                <View style={styles.photosGrid}>
                  {MOCK_PHOTOS.map((photo) => (
                    <Pressable
                      key={photo.id}
                      onPress={() => setSelectedPhoto(photo)}
                      style={[styles.photoGridItem, { borderColor: colors.border }]}
                    >
                      <Image source={{ uri: photo.url }} style={styles.gridImage} />
                      <View style={styles.photoLabelOverlay}>
                        <Text style={styles.photoLabelText} numberOfLines={1}>{photo.title}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Audio Controller (Only visible when audios tab is active or a song is playing) */}
      {activeTab === 'audios' && (
        <View style={[styles.floatingAudioPlayer, { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 }]}>
          <View style={styles.playerLayout}>
            <Image source={{ uri: activeAudio.image }} style={styles.playerImage} />
            <View style={styles.playerMeta}>
              <Text style={[styles.playerTitle, { color: colors.text }]} numberOfLines={1}>{activeAudio.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <Text style={[styles.playerArtist, { color: colors.textSecondary }]} numberOfLines={1}>{activeAudio.artist}</Text>
                {activeAudio.festivalRelacionado && (() => {
                  const linkedFest = FESTIVALS.find(f => f.id === activeAudio.festivalRelacionado);
                  if (!linkedFest) return null;
                  return (
                    <Pressable 
                      onPress={() => handleOpenFestival(linkedFest)}
                      style={styles.playerLink}
                    >
                      <Ionicons name="sparkles" size={9} color={colors.primary} style={{ marginRight: 2 }} />
                      <Text style={[styles.playerLinkText, { color: colors.primary }]} numberOfLines={1}>{linkedFest.nombre}</Text>
                    </Pressable>
                  );
                })()}
              </View>
            </View>
            
            {/* Custom Soundwave */}
            <View style={styles.playerWaveform}>
              {waveHeights.map((h, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.playerWaveBar, 
                    { height: h, backgroundColor: colors.primary },
                    isPlaying ? styles.playerWaveBarActive : [styles.playerWaveBarIdle, { backgroundColor: colors.textSecondary }]
                  ]} 
                />
              ))}
            </View>
          </View>

          {/* Progress Slider */}
          <Pressable onPress={handleProgressPress} style={styles.playerProgressRow}>
            <Pressable 
              onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
              style={[styles.playerProgressOuter, { backgroundColor: colors.border }]}
            >
              <View style={[styles.playerProgressInner, { backgroundColor: colors.primary, width: `${audioProgress * 100}%` }]} />
              <View style={[styles.playerProgressThumb, { backgroundColor: colors.primary, left: `${audioProgress * 100}%` }]} />
            </Pressable>
            <View style={styles.playerTimeLabels}>
              <Text style={[styles.playerTimeText, { color: colors.textSecondary }]}>{currentTimeStr}</Text>
              <Text style={[styles.playerTimeText, { color: colors.textSecondary }]}>{durationStr}</Text>
            </View>
          </Pressable>

          {/* Playback Controls */}
          <View style={styles.playerControlsRow}>
            <Pressable onPress={skipBackward} style={styles.playerBtn}>
              <Ionicons name="play-back" size={22} color={colors.text} />
            </Pressable>
            <Pressable onPress={isPlaying ? pauseAudio : resumeAudio} style={[styles.playerPlayCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={26} color={colors.white} style={!isPlaying ? { marginLeft: 3 } : null} />
            </Pressable>
            <Pressable onPress={skipForward} style={styles.playerBtn}>
              <Ionicons name="play-forward" size={22} color={colors.text} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Video Mock Player Modal */}
      {selectedVideo && (
        <Modal
          visible={!!selectedVideo}
          transparent={true}
          animationType="fade"
          onRequestClose={() => { setSelectedVideo(null); setIsVideoPlaying(false); }}
        >
          <View style={styles.videoPlayerModalOverlay}>
            <View style={[styles.videoPlayerModalContent, { backgroundColor: colors.background }]}>
              <View style={[styles.videoPlayerModalHeader, { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <Text style={[styles.videoPlayerModalTitle, { color: colors.primary }]} numberOfLines={1}>{selectedVideo.title}</Text>
                <Pressable onPress={() => { setSelectedVideo(null); setIsVideoPlaying(false); }}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              {/* Simulated video playback area with interactive controls */}
              <View style={styles.videoCenterContainer}>
                <Pressable 
                  style={styles.videoPlaybackArea} 
                  onPress={() => setIsVideoPlaying(!isVideoPlaying)}
                >
                  <Image source={{ uri: selectedVideo.thumbnail }} style={styles.videoPlayAsset} />
                  
                  {!isVideoPlaying ? (
                    <View style={styles.videoPlayOverlayCentered}>
                      <View style={[styles.largePlayButtonCircle, { backgroundColor: colors.primary }]}>
                        <Ionicons name="play" size={44} color={colors.white} style={{ marginLeft: 6 }} />
                      </View>
                      <Text style={[styles.videoPlayInstructionText, { color: colors.white }]}>Tocar para Reproducir</Text>
                    </View>
                  ) : (
                    <View style={styles.videoControlsOverlay}>
                      <Pressable 
                        onPress={(e) => { e.stopPropagation(); setIsVideoPlaying(!isVideoPlaying); }}
                        style={styles.videoControlBtn}
                      >
                        <Ionicons name={isVideoPlaying ? "pause" : "play"} size={20} color={colors.white} />
                      </Pressable>
                      
                      <Pressable 
                        onPress={(e) => {
                          e.stopPropagation();
                          const clickX = e.nativeEvent.locationX;
                          const width = videoProgressBarWidth || 200;
                          const progress = Math.max(0, Math.min(1, clickX / width));
                          setVideoProgress(progress);
                          const durationSecs = getDurationInSeconds(selectedVideo.duration);
                          setVideoTimeStr(formatSecondsStr(progress * durationSecs));
                        }}
                        onLayout={(e) => setVideoProgressBarWidth(e.nativeEvent.layout.width)}
                        style={[styles.videoProgressTrack, { backgroundColor: 'rgba(255,255,255,0.3)' }]}
                      >
                        <View style={[styles.videoProgressFill, { backgroundColor: colors.primary, width: `${videoProgress * 100}%` }]} />
                      </Pressable>
                      
                      <Text style={[styles.videoTimeLabel, { color: colors.white }]}>
                        {videoTimeStr} / {selectedVideo.duration}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>

              <View style={[styles.videoPlayerModalFooter, { backgroundColor: colors.surface }]}>
                <Text style={[styles.videoFooterInstructor, { color: colors.primary }]}>Instructor: {selectedVideo.instructor}</Text>
                <Text style={[styles.videoFooterDesc, { color: colors.textSecondary }]}>{selectedVideo.description}</Text>
                {selectedVideo.festivalRelacionado && (() => {
                  const linkedFest = FESTIVALS.find(f => f.id === selectedVideo.festivalRelacionado);
                  if (!linkedFest) return null;
                  return (
                    <Pressable 
                      onPress={() => {
                        setSelectedVideo(null);
                        handleOpenFestival(linkedFest);
                      }}
                      style={styles.videoLinkButton}
                    >
                      <Ionicons name="sparkles-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={[styles.videoLinkButtonText, { color: colors.primary }]}>Ver Fiesta Relacionada: {linkedFest.nombre}</Text>
                    </Pressable>
                  );
                })()}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <Modal
          visible={!!selectedPhoto}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
        >
          <Pressable style={styles.lightboxOverlay} onPress={() => setSelectedPhoto(null)}>
            <View style={styles.lightboxHeader}>
              <Text style={styles.lightboxTitle} numberOfLines={1}>{selectedPhoto.title}</Text>
              <Pressable style={styles.lightboxClose} onPress={() => setSelectedPhoto(null)}>
                <Ionicons name="close" size={28} color={colors.white} />
              </Pressable>
            </View>
            <Image source={{ uri: selectedPhoto.url }} style={styles.lightboxImage} />
            <Text style={styles.lightboxHelperText}>Toca en cualquier parte para cerrar</Text>
          </Pressable>
        </Modal>
      )}

      {/* Expanded Festival Details Modal (Detalle de Fiesta) */}
      {selectedFestival && (
        <Modal
          visible={!!selectedFestival}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedFestival(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <Text style={[styles.modalHeaderTitle, { color: colors.primary }]} numberOfLines={1}>
                  {selectedFestival.nombre}
                </Text>
                <Pressable onPress={() => setSelectedFestival(null)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              {/* Segmented Modal Tabs */}
              <View style={[styles.modalTabsRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                {['General', 'Recetas', 'Media', 'Ir'].map((tabLabel, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => setModalActiveTab(idx)}
                    style={[
                      styles.modalTabButton,
                      modalActiveTab === idx && [styles.modalTabButtonActive, { borderBottomColor: colors.primary }]
                    ]}
                  >
                    <Text style={[styles.modalTabLabel, { color: colors.textSecondary }, modalActiveTab === idx && [styles.modalTabLabelActive, { color: colors.primary }]]}>
                      {tabLabel}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >
                {/* 1. GENERAL TAB */}
                {modalActiveTab === 0 && (
                  <View style={styles.tabContentBlock}>
                    <Image source={{ uri: selectedFestival.galeria[0] }} style={styles.detailImage} />
                    <View style={[styles.detailCardBody, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Historia y Tradición</Text>
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>{selectedFestival.historia}</Text>
                      
                      <View style={[styles.highlightProductBox, {
                        backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.15)' : 'rgba(200, 92, 56, 0.07)',
                        borderColor: isDarkMode ? 'rgba(200, 92, 56, 0.3)' : 'rgba(200, 92, 56, 0.2)'
                      }]}>
                        <Ionicons name="flame" size={24} color={colors.primary} />
                        <View style={styles.highlightProductInfo}>
                          <Text style={[styles.highlightProductLabel, { color: colors.primary }]}>Plato Principal Relacionado</Text>
                          <Text style={[styles.highlightProductValue, { color: colors.text }]}>
                            {relatedRecipe ? relatedRecipe.nombre : 'Platos tradicionales'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* 2. RECIPES TAB */}
                {modalActiveTab === 1 && (
                  <View style={styles.tabContentBlock}>
                    <View style={[styles.detailCardBody, { backgroundColor: colors.surface }]}>
                      {relatedRecipe ? (
                        <>
                          <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Ingredientes Típicos</Text>
                          <Text style={[styles.tabSubtitle, { color: colors.textSecondary }]}>
                            Los ingredientes esenciales de la receta tradicional de la fiesta ({relatedRecipe.nombre}):
                          </Text>
                          <View style={styles.badgeWrap}>
                            {relatedRecipe.ingredientes.map((ing, i) => (
                              <View key={i} style={[styles.detailIngredientBadge, {
                                backgroundColor: isDarkMode ? 'rgba(46, 111, 64, 0.15)' : 'rgba(46, 111, 64, 0.05)',
                                borderColor: isDarkMode ? 'rgba(46, 111, 64, 0.3)' : 'rgba(46, 111, 64, 0.2)'
                              }]}>
                                <Ionicons name="leaf" size={12} color={colors.secondary} style={{ marginRight: 4 }} />
                                <Text style={[styles.ingredientBadgeText, { color: colors.secondary }]}>{ing}</Text>
                              </View>
                            ))}
                          </View>

                          <Text style={[styles.detailSectionTitle, { marginTop: Theme.spacing.lg, color: colors.text, borderLeftColor: colors.primary }]}>
                            Receta Tradicional
                          </Text>
                          <Text style={[styles.tabSubtitle, { color: colors.textSecondary }]}>
                            Accedé a la guía interactiva paso a paso para preparar este plato típico:
                          </Text>

                          <Card style={[styles.recipeLinkCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="sm" onPress={() => handleOpenRecipe(relatedRecipe)}>
                            <Image source={{ uri: relatedRecipe.video || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600' }} style={styles.recipeLinkImage} />
                            <View style={styles.recipeLinkBody}>
                              <Text style={[styles.recipeLinkLabel, { color: colors.primary }]}>Ver Receta Completa</Text>
                              <Text style={[styles.recipeLinkTitle, { color: colors.text }]}>{relatedRecipe.nombre}</Text>
                              <Text style={[styles.recipeLinkDesc, { color: colors.textSecondary }]} numberOfLines={2}>{relatedRecipe.historia}</Text>
                              <View style={styles.recipeLinkButton}>
                                <Text style={[styles.recipeLinkButtonText, { color: colors.primary }]}>Ver Paso a Paso</Text>
                                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                              </View>
                            </View>
                          </Card>
                        </>
                      ) : (
                        <View style={styles.emptyContainer}>
                          <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
                          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay receta registrada para esta fiesta.</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* 3. MULTIMEDIA TAB */}
                {modalActiveTab === 2 && (
                  <View style={styles.tabContentBlock}>
                    <View style={[styles.detailCardBody, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Fotografías de la Edición Anterior</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                        {selectedFestival.galeria.map((img, i) => (
                          <Image key={i} source={{ uri: img }} style={styles.galleryThumbnail} />
                        ))}
                      </ScrollView>

                      <Text style={[styles.detailSectionTitle, { marginTop: Theme.spacing.lg, color: colors.text, borderLeftColor: colors.primary }]}>
                        Transmisión de Cocina en Vivo (Simulado)
                      </Text>
                      <Text style={[styles.tabSubtitle, { color: colors.textSecondary }]}>Reviví el resumen de la última edición:</Text>
                      
                      {!isPlayingFestivalVideo ? (
                        <Pressable style={styles.videoPlayerMock} onPress={() => setIsPlayingFestivalVideo(true)}>
                          <Image source={{ uri: selectedFestival.video }} style={styles.videoMockThumbnail} />
                          <View style={styles.videoPlayOverlay}>
                            <View style={[styles.playButtonCircle, { backgroundColor: colors.primary }]}>
                              <Ionicons name="play" size={32} color={colors.white} style={{ marginLeft: 4 }} />
                            </View>
                            <Text style={[styles.videoPlayText, { color: colors.white }]}>Reproducir Video Resumen</Text>
                          </View>
                        </Pressable>
                      ) : (
                        <Pressable style={styles.videoPlayingMock} onPress={() => setIsPlayingFestivalVideo(false)}>
                          <Image source={{ uri: selectedFestival.galeria[0] }} style={styles.videoMockThumbnail} />
                          <View style={styles.videoPlayingOverlay}>
                            <Ionicons name="pause" size={36} color={colors.white} />
                            <Text style={[styles.videoPlayingText, { color: colors.white }]}>Reproduciendo... (Toca para pausar)</Text>
                            
                            {/* Simulated Video Progress Bar */}
                            <View style={styles.videoProgressOuter}>
                              <View style={[styles.videoProgressInner, { backgroundColor: colors.primary }]} />
                            </View>
                          </View>
                        </Pressable>
                      )}
                    </View>
                  </View>
                )}

                {/* 4. HOW TO GET THERE TAB */}
                {modalActiveTab === 3 && (
                  <View style={styles.tabContentBlock}>
                    <View style={[styles.detailCardBody, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Cómo Llegar al Evento</Text>
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>{selectedFestival.ubicación}</Text>
                      
                      {/* Stylized Simulated Route Card */}
                      <Card style={[styles.routeMockCard, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: isDarkMode ? 1 : 0 }]} elevation="none">
                        <View style={styles.routeHeader}>
                          <Ionicons name="navigate-circle" size={32} color={colors.secondary} />
                          <View style={styles.routeHeaderInfo}>
                            <Text style={[styles.routeTitle, { color: colors.text }]}>Ruta Recomendada</Text>
                            <Text style={[styles.routeSubtitle, { color: colors.textSecondary }]}>Desde Corrientes Capital</Text>
                          </View>
                        </View>
                        <View style={[styles.routeDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.routeStepRow}>
                          <Ionicons name="car-outline" size={20} color={colors.primary} />
                          <Text style={[styles.routeStepText, { color: colors.textSecondary }]}>Vehículo particular / Autobús provincial</Text>
                        </View>
                        <View style={styles.routeStepRow}>
                          <Ionicons name="time-outline" size={20} color={colors.primary} />
                          <Text style={[styles.routeStepText, { color: colors.textSecondary }]}>Frecuencia horaria regular de viajes</Text>
                        </View>
                      </Card>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Recipe Detail Modal with Interactive Checklist nested link */}
      {selectedRecipe && (
        <Modal
          visible={!!selectedRecipe}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedRecipe(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <Text style={[styles.modalHeaderTitle, { color: colors.primary }]} numberOfLines={1}>
                  {selectedRecipe.nombre}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable 
                    onPress={() => toggleFavorite(selectedRecipe.id)} 
                    style={{ marginRight: Theme.spacing.md, padding: 4 }}
                  >
                    <Ionicons 
                      name={favorites.includes(selectedRecipe.id) ? "heart" : "heart-outline"} 
                      size={24} 
                      color={favorites.includes(selectedRecipe.id) ? colors.primary : colors.text} 
                    />
                  </Pressable>
                  <Pressable onPress={() => setSelectedRecipe(null)} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </Pressable>
                </View>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >
                <Image source={{ uri: selectedRecipe.video || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600' }} style={styles.modalImage} />
                
                <View style={[styles.modalMetaRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="time" size={18} color={colors.primary} />
                    <Text style={[styles.modalMetaValue, { color: colors.text }]}>{selectedRecipe.duración}</Text>
                    <Text style={[styles.modalMetaLabel, { color: colors.textSecondary }]}>Tiempo</Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="star" size={18} color={colors.primary} />
                    <Text style={[styles.modalMetaValue, { color: colors.text }]}>{selectedRecipe.dificultad}</Text>
                    <Text style={[styles.modalMetaLabel, { color: colors.textSecondary }]}>Dificultad</Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="restaurant" size={18} color={colors.primary} />
                    <Text style={[styles.modalMetaValue, { color: colors.text }]}>{selectedRecipe.categoría}</Text>
                    <Text style={[styles.modalMetaLabel, { color: colors.textSecondary }]}>Mesa</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                {(() => {
                  const prog = recipeProgress[selectedRecipe.id];
                  const stepsDone = prog ? prog.completedSteps.length : 0;
                  const totalSteps = selectedRecipe.preparación.length;
                  const percent = totalSteps > 0 ? Math.round((stepsDone / totalSteps) * 100) : 0;
                  return (
                    <View style={[styles.progressContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                      <View style={styles.progressTextRow}>
                        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Progreso de la receta</Text>
                        <Text style={[styles.progressPercent, { color: colors.primary }]}>{percent}%</Text>
                      </View>
                      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                        <View style={[styles.progressBar, { backgroundColor: colors.primary, width: `${percent}%` }]} />
                      </View>
                    </View>
                  );
                })()}

                {/* History Section */}
                <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Herencia Cultural</Text>
                  <Text style={[styles.modalBodyText, { color: colors.textSecondary }]}>{selectedRecipe.historia}</Text>
                </View>

                {/* Interactive Checklist Section */}
                <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Ingredientes</Text>
                  <Text style={[styles.sectionHelpText, { color: colors.textSecondary }]}>
                    Marcá los ingredientes que ya tenés listos en tu mesa:
                  </Text>
                  
                  {selectedRecipe.ingredientes.map((ing, i) => {
                    const prog = recipeProgress[selectedRecipe.id];
                    const isChecked = prog ? prog.completedIngredients.includes(i) : false;
                    return (
                      <Pressable
                        key={i}
                        onPress={() => updateIngredientProgress(selectedRecipe.id, i, !isChecked)}
                        style={[
                          styles.checklistRow,
                          { borderBottomColor: colors.border },
                          isChecked && styles.checklistRowChecked
                        ]}
                      >
                        <Ionicons 
                          name={isChecked ? "checkbox" : "square-outline"} 
                          size={20} 
                          color={isChecked ? colors.secondary : colors.textSecondary} 
                        />
                        <Text 
                          style={[
                            styles.checklistText,
                            { color: colors.text },
                            isChecked && [styles.checklistTextChecked, { color: colors.textSecondary }]
                          ]}
                        >
                          {ing}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Preparation Steps */}
                <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Paso a Paso</Text>
                  <Text style={[styles.sectionHelpText, { color: colors.textSecondary }]}>Marcá los pasos completados:</Text>
                  {selectedRecipe.preparación.map((step, i) => {
                    const prog = recipeProgress[selectedRecipe.id];
                    const isChecked = prog ? prog.completedSteps.includes(i) : false;
                    return (
                      <Pressable
                        key={i}
                        onPress={() => updateStepProgress(selectedRecipe.id, i, !isChecked)}
                        style={[
                          styles.stepCheckRow,
                          isChecked && styles.stepCheckRowChecked
                        ]}
                      >
                        <View style={[styles.stepNumCircle, { backgroundColor: colors.primary }, isChecked && styles.stepNumCircleChecked]}>
                          {isChecked ? (
                            <Ionicons name="checkmark" size={12} color={colors.white} />
                          ) : (
                            <Text style={[styles.stepNumText, { color: colors.white }]}>{i + 1}</Text>
                          )}
                        </View>
                        <Text style={[styles.stepText, { color: colors.text }, isChecked && [styles.stepTextChecked, { color: colors.textSecondary }]]}>
                          {step}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Grandma Tip */}
                <View style={[styles.modalSection, styles.grandmaCard, {
                  backgroundColor: isDarkMode ? 'rgba(223, 177, 91, 0.15)' : 'rgba(223, 177, 91, 0.08)',
                  borderColor: isDarkMode ? 'rgba(223, 177, 91, 0.3)' : 'rgba(223, 177, 91, 0.25)'
                }]}>
                  <View style={styles.grandmaCardHeader}>
                    <Ionicons name="flame" size={20} color={colors.accent} />
                    <Text style={[styles.grandmaCardTitle, { color: isDarkMode ? '#DFB15B' : '#9E7A1C' }]}>El Consejo de la Abuela</Text>
                  </View>
                  <Text style={[styles.grandmaCardBody, { color: colors.text }]}>{getGrandmaTip(selectedRecipe.id)}</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm + 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Theme.colors.primary,
  },
  tabButtonText: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.semibold,
  },
  tabButtonTextActive: {
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.bold,
  },
  scrollContent: {
    paddingTop: Theme.spacing.md,
  },
  section: {
    paddingHorizontal: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.md + 2,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  audioItemCard: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.roundness.md,
  },
  audioItemCardActive: {
    borderColor: Theme.colors.primary,
    borderWidth: 1.5,
    backgroundColor: 'rgba(200, 92, 56, 0.02)',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioImageContainer: {
    width: 52,
    height: 52,
    borderRadius: Theme.roundness.xs,
    overflow: 'hidden',
    position: 'relative',
  },
  audioImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playingIndicatorMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(200, 92, 56, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioDetails: {
    flex: 1,
    marginLeft: Theme.spacing.md,
    justifyContent: 'center',
  },
  audioCategory: {
    fontSize: 8.5,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.secondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  audioCardTitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  audioArtist: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  audioTime: {
    fontSize: Theme.typography.sizes.xs - 1,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.sm,
  },
  videoCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.roundness.lg,
    padding: 0,
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  videoThumbnailContainer: {
    width: '100%',
    height: 155,
    position: 'relative',
    backgroundColor: Theme.colors.border,
  },
  videoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoCardPlayOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoMiniPlayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.roundness.xs,
  },
  videoDurationText: {
    color: Theme.colors.white,
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
  },
  videoTextBody: {
    padding: Theme.spacing.md,
  },
  videoCardInstructor: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.secondary,
    textTransform: 'uppercase',
  },
  videoCardTitle: {
    fontSize: Theme.typography.sizes.sm + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginTop: 2,
  },
  videoCardDesc: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    lineHeight: 15,
    marginTop: 4,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoGridItem: {
    width: '48%',
    height: 120,
    borderRadius: Theme.roundness.md,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoLabelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoLabelText: {
    color: Theme.colors.white,
    fontSize: 9.5,
    fontWeight: Theme.typography.weights.medium,
  },
  floatingAudioPlayer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 104 : 96,
    left: 12,
    right: 12,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.roundness.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    ...Theme.shadows.lg,
  },
  playerLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerImage: {
    width: 42,
    height: 42,
    borderRadius: Theme.roundness.xs,
  },
  playerMeta: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    marginRight: Theme.spacing.xs,
  },
  playerTitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  playerArtist: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  playerWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 70,
    height: 38,
  },
  playerWaveBar: {
    width: 3.5,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  playerWaveBarActive: {
    backgroundColor: Theme.colors.primary,
  },
  playerWaveBarIdle: {
    backgroundColor: Theme.colors.border,
  },
  playerProgressRow: {
    marginTop: Theme.spacing.sm,
  },
  playerProgressOuter: {
    height: 4,
    backgroundColor: Theme.colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  playerProgressInner: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: 2,
  },
  playerProgressThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.primary,
    borderWidth: 2,
    borderColor: Theme.colors.white,
    transform: [{ translateX: -6 }],
  },
  playerTimeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  playerTimeText: {
    fontSize: 9,
    color: Theme.colors.textSecondary,
  },
  playerControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  playerBtn: {
    padding: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.md,
  },
  playerPlayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  videoPlayerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 12, 10, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  videoPlayerModalContent: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  videoPlayerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: '#3E3A33',
  },
  videoPlayerModalTitle: {
    fontSize: Theme.typography.sizes.sm + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.white,
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  videoPlaybackArea: {
    width: '100%',
    height: 220,
    backgroundColor: '#000000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayAsset: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    opacity: 0.7,
  },
  videoPlayOverlayCentered: {
    position: 'absolute',
    alignItems: 'center',
  },
  largePlayButtonCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.lg,
  },
  videoPlayInstructionText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.bold,
    marginTop: Theme.spacing.sm,
  },
  videoPlayingOverlayCentered: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayingInstructionText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
    marginTop: 8,
  },
  videoPlaybackProgressBg: {
    position: 'absolute',
    bottom: 12,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  videoPlaybackProgressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  videoPlayerModalFooter: {
    padding: Theme.spacing.md,
    backgroundColor: '#1E1B18',
  },
  videoFooterInstructor: {
    fontSize: 9.5,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.accent,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  videoFooterDesc: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: '#D4CFC7',
    lineHeight: 17,
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 12, 10, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  lightboxHeader: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 99,
  },
  lightboxTitle: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.sm + 1,
    fontWeight: Theme.typography.weights.bold,
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  lightboxClose: {
    padding: 4,
  },
  lightboxImage: {
    width: '100%',
    height: SCREEN_WIDTH * 0.75,
    resizeMode: 'cover',
  },
  lightboxHelperText: {
    position: 'absolute',
    bottom: 40,
    color: '#8E8272',
    fontSize: Theme.typography.sizes.xs,
  },
  playerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(200, 92, 56, 0.08)',
    borderRadius: Theme.roundness.round,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    maxWidth: 150,
  },
  playerLinkText: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
  },
  videoLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    backgroundColor: 'rgba(223, 177, 91, 0.1)',
    borderColor: 'rgba(223, 177, 91, 0.25)',
    borderWidth: 1,
    borderRadius: Theme.roundness.sm,
    paddingVertical: 8,
    paddingHorizontal: Theme.spacing.md,
    alignSelf: 'flex-start',
  },
  videoLinkButtonText: {
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.roundness.xl,
    borderTopRightRadius: Theme.roundness.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
  },
  modalHeaderTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  closeButton: {
    padding: 4,
  },
  modalTabsRow: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalTabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm + 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  modalTabButtonActive: {
    borderBottomColor: Theme.colors.primary,
  },
  modalTabLabel: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.semibold,
  },
  modalTabLabelActive: {
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.bold,
  },
  modalScroll: {
    paddingBottom: 40,
  },
  tabContentBlock: {
    width: '100%',
  },
  detailImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  detailCardBody: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
  },
  detailSectionTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm - 2,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
    paddingLeft: Theme.spacing.sm,
  },
  tabSubtitle: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  detailText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  highlightProductBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 92, 56, 0.07)',
    borderColor: 'rgba(200, 92, 56, 0.2)',
    borderWidth: 1.5,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.md,
  },
  highlightProductInfo: {
    marginLeft: Theme.spacing.md,
  },
  highlightProductLabel: {
    fontSize: 9.5,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
  },
  highlightProductValue: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginTop: 2,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Theme.spacing.md,
  },
  detailIngredientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 111, 64, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(46, 111, 64, 0.2)',
    borderRadius: Theme.roundness.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  ingredientBadgeText: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.secondary,
    fontWeight: Theme.typography.weights.medium,
  },
  recipeListItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.border,
  },
  recipeBadgeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  recipeBadgeNum: {
    color: Theme.colors.white,
    fontSize: 10,
    fontWeight: Theme.typography.weights.bold,
  },
  recipeDishName: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text,
  },
  galleryScroll: {
    flexDirection: 'row',
    marginVertical: Theme.spacing.xs,
  },
  galleryThumbnail: {
    width: 140,
    height: 95,
    borderRadius: Theme.roundness.sm,
    marginRight: 8,
  },
  videoPlayerMock: {
    width: '100%',
    height: 190,
    borderRadius: Theme.roundness.md,
    overflow: 'hidden',
    position: 'relative',
    marginTop: Theme.spacing.xs,
  },
  videoMockThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPlayOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  videoPlayText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginTop: Theme.spacing.sm,
  },
  videoPlayingMock: {
    width: '100%',
    height: 190,
    borderRadius: Theme.roundness.md,
    overflow: 'hidden',
    position: 'relative',
    marginTop: Theme.spacing.xs,
  },
  videoPlayingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayingText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.semibold,
    marginTop: Theme.spacing.sm,
  },
  videoProgressOuter: {
    width: '80%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
    position: 'absolute',
    bottom: 12,
    overflow: 'hidden',
  },
  videoProgressInner: {
    width: '45%',
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  routeMockCard: {
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeHeaderInfo: {
    marginLeft: Theme.spacing.sm,
  },
  routeTitle: {
    fontSize: Theme.typography.sizes.sm + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  routeSubtitle: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  routeDivider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.sm,
  },
  routeStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm - 2,
  },
  routeStepText: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.sm,
  },
  recipeLinkCard: {
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: Theme.roundness.md,
    overflow: 'hidden',
    marginTop: Theme.spacing.sm,
  },
  recipeLinkImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  recipeLinkBody: {
    padding: Theme.spacing.md,
  },
  recipeLinkLabel: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recipeLinkTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  recipeLinkDesc: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  recipeLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  recipeLinkButtonText: {
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    marginRight: 6,
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  modalMetaRow: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    justifyContent: 'space-around',
  },
  modalMetaItem: {
    alignItems: 'center',
  },
  modalMetaValue: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginTop: 4,
  },
  modalMetaLabel: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  modalSection: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    marginTop: Theme.spacing.sm,
  },
  modalSectionTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
    paddingLeft: Theme.spacing.sm,
  },
  modalBodyText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  sectionHelpText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
    fontStyle: 'italic',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.border,
  },
  checklistRowChecked: {
    opacity: 0.7,
  },
  checklistText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text,
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  checklistTextChecked: {
    textDecorationLine: 'line-through',
    color: Theme.colors.textSecondary,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
    marginTop: 2,
  },
  stepNumText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text,
    lineHeight: 20,
  },
  grandmaCard: {
    backgroundColor: 'rgba(223, 177, 91, 0.08)',
    borderColor: 'rgba(223, 177, 91, 0.25)',
    borderWidth: 1.5,
    borderRadius: Theme.roundness.md,
    margin: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  grandmaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  grandmaCardTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: '#9E7A1C',
    marginLeft: Theme.spacing.sm,
  },
  grandmaCardBody: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xl,
    width: '100%',
  },
  emptyText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  videoCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  videoControlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 12, 10, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
  },
  videoControlBtn: {
    marginRight: Theme.spacing.sm,
  },
  videoProgressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: Theme.spacing.sm,
  },
  videoProgressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: 2,
  },
  videoTimeLabel: {
    color: Theme.colors.white,
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  listWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 40,
    height: 20,
    marginRight: 4,
  },
  listWaveBar: {
    width: 2.5,
    marginHorizontal: 0.8,
    backgroundColor: Theme.colors.primary,
    borderRadius: 1,
  },
  progressContainer: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    marginTop: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  progressLabel: {
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.textSecondary,
  },
  progressPercent: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: 3,
  },
  stepCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.border,
  },
  stepCheckRowChecked: {
    opacity: 0.65,
  },
  stepNumCircleChecked: {
    backgroundColor: Theme.colors.secondary,
  },
  stepTextChecked: {
    textDecorationLine: 'line-through',
    color: Theme.colors.textSecondary,
  },
});

export default MultimediaScreen;
