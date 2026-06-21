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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import { RECIPES } from '../services/mockData';
import { Recipe } from '../types';
import { useGlobalState } from '../services/GlobalStateContext';
import SkeletonLoader from '../components/SkeletonLoader';

const getGrandmaTip = (recipeId: string): string => {
  switch (recipeId) {
    case 'r1':
      return 'El gran secreto de las abuelas correntinas es agregar una cucharada de jugo de naranja natural al amasar. Esto ayuda a que el chipá quede esponjoso.';
    case 'r2':
      return 'Revolver siempre en sentido de las agujas del reloj y usando una cuchara de madera de espinillo para que no se corte la textura.';
    case 'r3':
      return 'Para el guiso, agrega un chorrito de jugo de limón al apagar el fuego. Realza los sabores de la carne y el arroz de manera espectacular.';
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

export const RecetasScreen: React.FC = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    favorites,
    toggleFavorite,
    recipeProgress,
    updateIngredientProgress,
    updateStepProgress,
    addRecentlyViewed,
    colors,
    isDarkMode,
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
  }, [activeCategory, searchQuery]);

  const categories = [
    'Todos',
    'Favoritos',
    'Carnes Tradicionales',
    'Sabores Guaraníes',
    'Guisos y Comidas Populares',
    'Frutas y Productos Naturales',
    'Panificados y Dulces'
  ];

  const handleOpenRecipe = (recipe: Recipe) => {
    addRecentlyViewed(recipe.id, 'recipe');
    setSelectedRecipe(recipe);
  };

  const filteredRecipes = RECIPES.filter(recipe => {
    const matchesCategory = activeCategory === 'Todos' || 
                           (activeCategory === 'Favoritos' ? favorites.includes(recipe.id) : recipe.categoría === activeCategory);
    const matchesSearch = recipe.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.historia.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Sabores Ancestrales" 
        subtitle="Catálogo de recetas autóctonas y técnicas tradicionales" 
        showDivider={true}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search input */}
        <View style={styles.searchBarContainer}>
          <View style={[styles.searchInner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Buscar receta por nombre o ingrediente..."
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

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryBadge,
                { backgroundColor: colors.surface, borderColor: colors.border },
                activeCategory === cat && [styles.categoryBadgeActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
              ]}
            >
              <Text 
                style={[
                  styles.categoryBadgeText,
                  { color: colors.textSecondary },
                  activeCategory === cat && [styles.categoryBadgeTextActive, { color: colors.white }]
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Editorial Recipe Cards Catalog */}
        <View style={styles.catalogList}>
          {isLoading ? (
            <View style={{ width: '100%' }}>
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
            </View>
          ) : filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => {
              const isFav = favorites.includes(recipe.id);
              return (
                <Card
                  key={recipe.id}
                  style={[styles.editorialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  elevation="md"
                  border={true}
                  onPress={() => handleOpenRecipe(recipe)}
                >
                  <View style={{ position: 'relative' }}>
                    <Image source={{ uri: recipe.video || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600' }} style={styles.editorialImage} />
                    <Pressable 
                      style={styles.cardHeartIcon} 
                      onPress={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
                    >
                      <Ionicons 
                        name={isFav ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isFav ? colors.primary : colors.white} 
                      />
                    </Pressable>
                  </View>
                
                  <View style={styles.editorialBody}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={[styles.recipeCategory, { color: colors.primary }]}>{recipe.categoría}</Text>
                      
                      <View style={styles.starsRow}>
                        <Ionicons name="star" size={12} color={colors.accent} />
                        <Ionicons name="star" size={12} color={colors.accent} />
                        <Ionicons name="star" size={12} color={colors.accent} />
                        <Ionicons name="star" size={12} color={colors.accent} />
                        <Ionicons name="star" size={12} color={colors.accent} />
                      </View>
                    </View>

                    <Text style={[styles.editorialTitle, { color: colors.text }]}>{recipe.nombre}</Text>
                    <Text style={[styles.editorialDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                      {recipe.historia}
                    </Text>
                    
                    <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
                    
                    <View style={styles.editorialMetaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time" size={14} color={colors.primary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{recipe.duración}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="restaurant" size={14} color={colors.secondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{recipe.dificultad}</Text>
                      </View>
                      <View style={styles.viewRecipeBtn}>
                        <Text style={[styles.viewRecipeBtnText, { color: colors.primary }]}>Ver Receta</Text>
                        <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })
          ) : activeCategory === 'Favoritos' ? (
            <View style={[styles.emptyContainer, styles.emptyFavoritesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.16)' : 'rgba(200, 92, 56, 0.08)' }]}>
                <Ionicons name="restaurant" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin Recetas Favoritas</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay recetas marcadas como favoritas todavía. Explorá nuestro recetario, tocá el corazón en tus platos preferidos y los verás aquí.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No encontramos recetas de esa sección o búsqueda.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Recipe Detail Modal with Interactive Checklist */}
      {selectedRecipe && (
        <Modal
          visible={!!selectedRecipe}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedRecipe(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
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
                    <Text style={styles.modalMetaLabel}>Tiempo</Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="star" size={18} color={colors.primary} />
                    <Text style={[styles.modalMetaValue, { color: colors.text }]}>{selectedRecipe.dificultad}</Text>
                    <Text style={styles.modalMetaLabel}>Dificultad</Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="restaurant" size={18} color={colors.primary} />
                    <Text style={[styles.modalMetaValue, { color: colors.text }]}>{selectedRecipe.categoría}</Text>
                    <Text style={styles.modalMetaLabel}>Mesa</Text>
                  </View>
                </View>

                {(() => {
                  const prog = recipeProgress[selectedRecipe.id];
                  const stepsDone = prog ? prog.completedSteps.length : 0;
                  const totalSteps = selectedRecipe.preparación.length;
                  const percent = totalSteps > 0 ? Math.round((stepsDone / totalSteps) * 100) : 0;
                  return (
                    <View style={[styles.progressContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                      <View style={styles.progressTextRow}>
                        <Text style={styles.progressLabel}>Progreso de la receta</Text>
                        <Text style={[styles.progressPercent, { color: colors.primary }]}>{percent}%</Text>
                      </View>
                      <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(232, 226, 213, 0.5)' }]}>
                        <View style={[styles.progressBar, { width: `${percent}%`, backgroundColor: colors.primary }]} />
                      </View>
                    </View>
                  );
                })()}

                <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Herencia Cultural</Text>
                  <Text style={[styles.modalBodyText, { color: colors.textSecondary }]}>{selectedRecipe.historia}</Text>
                </View>

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
                            { color: isChecked ? colors.textSecondary : colors.text },
                            isChecked && styles.checklistTextChecked
                          ]}
                        >
                          {ing}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

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
                          { borderBottomColor: colors.border },
                          isChecked && styles.stepCheckRowChecked
                        ]}
                      >
                        <View style={[styles.stepNumCircle, { backgroundColor: isChecked ? colors.secondary : colors.primary }]}>
                          {isChecked ? (
                            <Ionicons name="checkmark" size={12} color={colors.white} />
                          ) : (
                            <Text style={styles.stepNumText}>{i + 1}</Text>
                          )}
                        </View>
                        <Text style={[styles.stepText, { color: isChecked ? colors.textSecondary : colors.text }, isChecked && styles.stepTextChecked]}>
                          {step}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={[styles.modalSection, styles.grandmaCard, { backgroundColor: isDarkMode ? 'rgba(223, 177, 91, 0.15)' : 'rgba(223, 177, 91, 0.08)', borderColor: isDarkMode ? 'rgba(223, 177, 91, 0.4)' : 'rgba(223, 177, 91, 0.25)' }]}>
                  <View style={styles.grandmaCardHeader}>
                    <Ionicons name="flame" size={20} color={colors.accent} />
                    <Text style={[styles.grandmaCardTitle, { color: isDarkMode ? colors.accent : '#9E7A1C' }]}>El Consejo de la Abuela</Text>
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
  searchBarContainer: {
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
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  categoryBadge: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.roundness.round,
    marginRight: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  categoryBadgeActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  categoryBadgeText: {
    fontSize: Theme.typography.sizes.sm - 1,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.medium,
  },
  categoryBadgeTextActive: {
    color: Theme.colors.white,
    fontWeight: Theme.typography.weights.bold,
  },
  catalogList: {
    paddingHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  editorialCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.roundness.lg,
    padding: 0,
    marginBottom: Theme.spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  editorialImage: {
    width: '100%',
    height: 170,
    resizeMode: 'cover',
  },
  editorialBody: {
    padding: Theme.spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  starsRow: {
    flexDirection: 'row',
  },
  editorialTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    letterSpacing: -0.3,
  },
  editorialDesc: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
    marginTop: 6,
  },
  metaDivider: {
    height: 0.5,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md - 2,
  },
  editorialMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.medium,
    marginLeft: 4,
  },
  viewRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewRecipeBtnText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xl,
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
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
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
  modalScroll: {
    paddingBottom: 40,
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
  cardHeartIcon: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyFavoritesCard: {
    width: '100%',
    padding: Theme.spacing.xl,
    borderRadius: Theme.roundness.lg,
    borderWidth: 1.5,
    marginTop: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  emptyTitle: {
    fontSize: Theme.typography.sizes.md + 2,
    fontWeight: Theme.typography.weights.bold,
    textAlign: 'center',
    marginBottom: 6,
  },
});

export default RecetasScreen;
