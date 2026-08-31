import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import { FESTIVALS, RECIPES } from '../services/mockData';
import { Festival, Recipe } from '../types';
import { useGlobalState } from '../services/GlobalStateContext';
import SkeletonLoader from '../components/SkeletonLoader';
import RecipeDetailModal from '../components/RecipeDetailModal';
import FestivalDetailModal from '../components/FestivalDetailModal';

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

interface OriginOption {
  name: string;
  latitude: number;
  longitude: number;
  x: number;
  y: number;
}

const ORIGIN_CITIES: OriginOption[] = [
  { name: 'Corrientes (Capital)', latitude: -27.4696, longitude: -58.8306, x: 23, y: 19 },
  { name: 'Caá Catí', latitude: -27.5333, longitude: -57.6333, x: 48, y: 22 },
  { name: 'Mercedes', latitude: -29.1833, longitude: -58.0833, x: 52, y: 55 },
  { name: 'Pago de los Deseos', latitude: -28.2333, longitude: -58.8333, x: 58, y: 30 },
  { name: 'Empedrado', latitude: -27.9000, longitude: -58.8000, x: 22, y: 36 },
  { name: 'Santa Rosa', latitude: -28.2667, longitude: -58.1167, x: 62, y: 40 },
  { name: 'Tabay', latitude: -28.2667, longitude: -58.2833, x: 88, y: 22 },
  { name: 'El Sombrero', latitude: -27.6000, longitude: -58.7833, x: 55, y: 34 },
  { name: 'Gobernador Virasoro', latitude: -28.0500, longitude: -56.0167, x: 65, y: 15 },
  { name: 'San Cosme', latitude: -27.3667, longitude: -58.5167, x: 59, y: 27 },
  { name: 'Saladas', latitude: -28.2500, longitude: -58.7667, x: 32, y: 42 },
  { name: 'Santa Ana de los Guácaras', latitude: -27.4667, longitude: -58.7167, x: 28, y: 18 },
  { name: 'Esquina', latitude: -30.0167, longitude: -59.5333, x: 18, y: 80 },
  { name: 'Mantilla', latitude: -28.6167, longitude: -58.8333, x: 34, y: 56 },
  { name: 'Tres de Abril', latitude: -28.4667, longitude: -58.9833, x: 26, y: 62 },
];

const IBERA_ROUTE_SEGMENTS = [
  { x1: 52, y1: 55, x2: 32, y2: 42 },   // Mercedes a Saladas
  { x1: 32, y1: 42, x2: 58, y2: 30 },   // Saladas a Pago de los Deseos
  { x1: 58, y1: 30, x2: 55, y2: 34 },   // Pago de los Deseos a El Sombrero
  { x1: 55, y1: 34, x2: 59, y2: 27 },   // El Sombrero a San Cosme
  { x1: 59, y1: 27, x2: 65, y2: 15 },   // San Cosme a Gobernador Virasoro
];

const IBERA_FESTIVAL_IDS = ['2', '3', '7', '8', '9', '10'];

// Custom line component for rendering route connections on schematic map
const MapLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; thickness?: number; dashed?: boolean }> = ({
  x1, y1, x2, y2, color, thickness = 2, dashed = false
}) => {
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  return (
    <View
      style={{
        position: 'absolute',
        left: `${centerX}%`,
        top: `${centerY}%`,
        width: `${distance}%`,
        height: thickness,
        marginLeft: `${-distance / 2}%`,
        marginTop: -thickness / 2,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderWidth: dashed ? thickness / 2 : 0,
        backgroundColor: dashed ? 'transparent' : color,
        borderColor: color,
        transform: [{ rotate: `${angle}deg` }],
        zIndex: 4,
        opacity: 0.6,
      }}
    />
  );
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
    importancia: 'Rescate de los saberes tradicionales y de las recetas transmitidas de generación en generación en la provincia.',
    advice: 'Transitar con precaución respetando las velocidades máximas.'
  };
};

