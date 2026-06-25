import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import { FESTIVALS, RECIPES } from '../services/mockData';
import { Festival, Recipe } from '../types';
import { useGlobalState } from '../services/GlobalStateContext';
import SkeletonLoader from '../components/SkeletonLoader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Coordenadas geográficas aproximadas (x, y) en porcentaje para cada festival en el mapa
const FESTIVAL_COORDINATES: { [key: string]: { x: number; y: number } } = {
  '1': { x: 48, y: 22 },  // Caá Catí - Búfalo (Carnes)
  '2': { x: 52, y: 55 },  // Mercedes - Cordero (Carnes)
  '3': { x: 58, y: 30 },  // Loreto - Lechón (Carnes)
  '4': { x: 22, y: 36 },  // Empedrado - Asado (Carnes)
  '5': { x: 62, y: 40 },  // Santa Rosa - Chipá (Guaraní)
  '6': { x: 88, y: 22 },  // Gobernador Virasoro - Chipacuerito (Guaraní)
  '7': { x: 55, y: 34 },  // San Miguel - Mbejú y Mbaipy (Guaraní)
  '8': { x: 65, y: 15 },  // Itá Ibaté - Mandioca (Guaraní)
  '9': { x: 59, y: 27 },  // Loreto - Almidón (Guaraní)
  '10': { x: 32, y: 42 }, // Saladas - Miel (Naturales)
  '11': { x: 28, y: 18 }, // Santa Ana - Mango (Naturales)
  '12': { x: 18, y: 80 }, // Esquina - Sandía (Naturales)
  '13': { x: 34, y: 56 }, // Mantilla - Yatay (Naturales)
  '14': { x: 26, y: 62 }, // Tres de Abril - Batata (Naturales)
};

