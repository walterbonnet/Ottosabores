import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ImageBackground,
  TextInput,
  Pressable,
  Modal,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Theme from '../theme';
import Card from '../components/Card';
import { RECIPES, FESTIVALS } from '../services/mockData';
import { Recipe, Festival } from '../types';
import { useGlobalState } from '../services/GlobalStateContext';
import SkeletonLoader from '../components/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CURIOSITIES = [
  {
    title: 'El Gofio Litoraleño',
    fact: 'En Corrientes el gofio es maíz tostado y molido dulce. Es el acompañante clásico del chicharrón trenzado, aportando un dulzor que equilibra la grasa.',
    icon: 'star' as const,
  },
  {
    title: 'Origen de la Mandioca',
    fact: 'Los guaraníes consideraban a la mandioca un regalo de los dioses. Su nombre original, "Mandió", alude a la piel rugosa del tubérculo y su pulpa blanca celestial.',
    icon: 'sunny' as const,
  },
  {
    title: 'El Secreto del Espinillo',
    fact: 'El humo de la leña de Espinillo es considerado el perfume secreto de la cocina litoraleña. Su brasa lenta da el sabor ahumado característico al chipá mbocá.',
    icon: 'flame' as const,
  }
];

// Helper to provide grandma tips locally to keep visual system
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