export const MapaScreen: React.FC = () => {
  const router = useRouter();
  // Estados para filtro e interactividad del mapa
  const [routeFilter, setRouteFilter] = useState<string>('Todas');
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [userLocation, setUserLocation] = useState<{ x: number; y: number } | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [originCity, setOriginCity] = useState<string | null>(null);
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);


  // Bottom Sheet expansion states
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isRecipeCollapsed, setIsRecipeCollapsed] = useState<boolean>(true);

  // Estados para el detalle de la ficha gastronómica inline
  const [activeDetailedFestival, setActiveDetailedFestival] = useState<Festival | null>(null);
  
  // Estados auxiliares existentes de navegación para recetas en modal
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Estados para reproductor multimedia de video y carga progresiva en detalle de mapa
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [visibleSections, setVisibleSections] = useState<number>(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let timers: any[] = [];
    if (activeDetailedFestival) {
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
      }, 500);

      timers.push(loadTimer);
    } else {
      const initTimer = setTimeout(() => {
        setIsLoadingDetail(false);
        setVisibleSections(0);
        setIsPlayingVideo(false);
      }, 0);
      timers.push(initTimer);
    }

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [activeDetailedFestival]);

  const {
    addRecentlyViewed,
    colors,
    isDarkMode,
  } = useGlobalState();

  const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const getDistanceAndDuration = (fest: Festival) => {
    if (!userCoords || !fest.latitud || !fest.longitud) return null;
    const dist = getHaversineDistance(
      userCoords.latitude,
      userCoords.longitude,
      fest.latitud,
      fest.longitud
    );
    const durationHours = dist / 85; // 85 km/h average driving speed
    const durationMinutes = Math.round(durationHours * 60);

    let durationText = '';
    if (durationMinutes < 60) {
      durationText = `≈ ${durationMinutes} min`;
    } else {
      const h = Math.floor(durationMinutes / 60);
      const m = durationMinutes % 60;
      durationText = m > 0 ? `≈ ${h} h ${m} min` : `≈ ${h} h`;
    }

    return {
      distance: `${dist.toFixed(1)} km`,
      duration: durationText
    };
  };

  const handleDetectLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permiso de ubicación denegado. Se mantendrá el mapa activo y podrás seleccionar tu origen manualmente.');
        setIsLoadingLocation(false);
        setShowCityPicker(true);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const { latitude, longitude } = location.coords;
      setUserCoords({ latitude, longitude });
      setOriginCity('Mi Ubicación (GPS)');

      // Bounding box of Corrientes:
      // Min Lat: -30.5, Max Lat: -27.1
      // Min Lon: -59.8, Max Lon: -55.8
      const x = Math.min(95, Math.max(5, ((longitude - (-60.1)) / 4.3) * 100));
      const y = Math.min(95, Math.max(5, (((-27.0) - latitude) / 3.4) * 100));
      setUserLocation({ x, y });
    } catch (error) {
      console.warn(error);
      alert('No se pudo obtener la ubicación GPS. Selecciona tu origen manualmente.');
      setShowCityPicker(true);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSelectOriginCity = (city: OriginOption) => {
    setUserCoords({ latitude: city.latitude, longitude: city.longitude });
    setOriginCity(city.name);
    setUserLocation({ x: city.x, y: city.y });
    setShowCityPicker(false);
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
      case 'Ruta del Iberá':
        return '#2E6F40';
      default:
        return colors.primary;
    }
  };

  // Filtrado de festivales según la ruta seleccionada
  const displayedFestivals = FESTIVALS.filter(fest => {
    if (routeFilter === 'Todas') return true;
    if (routeFilter === 'Ruta del Iberá') return IBERA_FESTIVAL_IDS.includes(fest.id);
    return fest.rutaGastronomica === routeFilter;
  });

  const handleOpenNavigation = (fest: Festival) => {
    if (!fest.latitud || !fest.longitud) return;
    const scheme = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(fest.nombre)}@${fest.latitud},${fest.longitud}`,
      android: `geo:0,0?q=${fest.latitud},${fest.longitud}(${encodeURIComponent(fest.nombre)})`,
      default: `https://www.google.com/maps/search/?api=1&query=${fest.latitud},${fest.longitud}`
    });

    Linking.openURL(scheme).catch(() => {
      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${fest.latitud},${fest.longitud}`;
      Linking.openURL(fallbackUrl);
    });
  };

  const handleGoToRecipe = (recipeId: string) => {
    router.navigate(`/recetas?id=${recipeId}`);
  };

  const handleGoToFestival = (festivalId: string) => {
    router.navigate(`/fiestas?id=${festivalId}`);
  };

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
            {['Todas', 'Ruta del Iberá', 'Carnes Tradicionales', 'Herencia Guaraní', 'Sabores Naturales'].map(r => (
              <Pressable
                key={r}
                onPress={() => {
                  setRouteFilter(r);
                  setSelectedFestival(null);
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

              {/* Iberá gastronomic route connection lines */}
              {routeFilter === 'Ruta del Iberá' && IBERA_ROUTE_SEGMENTS.map((seg, i) => (
                <MapLine
                  key={i}
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  color="#2E6F40"
                  thickness={3}
                />
              ))}

              {/* Route Dashed Line between User Location and Destination Festival */}
              {(() => {
                if (!userLocation || !selectedFestival) return null;
                const destCoords = FESTIVAL_COORDINATES[selectedFestival.id];
                if (!destCoords) return null;

                return (
                  <MapLine
                    x1={userLocation.x}
                    y1={userLocation.y}
                    x2={destCoords.x}
                    y2={destCoords.y}
                    color={colors.primary}
                    thickness={2}
                    dashed={true}
                  />
                );
              })()}

              {/* User Location Marker */}
              {userLocation && (
                <View style={[styles.userLocationMarker, { left: `${userLocation.x}%`, top: `${userLocation.y}%` }]}>
                  <View style={[styles.userLocationPulse, { borderColor: '#1A73E8', backgroundColor: 'rgba(26, 115, 232, 0.15)' }]} />
                  <View style={styles.userLocationDot} />
                  <View style={[styles.userLocationLabelContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.userLocationLabelText, { color: colors.text }]} numberOfLines={1}>
                      {originCity === 'Mi Ubicación (GPS)' ? 'Tú' : originCity}
                    </Text>
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
                      setIsExpanded(false);
                      setIsRecipeCollapsed(true);
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
                accessibilityLabel="Calcular ruta o detectar mi ubicación"
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

        {/* Selected Festival Info Panel (Bottom Sheet on Mobile / Sidebar on Desktop) */}
        {selectedFestival && (() => {
          const relatedRecipe = RECIPES.find(r => r.id === selectedFestival.recetaRelacionada);
          const travelInfo = getDistanceAndDuration(selectedFestival);
          const isDesktop = SCREEN_WIDTH > 768;

          return (
            <View style={[
              isDesktop ? styles.sheetContainerDesktop : styles.sheetContainerMobile,
              !isDesktop && { height: isExpanded ? SCREEN_HEIGHT * 0.75 : 230 },
              { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDesktop ? 1 : 0 }
            ]}>
              {/* Header Handle / Drag Bar (Only for mobile) */}
              {!isDesktop && (
                <Pressable 
                  onPress={() => setIsExpanded(!isExpanded)} 
                  style={styles.dragHandleContainer}
                  accessibilityRole="button"
                  accessibilityLabel={isExpanded ? "Contraer panel" : "Expandir panel"}
                >
                  <View style={[styles.dragHandleBar, { backgroundColor: colors.border }]} />
                </Pressable>
              )}

              {/* Close Button */}
              <Pressable 
                onPress={() => setSelectedFestival(null)} 
                style={styles.sheetCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Cerrar panel de información"
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>

              {/* Scrollable Content Area */}
              <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Image & Header */}
                <View style={[styles.sheetHeaderLayout, isExpanded && styles.sheetHeaderLayoutExpanded]}>
                  <Image 
                    source={{ uri: selectedFestival.galeria[0] }} 
                    style={isExpanded || isDesktop ? styles.sheetHeroImage : styles.sheetThumbnailImage} 
                    contentFit="cover"
                  />
                  <View style={styles.sheetHeaderText}>
                    <Text style={[styles.sheetCategoryText, { color: getRouteColor(selectedFestival.rutaGastronomica) }]}>
                      {selectedFestival.rutaGastronomica}
                    </Text>
                    <Text style={[styles.sheetTitleText, { color: colors.text }]} numberOfLines={isExpanded ? 0 : 1}>
                      {selectedFestival.nombre}
                    </Text>
                    <View style={styles.sheetMetaRow}>
                      <Ionicons name="location-outline" size={13} color={colors.textSecondary} style={{ marginRight: 3 }} />
                      <Text style={[styles.sheetMetaText, { color: colors.textSecondary }]}>
                        {selectedFestival.localidad}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Travel & Distance Stats */}
                <View style={[styles.travelStatsContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  {travelInfo ? (
                    <View style={styles.travelStatsRow}>
                      <Ionicons name="compass-outline" size={18} color={colors.primary} style={{ marginRight: 6, marginTop: 1 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.travelStatsTitle, { color: colors.text }]}>Desde: {originCity === 'Mi Ubicación (GPS)' ? 'Tu Ubicación' : originCity}</Text>
                        <Text style={[styles.travelStatsDetail, { color: colors.textSecondary }]}>
                          Distancia: <Text style={{ fontWeight: 'bold', color: colors.primary }}>{travelInfo.distance}</Text> • Tiempo: <Text style={{ fontWeight: 'bold', color: colors.primary }}>{travelInfo.duration}</Text>
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.travelStatsPromptRow}>
                      <Ionicons name="locate-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.travelStatsPromptText, { color: colors.textSecondary }]}>
                          ¿Quieres calcular la distancia de viaje?
                        </Text>
                      </View>
                      <Pressable 
                        onPress={handleDetectLocation}
                        style={[styles.travelPromptBtn, { backgroundColor: colors.primary }]}
                        accessibilityRole="button"
                        accessibilityLabel="Calcular ruta de viaje"
                      >
                        <Text style={styles.travelPromptBtnText}>Calcular</Text>
                      </Pressable>
                    </View>
                  )}
                </View>

                {/* Comida Destacada */}
                <View style={[styles.highlightedFoodBox, { backgroundColor: getRouteColor(selectedFestival.rutaGastronomica) + '0d', borderColor: getRouteColor(selectedFestival.rutaGastronomica) + '25' }]}>
                  <Ionicons name="star" size={16} color={getRouteColor(selectedFestival.rutaGastronomica)} style={{ marginRight: 6 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.highlightedFoodLabel, { color: getRouteColor(selectedFestival.rutaGastronomica) }]}>Comida Destacada</Text>
                    <Text style={[styles.highlightedFoodName, { color: colors.text }]}>{selectedFestival.productoDestacado}</Text>
                  </View>
                </View>

                {/* Full Description & Recipe details when expanded */}
                {(isExpanded || isDesktop) && (
                  <View style={{ marginTop: 12 }}>
                    {/* Description */}
                    <Text style={[styles.expandedDescText, { color: colors.textSecondary }]}>
                      {selectedFestival.descripcionCorta}
                    </Text>

                    {/* Festival History */}
                    <Text style={[styles.panelSubtitle, { color: colors.text, borderLeftColor: colors.primary }]}>Historia & Tradición</Text>
                    <Text style={[styles.expandedContextText, { color: colors.textSecondary }]}>
                      {selectedFestival.historia}
                    </Text>

                    {/* Recipe Details collapsible */}
                    {relatedRecipe && (
                      <View style={{ marginTop: 12 }}>
                        <Pressable 
                          onPress={() => setIsRecipeCollapsed(!isRecipeCollapsed)}
                          style={[styles.recipeCollapseHeader, { borderBottomColor: colors.border }]}
                          accessibilityRole="button"
                          accessibilityLabel="Mostrar receta paso a paso"
                        >
                          <Ionicons name="book-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                          <Text style={[styles.recipeCollapseTitle, { color: colors.text }]}>Receta: {relatedRecipe.nombre}</Text>
                          <Ionicons name={isRecipeCollapsed ? "chevron-down" : "chevron-up"} size={16} color={colors.textSecondary} />
                        </Pressable>

                        {!isRecipeCollapsed && (
                          <View style={[styles.recipeCollapseBody, { backgroundColor: colors.background }]}>
                            {/* Meta Duration / Difficulty */}
                            <View style={styles.recipeMetaTextRow}>
                              <Text style={[styles.recipeMetaTextDetail, { color: colors.textSecondary }]}>
                                Duración: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{relatedRecipe.duración}</Text>
                              </Text>
                              <Text style={[styles.recipeMetaTextDetail, { color: colors.textSecondary }]}>
                                Dificultad: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{relatedRecipe.dificultad}</Text>
                              </Text>
                            </View>

                            {/* Ingredients */}
                            <Text style={[styles.recipeMiniSubTitle, { color: colors.text }]}>Ingredientes:</Text>
                            {relatedRecipe.ingredientes.map((ing, index) => (
                              <Text key={index} style={[styles.recipeMiniText, { color: colors.textSecondary }]}>
                                • {ing}
                              </Text>
                            ))}

                            {/* Steps */}
                            <Text style={[styles.recipeMiniSubTitle, { color: colors.text, marginTop: 8 }]}>Preparación:</Text>
                            {relatedRecipe.preparación.map((step, index) => (
                              <Text key={index} style={[styles.recipeMiniText, { color: colors.textSecondary, marginBottom: 4 }]}>
                                {index + 1}. {step}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons Footer */}
              <View style={[styles.sheetFooterRow, { borderTopColor: colors.border }]}>
                {/* Cómo Llegar */}
                <Pressable 
                  onPress={() => handleOpenNavigation(selectedFestival)}
                  style={[styles.sheetFooterBtn, { borderColor: colors.primary, borderWidth: 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Ver cómo llegar en mapas externos"
                >
                  <Ionicons name="navigate-outline" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.sheetFooterBtnText, { color: colors.primary }]}>Cómo Llegar</Text>
                </Pressable>

                {/* Ver Receta */}
                {relatedRecipe && (
                  <Pressable 
                    onPress={() => handleGoToRecipe(relatedRecipe.id)}
                    style={[styles.sheetFooterBtn, { borderColor: colors.secondary, borderWidth: 1 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Ver receta completa"
                  >
                    <Ionicons name="restaurant-outline" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.sheetFooterBtnText, { color: colors.secondary }]}>Receta</Text>
                  </Pressable>
                )}

                {/* Ver Fiesta */}
                <Pressable 
                  onPress={() => handleGoToFestival(selectedFestival.id)}
                  style={[styles.sheetFooterBtnPrimary, { backgroundColor: colors.primary }]}
                  accessibilityRole="button"
                  accessibilityLabel="Ver detalles de la festividad"
                >
                  <Text style={styles.sheetFooterBtnPrimaryText}>Ver Fiesta</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" style={{ marginLeft: 4 }} />
                </Pressable>
              </View>
            </View>
          );
        })()}
      </View>

      {/* Manual Origin City Picker Modal */}
      <Modal
        visible={showCityPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCityPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={[styles.pickerModalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.pickerModalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.pickerModalTitle, { color: colors.text }]}>Elegir Origen Manual</Text>
              <Pressable onPress={() => setShowCityPicker(false)} style={styles.pickerModalCloseBtn} accessibilityRole="button" accessibilityLabel="Cerrar modal">
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.cityList}>
              {ORIGIN_CITIES.map((city) => (
                <Pressable
                  key={city.name}
                  onPress={() => handleSelectOriginCity(city)}
                  style={({ pressed }) => [
                    styles.cityItem,
                    { borderBottomColor: colors.border },
                    pressed && { backgroundColor: colors.border }
                  ]}
                >
                  <Ionicons name="location" size={18} color={colors.primary} style={{ marginRight: 10 }} />
                  <Text style={[styles.cityItemText, { color: colors.text }]}>{city.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        visible={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />

      {/* Festival Detail Modal */}
      <FestivalDetailModal
        festival={activeDetailedFestival}
        visible={!!activeDetailedFestival}
        onClose={() => setActiveDetailedFestival(null)}
      />
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
  sheetContainerMobile: {
    position: 'absolute',
    bottom: 90, // Just above the CustomTabBar
    left: 12,
    right: 12,
    height: 230, // Default collapsed height
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    ...Theme.shadows.lg,
    overflow: 'hidden',
  },
  sheetContainerDesktop: {
    position: 'absolute',
    top: 12,
    right: 12,
    bottom: 110,
    width: 380,
    borderRadius: 16,
    ...Theme.shadows.lg,
    overflow: 'hidden',
  },
  dragHandleContainer: {
    width: '100%',
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 6,
    zIndex: 10,
  },
  sheetHeaderLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetHeaderLayoutExpanded: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  sheetThumbnailImage: {
    width: 70,
    height: 70,
    borderRadius: Theme.roundness.sm,
  },
  sheetHeroImage: {
    width: '100%',
    height: 140,
    borderRadius: Theme.roundness.md,
    marginBottom: 10,
  },
  sheetHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  sheetCategoryText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sheetTitleText: {
    fontSize: Theme.typography.sizes.md - 1,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  sheetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetMetaText: {
    fontSize: 10.5,
  },
  travelStatsContainer: {
    borderWidth: 1,
    borderRadius: Theme.roundness.sm,
    padding: 10,
    marginTop: 10,
  },
  travelStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelStatsTitle: {
    fontSize: 9.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  travelStatsDetail: {
    fontSize: 10.5,
    marginTop: 1,
  },
  travelStatsPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelStatsPromptText: {
    fontSize: 10,
    flex: 1,
  },
  travelPromptBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  travelPromptBtnText: {
    color: '#FFF',
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  highlightedFoodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 10,
  },
  highlightedFoodLabel: {
    fontSize: 8.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  highlightedFoodName: {
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  expandedDescText: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  panelSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    borderLeftWidth: 3,
    paddingLeft: 6,
  },
  expandedContextText: {
    fontSize: 11,
    lineHeight: 16,
  },
  recipeCollapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginTop: 12,
  },
  recipeCollapseTitle: {
    fontSize: 11.5,
    fontWeight: 'bold',
    flex: 1,
  },
  recipeCollapseBody: {
    padding: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  recipeMetaTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  recipeMetaTextDetail: {
    fontSize: 9.5,
  },
  recipeMiniSubTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    marginTop: 4,
  },
  recipeMiniText: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  sheetFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sheetFooterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    borderRadius: 6,
    marginRight: 6,
  },
  sheetFooterBtnText: {
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  sheetFooterBtnPrimary: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    borderRadius: 6,
  },
  sheetFooterBtnPrimaryText: {
    color: '#FFF',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalContent: {
    width: '85%',
    maxHeight: '60%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  pickerModalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pickerModalCloseBtn: {
    padding: 4,
  },
  cityList: {
    paddingBottom: 20,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  cityItemText: {
    fontSize: 12,
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
