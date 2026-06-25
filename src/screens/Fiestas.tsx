import React, { useState, useEffect } from 'react';
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
import { useLocalSearchParams } from 'expo-router';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import SkeletonLoader from '../components/SkeletonLoader';
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
  const params = useLocalSearchParams<{ id?: string }>();
  const [selectedRoute, setSelectedRoute] = useState<string>('Todas las Rutas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (params.id) {
      const found = FESTIVALS.find(f => f.id === params.id);
      if (found) {
        setSelectedFestival(found);
      }
    }
  }, [params.id]);
  
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [visibleSections, setVisibleSections] = useState<number>(0);

  const routes = ['Todas las Rutas', 'Carnes Tradicionales', 'Herencia Guaraní', 'Sabores Naturales'];

  const getFestivalContext = (id: string) => {
    const data: { [key: string]: { caracteristicas: string; importancia: string } } = {
      '1': {
        caracteristicas: 'Exhibición ganadera de búfalos, jineteadas, asados multitudinarios y peñas folclóricas.',
        importancia: 'Es la fiesta emblema del desarrollo bufalero en Caá Catí, destacando una alternativa productiva sostenible para los campos del norte.'
      },
      '2': {
        caracteristicas: 'Concurso de asadores a la estaca con leña de espinillo, jineteadas y espectáculos de chamamé de primer nivel.',
        importancia: 'Homenaje al peón rural y a la producción de cordero de excelente calidad en los campos lindantes a los Esteros del Iberá.'
      },
      '3': {
        caracteristicas: 'Cocción comunitaria en hornos de barro tradicionales alimentados a leña, degustación de costillares y cueros crocantes.',
        importancia: 'Promueve el trabajo de los pequeños productores porcinos del centro de la provincia, conservando métodos de cocción centenarios.'
      },
      '4': {
        caracteristicas: 'Competencia abierta de parrilleros a la orilla del río Paraná, guitarreadas tradicionales y ferias de artesanía criolla.',
        importancia: 'Reúne la tradición del asado de fin de semana con la imponente belleza de las barrancas del río Paraná.'
      },
      '5': {
        caracteristicas: 'Feria gastronómica de chipá calentito hecho al horno de barro y tatacua, música folclórica y elección de la reina del chipá.',
        importancia: 'Homenaje al pan sagrado de la cultura guaraní que une a toda la comunidad en torno a la mesa familiar del nordeste.'
      },
      '6': {
        caracteristicas: 'Preparación de tortas fritas en ollas gigantescas al aire libre, guitarreadas espontáneas y rondas de mate cebado.',
        importancia: 'Celebración de la merienda campesina por excelencia, rescatando el valor del encuentro y la hospitalidad litoraleña.'
      },
      '7': {
        caracteristicas: 'Cocina en vivo de Mbaipy en grandes ollas de hierro a la leña, preparación de Mbejú caliente en sartenes de chapa.',
        importancia: 'Celebración de la polenta y el pan plano de origen guaraní, fundamentales para combatir el frío invierno del campo correntino.'
      },
      '8': {
        caracteristicas: 'Exposición de raíces gigantes, talleres de cocina con mandioca, ferias agroecológicas y degustación de platos regionales.',
        importancia: 'Pone en valor el cultivo alimenticio más importante de la región guaranítica, pilar de la soberanía alimentaria correntina.'
      },
      '9': {
        caracteristicas: 'Demostración de extracción manual del almidón de mandioca, elaboración de chipas y panificados tradicionales sin gluten.',
        importancia: 'Rescata la técnica tradicional de molienda y colado artesanal del almidón, un saber que se transmite de abuelas a nietos.'
      },
      '10': {
        caracteristicas: 'Feria apícola con cata de mieles multiflorales, conferencias sobre apicultura y concursos de cocina dulce con miel de monte.',
        importancia: 'Impulsa la protección del monte nativo y la biodiversidad a través de la producción sostenible de mieles silvestres.'
      },
      '11': {
        caracteristicas: 'Cosecha de mango fresco de los árboles históricos, ferias de helados, mermeladas, jugos y conservas en almíbar.',
        importancia: 'Homenaje al paisaje urbano y cultural de Santa Ana, donde el mango representa abundancia y frescura veraniega.'
      },
      '12': {
        caracteristicas: 'Premiación a las sandías más grandes y dulces de la cosecha, desfiles costeros y shows musicales frente al río.',
        importancia: 'Celebra la sandía primicia de Esquina, símbolo del esfuerzo de los agricultores y del inicio del verano correntino.'
      },
      '13': {
        caracteristicas: 'Cosecha comunitaria del fruto de palmera yatay, talleres de licores artesanales, mermeladas y cestería con hojas de palma.',
        importancia: 'Promueve la conservación y el uso sustentable de los palmares nativos de yatay, recuperando un sabor silvestre histórico.'
      },
      '14': {
        caracteristicas: 'Cena campestre con platos dulces y salados elaborados con batatas locales, música chamamecera y bailes tradicionales.',
        importancia: 'Homenaje a la producción familiar batatera de Tres de Abril, un noble cultivo que sustenta la economía rural de la zona.'
      }
    };
    return data[id] || {
      caracteristicas: 'Feria gastronómica criolla, peñas de música chamamecera y degustación de platos locales.',
      importancia: 'Rescate de los saberes tradicionales y de las recetas transmitidas de generación en generación en la provincia.'
    };
  };

  const toggleIngredient = (recipeId: string, index: number) => {
    const key = `${recipeId}-${index}`;
    setCheckedIngredients(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredFestivals = FESTIVALS.filter(fest => {
    const matchesRoute = selectedRoute === 'Todas las Rutas' || fest.rutaGastronomica === selectedRoute;
    const matchesSearch = fest.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          fest.localidad.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fest.productoDestacado.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fest.descripcionCorta.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fest.historia.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoute && matchesSearch;
  });

  const relatedRecipe = selectedFestival ? RECIPES.find(r => r.id === selectedFestival.recetaRelacionada) : undefined;

  useEffect(() => {
    let timers: any[] = [];
    if (selectedFestival) {
      setIsLoadingDetail(true);
      setVisibleSections(0);
      
      const loadTimer = setTimeout(() => {
        setIsLoadingDetail(false);
        timers.push(setTimeout(() => setVisibleSections(1), 50));
        timers.push(setTimeout(() => setVisibleSections(2), 150));
        timers.push(setTimeout(() => setVisibleSections(3), 250));
        timers.push(setTimeout(() => setVisibleSections(4), 350));
        timers.push(setTimeout(() => setVisibleSections(5), 450));
      }, 500);
      
      timers.push(loadTimer);
    } else {
      setIsLoadingDetail(false);
      setVisibleSections(0);
    }
    
    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [selectedFestival]);

  const openFestivalDetails = (fest: Festival) => {
    setSelectedFestival(fest);
    setIsPlayingVideo(false);
  };

  const routesToRender = selectedRoute === 'Todas las Rutas'
    ? ['Carnes Tradicionales', 'Herencia Guaraní', 'Sabores Naturales']
    : [selectedRoute];

  if (selectedFestival) {
    if (isLoadingDetail) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.detailHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <Pressable onPress={() => setSelectedFestival(null)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.detailHeaderTitle, { color: colors.primary }]} numberOfLines={1}>
              {selectedFestival?.nombre}
            </Text>
          </View>
          <ScrollView>
            <SkeletonLoader type="details" />
          </ScrollView>
        </SafeAreaView>
      );
    }

    const context = getFestivalContext(selectedFestival?.id || '');

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Navigation Header */}
        <View style={[styles.detailHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
          <Pressable onPress={() => setSelectedFestival(null)} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Volver a las rutas">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.detailHeaderTitle, { color: colors.primary }]} numberOfLines={1}>
            {selectedFestival?.nombre}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          {/* SECCIÓN 1: Hero */}
          {visibleSections >= 1 && (
            <View style={styles.heroSection}>
              <Image source={{ uri: selectedFestival?.galeria?.[0] }} style={styles.heroImage} />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>{selectedFestival?.nombre}</Text>
                <View style={styles.heroLocationRow}>
                  <Ionicons name="location" size={14} color="#FFF" />
                  <Text style={styles.heroLocationText}>{selectedFestival?.localidad}</Text>
                </View>
              </View>
            </View>
          )}

          {/* SECCIÓN 2: Contexto */}
          {visibleSections >= 2 && (
            <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Contexto & Tradición</Text>
              
              <Text style={[styles.contextLabel, { color: colors.primary }]}>Características del Evento</Text>
              <Text style={[styles.contextText, { color: colors.textSecondary }]}>{context.caracteristicas}</Text>

              <Text style={[styles.contextLabel, { color: colors.primary, marginTop: 12 }]}>Importancia Cultural</Text>
              <Text style={[styles.contextText, { color: colors.textSecondary }]}>{context.importancia}</Text>
              
              <Text style={[styles.contextLabel, { color: colors.primary, marginTop: 12 }]}>Historia General</Text>
              <Text style={[styles.contextText, { color: colors.textSecondary }]}>{selectedFestival?.historia}</Text>
            </View>
          )}

          {/* SECCIÓN 3: Producto Destacado */}
          {visibleSections >= 3 && (
            <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Producto Destacado</Text>
              <View style={[styles.featuredProductCard, { backgroundColor: colors.primary + '0c', borderColor: colors.primary + '25' }]}>
                <Ionicons name="sparkles" size={24} color={colors.primary} />
                <View style={styles.featuredProductInfo}>
                  <Text style={[styles.featuredProductLabel, { color: colors.primary }]}>Sabor e Identidad</Text>
                  <Text style={[styles.featuredProductName, { color: colors.text }]}>{selectedFestival?.productoDestacado}</Text>
                  <Text style={[styles.featuredProductDesc, { color: colors.textSecondary }]}>
                    Este ingrediente es el corazón de la festividad en {selectedFestival?.localidad}, representando una tradición gastronómica única de las rutas del Taragüí.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* SECCIÓN 4: Receta Tradicional */}
          {visibleSections >= 4 && (
            <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Receta Tradicional</Text>
              {relatedRecipe ? (
                <View>
                  {/* Receta Meta Row */}
                  <View style={[styles.recipeMetaRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.recipeMetaItem}>
                      <Ionicons name="time-outline" size={18} color={colors.primary} />
                      <Text style={[styles.recipeMetaValue, { color: colors.text }]}>{relatedRecipe?.duración}</Text>
                      <Text style={[styles.recipeMetaLabel, { color: colors.textSecondary }]}>Tiempo</Text>
                    </View>
                    <View style={styles.recipeMetaItem}>
                      <Ionicons name="star-outline" size={18} color={colors.primary} />
                      <Text style={[styles.recipeMetaValue, { color: colors.text }]}>{relatedRecipe?.dificultad}</Text>
                      <Text style={[styles.recipeMetaLabel, { color: colors.textSecondary }]}>Dificultad</Text>
                    </View>
                  </View>

                  {/* Nombre de la Receta */}
                  <Text style={[styles.recipeTitleName, { color: colors.text }]}>{relatedRecipe?.nombre}</Text>

                  {/* Ingredientes Checklist */}
                  <Text style={[styles.recipeSubheading, { color: colors.text }]}>Ingredientes necesarios:</Text>
                  <Text style={[styles.recipeHelpText, { color: colors.textSecondary }]}>Marcá los ingredientes que ya tenés listos:</Text>
                  {relatedRecipe?.ingredientes?.map((ing, i) => {
                    const recipeId = relatedRecipe?.id || '';
                    const isChecked = !!checkedIngredients[`${recipeId}-${i}`];
                    return (
                      <Pressable
                        key={i}
                        onPress={() => toggleIngredient(recipeId, i)}
                        style={[styles.checklistRow, { borderBottomColor: colors.border }, isChecked && styles.checklistRowChecked]}
                      >
                        <Ionicons 
                          name={isChecked ? "checkbox" : "square-outline"} 
                          size={18} 
                          color={isChecked ? colors.secondary : colors.textSecondary} 
                        />
                        <Text style={[styles.checklistText, { color: colors.text }, isChecked && styles.checklistTextChecked]}>
                          {ing}
                        </Text>
                      </Pressable>
                    );
                  })}

                  {/* Pasos de Preparación */}
                  <Text style={[styles.recipeSubheading, { color: colors.text, marginTop: 18 }]}>Preparación paso a paso:</Text>
                  {relatedRecipe?.preparación?.map((step, i) => (
                    <View key={i} style={styles.stepContainer}>
                      <View style={[styles.stepNumCircle, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.stepNumText, { color: colors.white }]}>{i + 1}</Text>
                      </View>
                      <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
                    </View>
                  ))}

                  {/* Grandma Tip */}
                  <View style={[styles.grandmaTipCard, {
                    backgroundColor: isDarkMode ? 'rgba(223, 177, 91, 0.15)' : 'rgba(223, 177, 91, 0.08)',
                    borderColor: isDarkMode ? 'rgba(223, 177, 91, 0.3)' : 'rgba(223, 177, 91, 0.25)'
                  }]}>
                    <View style={styles.grandmaCardHeader}>
                      <Ionicons name="flame" size={20} color={colors.accent} />
                      <Text style={[styles.grandmaCardTitle, { color: isDarkMode ? '#DFB15B' : '#9E7A1C' }]}>El Consejo de la Abuela</Text>
                    </View>
                    <Text style={[styles.grandmaCardBody, { color: colors.text }]}>{getGrandmaTip(relatedRecipe?.id || '')}</Text>
                  </View>
                </View>
              ) : (
                <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>No hay receta registrada para este evento.</Text>
              )}
            </View>
          )}

          {/* SECCIÓN 5: Contenido Multimedia */}
          {visibleSections >= 5 && (
            <View style={[styles.detailSection, { backgroundColor: colors.surface, marginBottom: 110 }]}>
              <Text style={[styles.sectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Contenido Multimedia</Text>
              
              <Text style={[styles.contextLabel, { color: colors.primary }]}>Galería de Fotos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                {selectedFestival?.galeria?.map((img, i) => (
                  <Image key={i} source={{ uri: img }} style={styles.galleryImageItem} />
                ))}
              </ScrollView>

              <Text style={[styles.contextLabel, { color: colors.primary, marginTop: 12 }]}>Video Resumen</Text>
              {!isPlayingVideo ? (
                <Pressable style={styles.videoPlayerMock} onPress={() => setIsPlayingVideo(true)}>
                  <Image source={{ uri: selectedFestival?.video }} style={styles.videoMockThumbnail} />
                  <View style={styles.videoPlayOverlay}>
                    <View style={[styles.playButtonCircle, { backgroundColor: colors.primary }]}>
                      <Ionicons name="play" size={32} color={colors.white} style={{ marginLeft: 4 }} />
                    </View>
                    <Text style={[styles.videoPlayText, { color: colors.white }]}>Reproducir Video Resumen</Text>
                  </View>
                </Pressable>
              ) : (
                <Pressable style={styles.videoPlayingMock} onPress={() => setIsPlayingVideo(false)}>
                  <Image source={{ uri: selectedFestival?.galeria?.[0] }} style={styles.videoMockThumbnail} />
                  <View style={styles.videoPlayingOverlay}>
                    <Ionicons name="pause" size={36} color={colors.white} />
                    <Text style={[styles.videoPlayingText, { color: colors.white }]}>Reproduciendo... (Toca para pausar)</Text>
                    <View style={styles.videoProgressOuter}>
                      <View style={[styles.videoProgressInner, { backgroundColor: colors.primary }]} />
                    </View>
                  </View>
                </Pressable>
              )}

              {/* Share CTA Button */}
              <Pressable 
                onPress={() => {
                  alert(`¡Enlace de la ${selectedFestival?.nombre} copiado al portapapeles!`);
                }}
                style={[styles.shareBtn, { backgroundColor: colors.secondary }]}
              >
                <Ionicons name="share-social-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.shareBtnText}>Compartir Ruta Gastronómica</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

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
        <View style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Seleccionar Ruta</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
            {routes.map(r => (
              <Pressable
                key={r}
                onPress={() => setSelectedRoute(r)}
                style={[
                  styles.filterBadge,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedRoute === r && [styles.filterBadgeActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                ]}
              >
                <Text style={[styles.filterBadgeText, { color: colors.textSecondary }, selectedRoute === r && { color: colors.white }]}>
                  {r}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Route Containers */}
        <View style={styles.gridSection}>
          {filteredFestivals.length > 0 ? (
            routesToRender.map(routeName => {
              const routeFestivals = filteredFestivals.filter(f => f.rutaGastronomica === routeName);
              if (routeFestivals.length === 0) return null;

              return (
                <View key={routeName} style={styles.routeContainer}>
                  <Text style={[styles.routeContainerTitle, { color: colors.text }]}>
                    Ruta de las {routeName}
                  </Text>
                  <View style={styles.gridContainer}>
                    {routeFestivals.map((fest) => (
                      <Card
                        key={fest.id}
                        style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        elevation="sm"
                        border={true}
                        onPress={() => openFestivalDetails(fest)}
                      >
                        <Image source={{ uri: fest.galeria[0] }} style={styles.cardImage} />
                        <View style={styles.cardInfo}>
                          {/* Localidad */}
                          <View style={styles.cardMetaRow}>
                            <Ionicons name="location-outline" size={11} color={colors.secondary} />
                            <Text style={[styles.cardMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                              {fest.localidad}
                            </Text>
                          </View>

                          {/* Nombre / Fiesta */}
                          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                            {fest.nombre}
                          </Text>

                          {/* Producto Destacado */}
                          <View style={[styles.productBadge, { backgroundColor: colors.primary + '15' }]}>
                            <Text style={[styles.productBadgeText, { color: colors.primary }]}>
                              {fest.productoDestacado}
                            </Text>
                          </View>

                          {/* Breve descripción */}
                          <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                            {fest.descripcionCorta}
                          </Text>

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
