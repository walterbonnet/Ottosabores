import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import { FESTIVALS, RECIPES } from '../services/mockData';
import { Festival, Recipe } from '../types';
import { useGlobalState } from '../services/GlobalStateContext';

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
  const [selectedMonth, setSelectedMonth] = useState<string>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<{ [key: string]: boolean }>({});
  
  // Tab index inside the details modal: 0 = General/History, 1 = Ingredients/Dishes, 2 = Gallery/Video, 3 = How to get there
  const [modalActiveTab, setModalActiveTab] = useState<number>(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);

  const months = ['Todos', 'Enero', 'Agosto', 'Septiembre'];
  const categories = ['Todos', 'Música y Fogón', 'Ollas y Campo', 'Tradición Criolla', 'Pesca y Río'];

  const toggleIngredient = (recipeId: string, index: number) => {
    const key = `${recipeId}-${index}`;
    setCheckedIngredients(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredFestivals = FESTIVALS.filter(fest => {
    const matchesMonth = selectedMonth === 'Todos' || fest.fecha.toLowerCase().includes(selectedMonth.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || fest.categoría === selectedCategory;
    const matchesSearch = fest.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          fest.localidad.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fest.historia.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMonth && matchesCategory && matchesSearch;
  });

  const relatedRecipe = selectedFestival ? RECIPES.find(r => r.id === selectedFestival.recetaRelacionada) : undefined;

  const openFestivalDetails = (fest: Festival) => {
    setSelectedFestival(fest);
    setModalActiveTab(0);
    setIsPlayingVideo(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Fiestas Populares" 
        subtitle="Celebraciones y fuegos de la provincia" 
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
              placeholder="Buscar por nombre o localidad..."
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

        {/* Month Filters */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Filtrar por Mes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
            {months.map(m => (
              <Pressable
                key={m}
                onPress={() => setSelectedMonth(m)}
                style={[
                  styles.filterBadge,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedMonth === m && [styles.filterBadgeActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                ]}
              >
                <Text style={[styles.filterBadgeText, { color: colors.textSecondary }, selectedMonth === m && { color: colors.white }]}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Category Chips */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Filtrar por Temática</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedCategory === cat && [styles.categoryChipActive, { backgroundColor: colors.secondary, borderColor: colors.secondary }]
                ]}
              >
                <Text style={[styles.categoryChipText, { color: colors.textSecondary }, selectedCategory === cat && { color: colors.white }]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Responsive / Adaptable Grid Layout */}
        <View style={styles.gridSection}>
          <Text style={[styles.gridSectionTitle, { color: colors.text }]}>Cartelera de Festivales</Text>
          <View style={styles.gridContainer}>
            {filteredFestivals.length > 0 ? (
              filteredFestivals.map((fest) => (
                <Card
                  key={fest.id}
                  style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  elevation="sm"
                  border={true}
                  onPress={() => openFestivalDetails(fest)}
                >
                  <Image source={{ uri: fest.galeria[0] }} style={styles.cardImage} />
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardCategory, { color: colors.primary }]}>{fest.categoría}</Text>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{fest.nombre}</Text>
                    
                    <View style={styles.cardMetaRow}>
                      <Ionicons name="location-outline" size={12} color={colors.secondary} />
                      <Text style={[styles.cardMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {fest.localidad.split(' (')[0]}
                      </Text>
                    </View>
                    
                    <View style={[styles.cardMetaRow, { marginTop: 4 }]}>
                      <Ionicons name="calendar-outline" size={12} color={colors.primary} />
                      <Text style={[styles.cardMetaText, { color: colors.textSecondary }]}>{fest.fecha}</Text>
                    </View>
                  </View>
                </Card>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="sparkles-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No encontramos festivales con el filtro seleccionado.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

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
              <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
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
                <Pressable onPress={() => setSelectedRecipe(null)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
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
                    const isChecked = !!checkedIngredients[`${selectedRecipe.id}-${i}`];
                    return (
                      <Pressable
                        key={i}
                        onPress={() => toggleIngredient(selectedRecipe.id, i)}
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
                  {selectedRecipe.preparación.map((step, i) => (
                    <View key={i} style={styles.stepContainer}>
                      <View style={[styles.stepNumCircle, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.stepNumText, { color: colors.white }]}>{i + 1}</Text>
                      </View>
                      <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
                    </View>
                  ))}
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
  scrollContent: {
    paddingBottom: 110,
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
    height: 110,
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
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    height: 38,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMetaText: {
    fontSize: 10,
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
});

export default FiestasScreen;
