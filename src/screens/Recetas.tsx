import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import { RECIPES, FESTIVALS } from '../services/mockData';
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
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [visibleSections, setVisibleSections] = useState<number>(0);

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

  useEffect(() => {
    let timers: any[] = [];
    if (selectedRecipe) {
      setIsLoadingDetail(true);
      setVisibleSections(0);
      const loadTimer = setTimeout(() => {
        setIsLoadingDetail(false);
        timers.push(setTimeout(() => setVisibleSections(1), 50));
        timers.push(setTimeout(() => setVisibleSections(2), 150));
        timers.push(setTimeout(() => setVisibleSections(3), 250));
        timers.push(setTimeout(() => setVisibleSections(4), 350));
        timers.push(setTimeout(() => setVisibleSections(5), 450));
        timers.push(setTimeout(() => setVisibleSections(6), 550));
        timers.push(setTimeout(() => setVisibleSections(7), 650));
      }, 450);
      timers.push(loadTimer);
    } else {
      setIsLoadingDetail(false);
      setVisibleSections(0);
    }
    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [selectedRecipe]);

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

  // Encuentra la receta con progreso para el banner de "Continuar lectura"
  const inProgressRecipes = Object.entries(recipeProgress)
    .map(([recipeId, progress]) => {
      const recipe = RECIPES.find(r => r.id === recipeId);
      return { recipe, progress };
    })
    .filter((item): item is { recipe: Recipe; progress: typeof item.progress } => {
      if (!item.recipe) return false;
      const totalSteps = item.recipe.preparación.length;
      const stepsDone = item.progress.completedSteps?.length || 0;
      const totalIngredients = item.recipe.ingredientes.length;
      const ingredientsDone = item.progress.completedIngredients?.length || 0;
      return (stepsDone > 0 || ingredientsDone > 0) && (stepsDone < totalSteps);
    })
    .sort((a, b) => (b.progress.lastUpdated || 0) - (a.progress.lastUpdated || 0));

  const resumingItem = inProgressRecipes[0];

  if (selectedRecipe) {
    if (isLoadingDetail) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.detailHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <Pressable onPress={() => setSelectedRecipe(null)} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Volver">
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.detailHeaderTitle, { color: colors.primary }]} numberOfLines={1}>
              {selectedRecipe.nombre}
            </Text>
          </View>
          <ScrollView>
            <SkeletonLoader type="details" />
          </ScrollView>
        </SafeAreaView>
      );
    }

    const relatedFestival = FESTIVALS.find(f => f.recetaRelacionada === selectedRecipe.id);
    const otherRecipes = RECIPES.filter(r => r.id !== selectedRecipe.id && r.categoría === selectedRecipe.categoría).slice(0, 3);
    const prog = recipeProgress[selectedRecipe.id];
    const stepsDone = prog ? prog.completedSteps.length : 0;
    const totalSteps = selectedRecipe.preparación.length;
    const percent = totalSteps > 0 ? Math.round((stepsDone / totalSteps) * 100) : 0;
    const isFav = favorites.includes(selectedRecipe.id);
    const isRecentlyViewed = recentlyViewed.some(item => item.id === selectedRecipe.id && item.type === 'recipe');

    // Identificar el paso activo actual
    const completedSteps = prog ? prog.completedSteps : [];
    let activeStepIndex = 0;
    for (let i = 0; i < selectedRecipe.preparación.length; i++) {
      if (!completedSteps.includes(i)) {
        activeStepIndex = i;
        break;
      }
    }
    if (completedSteps.length === selectedRecipe.preparación.length) {
      activeStepIndex = selectedRecipe.preparación.length - 1;
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Navigation Header */}
        <View style={[styles.detailHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
          <Pressable onPress={() => setSelectedRecipe(null)} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Volver al catálogo">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.detailHeaderTitle, { color: colors.primary }]} numberOfLines={1}>
            {selectedRecipe.nombre}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable 
              onPress={() => toggleFavorite(selectedRecipe.id)} 
              style={{ marginRight: 8, padding: 4 }}
              accessibilityRole="button"
              accessibilityLabel="Favorito"
            >
              <Ionicons 
                name={isFav ? "heart" : "heart-outline"} 
                size={24} 
                color={isFav ? colors.primary : colors.text} 
              />
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          {/* SECCIÓN 1: Hero */}
          {visibleSections >= 1 && (
            <View style={styles.heroSection}>
              <Image source={{ uri: selectedRecipe.video || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600' }} style={styles.heroImage} />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>{selectedRecipe.nombre}</Text>
                <View style={styles.heroCategoryRow}>
                  <Ionicons name="restaurant" size={14} color="#FFF" />
                  <Text style={styles.heroCategoryText}>{selectedRecipe.categoría}</Text>
                </View>
              </View>
            </View>
          )}

          {/* SECCIÓN 2: Meta Info y Guardado/Visto */}
          {visibleSections >= 2 && (
            <View style={[styles.metaRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <View style={styles.metaCol}>
                <Ionicons name="time" size={18} color={colors.primary} />
                <Text style={[styles.metaVal, { color: colors.text }]}>{selectedRecipe.duración}</Text>
                <Text style={styles.metaLab}>Tiempo</Text>
              </View>
              <View style={styles.metaCol}>
                <Ionicons name="star" size={18} color={colors.primary} />
                <Text style={[styles.metaVal, { color: colors.text }]}>{selectedRecipe.dificultad}</Text>
                <Text style={styles.metaLab}>Dificultad</Text>
              </View>
              <View style={styles.metaCol}>
                <Pressable
                  onPress={() => addRecentlyViewed(selectedRecipe.id, 'recipe')}
                  style={styles.eyeBtn}
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
              <Text style={[styles.detailBodyText, { color: colors.textSecondary }]}>{selectedRecipe.historia}</Text>
            </View>
          )}

          {/* SECCIÓN 5: Ingredientes */}
          {visibleSections >= 5 && (
            <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Ingredientes</Text>
              <Text style={[styles.sectionHelpText, { color: colors.textSecondary }]}>
                Marcá los ingredientes que ya tenés listos en tu mesa:
              </Text>
              
              {selectedRecipe.ingredientes.map((ing, i) => {
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
              
              {selectedRecipe.preparación.map((step, i) => {
                const isChecked = completedSteps.includes(i);
                const isActive = activeStepIndex === i;
                return (
                  <Pressable
                    key={i}
                    onPress={() => updateStepProgress(selectedRecipe.id, i, !isChecked)}
                    style={[
                      styles.stepCard,
                      { 
                        backgroundColor: colors.background, 
                        borderColor: isActive ? colors.primary : colors.border,
                        borderWidth: isActive ? 2 : 1
                      },
                      isChecked && styles.stepCardChecked
                    ]}
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
                <Text style={[styles.grandmaCardBody, { color: colors.text }]}>{getGrandmaTip(selectedRecipe.id)}</Text>
              </View>
            </View>
          )}

          {/* SECCIÓN 7: Relación Automática (Fiesta ➔ Producto ➔ Receta ➔ Ruta gastronómica) */}
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
                        {selectedRecipe.nombre.split(' ')[0]}
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
                    <Image source={{ uri: relatedFestival.galeria?.[0] }} style={styles.relatedFestivalImg} />
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
                        style={[styles.verFiestaBtn, { backgroundColor: colors.primary }]}
                        onPress={() => {
                          setSelectedRecipe(null); // Close recipe detail first
                          router.push({ pathname: '/fiestas', params: { id: relatedFestival.id } });
                        }}
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

              {/* Recomendados: Otras recetas de la misma ruta */}
              {otherRecipes.length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <Text style={[styles.subSectionTitle, { color: colors.text }]}>Otras Recetas de la misma Categoría</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
                    {otherRecipes.map(item => (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          setSelectedRecipe(item);
                          addRecentlyViewed(item.id, 'recipe');
                        }}
                        style={[styles.smallRecipeCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                      >
                        <Image source={{ uri: item.video || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600' }} style={styles.smallRecipeImg} />
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
      </SafeAreaView>
    );
  }

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

        {/* Continuar Lectura Banner Section */}
        {resumingItem && (
          <View>
            <Text style={[styles.sectionTitleLabel, { color: colors.textSecondary }]}>Retomar Preparación</Text>
            <Card
              style={[styles.resumeBanner, { backgroundColor: colors.surface, borderColor: colors.primary }]}
              border={true}
              elevation="sm"
              onPress={() => handleOpenRecipe(resumingItem.recipe)}
            >
              <Image source={{ uri: resumingItem.recipe.video || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600' }} style={styles.resumeImg} />
              <View style={styles.resumeContent}>
                <Text style={[styles.resumeLabel, { color: colors.primary }]}>Continuar Lectura</Text>
                <Text style={[styles.resumeTitle, { color: colors.text }]} numberOfLines={1}>{resumingItem.recipe.nombre}</Text>
                
                {(() => {
                  const rProg = resumingItem.progress;
                  const done = rProg.completedSteps?.length || 0;
                  const total = resumingItem.recipe.preparación.length;
                  const rPercent = total > 0 ? Math.round((done / total) * 100) : 0;
                  // Get next step text
                  let nextStepText = 'Empezar preparación';
                  for (let s = 0; s < total; s++) {
                    if (!rProg.completedSteps.includes(s)) {
                      nextStepText = `Paso ${s + 1}: ${resumingItem.recipe.preparación[s]}`;
                      break;
                    }
                  }
                  return (
                    <View>
                      <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                        {nextStepText}
                      </Text>
                      <View style={styles.resumeProgressRow}>
                        <View style={[styles.resumeProgressTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(232, 226, 213, 0.5)' }]}>
                          <View style={[styles.resumeProgressFill, { width: `${rPercent}%`, backgroundColor: colors.primary }]} />
                        </View>
                        <Text style={[styles.resumeProgressText, { color: colors.primary }]}>{rPercent}%</Text>
                      </View>
                    </View>
                  );
                })()}
              </View>
              <View style={[styles.resumeBtn, { backgroundColor: 'rgba(200, 92, 56, 0.08)' }]}>
                <Ionicons name="play" size={16} color={colors.primary} />
              </View>
            </Card>
          </View>
        )}

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
              const isSeen = recentlyViewed.some(item => item.id === recipe.id && item.type === 'recipe');
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
                    {isSeen && (
                      <View style={styles.viewedBadge}>
                        <Ionicons name="checkmark-circle" size={10} color="#FFF" style={{ marginRight: 3 }} />
                        <Text style={styles.viewedBadgeText}>VISTA</Text>
                      </View>
                    )}
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
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
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
  // --- Detailed Inline View Styles ---
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
    paddingBottom: 130,
  },
  heroSection: {
    position: 'relative',
    height: 220,
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
  // --- Relationship styles ---
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
    resizeMode: 'cover',
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
    resizeMode: 'cover',
  },
  smallRecipeTitle: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
  },
  smallRecipeMeta: {
    fontSize: 9,
  },
  // --- Resumption and card badges ---
  sectionTitleLabel: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
    marginHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
    letterSpacing: 0.5,
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Theme.roundness.lg,
    borderWidth: 1.5,
    padding: Theme.spacing.md,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  resumeImg: {
    width: 54,
    height: 54,
    borderRadius: Theme.roundness.sm,
    marginRight: Theme.spacing.md,
  },
  resumeContent: {
    flex: 1,
  },
  resumeLabel: {
    fontSize: 8,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resumeTitle: {
    fontSize: Theme.typography.sizes.sm + 1,
    fontWeight: Theme.typography.weights.bold,
    marginTop: 1,
  },
  resumeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  resumeProgressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: Theme.spacing.sm,
    overflow: 'hidden',
  },
  resumeProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  resumeProgressText: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
  },
  resumeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.sm,
  },
  viewedBadge: {
    position: 'absolute',
    top: Theme.spacing.sm,
    left: Theme.spacing.sm,
    backgroundColor: 'rgba(46, 111, 64, 0.9)',
    borderRadius: Theme.roundness.xs,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewedBadgeText: {
    fontSize: 8,
    fontWeight: Theme.typography.weights.bold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
});

export default RecetasScreen;
