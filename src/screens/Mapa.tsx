import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  SafeAreaView,
  Dimensions,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import { MAP_HOTSPOTS, FESTIVALS, RECIPES } from '../services/mockData';
import { DepartmentHotspot, Festival, Recipe } from '../types';
import { useGlobalState } from '../services/GlobalStateContext';
import SkeletonLoader from '../components/SkeletonLoader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

export const MapaScreen: React.FC = () => {
  const [activeZone, setActiveZone] = useState<DepartmentHotspot | null>(MAP_HOTSPOTS[0]);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<DepartmentHotspot | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<number>(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    favorites,
    toggleFavorite,
    recipeProgress,
    updateIngredientProgress,
    updateStepProgress,
    addRecentlyViewed,
    markHotspotViewed,
    colors,
    isDarkMode,
  } = useGlobalState();

  const handleNextZone = () => {
    if (!activeZone) return;
    setIsLoading(true);
    const currentIndex = MAP_HOTSPOTS.findIndex(z => z.id === activeZone.id);
    const nextIndex = (currentIndex + 1) % MAP_HOTSPOTS.length;
    setActiveZone(MAP_HOTSPOTS[nextIndex]);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const handlePrevZone = () => {
    if (!activeZone) return;
    setIsLoading(true);
    const currentIndex = MAP_HOTSPOTS.findIndex(z => z.id === activeZone.id);
    const prevIndex = currentIndex === 0 ? MAP_HOTSPOTS.length - 1 : currentIndex - 1;
    setActiveZone(MAP_HOTSPOTS[prevIndex]);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const regionalFestivals = activeZone
    ? FESTIVALS.filter(f => activeZone.festivalesEnZona.includes(f.id))
    : [];

  const relatedRecipe = selectedFestival ? RECIPES.find(r => r.id === selectedFestival.recetaRelacionada) : undefined;

  const handleSelectMarker = (zone: DepartmentHotspot) => {
    setIsLoading(true);
    setActiveZone(zone);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const handleOpenRecipe = (recipe: Recipe) => {
    addRecentlyViewed(recipe.id, 'recipe');
    setSelectedRecipe(recipe);
  };

  const handleOpenFestival = (festival: Festival) => {
    addRecentlyViewed(festival.id, 'festival');
    setSelectedFestival(festival);
    setModalActiveTab(0);
    setIsPlayingVideo(false);
  };

  const handleCloseBottomSheet = () => {
    setActiveZone(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Mapa Gastronómico" 
        subtitle="Identidades y sabores por corredores provinciales" 
        showDivider={true}
      />

      {/* Main View Area */}
      <View style={styles.mainArea}>
        <View style={styles.introSection}>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Tocá los marcadores dorados sobre el mapa interactivo para desplegar el Bottom Sheet con la identidad gastronómica de cada región.
          </Text>
        </View>

        {/* Blueprint Map Canvas */}
        <View style={styles.mapCanvasContainer}>
          <Card style={[styles.mapCanvas, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="md" border={true}>
            <View style={styles.mapBackdrop}>
              {/* Rivers */}
              <View style={[styles.riverParana, { backgroundColor: isDarkMode ? '#1B2C3F' : '#CFE2F3' }]} />
              <View style={[styles.riverUruguay, { backgroundColor: isDarkMode ? '#1B2C3F' : '#CFE2F3' }]} />
              <View style={[styles.iberaWetlands, {
                backgroundColor: isDarkMode ? '#1B2C21' : '#E2EFDA',
                borderColor: isDarkMode ? 'rgba(46, 111, 64, 0.3)' : 'rgba(46, 111, 64, 0.15)'
              }]} />

              {/* Grid background lines for a technical/contemporary visual overlay */}
              <View style={[styles.gridLineH1, { backgroundColor: colors.border }]} />
              <View style={[styles.gridLineH2, { backgroundColor: colors.border }]} />
              <View style={[styles.gridLineV1, { backgroundColor: colors.border }]} />
              <View style={[styles.gridLineV2, { backgroundColor: colors.border }]} />

              {/* Pulsing Hotspot Markers */}
              {MAP_HOTSPOTS.map((zone) => {
                const isActive = activeZone?.id === zone.id;
                return (
                  <Pressable
                    key={zone.id}
                    onPress={() => handleSelectMarker(zone)}
                    style={[
                      styles.markerWrapper,
                      { left: `${zone.x}%`, top: `${zone.y}%` }
                    ]}
                  >
                    {/* Pulsing Ring Mock */}
                    <View style={[
                      styles.pulseRing, 
                      { borderColor: colors.accent },
                      isActive && [styles.pulseRingActive, { borderColor: colors.primary }]
                    ]} />
                    
                    {/* Glowing Core */}
                    <View style={[
                      styles.markerCore, 
                      { backgroundColor: colors.accent },
                      isActive && [styles.markerCoreActive, { backgroundColor: colors.primary }]
                    ]}>
                      <Ionicons 
                        name={isActive ? "restaurant" : "location"} 
                        size={isActive ? 14 : 12} 
                        color={colors.white} 
                      />
                    </View>
                    
                    {/* Floating mini tag */}
                    <View style={[
                      styles.markerTag, 
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      isActive && [styles.markerTagActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                    ]}>
                      <Text style={[
                        styles.markerTagText, 
                        { color: colors.text },
                        isActive && [styles.markerTagTextActive, { color: colors.white }]
                      ]}>
                        {zone.name.split(' (')[0].replace('Corredor ', '').replace('Eco-Región del ', '')}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </View>
      </View>

      {/* Custom Bottom Sheet Overlay */}
      {activeZone && (
        <View style={styles.bottomSheetContainer}>
          <Card style={[styles.bottomSheet, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="lg" border={true}>
            {/* Grab Handle simulating native sheet bar */}
            <View style={[styles.grabHandle, { backgroundColor: isDarkMode ? '#555' : '#C8C2B7' }]} />

            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.sheetHeaderTitleRow}>
                <Ionicons name="compass" size={22} color={colors.primary} />
                <Text style={[styles.sheetTitle, { color: colors.primary }]}>{activeZone.name}</Text>
              </View>
              <Pressable onPress={handleCloseBottomSheet} style={styles.sheetCloseButton}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScrollContent}
            >
              {isLoading ? (
                <View style={{ paddingVertical: 10 }}>
                  <SkeletonLoader type="list" />
                  <SkeletonLoader type="list" />
                </View>
              ) : (
                <>
                  <Text style={[styles.sheetDescription, { color: colors.textSecondary }]}>{activeZone.description}</Text>

                  {/* Explorar Región en Detalle Button */}
                  <Pressable 
                    style={[styles.exploreRegionButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setIsLoading(true);
                      setSelectedRegion(activeZone);
                      markHotspotViewed(activeZone.id);
                      setTimeout(() => {
                        setIsLoading(false);
                      }, 600);
                    }}
                  >
                    <Ionicons name="compass-outline" size={18} color={colors.white} style={{ marginRight: 6 }} />
                    <Text style={[styles.exploreRegionButtonText, { color: colors.white }]}>Explorar Región en Detalle</Text>
                  </Pressable>

                  {/* Local Ingredients */}
                  <View style={styles.sheetBlock}>
                    <Text style={[styles.sheetBlockTitle, { color: colors.text }]}>Ingredientes Clave de la Región</Text>
                    <View style={styles.badgeContainer}>
                      {activeZone.localIngredients.map((ing, i) => (
                        <View key={i} style={[styles.badge, styles.ingredientBadge, {
                          backgroundColor: isDarkMode ? 'rgba(46, 111, 64, 0.15)' : 'rgba(46, 111, 64, 0.04)',
                          borderColor: isDarkMode ? 'rgba(46, 111, 64, 0.3)' : 'rgba(46, 111, 64, 0.15)'
                        }]}>
                          <Ionicons name="leaf" size={10} color={colors.secondary} style={{ marginRight: 4 }} />
                          <Text style={[styles.badgeText, { color: colors.secondary }]}>{ing}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Recommended Local Dishes */}
                  <View style={styles.sheetBlock}>
                    <Text style={[styles.sheetBlockTitle, { color: colors.text }]}>Platos Recomendados</Text>
                    <View style={styles.badgeContainer}>
                      {activeZone.localDishes.map((dish, i) => {
                        const matchRecipe = RECIPES.find(r => r.nombre.toLowerCase().includes(dish.toLowerCase()) || dish.toLowerCase().includes(r.nombre.toLowerCase()));
                        return (
                          <Pressable 
                            key={i} 
                            style={[styles.badge, styles.dishBadge, {
                              backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.15)' : 'rgba(200, 92, 56, 0.04)',
                              borderColor: isDarkMode ? 'rgba(200, 92, 56, 0.3)' : 'rgba(200, 92, 56, 0.15)'
                            }]}
                            onPress={() => matchRecipe && handleOpenRecipe(matchRecipe)}
                          >
                            <Ionicons name="restaurant" size={10} color={colors.primary} style={{ marginRight: 4 }} />
                            <Text style={[styles.badgeText, { color: colors.primary }]}>{dish}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Regional Festivals */}
                  {regionalFestivals.length > 0 && (
                    <View style={styles.sheetBlock}>
                      <Text style={[styles.sheetBlockTitle, { color: colors.text }]}>Festivales en la Región</Text>
                      {regionalFestivals.map((fest) => (
                        <Pressable
                          key={fest.id}
                          onPress={() => handleOpenFestival(fest)}
                          style={[styles.regionalFestivalCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                        >
                          <View style={styles.regionalFestivalInfo}>
                            <Text style={[styles.regionalFestivalName, { color: colors.text }]}>{fest.nombre}</Text>
                            <Text style={[styles.regionalFestivalMeta, { color: colors.textSecondary }]}>{fest.localidad} • {fest.fecha}</Text>
                          </View>
                          <Ionicons name="arrow-forward-circle" size={24} color={colors.primary} />
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {/* Sequential Region Navigation controls */}
                  <View style={[styles.sheetNavigationRow, { borderTopColor: colors.border }]}>
                    <Pressable onPress={handlePrevZone} style={styles.sheetNavBtn}>
                      <Ionicons name="chevron-back" size={16} color={colors.primary} />
                      <Text style={[styles.sheetNavBtnText, { color: colors.primary }]}>Anterior</Text>
                    </Pressable>
                    <View style={[styles.navIndicator, { backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.16)' : 'rgba(200, 92, 56, 0.08)' }]}>
                      <Text style={[styles.navIndicatorText, { color: colors.primary }]}>
                        {MAP_HOTSPOTS.findIndex(z => z.id === activeZone.id) + 1} de {MAP_HOTSPOTS.length}
                      </Text>
                    </View>
                    <Pressable onPress={handleNextZone} style={styles.sheetNavBtn}>
                      <Text style={[styles.sheetNavBtnText, { color: colors.primary }]}>Siguiente</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                    </Pressable>
                  </View>
                </>
              )}
            </ScrollView>
          </Card>
        </View>
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

                          <Card style={[styles.recipeLinkCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="sm" onPress={() => setSelectedRecipe(relatedRecipe)}>
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
                      
                      {!isPlayingVideo ? (
                        <Pressable style={styles.videoPlayerMock} onPress={() => setIsPlayingVideo(true)}>
                          <Image source={{ uri: selectedFestival.video }} style={styles.videoMockThumbnail} />
                          <View style={styles.videoPlayOverlay}>
                            <View style={[styles.playButtonCircle, { backgroundColor: colors.primary }]}>
                              <Ionicons name="play" size={32} color={colors.white} style={{ marginLeft: 4 }} />
                            </View>
                            <Text style={[styles.videoPlayText, { color: colors.white }]}>Reproducir Video Resumen</Text>
                          </View>
                        </Pressable>
                      ) : (
                        <Pressable style={styles.videoPlayingMock} onPress={() => setIsPlayingVideo(false)}>
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

      {/* Region Detail Modal */}
      {selectedRegion && (
        <Modal
          visible={!!selectedRegion}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedRegion(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <Text style={[styles.modalHeaderTitle, { color: colors.primary }]} numberOfLines={1}>
                  {selectedRegion.name}
                </Text>
                <Pressable onPress={() => setSelectedRegion(null)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >
                {isLoading ? (
                  <View style={{ paddingVertical: 10 }}>
                    <SkeletonLoader type="details" />
                  </View>
                ) : (
                  <>
                    {/* Large visual region backdrop */}
                    <Image 
                      source={{ uri: selectedRegion.id === 'zone-1' ? 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800' : selectedRegion.id === 'zone-2' ? 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800' : selectedRegion.id === 'zone-3' ? 'https://images.unsplash.com/photo-1542362567-b07eac79094f?w=800' : 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800' }} 
                      style={styles.regionHeroImage} 
                    />

                    <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Identidad Regional</Text>
                      <Text style={[styles.modalBodyText, { color: colors.textSecondary }]}>{selectedRegion.description}</Text>
                    </View>

                    {/* Cultural explanation */}
                    <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Cultura y Cocina del Taragüí</Text>
                      <Text style={[styles.modalBodyText, { color: colors.textSecondary }]}>
                        Esta zona representa un corredor de identidad único en la provincia de Corrientes. La confluencia de la cocina guaraní original, con sus técnicas de molienda de maíz y recolección de mandioca, y la influencia jesuítica y española con la introducción de quesos, huevos y carnes asadas, define un recetario criollo de fuerte arraigo. Las familias cocinan tradicionalmente a fuego de leña de espinillo y en ollas de hierro de tres patas, transmitiendo los secretos culinarios oralmente de generación en generación.
                      </Text>
                    </View>

                    <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Ingredientes Emblemáticos</Text>
                      {selectedRegion.localIngredients.map((ing, i) => (
                        <View key={i} style={[styles.regionListItemRow, { borderBottomColor: colors.border }]}>
                          <View style={[styles.bulletIcon, { backgroundColor: isDarkMode ? 'rgba(46, 111, 64, 0.15)' : 'rgba(46, 111, 64, 0.08)' }]}>
                            <Ionicons name="leaf" size={14} color={colors.secondary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.regionListTitle, { color: colors.text }]}>{ing}</Text>
                            <Text style={[styles.regionListDesc, { color: colors.textSecondary }]}>
                              {ing === 'Mandioca' ? 'Base alimentaria del litoral, consumida frita, hervida o en harinas (almidón).' : ing === 'Naranja' || ing === 'Citrus (Limón, Naranja)' ? 'Aporta frescura y adoba pescados asados o chipá.' : ing === 'Pescado fresco de río' ? 'Dorado, surubí y pacú pescados del Paraná superior.' : 'Ingrediente natural cosechado en los campos correntinos.'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Recetas Autóctonas de la Zona</Text>
                      {selectedRegion.localDishes.map((dish, i) => {
                        const matchRecipe = RECIPES.find(r => r.nombre.toLowerCase().includes(dish.toLowerCase()) || dish.toLowerCase().includes(r.nombre.toLowerCase()));
                        return (
                          <Pressable 
                            key={i} 
                            style={[styles.regionRecipeItem, { borderBottomColor: colors.border }]}
                            onPress={() => matchRecipe && handleOpenRecipe(matchRecipe)}
                          >
                            <View style={{ flex: 1, marginRight: Theme.spacing.sm }}>
                              <Text style={[styles.regionRecipeName, { color: colors.text }]}>{dish}</Text>
                              <Text style={[styles.regionRecipeDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                                {matchRecipe ? matchRecipe.historia : 'Plato representativo elaborado con ingredientes locales.'}
                              </Text>
                            </View>
                            {matchRecipe && (
                              <View style={[styles.recipeGoBtn, { backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.15)' : 'rgba(200, 92, 56, 0.06)' }]}>
                                <Text style={[styles.recipeGoBtnText, { color: colors.primary }]}>Ver Receta</Text>
                                <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>

                    {selectedRegion.festivalesEnZona.length > 0 && (
                      <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Festivales en el Corredor</Text>
                        {FESTIVALS.filter(f => selectedRegion.festivalesEnZona.includes(f.id)).map((fest) => (
                          <Pressable
                            key={fest.id}
                            onPress={() => handleOpenFestival(fest)}
                            style={[styles.regionFestivalCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                          >
                            <Image source={{ uri: fest.galeria[0] }} style={styles.regionFestivalThumb} />
                            <View style={{ flex: 1, marginLeft: Theme.spacing.sm }}>
                              <Text style={[styles.regionFestivalName, { color: colors.text }]}>{fest.nombre}</Text>
                              <Text style={[styles.regionFestivalMeta, { color: colors.textSecondary }]}>{fest.localidad} • {fest.fecha}</Text>
                            </View>
                            <Ionicons name="arrow-forward-circle" size={24} color={colors.primary} />
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </>
                )}
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
  mainArea: {
    flex: 1,
    paddingBottom: 90, // Leave room for floating bottom tab
  },
  introSection: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
  },
  introText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  mapCanvasContainer: {
    flex: 1,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  mapCanvas: {
    flex: 1,
    padding: 0,
    backgroundColor: '#FAF7F0',
    borderRadius: Theme.roundness.lg,
    overflow: 'hidden',
  },
  mapBackdrop: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  riverParana: {
    position: 'absolute',
    left: -40,
    top: '25%',
    width: '120%',
    height: 7,
    backgroundColor: '#CFE2F3',
    borderRadius: 5,
    transform: [{ rotate: '12deg' }],
    opacity: 0.8,
  },
  riverUruguay: {
    position: 'absolute',
    right: -20,
    bottom: '30%',
    width: '70%',
    height: 7,
    backgroundColor: '#CFE2F3',
    borderRadius: 5,
    transform: [{ rotate: '60deg' }],
    opacity: 0.8,
  },
  iberaWetlands: {
    position: 'absolute',
    left: '42%',
    top: '38%',
    width: '28%',
    height: '24%',
    backgroundColor: '#E2EFDA',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 111, 64, 0.15)',
    opacity: 0.8,
  },
  gridLineH1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(78, 72, 63, 0.08)',
  },
  gridLineH2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(78, 72, 63, 0.08)',
  },
  gridLineV1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 0.5,
    backgroundColor: 'rgba(78, 72, 63, 0.08)',
  },
  gridLineV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 0.5,
    backgroundColor: 'rgba(78, 72, 63, 0.08)',
  },
  markerWrapper: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  pulseRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.colors.accent,
    opacity: 0.6,
  },
  pulseRingActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderColor: Theme.colors.primary,
    borderWidth: 2,
    opacity: 0.85,
  },
  markerCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  markerCoreActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Theme.colors.primary,
  },
  markerTag: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 0.5,
    borderColor: Theme.colors.border,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: Theme.roundness.xs,
  },
  markerTagActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  markerTagText: {
    fontSize: 8,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text,
  },
  markerTagTextActive: {
    color: Theme.colors.white,
    fontWeight: Theme.typography.weights.bold,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 84, // Float right above the custom tab bar
    left: 12,
    right: 12,
    zIndex: 99,
  },
  bottomSheet: {
    backgroundColor: Theme.colors.white,
    borderRadius: 24,
    borderColor: 'rgba(232, 226, 213, 0.9)',
    borderWidth: 1.5,
    paddingTop: 12,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    maxHeight: SCREEN_HEIGHT * 0.45,
    ...Theme.shadows.lg,
  },
  grabHandle: {
    width: 40,
    height: 4.5,
    backgroundColor: '#C8C2B7',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  sheetHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sheetTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
  sheetCloseButton: {
    padding: 4,
  },
  sheetScrollContent: {
    paddingBottom: Theme.spacing.sm,
  },
  sheetDescription: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    lineHeight: 19,
    marginBottom: Theme.spacing.md,
  },
  sheetBlock: {
    marginBottom: Theme.spacing.md,
  },
  sheetBlockTitle: {
    fontSize: 10.5,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.roundness.sm,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
  },
  ingredientBadge: {
    backgroundColor: 'rgba(46, 111, 64, 0.04)',
    borderColor: 'rgba(46, 111, 64, 0.15)',
  },
  dishBadge: {
    backgroundColor: 'rgba(200, 92, 56, 0.04)',
    borderColor: 'rgba(200, 92, 56, 0.15)',
  },
  badgeText: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.secondary,
    fontWeight: Theme.typography.weights.medium,
  },
  infoAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(223, 177, 91, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(223, 177, 91, 0.25)',
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  infoAlertText: {
    flex: 1,
    fontSize: 10.5,
    color: '#9E7A1C',
    lineHeight: 14,
    marginLeft: 6,
  },
  regionalFestivalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F0',
    borderRadius: Theme.roundness.sm,
    padding: Theme.spacing.sm,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  regionalFestivalInfo: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  regionalFestivalName: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  regionalFestivalMeta: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    marginTop: 2,
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
  // --- Functional Additions Styles ---
  exploreRegionButton: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Theme.roundness.md,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  exploreRegionButtonText: {
    color: Theme.colors.white,
    fontWeight: Theme.typography.weights.bold,
    fontSize: Theme.typography.sizes.sm,
  },
  sheetNavigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  sheetNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  sheetNavBtnText: {
    fontSize: Theme.typography.sizes.sm - 1,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.bold,
    marginHorizontal: 4,
  },
  navIndicator: {
    backgroundColor: 'rgba(200, 92, 56, 0.08)',
    paddingHorizontal: Theme.spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: Theme.roundness.sm,
  },
  navIndicatorText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
  },
  regionHeroImage: {
    width: '100%',
    height: 190,
    resizeMode: 'cover',
  },
  regionListItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm + 4,
  },
  bulletIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm + 2,
    marginTop: 2,
  },
  regionListTitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  regionListDesc: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.textSecondary,
    lineHeight: 15,
    marginTop: 1,
  },
  regionRecipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.border,
  },
  regionRecipeName: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text,
  },
  regionRecipeDesc: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  recipeGoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 92, 56, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recipeGoBtnText: {
    fontSize: 10,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    marginRight: 2,
  },
  regionFestivalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.roundness.sm,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  regionFestivalThumb: {
    width: 50,
    height: 50,
    borderRadius: Theme.roundness.xs,
  },
  regionFestivalName: {
    fontSize: Theme.typography.sizes.sm - 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  regionFestivalMeta: {
    fontSize: 9.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  progressPercent: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(232, 226, 213, 0.5)',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  stepCheckRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  stepCheckRowChecked: {
    opacity: 0.65,
  },
  stepNumCircleChecked: {
    backgroundColor: Theme.colors.secondary,
  },
  stepTextChecked: {
    color: Theme.colors.textSecondary,
  },
});

export default MapaScreen;