const getGrandmaTip = (recipeId: string): string => {
  switch (recipeId) {
    case 'r1':
      return 'El gran secreto de las abuelas correntinas es agregar una cucharada de jugo de naranja natural al amasar. Esto ayuda a que el chipá quede esponjoso.';
    case 'r2':
      return 'Revolver siempre en sentido de las agujas del reloj y usando una cuchara de madera de espinillo para que no se corte la textura.';
    case 'r3':
      return 'Para el guiso, agrega un chorrito de jugo de limón al apagar el fuego. Realza los sabores de la carne de manera espectacular.';
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

const getRouteInfo = (id: string) => {
  const info: { [key: string]: { distance: string; time: string; route: string; advice: string } } = {
    '1': {
      distance: '126 km',
      time: '1h 35m',
      route: 'Tomar Ruta Nacional 12 hacia el este y luego la Ruta Provincial 5 directo a Caá Catí.',
      advice: 'Camino totalmente pavimentado con hermosas vistas de lagunas y palmares.'
    },
    '2': {
      distance: '244 km',
      time: '2h 55m',
      route: 'Tomar Ruta Nacional 12 hacia el sur y empalmar con la Ruta Nacional 123 directo a Mercedes.',
      advice: 'Prestar atención a la fauna silvestre en el tramo cercano al Iberá.'
    },
    '3': {
      distance: '202 km',
      time: '2h 20m',
      route: 'Tomar Ruta Nacional 12 hacia el este hasta el acceso directo a Loreto.',
      advice: 'Ideal para visitar el portal San Antonio de los Esteros del Iberá.'
    },
    '4': {
      distance: '55 km',
      time: '45m',
      route: 'Tomar Ruta Nacional 12 hacia el sur pasando por Riachuelo directo a Empedrado.',
      advice: 'Tránsito fluido. No te pierdas el atardecer en las barrancas sobre el Paraná.'
    },
    '5': {
      distance: '155 km',
      time: '1h 50m',
      route: 'Tomar Ruta Nacional 12 hacia el este y empalmar con la Ruta Nacional 118 hacia Santa Rosa.',
      advice: 'Zona forestal, transitar con precaución por camiones de gran porte.'
    },
    '6': {
      distance: '327 km',
      time: '3h 50m',
      route: 'Tomar Ruta Nacional 12 hasta Ituzaingó, empalmar con Ruta Nacional 120 y luego Ruta Nacional 14.',
      advice: 'Ruta principal del Mercosur, transitar atento a los camiones internacionales.'
    },
    '7': {
      distance: '161 km',
      time: '2h 00m',
      route: 'Tomar Ruta Nacional 12 y desviar en la Ruta Nacional 118 hacia San Miguel.',
      advice: 'Camino con acceso cercano al portal San Caridi de los Esteros.'
    },
    '8': {
      distance: '156 km',
      time: '1h 45m',
      route: 'Tomar Ruta Nacional 12 hacia el este directo hasta el portal de Itá Ibaté.',
      advice: 'Excelente estado de calzada. Disfrutá de la vista al río Paraná.'
    },
    '9': {
      distance: '202 km',
      time: '2h 20m',
      route: 'Tomar Ruta Nacional 12 hacia el este directo hasta Loreto.',
      advice: 'Loreto es famoso por su almidón de mandioca de producción artesanal.'
    },
    '10': {
      distance: '100 km',
      time: '1h 15m',
      route: 'Tomar Ruta Nacional 12 hacia el sur y empalmar con Ruta Nacional 118 hacia Saladas.',
      advice: 'Ciudad cuna del héroe Sargento Cabral, vale la pena detenerse a visitarla.'
    },
    '11': {
      distance: '20 km',
      time: '25m',
      route: 'Tomar Ruta Nacional 12 hacia el este y desviar en el acceso pavimentado a Santa Ana.',
      advice: 'Un pintoresco pueblo con calles de arena y frondosos mangos centenarios.'
    },
    '12': {
      distance: '328 km',
      time: '3h 40m',
      route: 'Tomar Ruta Nacional 12 hacia el sur pasando por Goya y Bella Vista hasta Esquina.',
      advice: 'Camino costero muy pintoresco sobre la costa del río Paraná.'
    },
    '13': {
      distance: '150 km',
      time: '1h 45m',
      route: 'Tomar Ruta Nacional 12 hacia el sur y empalmar con la Ruta Provincial 27 y acceso a Mantilla.',
      advice: 'Famosa localidad inmortalizada en el chamamé "Bajo el cielo de Mantilla".'
    },
    '14': {
      distance: '125 km',
      time: '1h 30m',
      route: 'Tomar Ruta Nacional 12 hacia el sur pasando Bella Vista y desviar hacia Tres de Abril.',
      advice: 'Camino rural tranquilo, dominado por cultivos familiares de batatas.'
    }
  };
  return info[id] || {
    distance: '150 km',
    time: '1h 45m',
    route: 'Tomar Ruta Nacional 12 y corredores provinciales hacia el evento.',
    advice: 'Transitar con precaución respetando las velocidades máximas.'
  };
};

export const MapaScreen: React.FC = () => {
  // Estados para filtro e interactividad del mapa
  const [routeFilter, setRouteFilter] = useState<string>('Todas');
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [userLocation, setUserLocation] = useState<{ x: number; y: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [showRouteTo, setShowRouteTo] = useState<string | null>(null);

  // Estados para el detalle de la ficha gastronómica inline
  const [activeDetailedFestival, setActiveDetailedFestival] = useState<Festival | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [visibleSections, setVisibleSections] = useState<number>(0);
  const [checkedIngredients, setCheckedIngredients] = useState<{ [key: string]: boolean }>({});
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  
  // Estados auxiliares existentes de navegación para recetas en modal
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

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

  // Carga progresiva de secciones detalladas al abrir un festival
  useEffect(() => {
    let timers: any[] = [];
    if (activeDetailedFestival) {
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
  }, [activeDetailedFestival]);

  const handleDetectLocation = () => {
    setIsLoadingLocation(true);
    setTimeout(() => {
      setUserLocation({ x: 23, y: 19 }); // Corrientes Capital (GPS)
      setIsLoadingLocation(false);
    }, 1000);
  };

  const handleOpenFestivalDetails = (fest: Festival) => {
    addRecentlyViewed(fest.id, 'festival');
    setActiveDetailedFestival(fest);
  };

  const toggleIngredientLocal = (recipeId: string, index: number) => {
    const key = `${recipeId}-${index}`;
    setCheckedIngredients(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getRouteColor = (route: string) => {
    switch (route) {
      case 'Carnes Tradicionales':
        return colors.primary;
      case 'Herencia Guaraní':
        return colors.secondary;
      case 'Sabores Naturales':
        return colors.accent;
      default:
        return colors.primary;
    }
  };

  // Filtrado de festivales según la ruta seleccionada
  const displayedFestivals = FESTIVALS.filter(fest => {
    return routeFilter === 'Todas' || fest.rutaGastronomica === routeFilter;
  });

  // Si se abre el detalle inline de un festival, renderizarlo completo en la pestaña
  if (activeDetailedFestival) {
    const relatedRecipe = RECIPES.find(r => r.id === activeDetailedFestival.recetaRelacionada);
    const context = getFestivalContext(activeDetailedFestival.id);

    if (isLoadingDetail) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.detailHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <Pressable onPress={() => setActiveDetailedFestival(null)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.detailHeaderTitle, { color: colors.primary }]} numberOfLines={1}>
              {activeDetailedFestival.nombre}
            </Text>
          </View>
          <ScrollView>
            <SkeletonLoader type="details" />
          </ScrollView>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Navigation Header */}
        <View style={[styles.detailHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
          <Pressable onPress={() => setActiveDetailedFestival(null)} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Volver al mapa">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.detailHeaderTitle, { color: colors.primary }]} numberOfLines={1}>
            {activeDetailedFestival.nombre}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          {/* SECCIÓN 1: Hero */}
          {visibleSections >= 1 && (
            <View style={styles.heroSection}>
              <Image source={{ uri: activeDetailedFestival.galeria[0] }} style={styles.heroImage} />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>{activeDetailedFestival.nombre}</Text>
                <View style={styles.heroLocationRow}>
                  <Ionicons name="location" size={14} color="#FFF" />
                  <Text style={styles.heroLocationText}>{activeDetailedFestival.localidad}</Text>
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
              <Text style={[styles.contextText, { color: colors.textSecondary }]}>{activeDetailedFestival.historia}</Text>
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
                  <Text style={[styles.featuredProductName, { color: colors.text }]}>{activeDetailedFestival.productoDestacado}</Text>
                  <Text style={[styles.featuredProductDesc, { color: colors.textSecondary }]}>
                    Este ingrediente es el corazón de la festividad en {activeDetailedFestival.localidad}, representando una tradición gastronómica única de las rutas del Taragüí.
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
                        onPress={() => toggleIngredientLocal(recipeId, i)}
                        style={[styles.checklistRowLocal, { borderBottomColor: colors.border }, isChecked && styles.checklistRowChecked]}
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
                {activeDetailedFestival.galeria.map((img, i) => (
                  <Image key={i} source={{ uri: img }} style={styles.galleryImageItem} />
                ))}
              </ScrollView>

              <Text style={[styles.contextLabel, { color: colors.primary, marginTop: 12 }]}>Video Resumen</Text>
              {!isPlayingVideo ? (
                <Pressable style={styles.videoPlayerMock} onPress={() => setIsPlayingVideo(true)}>
                  <Image source={{ uri: activeDetailedFestival.video }} style={styles.videoMockThumbnail} />
                  <View style={styles.videoPlayOverlay}>
                    <View style={[styles.playButtonCircle, { backgroundColor: colors.primary }]}>
                      <Ionicons name="play" size={32} color={colors.white} style={{ marginLeft: 4 }} />
                    </View>
                    <Text style={[styles.videoPlayText, { color: colors.white }]}>Reproducir Video Resumen</Text>
                  </View>
                </Pressable>
              ) : (
                <Pressable style={styles.videoPlayingMock} onPress={() => setIsPlayingVideo(false)}>
                  <Image source={{ uri: activeDetailedFestival.galeria[0] }} style={styles.videoMockThumbnail} />
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
                  alert(`¡Enlace de la ${activeDetailedFestival.nombre} copiado al portapapeles!`);
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
        title="Mapa Gastronómico" 
        subtitle="Fiestas y sabores tradicionales de Corrientes" 
        showDivider={true}
      />

      {/* Main View Area */}
      <View style={styles.mainArea}>
        {/* Route Filters */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
            {['Todas', 'Carnes Tradicionales', 'Herencia Guaraní', 'Sabores Naturales'].map(r => (
              <Pressable
                key={r}
                onPress={() => {
                  setRouteFilter(r);
                  setSelectedFestival(null);
                  setShowRouteTo(null);
                }}
                style={[
                  styles.filterBadge,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  (routeFilter === r || (routeFilter === 'Todas' && r === 'Todas')) && [styles.filterBadgeActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                ]}
              >
                <Text style={[
                  styles.filterBadgeText, 
                  { color: colors.textSecondary }, 
                  (routeFilter === r || (routeFilter === 'Todas' && r === 'Todas')) && { color: colors.white }
                ]}>
                  {r}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Blueprint Map Canvas */}
        <View style={styles.mapCanvasContainer}>
          <Card style={[styles.mapCanvas, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="md" border={true}>
            <View style={styles.mapBackdrop}>
              {/* Rivers - schematic layout representing Corrientes boundary */}
              <View style={[styles.riverParana, { backgroundColor: isDarkMode ? '#1B2C3F' : '#CFE2F3' }]} />
              <View style={[styles.riverUruguay, { backgroundColor: isDarkMode ? '#1B2C3F' : '#CFE2F3' }]} />
              <View style={[styles.iberaWetlands, {
                backgroundColor: isDarkMode ? '#1B2C21' : '#E2EFDA',
                borderColor: isDarkMode ? 'rgba(46, 111, 64, 0.3)' : 'rgba(46, 111, 64, 0.15)'
              }]} />

              {/* Grid lines */}
              <View style={[styles.gridLineH1, { backgroundColor: colors.border }]} />
              <View style={[styles.gridLineH2, { backgroundColor: colors.border }]} />
              <View style={[styles.gridLineV1, { backgroundColor: colors.border }]} />
              <View style={[styles.gridLineV2, { backgroundColor: colors.border }]} />

              {/* Map labels */}
              <Text style={[styles.mapWaterLabel, { left: '30%', top: '15%', color: isDarkMode ? '#2C4A6F' : '#A9C3E3' }]}>RÍO PARANÁ</Text>
              <Text style={[styles.mapWaterLabel, { right: '10%', bottom: '25%', color: isDarkMode ? '#2C4A6F' : '#A9C3E3', transform: [{ rotate: '-60deg' }] }]}>RÍO URUGUAY</Text>
              <Text style={[styles.mapWetlandsLabel, { left: '46%', top: '48%', color: isDarkMode ? '#4E7E5A' : '#7FA884' }]}>ESTEROS DEL IBERÁ</Text>

              {/* Pulsing Route Dashed Line between User Location and Destination Festival */}
              {(() => {
                if (!userLocation || !showRouteTo || !selectedFestival) return null;
                const destCoords = FESTIVAL_COORDINATES[selectedFestival.id];
                if (!destCoords) return null;

                const startX = userLocation.x;
                const startY = userLocation.y;
                const endX = destCoords.x;
                const endY = destCoords.y;

                const centerX = (startX + endX) / 2;
                const centerY = (startY + endY) / 2;
                const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
                const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

                return (
                  <View
                    style={{
                      position: 'absolute',
                      left: `${centerX}%`,
                      top: `${centerY}%`,
                      width: `${distance}%`,
                      height: 3,
                      marginLeft: `${-distance / 2}%`,
                      marginTop: -1.5,
                      borderStyle: 'dashed',
                      borderWidth: 1.5,
                      borderColor: colors.primary,
                      transform: [{ rotate: `${angle}deg` }],
                      zIndex: 10,
                      opacity: 0.85,
                    }}
                  />
                );
              })()}

              {/* User Location Pulsing Dot */}
              {userLocation && (
                <View style={[styles.userLocationMarker, { left: `${userLocation.x}%`, top: `${userLocation.y}%` }]}>
                  <View style={[styles.userLocationPulse, { borderColor: '#1A73E8', backgroundColor: 'rgba(26, 115, 232, 0.15)' }]} />
                  <View style={styles.userLocationDot} />
                  <View style={[styles.userLocationLabelContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.userLocationLabelText, { color: colors.text }]}>Tú (Capital)</Text>
                  </View>
                </View>
              )}

              {/* Interactive Festival Markers */}
              {displayedFestivals.map((fest) => {
                const coords = FESTIVAL_COORDINATES[fest.id];
                if (!coords) return null;
                const isSelected = selectedFestival?.id === fest.id;
                const routeColor = getRouteColor(fest.rutaGastronomica);

                return (
                  <Pressable
                    key={fest.id}
                    onPress={() => {
                      setSelectedFestival(fest);
                      setShowRouteTo(null);
                    }}
                    style={[
                      styles.markerWrapper,
                      { left: `${coords.x}%`, top: `${coords.y}%` }
                    ]}
                  >
                    {/* Pulsing Active Ring */}
                    <View style={[
                      styles.pulseRing, 
                      { borderColor: routeColor },
                      isSelected && [styles.pulseRingActive, { borderColor: colors.primary }]
                    ]} />
                    
                    {/* Marker Pin Core */}
                    <View style={[
                      styles.markerCore, 
                      { backgroundColor: routeColor },
                      isSelected && [styles.markerCoreActive, { backgroundColor: colors.primary }]
                    ]}>
                      <Ionicons 
                        name={isSelected ? "restaurant" : "location"} 
                        size={isSelected ? 13 : 11} 
                        color="#FFF" 
                      />
                    </View>
                    
                    {/* Floating label */}
                    <View style={[
                      styles.markerTag, 
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      isSelected && [styles.markerTagActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                    ]}>
                      <Text style={[
                        styles.markerTagText, 
                        { color: colors.text },
                        isSelected && [styles.markerTagTextActive, { color: colors.white }]
                      ]}>
                        {fest.localidad}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}

              {/* Floating Action Button (FAB) for User Location Detection */}
              <Pressable 
                onPress={handleDetectLocation} 
                style={[styles.locationFab, { backgroundColor: colors.surface, borderColor: colors.border }]}
                accessibilityRole="button"
                accessibilityLabel="Detectar mi ubicación"
              >
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name={userLocation ? "locate" : "locate-outline"} size={22} color={userLocation ? colors.primary : colors.text} />
                )}
              </Pressable>
            </View>
          </Card>
        </View>

        {/* Selected Festival Card (Popup Flotante) */}
        {selectedFestival && (
          <View style={styles.previewCardContainer}>
            <Card 
              style={[
                styles.previewCard, 
                { 
                  backgroundColor: colors.surface, 
                  borderColor: colors.border,
                  borderWidth: 1
                }
              ]} 
              elevation="lg"
            >
              <View style={styles.previewCardHeader}>
                <Image source={{ uri: selectedFestival.galeria[0] }} style={styles.previewCardImage} />
                <View style={styles.previewCardInfo}>
                  <Text style={[styles.previewCardCategory, { color: getRouteColor(selectedFestival.rutaGastronomica) }]}>
                    {selectedFestival.rutaGastronomica}
                  </Text>
                  <Text style={[styles.previewCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {selectedFestival.nombre}
                  </Text>
                  <View style={styles.previewCardMeta}>
                    <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.previewCardMetaText, { color: colors.textSecondary }]}>
                      {selectedFestival.localidad}
                    </Text>
                  </View>
                  <View style={[styles.previewCardProduct, { backgroundColor: getRouteColor(selectedFestival.rutaGastronomica) + '15' }]}>
                    <Text style={[styles.previewCardProductText, { color: getRouteColor(selectedFestival.rutaGastronomica) }]}>
                      {selectedFestival.productoDestacado}
                    </Text>
                  </View>
                </View>
                <Pressable 
                  onPress={() => {
                    setSelectedFestival(null);
                    setShowRouteTo(null);
                  }} 
                  style={styles.previewCloseBtn}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              </View>
              
              <View style={styles.previewCardActions}>
                {userLocation ? (
                  <Pressable 
                    onPress={() => {
                      if (showRouteTo === selectedFestival.id) {
                        setShowRouteTo(null);
                      } else {
                        setShowRouteTo(selectedFestival.id);
                      }
                    }}
                    style={[
                      styles.previewActionBtn, 
                      { 
                        backgroundColor: showRouteTo === selectedFestival.id ? colors.primary + '15' : colors.surface,
                        borderColor: colors.primary,
                        borderWidth: 1
                      }
                    ]}
                  >
                    <Ionicons 
                      name={showRouteTo === selectedFestival.id ? "navigate" : "navigate-outline"} 
                      size={14} 
                      color={colors.primary} 
                      style={{ marginRight: 4 }} 
                    />
                    <Text style={[styles.previewActionBtnText, { color: colors.primary }]}>
                      {showRouteTo === selectedFestival.id ? "Ocultar Ruta" : "Cómo Llegar"}
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable 
                    onPress={handleDetectLocation}
                    style={[
                      styles.previewActionBtn, 
                      { 
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderWidth: 1
                      }
                    ]}
                  >
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.previewActionBtnText, { color: colors.textSecondary }]}>
                      Activar GPS para Ruta
                    </Text>
                  </Pressable>
                )}
                
                <Pressable 
                  onPress={() => handleOpenFestivalDetails(selectedFestival)}
                  style={[styles.previewActionBtnPrimary, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.previewActionBtnPrimaryText}>Ver Fiesta</Text>
                  <Ionicons name="arrow-forward" size={12} color="#FFF" style={{ marginLeft: 4 }} />
                </Pressable>
              </View>
              
              {/* Route Tracing Panel */}
              {showRouteTo === selectedFestival.id && (
                <View style={[styles.directionsPanel, { borderTopColor: colors.border }]}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.secondary} style={{ marginRight: 6, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.directionsRouteTitle, { color: colors.text }]}>
                      Indicaciones ({getRouteInfo(selectedFestival.id).distance} • {getRouteInfo(selectedFestival.id).time})
                    </Text>
                    <Text style={[styles.directionsRouteText, { color: colors.textSecondary }]}>
                      {getRouteInfo(selectedFestival.id).route}
                    </Text>
                    <Text style={[styles.directionsRouteAdvice, { color: colors.secondary }]}>
                      Tip: {getRouteInfo(selectedFestival.id).advice}
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          </View>
        )}
      </View>

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
                <View style={[styles.modalSection, styles.grandmaTipCard, {
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
  mainArea: {
    flex: 1,
    position: 'relative',
  },
  filterSection: {
    paddingHorizontal: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
  },
  badgeScroll: {
    flexDirection: 'row',
  },
  filterBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs - 2,
    borderRadius: Theme.roundness.round,
    marginRight: 8,
    borderWidth: 1,
  },
  filterBadgeActive: {
    borderColor: Theme.colors.primary,
  },
  filterBadgeText: {
    fontSize: Theme.typography.sizes.sm - 1,
    fontWeight: Theme.typography.weights.medium,
  },
  mapCanvasContainer: {
    flex: 1,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: 90, // Room for the custom bottom tab bar
  },
  mapCanvas: {
    flex: 1,
    padding: 0,
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
    borderRadius: 40,
    borderWidth: 1.5,
    opacity: 0.8,
  },
  gridLineH1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 0.5,
    opacity: 0.15,
  },
  gridLineH2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 0.5,
    opacity: 0.15,
  },
  gridLineV1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 0.5,
    opacity: 0.15,
  },
  gridLineV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 0.5,
    opacity: 0.15,
  },
  mapWaterLabel: {
    position: 'absolute',
    fontSize: 7.5,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  mapWetlandsLabel: {
    position: 'absolute',
    fontSize: 7.5,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    opacity: 0.85,
    textAlign: 'center',
    width: 80,
    marginLeft: -40,
  },
  markerWrapper: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 5,
  },
  pulseRing: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    opacity: 0.5,
  },
  pulseRingActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    opacity: 0.8,
  },
  markerCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  markerCoreActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  markerTag: {
    position: 'absolute',
    bottom: -11,
    borderWidth: 0.5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: Theme.roundness.xs,
  },
  markerTagActive: {
    opacity: 1,
  },
  markerTagText: {
    fontSize: 7.5,
    fontWeight: Theme.typography.weights.semibold,
  },
  markerTagTextActive: {
    fontWeight: Theme.typography.weights.bold,
  },
  locationFab: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.md,
    zIndex: 15,
  },
  userLocationMarker: {
    position: 'absolute',
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -35 }, { translateY: -35 }],
    zIndex: 8,
  },
  userLocationPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    opacity: 0.65,
  },
  userLocationDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#1A73E8',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  userLocationLabelContainer: {
    position: 'absolute',
    bottom: -12,
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  userLocationLabelText: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  previewCardContainer: {
    position: 'absolute',
    bottom: 100, // Float just above the tab bar and map padding
    left: 16,
    right: 16,
    zIndex: 25,
  },
  previewCard: {
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.sm + 2,
    ...Theme.shadows.lg,
  },
  previewCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  previewCardImage: {
    width: 65,
    height: 65,
    borderRadius: Theme.roundness.xs,
  },
  previewCardInfo: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 10,
  },
  previewCardCategory: {
    fontSize: 8.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  previewCardTitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: 'bold',
    marginTop: 2,
  },
  previewCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  previewCardMetaText: {
    fontSize: 10,
    marginLeft: 3,
  },
  previewCardProduct: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  previewCardProductText: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  previewCloseBtn: {
    padding: 2,
  },
  previewCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  previewActionBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    borderRadius: Theme.roundness.sm,
    marginRight: 8,
  },
  previewActionBtnText: {
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  previewActionBtnPrimary: {
    flex: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    borderRadius: Theme.roundness.sm,
  },
  previewActionBtnPrimaryText: {
    color: '#FFF',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  directionsPanel: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    marginTop: 10,
    paddingTop: 8,
  },
  directionsRouteTitle: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  directionsRouteText: {
    fontSize: 9.5,
    lineHeight: 13,
    marginTop: 2,
  },
  directionsRouteAdvice: {
    fontSize: 9,
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Inline detailed view styles (consistent with Fiestas.tsx)
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
  checklistRowLocal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  checklistRowChecked: {
    opacity: 0.7,
  },
  checklistText: {
    fontSize: Theme.typography.sizes.sm,
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  checklistTextChecked: {
    textDecorationLine: 'line-through',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
    marginTop: 2,
  },
  stepNumText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
  },
  stepText: {
    flex: 1,
    fontSize: Theme.typography.sizes.sm,
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
    marginLeft: Theme.spacing.sm,
  },
  grandmaCardBody: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
    fontStyle: 'italic',
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
  // Recetas Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: Theme.roundness.xl,
    borderTopRightRadius: Theme.roundness.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  modalHeaderTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
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
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    justifyContent: 'space-around',
  },
  modalMetaItem: {
    alignItems: 'center',
  },
  modalMetaValue: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginTop: 4,
  },
  modalMetaLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  modalSection: {
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  modalSectionTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.sm,
    borderLeftWidth: 3,
    paddingLeft: Theme.spacing.sm,
  },
  modalBodyText: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
  },
  sectionHelpText: {
    fontSize: 11,
    marginBottom: Theme.spacing.sm,
    fontStyle: 'italic',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
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
    textDecorationLine: 'line-through',
  },
  progressContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
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
    textTransform: 'uppercase',
  },
  progressPercent: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  galleryScroll: {
    flexDirection: 'row',
    marginVertical: Theme.spacing.xs,
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
});

export default MapaScreen;
