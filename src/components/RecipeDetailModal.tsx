import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Theme from '../theme';
import { Recipe } from '../types';
import { RECIPES, FESTIVALS } from '../services/mockData';
import { useGlobalState } from '../services/GlobalStateContext';
import SkeletonLoader from './SkeletonLoader';

const getGrandmaTip = (recipeId: string): string => {
  switch (recipeId) {
    case 'r1':
      return 'El gran secreto de las abuelas correntinas es agregar una cucharada de jugo de naranja natural al amasar. Esto ayuda a que el chipá quede esponjoso.';
    case 'r2':
      return 'Para un Mbaipy bien cremoso, cocinalo a fuego corona (muy lento) en olla de hierro y usá harina de maíz de molienda fina, hidratándola previamente.';
    case 'r3':
      return 'El guiso de arroz sale más sabroso si sofríes bien la carne hasta que dore en grasa de cerdo, y usas arroz largo fino de producción local.';
    case 'r4':
      return 'Para que los trozos de mamón queden firmes por fuera y cremosos por dentro, dejalos reposar en agua con bicarbonato de sodio unas horas antes de cocinar.';
    default:
      return 'Cociná siempre con paciencia, a fuego lento y con el corazón para honrar los saberes de nuestra tierra.';
  }
};

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  visible: boolean;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  visible,
  onClose,
}) => {
  const router = useRouter();
  const {
    favorites,
    toggleFavorite,
    recipeProgress,
    updateIngredientProgress,
    updateStepProgress,
    addRecentlyViewed,
    recentlyViewed,
    colors,
    isDarkMode,
  } = useGlobalState();

  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [visibleSections, setVisibleSections] = useState<number>(0);

  // Handle loading animations when recipe changes or modal opens
  useEffect(() => {
    let timers: any[] = [];
    if (visible && recipe) {
      const initTimer = setTimeout(() => {
        setIsLoadingDetail(true);
        setVisibleSections(0);
      }, 0);
      timers.push(initTimer);
      
      const loadTimer = setTimeout(() => {
        setIsLoadingDetail(false);
        timers.push(setTimeout(() => setVisibleSections(1), 50));
        timers.push(setTimeout(() => setVisibleSections(2), 150));
        timers.push(setTimeout(() => setVisibleSections(3), 250));
        timers.push(setTimeout(() => setVisibleSections(4), 350));
        timers.push(setTimeout(() => setVisibleSections(5), 450));
        timers.push(setTimeout(() => setVisibleSections(6), 550));
        timers.push(setTimeout(() => setVisibleSections(7), 650));
      }, 500);

      timers.push(loadTimer);
    } else {
      const initTimer = setTimeout(() => {
        setIsLoadingDetail(false);
        setVisibleSections(0);
      }, 0);
      timers.push(initTimer);
    }

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [visible, recipe]);

  if (!recipe) return null;

  const prog = recipeProgress[recipe.id];
  const completedSteps = prog ? prog.completedSteps : [];
  const percent = recipe.preparación.length > 0
    ? Math.round((completedSteps.length / recipe.preparación.length) * 100)
    : 0;

  let activeStepIndex = 0;
  for (let i = 0; i < recipe.preparación.length; i++) {
    if (!completedSteps.includes(i)) {
      activeStepIndex = i;
      break;
    }
  }
  if (completedSteps.length === recipe.preparación.length) {
    activeStepIndex = recipe.preparación.length - 1;
  }

  const isFav = favorites.includes(recipe.id);
  const isRecentlyViewed = recentlyViewed.some(item => item.id === recipe.id && item.type === 'recipe');
  const relatedFestival = FESTIVALS.find(f => f.recetaRelacionada === recipe.id);
  const otherRecipes = RECIPES.filter(r => r.id !== recipe.id && r.categoría === recipe.categoría).slice(0, 3);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Navigation Header */}
        <View style={[styles.detailHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
          <Pressable 
            onPress={handleClose} 
            style={({ pressed }) => [styles.backButton, pressed && styles.pressedFeedback]}
            accessibilityRole="button"
            accessibilityLabel="Volver al catálogo"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.detailHeaderTitle, { color: colors.primary }]} numberOfLines={1}>
            {recipe.nombre}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable 
              onPress={() => toggleFavorite(recipe.id)} 
              style={({ pressed }) => [{ marginRight: 8, padding: 4 }, pressed && styles.pressedFeedback]}
              accessibilityRole="button"
              accessibilityState={{ selected: isFav }}
              accessibilityLabel={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <Ionicons 
                name={isFav ? "heart" : "heart-outline"} 
                size={24} 
                color={isFav ? colors.primary : colors.text} 
              />
            </Pressable>
          </View>
        </View>

        {isLoadingDetail ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
            <SkeletonLoader type="details" />
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
            {/* SECCIÓN 1: Hero */}
            {visibleSections >= 1 && (
              <View style={styles.heroSection}>
                <Image 
                  source={{ uri: recipe.video || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600' }} 
                  style={styles.heroImage} 
                  contentFit="cover"
                  placeholder="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100&blur=30"
                  transition={250}
                />
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroTitle}>{recipe.nombre}</Text>
                  <View style={styles.heroCategoryRow}>
                    <Ionicons name="restaurant" size={14} color="#FFF" />
                    <Text style={styles.heroCategoryText}>{recipe.categoría}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* SECCIÓN 2: Meta Info y Guardado/Visto */}
            {visibleSections >= 2 && (
              <View style={[styles.metaRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={styles.metaCol}>
                  <Ionicons name="time" size={18} color={colors.primary} />
                  <Text style={[styles.metaVal, { color: colors.text }]}>{recipe.duración}</Text>
                  <Text style={styles.metaLab}>Tiempo</Text>
                </View>
                <View style={styles.metaCol}>
                  <Ionicons name="star" size={18} color={colors.primary} />
                  <Text style={[styles.metaVal, { color: colors.text }]}>{recipe.dificultad}</Text>
                  <Text style={styles.metaLab}>Dificultad</Text>
                </View>
                <View style={styles.metaCol}>
                  <Pressable
                    onPress={() => addRecentlyViewed(recipe.id, 'recipe')}
                    style={({ pressed }) => [styles.eyeBtn, pressed && styles.pressedFeedback]}
                    accessibilityRole="button"
                    accessibilityState={{ checked: isRecentlyViewed }}
                    accessibilityLabel={isRecentlyViewed ? "Receta marcada como leída" : "Marcar receta como leída"}
                  >
                    <Ionicons 
                      name={isRecentlyViewed ? "checkmark-circle" : "eye-outline"} 
                      size={20} 
                      color={isRecentlyViewed ? colors.secondary : colors.textSecondary} 
                    />
                    <Text style={[styles.metaVal, { color: isRecentlyViewed ? colors.secondary : colors.text, fontSize: 13, fontWeight: '700' }]}>
                      {isRecentlyViewed ? "Leída" : "Marcar vista"}
                    </Text>
                    <Text style={styles.metaLab}>Lectura</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* SECCIÓN 3: Barra de Progreso */}
            {visibleSections >= 3 && (
              <View style={[styles.progressBox, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={styles.progressTextRow}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Progreso de Preparación</Text>
                  <Text style={[styles.progressPercent, { color: colors.primary }]}>{percent}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(232, 226, 213, 0.5)' }]}>
                  <View style={[styles.progressBar, { width: `${percent}%`, backgroundColor: colors.primary }]} />
                </View>
              </View>
            )}

            {/* SECCIÓN 4: Herencia Cultural */}
            {visibleSections >= 4 && (
              <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Herencia Cultural</Text>
                <Text style={[styles.detailBodyText, { color: colors.textSecondary }]}>{recipe.historia}</Text>
              </View>
            )}

            {/* SECCIÓN 5: Ingredientes */}
            {visibleSections >= 5 && (
              <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Ingredientes</Text>
                <Text style={[styles.sectionHelpText, { color: colors.textSecondary }]}>
                  Marcá los ingredientes que ya tenés listos en tu mesa:
                </Text>
                
                {recipe.ingredientes.map((ing, i) => {
                  const isChecked = prog ? prog.completedIngredients.includes(i) : false;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => updateIngredientProgress(recipe.id, i, !isChecked)}
                      style={({ pressed }) => [
                        styles.checklistRow,
                        { borderBottomColor: colors.border },
                        isChecked && styles.checklistRowChecked,
                        pressed && styles.pressedFeedback
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isChecked }}
                      accessibilityLabel={`${isChecked ? 'Ingrediente listo:' : 'Marcar listo:'} ${ing}`}
                    >
                      <Ionicons 
                        name={isChecked ? "checkbox" : "square-outline"} 
                        size={22} 
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
            )}

            {/* SECCIÓN 6: Preparación Paso a Paso */}
            {visibleSections >= 6 && (
              <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Preparación Paso a Paso</Text>
                <Text style={[styles.sectionHelpText, { color: colors.textSecondary }]}>Marcá los pasos a medida que los realizás para continuar la lectura:</Text>
                
                {recipe.preparación.map((step, i) => {
                  const isChecked = completedSteps.includes(i);
                  const isActive = activeStepIndex === i;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => updateStepProgress(recipe.id, i, !isChecked)}
                      style={({ pressed }) => [
                        styles.stepCard,
                        { 
                          backgroundColor: colors.background, 
                          borderColor: isActive ? colors.primary : colors.border,
                          borderWidth: isActive ? 2 : 1
                        },
                        isChecked && styles.stepCardChecked,
                        pressed && styles.pressedFeedback
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isChecked }}
                      accessibilityLabel={`Paso ${i + 1}: ${step}`}
                    >
                      <View style={styles.stepCardHeader}>
                        <View style={[
                          styles.stepNumCircle, 
                          { backgroundColor: isChecked ? colors.secondary : isActive ? colors.primary : colors.textSecondary }
                        ]}>
                          {isChecked ? (
                            <Ionicons name="checkmark" size={12} color={colors.white} />
                          ) : (
                            <Text style={styles.stepNumText}>{i + 1}</Text>
                          )}
                        </View>
                        
                        <Text style={[
                          styles.stepCardTitle, 
                          { color: isActive ? colors.primary : colors.text }
                        ]}>
                          {isActive ? "Paso Activo" : `Paso ${i + 1}`}
                        </Text>

                        {isChecked && (
                          <Text style={[styles.completedBadge, { color: colors.secondary }]}>✓ Completado</Text>
                        )}
                      </View>

                      <Text style={[
                        styles.stepCardBody, 
                        { color: isChecked ? colors.textSecondary : colors.text }, 
                        isChecked && styles.stepTextChecked
                      ]}>
                        {step}
                      </Text>
                    </Pressable>
                  );
                })}

                {/* El Consejo de la Abuela */}
                <View style={[styles.grandmaCard, { 
                  backgroundColor: isDarkMode ? 'rgba(223, 177, 91, 0.15)' : 'rgba(223, 177, 91, 0.08)', 
                  borderColor: isDarkMode ? 'rgba(223, 177, 91, 0.4)' : 'rgba(223, 177, 91, 0.25)' 
                }]}>
                  <View style={styles.grandmaCardHeader}>
                    <Ionicons name="flame" size={20} color={colors.accent} />
                    <Text style={[styles.grandmaCardTitle, { color: isDarkMode ? colors.accent : '#9E7A1C' }]}>El Consejo de la Abuela</Text>
                  </View>
                  <Text style={[styles.grandmaCardBody, { color: colors.text }]}>{getGrandmaTip(recipe.id)}</Text>
                </View>
              </View>
            )}

            {/* SECCIÓN 7: Relación Automática */}
            {visibleSections >= 7 && (
              <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>
                  Origen y Relación Territorial
                </Text>
                <Text style={[styles.sectionHelpText, { color: colors.textSecondary, marginBottom: 12 }]}>
                  Esta receta forma parte de una cadena cultural que une fiestas, productos y rutas locales:
                </Text>

                {relatedFestival ? (
                  <View>
                    {/* Visual Timeline/Chain */}
                    <View style={[styles.relationChain, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      {/* Element 1: Fiesta */}
                      <View style={styles.chainNode}>
                        <View style={[styles.nodeIconCircle, { backgroundColor: colors.primary }]}>
                          <Ionicons name="sparkles" size={16} color={colors.white} />
                        </View>
                        <Text style={[styles.nodeLabel, { color: colors.text }]} numberOfLines={1}>Fiesta</Text>
                        <Text style={[styles.nodeVal, { color: colors.textSecondary }]} numberOfLines={1}>
                          {relatedFestival.nombre.replace('Fiesta Provincial del ', '').replace('Fiesta Nacional del ', '').replace('Festival del ', '')}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} style={styles.chainArrow} />

                      {/* Element 2: Producto */}
                      <View style={styles.chainNode}>
                        <View style={[styles.nodeIconCircle, { backgroundColor: colors.secondary }]}>
                          <Ionicons name="leaf" size={16} color={colors.white} />
                        </View>
                        <Text style={[styles.nodeLabel, { color: colors.text }]} numberOfLines={1}>Producto</Text>
                        <Text style={[styles.nodeVal, { color: colors.textSecondary }]} numberOfLines={1}>
                          {relatedFestival.productoDestacado}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} style={styles.chainArrow} />

                      {/* Element 3: Receta */}
                      <View style={styles.chainNode}>
                        <View style={[styles.nodeIconCircle, { backgroundColor: colors.accent }]}>
                          <Ionicons name="restaurant" size={16} color={colors.white} />
                        </View>
                        <Text style={[styles.nodeLabel, { color: colors.text }]} numberOfLines={1}>Receta</Text>
                        <Text style={[styles.nodeVal, { color: colors.textSecondary }]} numberOfLines={1}>
                          {recipe.nombre.split(' ')[0]}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} style={styles.chainArrow} />

                      {/* Element 4: Ruta */}
                      <View style={styles.chainNode}>
                        <View style={[styles.nodeIconCircle, { backgroundColor: '#4A3E3D' }]}>
                          <Ionicons name="map" size={16} color={colors.white} />
                        </View>
                        <Text style={[styles.nodeLabel, { color: colors.text }]} numberOfLines={1}>Ruta</Text>
                        <Text style={[styles.nodeVal, { color: colors.textSecondary }]} numberOfLines={1}>
                          {relatedFestival.rutaGastronomica}
                        </Text>
                      </View>
                    </View>

                    {/* Related Festival Card */}
                    <View style={[styles.relatedFestivalCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Image 
                        source={{ uri: relatedFestival.galeria?.[0] }} 
                        style={styles.relatedFestivalImg} 
                        contentFit="cover"
                        placeholder={relatedFestival.galeria?.[0] ? `${relatedFestival.galeria[0]}?w=100&blur=30` : undefined}
                      />
                      <View style={styles.relatedFestivalBody}>
                        <View style={styles.badgeRow}>
                          <View style={[styles.miniBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.miniBadgeText}>{relatedFestival.rutaGastronomica}</Text>
                          </View>
                          <View style={[styles.miniBadge, { backgroundColor: colors.secondary }]}>
                            <Text style={styles.miniBadgeText}>{relatedFestival.localidad}</Text>
                          </View>
                        </View>
                        
                        <Text style={[styles.relatedFestivalTitle, { color: colors.text }]}>{relatedFestival.nombre}</Text>
                        <Text style={[styles.relatedFestivalDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                          {relatedFestival.descripcionCorta || relatedFestival.historia}
                        </Text>

                        <Pressable 
                          style={({ pressed }) => [styles.verFiestaBtn, { backgroundColor: colors.primary }, pressed && styles.pressedFeedback]}
                          onPress={() => {
                            handleClose(); // Close modal
                            router.push({ pathname: '/fiestas', params: { id: relatedFestival.id } });
                          }}
                          accessibilityRole="button"
                          accessibilityLabel="Ir a Fiesta Gastronómica"
                        >
                          <Text style={styles.verFiestaBtnText}>Ver Fiesta Gastronómica</Text>
                          <Ionicons name="arrow-forward" size={16} color={colors.white} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.noRelationCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
                    <Text style={[styles.noRelationText, { color: colors.textSecondary }]}>
                      Esta técnica tradicional es un saber libre de los hogares y no está asociada a un evento oficial único.
                    </Text>
                  </View>
                )}

                {/* Recomendados */}
                {otherRecipes.length > 0 && (
                  <View style={{ marginTop: 24 }}>
                    <Text style={[styles.subSectionTitle, { color: colors.text }]}>Otras Recetas de la misma Categoría</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
                      {otherRecipes.map(item => (
                        <Pressable
                          key={item.id}
                          onPress={() => {
                            // Close modal and navigate to reload recommended recipe details
                            handleClose();
                            router.push({ pathname: '/recetas', params: { id: item.id } });
                          }}
                          style={({ pressed }) => [styles.smallRecipeCard, { backgroundColor: colors.background, borderColor: colors.border }, pressed && styles.pressedFeedback]}
                          accessibilityRole="button"
                          accessibilityLabel={`Ver receta: ${item.nombre}`}
                        >
                          <Image 
                            source={{ uri: item.video || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600' }} 
                            style={styles.smallRecipeImg} 
                            contentFit="cover"
                          />
                          <View style={{ padding: 8 }}>
                            <Text style={[styles.smallRecipeTitle, { color: colors.text }]} numberOfLines={1}>{item.nombre}</Text>
                            <Text style={[styles.smallRecipeMeta, { color: colors.textSecondary }]}>
                              {item.duración} • {item.dificultad}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    height: 56,
  },
  detailHeaderTitle: {
    fontSize: Theme.typography.sizes.md + 1,
    fontWeight: Theme.typography.weights.bold,
    flex: 1,
    marginHorizontal: Theme.spacing.sm,
  },
  backButton: {
    padding: 4,
  },
  detailScrollContent: {
    paddingBottom: 170, // Increased bottom padding to prevent overlap with floating player and tab bar
  },
  heroSection: {
    position: 'relative',
    height: 220,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    padding: Theme.spacing.md,
  },
  heroTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: '#FFF',
    marginBottom: 4,
  },
  heroCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCategoryText: {
    fontSize: Theme.typography.sizes.xs,
    color: '#FFF',
    marginLeft: 4,
    fontWeight: Theme.typography.weights.medium,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
  },
  metaCol: {
    alignItems: 'center',
    flex: 1,
  },
  metaVal: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginTop: 4,
  },
  metaLab: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  eyeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBox: {
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
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
  },
  progressPercent: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  detailSection: {
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  detailSectionTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.sm,
    borderLeftWidth: 3,
    paddingLeft: Theme.spacing.sm,
  },
  detailBodyText: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 22,
  },
  sectionHelpText: {
    fontSize: 11,
    marginBottom: Theme.spacing.sm,
    fontStyle: 'italic',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  checklistRowChecked: {
    opacity: 0.55,
  },
  checklistText: {
    fontSize: Theme.typography.sizes.sm + 1,
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  checklistTextChecked: {
    textDecorationLine: 'line-through',
  },
  stepCard: {
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
  },
  stepCardChecked: {
    opacity: 0.55,
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
  },
  stepNumText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: '#FFF',
  },
  stepCardTitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    flex: 1,
  },
  completedBadge: {
    fontSize: 10,
    fontWeight: Theme.typography.weights.semibold,
  },
  stepCardBody: {
    fontSize: Theme.typography.sizes.sm + 1,
    lineHeight: 22,
    paddingLeft: 32,
  },
  stepTextChecked: {
    textDecorationLine: 'line-through',
  },
  grandmaCard: {
    borderWidth: 1.5,
    borderRadius: Theme.roundness.md,
    marginTop: Theme.spacing.lg,
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
    marginLeft: Theme.spacing.sm,
  },
  grandmaCardBody: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  relationChain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Theme.roundness.md,
    borderWidth: 1,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.xs,
  },
  chainNode: {
    alignItems: 'center',
    flex: 1,
  },
  nodeIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  nodeLabel: {
    fontSize: 8,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
  },
  nodeVal: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
    textAlign: 'center',
  },
  chainArrow: {
    alignSelf: 'center',
    opacity: 0.5,
  },
  relatedFestivalCard: {
    borderRadius: Theme.roundness.lg,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: Theme.spacing.md,
  },
  relatedFestivalImg: {
    width: '100%',
    height: 140,
  },
  relatedFestivalBody: {
    padding: Theme.spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.xs,
  },
  miniBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.roundness.round,
    marginRight: 6,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
    color: '#FFF',
  },
  relatedFestivalTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: 4,
  },
  relatedFestivalDesc: {
    fontSize: Theme.typography.sizes.xs + 1,
    lineHeight: 16,
    marginBottom: Theme.spacing.md,
  },
  verFiestaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Theme.roundness.sm,
  },
  verFiestaBtnText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: '#FFF',
    marginRight: Theme.spacing.sm,
  },
  noRelationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    borderWidth: 1,
  },
  noRelationText: {
    fontSize: Theme.typography.sizes.xs + 1,
    flex: 1,
    marginLeft: Theme.spacing.sm,
    lineHeight: 16,
  },
  subSectionTitle: {
    fontSize: Theme.typography.sizes.sm + 1,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.sm,
  },
  smallRecipeCard: {
    width: 140,
    borderRadius: Theme.roundness.md,
    borderWidth: 1,
    marginRight: Theme.spacing.sm,
    overflow: 'hidden',
  },
  smallRecipeImg: {
    width: '100%',
    height: 80,
  },
  smallRecipeTitle: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
  },
  smallRecipeMeta: {
    fontSize: 9,
  },
  pressedFeedback: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});

export default RecipeDetailModal;