export const InicioScreen: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [festivalActiveTab, setFestivalActiveTab] = useState<number>(0);
  const [isPlayingFestivalVideo, setIsPlayingFestivalVideo] = useState<boolean>(false);
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false]);

  const {
    favorites,
    recipeProgress,
    recentlyViewed,
    addRecentlyViewed,
    toggleFavorite,
    updateIngredientProgress,
    updateStepProgress,
    isFirstLaunch,
    completeOnboarding,
    colors,
    isDarkMode,
  } = useGlobalState();

  const [showSplash, setShowSplash] = useState(isFirstLaunch);
  const [isOnboarding, setIsOnboarding] = useState(isFirstLaunch);
  const [onboardingSlide, setOnboardingSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Animated values
  const [splashProgress] = useState(() => new Animated.Value(0));
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOnboarding(isFirstLaunch);
      setShowSplash(isFirstLaunch);
    }, 0);
    return () => clearTimeout(timer);
  }, [isFirstLaunch]);

  useEffect(() => {
    if (showSplash) {
      // Pulse logo animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 800,
            useNativeDriver: true,
          })
        ])
      ).start();

      // Progress bar animation
      Animated.timing(splashProgress, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            setShowSplash(false);
            fadeAnim.setValue(1);
          });
        }
      });
    }
  }, [showSplash, splashProgress, pulseAnim, fadeAnim]);

  useEffect(() => {
    if (!isFirstLaunch) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isFirstLaunch]);

  const handleCompleteOnboarding = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      completeOnboarding();
      setIsOnboarding(false);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    });
  };

  const handleFlipCard = (index: number) => {
    const updated = [...flippedCards];
    updated[index] = !updated[index];
    setFlippedCards(updated);
  };

  const handleOpenRecipe = (recipe: Recipe) => {
    addRecentlyViewed(recipe.id, 'recipe');
    setSelectedRecipe(recipe);
  };

  const handleOpenFestival = (festival: Festival) => {
    addRecentlyViewed(festival.id, 'festival');
    setSelectedFestival(festival);
    setFestivalActiveTab(0);
    setIsPlayingFestivalVideo(false);
  };

  const filteredRecipes = RECIPES.filter(recipe => {
    return recipe.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
           recipe.historia.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // --- Dynamic Modules Computation ---

  // 1. Continuar Exploración
  const progressList = Object.entries(recipeProgress)
    .map(([id, prog]) => {
      const recipe = RECIPES.find(r => r.id === id);
      return { id, prog, recipe };
    })
    .filter((item): item is { id: string; prog: any; recipe: Recipe } => !!item.recipe)
    .sort((a, b) => b.prog.lastUpdated - a.prog.lastUpdated);

  const lastProgress = progressList[0];
  let continueRecipe: Recipe | null = null;
  let continuePercent = 0;
  let continueStepsDone = 0;
  let continueStepsTotal = 0;
  if (lastProgress) {
    const totalSteps = lastProgress.recipe.preparación.length;
    continueStepsTotal = totalSteps;
    continueStepsDone = lastProgress.prog.completedSteps.length;
    
    // Incomplete recipe reads
    if (continueStepsDone > 0 && continueStepsDone < totalSteps) {
      continueRecipe = lastProgress.recipe;
      continuePercent = Math.round((continueStepsDone / totalSteps) * 100);
    }
  }

  // 2. Últimos Vistos
  const recentlyViewedItems = recentlyViewed
    .map(item => {
      if (item.type === 'recipe') {
        const rec = RECIPES.find(r => r.id === item.id);
        return rec ? { ...rec, type: 'recipe' as const } : null;
      } else {
        const fest = FESTIVALS.find(f => f.id === item.id);
        return fest ? { ...fest, type: 'festival' as const } : null;
      }
    })
    .filter((x): x is (Recipe & { type: 'recipe' }) | (Festival & { type: 'festival' }) => !!x)
    .slice(0, 5);

  // 3. Recomendado del Día / Personalizado
  let recommendedRecipe = RECIPES[0];
  let recommendationBadge = "Sabor Auténtico";
  if (favorites.length > 0) {
    const favRecipes = RECIPES.filter(r => favorites.includes(r.id));
    const favCategories = favRecipes.map(r => r.categoría);
    const sameCategoryUnfav = RECIPES.filter(r => favCategories.includes(r.categoría) && !favorites.includes(r.id));
    
    if (sameCategoryUnfav.length > 0) {
      recommendedRecipe = sameCategoryUnfav[0];
      recommendationBadge = "Especial Para Vos";
    } else {
      const unfav = RECIPES.filter(r => !favorites.includes(r.id));
      if (unfav.length > 0) {
        recommendedRecipe = unfav[0];
        recommendationBadge = "Sabor Recomendado";
      }
    }
  } else {
    // default suggestion
    recommendedRecipe = RECIPES[1]; // Mbaipy
    recommendationBadge = "Sugerencia del Día";
  }

  if (showSplash) {
    const barWidth = splashProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <SafeAreaView style={[styles.splashContainer, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.splashInner, { opacity: fadeAnim }]}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
            <View style={[styles.splashLogoCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="flame" size={64} color={colors.white} />
            </View>
            <Text style={[styles.splashBrand, { color: colors.primary }]}>Sabores 4.0</Text>
            <Text style={[styles.splashSubtitle, { color: colors.textSecondary }]}>El Fuego del Taragüí</Text>
          </Animated.View>

          <View style={styles.splashLoadingContainer}>
            <View style={[styles.splashTrack, { backgroundColor: colors.border }]}>
              <Animated.View style={[styles.splashBar, { width: barWidth, backgroundColor: colors.accent }]} />
            </View>
            <Text style={[styles.splashProgressText, { color: colors.textSecondary }]}>Cargando cultura y tradición...</Text>
          </View>

          <View style={styles.splashIconsRow}>
            <Ionicons name="restaurant" size={24} color={colors.textSecondary} style={styles.splashIcon} />
            <Ionicons name="leaf" size={24} color={colors.textSecondary} style={styles.splashIcon} />
            <Ionicons name="map" size={24} color={colors.textSecondary} style={styles.splashIcon} />
            <Ionicons name="sparkles" size={24} color={colors.textSecondary} style={styles.splashIcon} />
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (isOnboarding) {
    const slides = [
      {
        title: 'Exploración de Rutas',
        desc: 'Navegá por las localidades correntinas, descubriendo sus platos típicos y secretos gastronómicos únicos.',
        icon: 'map-outline',
        color: colors.primary,
        image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'Saberes Tradicionales',
        desc: 'Accedé a recetas ancestrales con listas de control inteligentes y sumá puntos de experiencia cocinando.',
        icon: 'restaurant-outline',
        color: colors.secondary,
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'Realidad Aumentada',
        desc: 'Escaneá códigos QR para proyectar platos tradicionales en 3D y escuchar relatos de la historia correntina.',
        icon: 'qr-code-outline',
        color: colors.accent,
        image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop&q=80',
      },
    ];

    const currentSlide = slides[onboardingSlide];

    return (
      <SafeAreaView style={[styles.onboardingContainer, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.onboardingInner, { opacity: fadeAnim }]}>
          <View style={styles.onboardingHeader}>
            <Pressable 
              onPress={handleCompleteOnboarding}
              style={styles.skipButton}
              accessibilityRole="button"
              accessibilityLabel="Omitir introducción"
            >
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>Omitir</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.onboardingScroll} showsVerticalScrollIndicator={false}>
            <Image 
              source={{ uri: currentSlide.image }} 
              style={styles.onboardingImage} 
            />

            <View style={styles.onboardingCardBody}>
              <View style={[styles.onboardingIconBg, { backgroundColor: currentSlide.color + '18' }]}>
                <Ionicons name={currentSlide.icon as any} size={40} color={currentSlide.color} />
              </View>

              <Text style={[styles.onboardingTitle, { color: colors.text }]}>{currentSlide.title}</Text>
              <Text style={[styles.onboardingDesc, { color: colors.textSecondary }]}>{currentSlide.desc}</Text>
            </View>
          </ScrollView>

          <View style={styles.dotsRow}>
            {slides.map((_, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.dotItem, 
                  { backgroundColor: onboardingSlide === idx ? colors.primary : colors.border },
                  onboardingSlide === idx && { width: 18 }
                ]} 
              />
            ))}
          </View>

          <View style={styles.onboardingFooter}>
            {onboardingSlide > 0 ? (
              <Pressable 
                onPress={() => setOnboardingSlide(prev => prev - 1)}
                style={[styles.navBtn, { borderColor: colors.border, borderWidth: 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Volver al slide anterior"
              >
                <Text style={[styles.navBtnText, { color: colors.text }]}>Atrás</Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {onboardingSlide < 2 ? (
              <Pressable 
                onPress={() => setOnboardingSlide(prev => prev + 1)}
                style={[styles.navBtn, { backgroundColor: colors.primary }]}
                accessibilityRole="button"
                accessibilityLabel="Siguiente slide"
              >
                <Text style={[styles.navBtnText, { color: colors.white }]}>Siguiente</Text>
              </Pressable>
            ) : (
              <Pressable 
                onPress={handleCompleteOnboarding}
                style={[styles.navBtn, { backgroundColor: colors.secondary }]}
                accessibilityRole="button"
                accessibilityLabel="Comenzar Aventura"
              >
                <Text style={[styles.navBtnText, { color: colors.white }]}>Comenzar</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Principal con Imagen de Fondo y Eslogan */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=1000&auto=format&fit=crop&q=80' }} 
          style={styles.heroBackground}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}>
                <Ionicons name="restaurant" size={20} color={colors.primary} />
              </View>
              <Text style={styles.heroBrandName}>Sabores 4.0</Text>
            </View>
            <View style={styles.heroTitleContainer}>
              <Text style={styles.heroTitle}>La gastronomía correntina</Text>
              <Text style={styles.heroSubtitle}>en la palma de tu mano</Text>
            </View>
            <View style={styles.heroDivider} />
            <Text style={styles.heroSlogan}>Tradición, fuego y tierra del Taragüí</Text>
          </View>
        </ImageBackground>

        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <SkeletonLoader type="card" />
            <SkeletonLoader type="list" />
            <SkeletonLoader type="card" />
          </View>
        ) : (
          <>
            {/* Bienvenida y Mensaje */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>¡Bienvenidos, Chamigos!</Text>
              <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                Descubrí la rica confluencia de la cultura jesuítico-guaraní y española en el litoral argentino. Un recorrido sensorial por recetas ancestrales, ingredientes puros de la tierra y festivales populares.
              </Text>
            </View>

            {/* Buscador Integrado */}
            <View style={styles.searchContainer}>
              <Card style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="sm" border={true}>
                <View style={styles.searchInner}>
                  <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar chipá, mbaipy, guiso, fiestas..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                    </Pressable>
                  )}
                </View>
              </Card>
            </View>

            {/* Conditionally Render Search Results or Main Layout */}
            {searchQuery.length > 0 ? (
              <View style={styles.recipesSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Resultados de Búsqueda</Text>
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe) => {
                    const isFav = favorites.includes(recipe.id);
                    return (
                      <Card 
                        key={recipe.id}
                        style={[styles.recipeListItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => handleOpenRecipe(recipe)}
                        elevation="sm"
                        border={true}
                      >
                        <View style={styles.recipeRow}>
                          <Image source={{ uri: recipe.video || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400' }} style={[styles.recipeThumbnail, { backgroundColor: colors.surfaceDark }]} />
                          <View style={styles.recipeInfo}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={[styles.recipeCategoryText, { color: colors.primary }]}>{recipe.categoría}</Text>
                              <Pressable onPress={() => toggleFavorite(recipe.id)} style={{ padding: 4 }}>
                                <Ionicons 
                                  name={isFav ? "heart" : "heart-outline"} 
                                  size={16} 
                                  color={isFav ? colors.primary : colors.textSecondary} 
                                />
                              </Pressable>
                            </View>
                            <Text style={[styles.recipeTitleText, { color: colors.text }]}>{recipe.nombre}</Text>
                            <Text style={[styles.recipeDescText, { color: colors.textSecondary }]} numberOfLines={2}>
                              {recipe.historia}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    );
                  })
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="sad-outline" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No encontramos recetas que coincidan con tu búsqueda.</Text>
                  </View>
                )}
              </View>
            ) : (
              <>
                {/* 1. Continuar Exploración */}
                {continueRecipe && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Continuar exploración</Text>
                    <Card 
                      style={[styles.continueCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
                      elevation="sm" 
                      border={true}
                      onPress={() => handleOpenRecipe(continueRecipe!)}
                    >
                      <View style={styles.continueRow}>
                        <Image source={{ uri: continueRecipe.video }} style={[styles.continueThumbnail, { backgroundColor: colors.surfaceDark }]} />
                        <View style={styles.continueInfo}>
                          <Text style={[styles.continueCategory, { color: colors.primary }]}>{continueRecipe.categoría}</Text>
                          <Text style={[styles.continueTitle, { color: colors.text }]}>{continueRecipe.nombre}</Text>
                          <Text style={[styles.continueProgressText, { color: colors.textSecondary }]}>Progreso: {continuePercent}% ({continueStepsDone} de {continueStepsTotal} pasos)</Text>
                          <View style={[styles.continueTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(232, 226, 213, 0.5)' }]}>
                            <View style={[styles.continueBar, { width: `${continuePercent}%`, backgroundColor: colors.primary }]} />
                          </View>
                        </View>
                        <Ionicons name="play-circle" size={32} color={colors.primary} />
                      </View>
                    </Card>
                  </View>
                )}

                {/* Accesos Rápidos */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Accesos Rápidos</Text>
                  <View style={styles.quickAccessGrid}>
                    <Pressable 
                      style={[styles.quickAccessItem, { backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.15)' : '#FDEEE9', borderColor: colors.border }]}
                      onPress={() => router.push('/recetas')}
                    >
                      <View style={[styles.quickAccessIconBg, { backgroundColor: colors.primary }]}>
                        <Ionicons name="restaurant" size={20} color={colors.white} />
                      </View>
                      <Text style={[styles.quickAccessLabel, { color: colors.text }]}>Recetario</Text>
                      <Text style={[styles.quickAccessSubLabel, { color: colors.textSecondary }]}>Comidas típicas</Text>
                    </Pressable>

                    <Pressable 
                      style={[styles.quickAccessItem, { backgroundColor: isDarkMode ? 'rgba(46, 111, 64, 0.15)' : '#EEF6F0', borderColor: colors.border }]}
                      onPress={() => router.push('/fiestas')}
                    >
                      <View style={[styles.quickAccessIconBg, { backgroundColor: colors.secondary }]}>
                        <Ionicons name="sparkles" size={20} color={colors.white} />
                      </View>
                      <Text style={[styles.quickAccessLabel, { color: colors.text }]}>Fiestas</Text>
                      <Text style={[styles.quickAccessSubLabel, { color: colors.textSecondary }]}>Festivales locales</Text>
                    </Pressable>

                    <Pressable 
                      style={[styles.quickAccessItem, { backgroundColor: isDarkMode ? 'rgba(223, 177, 91, 0.15)' : '#FCF7EB', borderColor: colors.border }]}
                      onPress={() => router.push('/mapa')}
                    >
                      <View style={[styles.quickAccessIconBg, { backgroundColor: colors.accent }]}>
                        <Ionicons name="map" size={20} color={colors.white} />
                      </View>
                      <Text style={[styles.quickAccessLabel, { color: colors.text }]}>Mapa Gastronómico</Text>
                      <Text style={[styles.quickAccessSubLabel, { color: colors.textSecondary }]}>Sabores por región</Text>
                    </Pressable>

                    <Pressable 
                      style={[styles.quickAccessItem, { backgroundColor: isDarkMode ? 'rgba(142, 130, 114, 0.15)' : '#F4F1EA', borderColor: colors.border }]}
                      onPress={() => router.push('/trivia')}
                    >
                      <View style={[styles.quickAccessIconBg, { backgroundColor: colors.textSecondary }]}>
                        <Ionicons name="trophy" size={20} color={colors.white} />
                      </View>
                      <Text style={[styles.quickAccessLabel, { color: colors.text }]}>Trivia Cultural</Text>
                      <Text style={[styles.quickAccessSubLabel, { color: colors.textSecondary }]}>¿Cuánto sabés?</Text>
                    </Pressable>
                  </View>
                </View>

                {/* 2. Últimos Vistos */}
                {recentlyViewedItems.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Últimos vistos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScrollContent}>
                      {recentlyViewedItems.map((item, idx) => (
                        <Card
                          key={idx}
                          style={[styles.recentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                          elevation="sm"
                          border={true}
                          onPress={() => item.type === 'recipe' ? handleOpenRecipe(item as Recipe) : handleOpenFestival(item as Festival)}
                        >
                          <Image source={{ uri: item.type === 'recipe' ? (item as Recipe).video : (item as Festival).galeria[0] }} style={styles.recentImage} />
                          <View style={styles.recentOverlay}>
                            <View style={[styles.recentBadgeRow, { backgroundColor: colors.primary }]}>
                              <Ionicons 
                                name={item.type === 'recipe' ? 'restaurant' : 'sparkles'} 
                                size={10} 
                                color={colors.white} 
                              />
                              <Text style={styles.recentBadgeText}>{item.type === 'recipe' ? 'Receta' : 'Fiesta'}</Text>
                            </View>
                            <Text style={styles.recentTitle} numberOfLines={1}>{item.nombre}</Text>
                          </View>
                        </Card>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Carrusel de Recomendados */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recomendado del Día</Text>
                    <View style={[styles.badge, { backgroundColor: recommendedRecipe.id === RECIPES[1].id ? (isDarkMode ? 'rgba(223, 177, 91, 0.15)' : '#FCF7EB') : 'rgba(200, 92, 56, 0.12)' }]}>
                      <Text style={[styles.badgeText, { color: colors.primary }]}>{recommendationBadge}</Text>
                    </View>
                  </View>
                  
                  <Card 
                    style={[styles.featuredCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
                    elevation="md" 
                    border={true}
                    onPress={() => handleOpenRecipe(recommendedRecipe)}
                  >
                    <Image source={{ uri: recommendedRecipe.video || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600' }} style={styles.featuredImage} />
                    <View style={styles.featuredOverlay}>
                      <View style={styles.featuredTagContainer}>
                        <Text style={[styles.featuredTag, { color: colors.accent }]}>{recommendedRecipe.categoría}</Text>
                        <View style={[styles.dot, { backgroundColor: colors.border }]} />
                        <Text style={[styles.featuredTag, { color: colors.accent }]}>{recommendedRecipe.duración}</Text>
                      </View>
                      <Text style={styles.featuredTitle}>{recommendedRecipe.nombre}</Text>
                      <Text style={styles.featuredDesc} numberOfLines={2}>
                        {recommendedRecipe.historia}
                      </Text>
                      <View style={styles.actionRow}>
                        <Text style={[styles.actionText, { color: colors.accent }]}>Ver preparación paso a paso</Text>
                        <Ionicons name="arrow-forward" size={16} color={colors.accent} />
                      </View>
                    </View>
                  </Card>
                </View>

                {/* Tarjetas Dinámicas / Curiosidades */}
                <View style={[styles.section, { marginBottom: 110 }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Curiosidades del Taragüí</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                    Tocá cada tarjeta para revelar historias y secretos de nuestra gastronomía.
                  </Text>
                  
                  <View style={styles.curiositiesContainer}>
                    {CURIOSITIES.map((curi, idx) => (
                      <Card
                        key={idx}
                        onPress={() => handleFlipCard(idx)}
                        elevation="sm"
                        border={true}
                        style={[
                          styles.curiosityCard,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          flippedCards[idx] && { backgroundColor: isDarkMode ? 'rgba(46, 111, 64, 0.15)' : 'rgba(46, 111, 64, 0.08)', borderColor: colors.secondary, borderWidth: 1.5 }
                        ]}
                      >
                        {!flippedCards[idx] ? (
                          <View style={styles.curiosityFront}>
                            <View style={[styles.curiosityIconCircle, { backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.16)' : 'rgba(200, 92, 56, 0.08)' }]}>
                              <Ionicons name={curi.icon} size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.curiosityCardTitle, { color: colors.text }]}>{curi.title}</Text>
                            <Text style={[styles.curiosityTapPrompt, { color: colors.primary }]}>Ver secreto</Text>
                          </View>
                        ) : (
                          <View style={styles.curiosityBack}>
                            <Text style={[styles.curiosityBackText, { color: colors.text }]}>{curi.fact}</Text>
                            <Text style={[styles.curiosityTapPromptBack, { color: colors.secondary }]}>Cerrar</Text>
                          </View>
                        )}
                      </Card>
                    ))}
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Recipe Detail Modal */}
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
                <Text style={[styles.modalHeaderTitle, { color: colors.primary }]} numberOfLines={1}>{selectedRecipe.nombre}</Text>
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
                    <Ionicons name="time-outline" size={18} color={colors.primary} />
                    <Text style={[styles.modalMetaValue, { color: colors.text }]}>{selectedRecipe.duración}</Text>
                    <Text style={styles.modalMetaLabel}>Tiempo</Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="restaurant-outline" size={18} color={colors.primary} />
                    <Text style={[styles.modalMetaValue, { color: colors.text }]}>{selectedRecipe.dificultad}</Text>
                    <Text style={styles.modalMetaLabel}>Dificultad</Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="bookmark-outline" size={18} color={colors.primary} />
                    <Text style={[styles.modalMetaValue, { color: colors.text }]}>{selectedRecipe.categoría}</Text>
                    <Text style={styles.modalMetaLabel}>Categoría</Text>
                  </View>
                </View>

                {/* Progress bar */}
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
                  <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Historia y Origen</Text>
                  <Text style={[styles.modalBodyText, { color: colors.textSecondary }]}>{selectedRecipe.historia}</Text>
                </View>

                <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Ingredientes</Text>
                  <Text style={[styles.sectionHelpText, { color: colors.textSecondary }]}>Marcá los ingredientes que tenés listos:</Text>
                  {selectedRecipe.ingredientes.map((ing, i) => {
                    const prog = recipeProgress[selectedRecipe.id];
                    const isChecked = prog ? prog.completedIngredients.includes(i) : false;
                    return (
                      <Pressable 
                        key={i} 
                        style={[styles.checklistRow, { borderBottomColor: colors.border }, isChecked && styles.checklistRowChecked]}
                        onPress={() => updateIngredientProgress(selectedRecipe.id, i, !isChecked)}
                      >
                        <Ionicons 
                          name={isChecked ? "checkbox" : "square-outline"} 
                          size={20} 
                          color={isChecked ? colors.secondary : colors.textSecondary} 
                        />
                        <Text style={[styles.checklistText, { color: isChecked ? colors.textSecondary : colors.text }, isChecked && styles.checklistTextChecked]}>
                          {ing}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={[styles.modalSection, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Preparación</Text>
                  <Text style={[styles.sectionHelpText, { color: colors.textSecondary }]}>Marcá los pasos completados:</Text>
                  {selectedRecipe.preparación.map((step, i) => {
                    const prog = recipeProgress[selectedRecipe.id];
                    const isChecked = prog ? prog.completedSteps.includes(i) : false;
                    return (
                      <Pressable 
                        key={i} 
                        style={[styles.stepCheckRow, isChecked && styles.stepCheckRowChecked]}
                        onPress={() => updateStepProgress(selectedRecipe.id, i, !isChecked)}
                      >
                        <View style={[styles.stepNumberCircle, { backgroundColor: isChecked ? colors.secondary : colors.primary }]}>
                          {isChecked ? (
                            <Ionicons name="checkmark" size={12} color={colors.white} />
                          ) : (
                            <Text style={styles.stepNumberText}>{i + 1}</Text>
                          )}
                        </View>
                        <Text style={[styles.stepText, { color: isChecked ? colors.textSecondary : colors.text }, isChecked && styles.stepTextChecked]}>
                          {step}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={[styles.modalSection, styles.grandmaTipSection, { backgroundColor: isDarkMode ? 'rgba(223, 177, 91, 0.15)' : 'rgba(223, 177, 91, 0.08)', borderColor: isDarkMode ? 'rgba(223, 177, 91, 0.4)' : 'rgba(223, 177, 91, 0.3)' }]}>
                  <View style={styles.grandmaTipHeader}>
                    <Ionicons name="bulb-outline" size={20} color={colors.accent} />
                    <Text style={[styles.grandmaTipTitle, { color: isDarkMode ? colors.accent : '#B78D1E' }]}>Consejo de la Abuela</Text>
                  </View>
                  <Text style={[styles.grandmaTipText, { color: colors.text }]}>{getGrandmaTip(selectedRecipe.id)}</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Festival Detail Modal */}
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
                    onPress={() => setFestivalActiveTab(idx)}
                    style={[
                      styles.modalTabButton,
                      festivalActiveTab === idx && [styles.modalTabButtonActive, { borderBottomColor: colors.primary }]
                    ]}
                  >
                    <Text style={[styles.modalTabLabel, { color: colors.textSecondary }, festivalActiveTab === idx && [styles.modalTabLabelActive, { color: colors.primary }]]}>
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
                {festivalActiveTab === 0 && (
                  <View style={styles.tabContentBlock}>
                    <Image source={{ uri: selectedFestival.galeria[0] }} style={styles.detailImage} />
                    <View style={[styles.detailCardBody, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Historia y Tradición</Text>
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>{selectedFestival.historia}</Text>
                      
                      {selectedFestival.recetaRelacionada && (() => {
                        const relRecipe = RECIPES.find(r => r.id === selectedFestival.recetaRelacionada);
                        return relRecipe ? (
                          <View style={[styles.highlightProductBox, { backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.15)' : 'rgba(200, 92, 56, 0.07)', borderColor: isDarkMode ? 'rgba(200, 92, 56, 0.3)' : 'rgba(200, 92, 56, 0.2)' }]}>
                            <Ionicons name="flame" size={24} color={colors.primary} />
                            <View style={styles.highlightProductInfo}>
                              <Text style={[styles.highlightProductLabel, { color: colors.primary }]}>Plato Principal Relacionado</Text>
                              <Text style={[styles.highlightProductValue, { color: colors.text }]}>{relRecipe.nombre}</Text>
                            </View>
                          </View>
                        ) : null;
                      })()}
                    </View>
                  </View>
                )}

                {/* 2. RECIPES TAB */}
                {festivalActiveTab === 1 && (() => {
                  const relRecipe = RECIPES.find(r => r.id === selectedFestival.recetaRelacionada);
                  return relRecipe ? (
                    <View style={styles.tabContentBlock}>
                      <View style={[styles.detailCardBody, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Ingredientes Típicos</Text>
                        <View style={styles.badgeWrap}>
                          {relRecipe.ingredientes.map((ing, i) => (
                            <View key={i} style={[styles.detailIngredientBadge, { backgroundColor: isDarkMode ? 'rgba(46, 111, 64, 0.15)' : 'rgba(46, 111, 64, 0.05)', borderColor: isDarkMode ? 'rgba(46, 111, 64, 0.3)' : 'rgba(46, 111, 64, 0.2)' }]}>
                              <Ionicons name="leaf" size={12} color={colors.secondary} style={{ marginRight: 4 }} />
                              <Text style={[styles.ingredientBadgeText, { color: colors.secondary }]}>{ing}</Text>
                            </View>
                          ))}
                        </View>

                        <Text style={[styles.detailSectionTitle, { marginTop: Theme.spacing.lg, color: colors.text, borderLeftColor: colors.primary }]}>
                          Receta Tradicional
                        </Text>
                        <Card style={[styles.recipeLinkCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="sm" border={true} onPress={() => { setSelectedFestival(null); handleOpenRecipe(relRecipe); }}>
                          <Image source={{ uri: relRecipe.video || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600' }} style={styles.recipeLinkImage} />
                          <View style={styles.recipeLinkBody}>
                            <Text style={[styles.recipeLinkLabel, { color: colors.primary }]}>Ver Receta Completa</Text>
                            <Text style={[styles.recipeLinkTitle, { color: colors.text }]}>{relRecipe.nombre}</Text>
                            <Text style={[styles.recipeLinkDesc, { color: colors.textSecondary }]} numberOfLines={2}>{relRecipe.historia}</Text>
                          </View>
                        </Card>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
                      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay receta registrada para esta fiesta.</Text>
                    </View>
                  );
                })()}

                {/* 3. MULTIMEDIA TAB */}
                {festivalActiveTab === 2 && (
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
                      
                      {!isPlayingFestivalVideo ? (
                        <Pressable style={styles.videoPlayerMock} onPress={() => setIsPlayingFestivalVideo(true)}>
                          <Image source={{ uri: selectedFestival.video }} style={styles.videoMockThumbnail} />
                          <View style={styles.videoPlayOverlay}>
                            <View style={[styles.playButtonCircle, { backgroundColor: colors.primary }]}>
                              <Ionicons name="play" size={32} color={colors.white} style={{ marginLeft: 4 }} />
                            </View>
                            <Text style={styles.videoPlayText}>Reproducir Video Resumen</Text>
                          </View>
                        </Pressable>
                      ) : (
                        <Pressable style={styles.videoPlayingMock} onPress={() => setIsPlayingFestivalVideo(false)}>
                          <Image source={{ uri: selectedFestival.galeria[0] }} style={styles.videoMockThumbnail} />
                          <View style={styles.videoPlayingOverlay}>
                            <Ionicons name="pause" size={36} color={colors.white} />
                            <Text style={styles.videoPlayingText}>Reproduciendo... (Toca para pausar)</Text>
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
                {festivalActiveTab === 3 && (
                  <View style={styles.tabContentBlock}>
                    <View style={[styles.detailCardBody, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.detailSectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Cómo Llegar al Evento</Text>
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>{selectedFestival.ubicación}</Text>
                      
                      <Card style={[styles.routeMockCard, { backgroundColor: colors.surfaceDark }]} elevation="none">
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
                      </Card>
                    </View>
                  </View>
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
  scrollContent: {
    paddingBottom: 24,
  },
  heroBackground: {
    width: '100%',
    height: 290,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
    justifyContent: 'flex-end',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  heroBrandName: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  heroTitleContainer: {
    marginBottom: Theme.spacing.sm,
  },
  heroTitle: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.bold,
  },
  heroSubtitle: {
    color: Theme.colors.accent,
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
  },
  heroDivider: {
    width: 60,
    height: 3,
    backgroundColor: Theme.colors.accent,
    marginVertical: Theme.spacing.sm,
    borderRadius: 2,
  },
  heroSlogan: {
    color: 'rgba(255, 253, 249, 0.9)',
    fontSize: Theme.typography.sizes.sm,
    fontStyle: 'italic',
    fontWeight: Theme.typography.weights.medium,
  },
  welcomeSection: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xs,
  },
  welcomeTitle: {
    fontSize: Theme.typography.sizes.lg + 2,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  welcomeText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    marginTop: 6,
    lineHeight: 21,
  },
  searchContainer: {
    paddingHorizontal: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
  },
  searchCard: {
    backgroundColor: Theme.colors.white,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    ...Theme.shadows.sm,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text,
    height: 36,
  },
  section: {
    marginTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.md + 2,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    marginTop: -8,
    marginBottom: Theme.spacing.sm,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    width: '48%',
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(232, 226, 213, 0.5)',
  },
  quickAccessIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  quickAccessLabel: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  quickAccessSubLabel: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: 'rgba(200, 92, 56, 0.12)',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.roundness.sm,
  },
  badgeText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
  },
  featuredCard: {
    height: 240,
    position: 'relative',
    padding: 0,
    borderRadius: Theme.roundness.lg,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    padding: Theme.spacing.md,
    justifyContent: 'flex-end',
  },
  featuredTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  featuredTag: {
    color: Theme.colors.accent,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.border,
    marginHorizontal: 6,
  },
  featuredTitle: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: 4,
  },
  featuredDesc: {
    color: 'rgba(255, 253, 249, 0.85)',
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 18,
    marginBottom: Theme.spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: Theme.colors.accent,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    marginRight: 4,
  },
  recipesSection: {
    paddingHorizontal: Theme.spacing.md,
  },
  recipeListItem: {
    backgroundColor: Theme.colors.white,
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.sm,
    borderRadius: Theme.roundness.md,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeThumbnail: {
    width: 90,
    height: 90,
    borderRadius: Theme.roundness.sm,
    backgroundColor: Theme.colors.border,
  },
  recipeInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  recipeCategoryText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
  },
  recipeTitleText: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginTop: 2,
  },
  recipeDescText: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
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
    paddingHorizontal: Theme.spacing.lg,
  },
  curiositiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.xs,
  },
  curiosityCard: {
    width: (SCREEN_WIDTH - 32 - 16) / 3,
    height: 145,
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.roundness.md,
  },
  curiosityCardFlipped: {
    backgroundColor: 'rgba(46, 111, 64, 0.08)',
    borderColor: Theme.colors.secondary,
  },
  curiosityFront: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  curiosityBack: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  curiosityIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(200, 92, 56, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  curiosityCardTitle: {
    fontSize: Theme.typography.sizes.xs - 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    textAlign: 'center',
    marginVertical: 4,
  },
  curiosityTapPrompt: {
    fontSize: 8.5,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
  },
  curiosityTapPromptBack: {
    fontSize: 8.5,
    color: Theme.colors.secondary,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
  },
  curiosityBackText: {
    fontSize: 9.5,
    color: Theme.colors.text,
    textAlign: 'center',
    lineHeight: 12.5,
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
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    paddingBottom: 40,
  },
  modalImage: {
    width: '100%',
    height: 220,
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
  ingredientBullet: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm - 2,
  },
  ingredientText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text,
    marginLeft: Theme.spacing.sm,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
    marginTop: 2,
  },
  stepNumberText: {
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
  grandmaTipSection: {
    backgroundColor: 'rgba(223, 177, 91, 0.08)',
    borderColor: 'rgba(223, 177, 91, 0.3)',
    borderWidth: 1.5,
    borderRadius: Theme.roundness.md,
    margin: Theme.spacing.md,
  },
  grandmaTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  grandmaTipTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: '#B78D1E',
    marginLeft: Theme.spacing.sm,
  },
  grandmaTipText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // --- New Functional Styles ---
  continueCard: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.sm + 4,
    borderRadius: Theme.roundness.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueThumbnail: {
    width: 64,
    height: 64,
    borderRadius: Theme.roundness.sm,
    backgroundColor: Theme.colors.surfaceDark,
  },
  continueInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  continueCategory: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
  },
  continueTitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginTop: 2,
  },
  continueProgressText: {
    fontSize: 9.5,
    color: Theme.colors.textSecondary,
    marginTop: 3,
  },
  continueTrack: {
    width: '90%',
    height: 4,
    backgroundColor: 'rgba(232, 226, 213, 0.5)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  continueBar: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  recentScrollContent: {
    paddingRight: Theme.spacing.md,
  },
  recentCard: {
    width: 140,
    height: 120,
    marginRight: Theme.spacing.sm,
    padding: 0,
    borderRadius: Theme.roundness.md,
    overflow: 'hidden',
    position: 'relative',
  },
  recentImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  recentOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: Theme.spacing.sm,
    justifyContent: 'flex-end',
  },
  recentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 92, 56, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  recentBadgeText: {
    color: Theme.colors.white,
    fontSize: 8,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: 2,
  },
  recentTitle: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
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
  sectionHelpText: {
    fontSize: 10.5,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Theme.spacing.sm,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.border,
  },
  checklistRowChecked: {
    opacity: 0.65,
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
  stepCheckRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  stepCheckRowChecked: {
    opacity: 0.65,
  },
  stepNumberCircleChecked: {
    backgroundColor: Theme.colors.secondary,
  },
  stepTextChecked: {
    color: Theme.colors.textSecondary,
  },
  // --- Festival modal styling (synced from Fiestas Screen) ---
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
  // --- Splash Screen & Onboarding Styles ---
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '70%',
    paddingHorizontal: Theme.spacing.lg,
  },
  splashLogoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.md,
  },
  splashBrand: {
    fontSize: Theme.typography.sizes.xxl + 4,
    fontWeight: Theme.typography.weights.bold,
    letterSpacing: -0.5,
  },
  splashSubtitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.medium,
    marginTop: 4,
  },
  splashLoadingContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
  },
  splashTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  splashBar: {
    height: '100%',
    borderRadius: 3,
  },
  splashProgressText: {
    fontSize: Theme.typography.sizes.xs,
    fontStyle: 'italic',
  },
  splashIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  splashIcon: {
    marginHorizontal: Theme.spacing.md,
    opacity: 0.7,
  },
  onboardingContainer: {
    flex: 1,
  },
  onboardingInner: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  onboardingHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    height: 40,
  },
  skipButton: {
    padding: Theme.spacing.xs,
  },
  skipText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  onboardingScroll: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  onboardingImage: {
    width: SCREEN_WIDTH - 48,
    height: 240,
    borderRadius: Theme.roundness.lg,
    marginVertical: Theme.spacing.md,
  },
  onboardingCardBody: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
  onboardingIconBg: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  onboardingTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  onboardingDesc: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: Theme.spacing.lg,
  },
  dotItem: {
    height: 6,
    width: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  onboardingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    height: 50,
  },
  navBtn: {
    flex: 1,
    height: 48,
    borderRadius: Theme.roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
    minHeight: 48,
  },
  navBtnText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  skeletonContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
  },
});

export default InicioScreen;
