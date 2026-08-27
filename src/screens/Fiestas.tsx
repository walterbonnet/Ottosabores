import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import SkeletonLoader from '../components/SkeletonLoader';
import { FESTIVALS, RECIPES } from '../services/mockData';
import { Festival, Recipe } from '../types';
import { useGlobalState } from '../services/GlobalStateContext';
import FestivalDetailModal from '../components/FestivalDetailModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

export const FiestasScreen: React.FC = () => {
  const { colors, isDarkMode } = useGlobalState();
  const params = useLocalSearchParams<{ id?: string }>();
  const [selectedRoute, setSelectedRoute] = useState<string>('Todas las Rutas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);

  useEffect(() => {
    if (params.id) {
      const found = FESTIVALS.find(f => f.id === params.id);
      if (found) {
        const timer = setTimeout(() => {
          setSelectedFestival(found);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [params.id]);

  const routes = ['Todas las Rutas', 'Carnes Tradicionales', 'Herencia Guaraní', 'Sabores Naturales'];

  const filteredFestivals = FESTIVALS.filter(fest => {
    const matchesRoute = selectedRoute === 'Todas las Rutas' || fest.rutaGastronomica === selectedRoute;
    const matchesSearch = fest.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          fest.localidad.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fest.productoDestacado.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fest.descripcionCorta.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fest.historia.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoute && matchesSearch;
  });

  const openFestivalDetails = (fest: Festival) => {
    setSelectedFestival(fest);
  };

  const routesToRender = selectedRoute === 'Todas las Rutas'
    ? ['Carnes Tradicionales', 'Herencia Guaraní', 'Sabores Naturales']
    : [selectedRoute];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Rutas Gastronómicas" 
        subtitle="Exploración culinaria y fiestas populares" 
        showDivider={true}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={[styles.searchInner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Buscar por nombre, localidad o sabor..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Route Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContainer}
        >
          {routes.map((route) => {
            const isActive = selectedRoute === route;
            return (
              <Pressable
                key={route}
                onPress={() => setSelectedRoute(route)}
                style={[
                  styles.filterTab,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isActive && [styles.filterTabActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                ]}
              >
                <Text 
                  style={[
                    styles.filterTabText, 
                    { color: colors.textSecondary },
                    isActive && { color: colors.white, fontWeight: 'bold' }
                  ]}
                >
                  {route}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Routes & Festivals list */}
        <View style={styles.listSection}>
          {routesToRender.length > 0 && filteredFestivals.length > 0 ? (
            routesToRender.map((route) => {
              const routeFestivals = filteredFestivals.filter(f => f.rutaGastronomica === route);
              if (routeFestivals.length === 0) return null;

              return (
                <View key={route} style={styles.routeGroup}>
                  <View style={styles.routeHeaderRow}>
                    <View style={[styles.routeIndicatorCircle, { backgroundColor: route === 'Carnes Tradicionales' ? colors.primary : route === 'Herencia Guaraní' ? colors.secondary : colors.accent }]} />
                    <Text style={[styles.routeGroupTitle, { color: colors.text }]}>{route}</Text>
                  </View>
                  
                  <View style={styles.festivalsGrid}>
                    {routeFestivals.map((fest) => (
                      <Card
                        key={fest.id}
                        style={[styles.festivalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => openFestivalDetails(fest)}
                      >
                        <Image source={{ uri: fest.galeria?.[0] }} style={styles.festivalImage} />
                        
                        <View style={styles.festivalCardBody}>
                          <View style={styles.festivalCardHeader}>
                            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                            <Text style={styles.festivalLocation} numberOfLines={1}>{fest.localidad}</Text>
                          </View>
                          
                          <Text style={[styles.festivalTitle, { color: colors.text }]} numberOfLines={1}>{fest.nombre}</Text>
                          <Text style={[styles.festivalDesc, { color: colors.textSecondary }]} numberOfLines={2}>{fest.descripcionCorta}</Text>
                          
                          <View style={styles.productBadgeContainer}>
                            <Ionicons name="leaf-outline" size={10} color={colors.secondary} style={{ marginRight: 4 }} />
                            <Text style={[styles.productBadgeText, { color: colors.secondary }]} numberOfLines={1}>{fest.productoDestacado}</Text>
                          </View>
                          
                          {/* CTA Explorar */}
                          <View style={[styles.exploreBtn, { backgroundColor: colors.primary }]}>
                            <Text style={styles.exploreBtnText}>Explorar</Text>
                            <Ionicons name="arrow-forward" size={11} color={colors.white} style={{ marginLeft: 4 }} />
                          </View>
                        </View>
                      </Card>
                    ))}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="sparkles-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No encontramos fiestas populares con el filtro seleccionado.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Festival Detail Modal */}
      <FestivalDetailModal
        festival={selectedFestival}
        visible={!!selectedFestival}
        onClose={() => setSelectedFestival(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 170, // Increased bottom padding to prevent overlap with audio player
  },
  searchSection: {
    paddingHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.md,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.roundness.sm,
    paddingHorizontal: Theme.spacing.sm,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text,
  },
  filterSection: {
    marginTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  filterTitle: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  badgeScroll: {
    flexDirection: 'row',
  },
  filterBadge: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs - 2,
    borderRadius: Theme.roundness.round,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterBadgeActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterBadgeText: {
    fontSize: Theme.typography.sizes.sm - 1,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.medium,
  },
  filterBadgeTextActive: {
    color: Theme.colors.white,
    fontWeight: Theme.typography.weights.bold,
  },
  categoryChip: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs - 2,
    borderRadius: Theme.roundness.round,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: Theme.colors.secondary,
    borderColor: Theme.colors.secondary,
  },
  categoryChipText: {
    fontSize: Theme.typography.sizes.sm - 1,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.medium,
  },
  categoryChipTextActive: {
    color: Theme.colors.white,
    fontWeight: Theme.typography.weights.bold,
  },
  gridSection: {
    paddingHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  },
  gridSectionTitle: {
    fontSize: Theme.typography.sizes.md + 2,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  routeContainer: {
    marginBottom: Theme.spacing.lg,
  },
  routeContainerTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    borderLeftWidth: 3.5,
    borderLeftColor: Theme.colors.primary,
    paddingLeft: Theme.spacing.sm,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.roundness.md,
    padding: 0,
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 105,
    resizeMode: 'cover',
  },
  cardInfo: {
    padding: Theme.spacing.sm,
  },
  cardCategory: {
    fontSize: 8.5,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: Theme.typography.sizes.sm - 0.5,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 16,
  },
  productBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.roundness.xs,
    marginBottom: 6,
  },
  productBadgeText: {
    fontSize: 8.5,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
  },
  cardDesc: {
    fontSize: 10.5,
    lineHeight: 14,
    marginBottom: 10,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: Theme.roundness.xs,
    marginTop: 2,
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 10.5,
    fontWeight: Theme.typography.weights.bold,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMetaText: {
    fontSize: 9.5,
    color: Theme.colors.textSecondary,
    marginLeft: 4,
    flex: 1,
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
  grandmaTipCard: {
    borderWidth: 1.5,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.md,
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
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: Theme.spacing.md,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  detailHeaderTitle: {
    fontSize: Theme.typography.sizes.md + 1,
    fontWeight: 'bold',
    flex: 1,
  },
  detailScrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    position: 'relative',
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: Theme.spacing.md,
  },
  heroTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLocationText: {
    color: '#FFF',
    fontSize: Theme.typography.sizes.sm - 1,
    marginLeft: 4,
  },
  detailSection: {
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.md,
    borderLeftWidth: 3.5,
    paddingLeft: Theme.spacing.sm,
  },
  contextLabel: {
    fontSize: Theme.typography.sizes.sm - 0.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  contextText: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    borderWidth: 1,
  },
  featuredProductInfo: {
    marginLeft: 12,
    flex: 1,
  },
  featuredProductLabel: {
    fontSize: 9.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  featuredProductName: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredProductDesc: {
    fontSize: Theme.typography.sizes.xs + 1,
    lineHeight: 16,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.md,
  },
  recipeMetaItem: {
    alignItems: 'center',
  },
  recipeMetaValue: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: 'bold',
    marginTop: 4,
  },
  recipeMetaLabel: {
    fontSize: 9.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  recipeTitleName: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: 'bold',
    marginVertical: Theme.spacing.sm,
  },
  recipeSubheading: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  recipeHelpText: {
    fontSize: 10.5,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  galleryImageItem: {
    width: 140,
    height: 95,
    borderRadius: Theme.roundness.sm,
    marginRight: 8,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.md - 2,
    borderRadius: Theme.roundness.md,
    marginTop: Theme.spacing.lg,
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: Theme.typography.sizes.sm,
    fontWeight: 'bold',
  },
});

export default FiestasScreen;
