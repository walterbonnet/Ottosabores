import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Theme from '../theme';
import { Festival, Recipe } from '../types';
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

interface FestivalDetailModalProps {
  festival: Festival | null;
  visible: boolean;
  onClose: () => void;
}

export const FestivalDetailModal: React.FC<FestivalDetailModalProps> = ({
  festival,
  visible,
  onClose,
}) => {
  const router = useRouter();
  const { colors, isDarkMode, recipeProgress, updateIngredientProgress } = useGlobalState();

  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [visibleSections, setVisibleSections] = useState<number>(0);

  // Transition entries
  useEffect(() => {
    let timers: any[] = [];
    if (visible && festival) {
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
      }, 0);
      timers.push(initTimer);
    }

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [visible, festival]);

  if (!festival) return null;

  const relatedRecipe = RECIPES.find(r => r.id === festival.recetaRelacionada);
  const context = getFestivalContext(festival.id);
  const prog = relatedRecipe ? recipeProgress[relatedRecipe.id] : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Navigation Header */}
        <View style={[styles.detailHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
          <Pressable 
            onPress={onClose} 
            style={({ pressed }) => [styles.backButton, pressed && styles.pressedFeedback]}
            accessibilityRole="button"
            accessibilityLabel="Volver a las rutas"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.detailHeaderTitle, { color: colors.primary }]} numberOfLines={1}>
            {festival.nombre}
          </Text>
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
                  source={{ uri: festival.galeria?.[0] }} 
                  style={styles.heroImage} 
                  contentFit="cover"
                  placeholder={`${festival.galeria?.[0]}?w=100&blur=30`}
                  transition={250}
                />
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroTitle}>{festival.nombre}</Text>
                  <View style={styles.heroLocationRow}>
                    <Ionicons name="location" size={14} color="#FFF" />
                    <Text style={styles.heroLocationText}>{festival.localidad}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* SECCIÓN 2: Contexto */}
            {visibleSections >= 2 && (
              <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitleTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Contexto & Tradición</Text>
                
                <Text style={[styles.contextLabel, { color: colors.primary }]}>Características del Evento</Text>
                <Text style={[styles.contextText, { color: colors.textSecondary }]}>{context.caracteristicas}</Text>

                <Text style={[styles.contextLabel, { color: colors.primary, marginTop: 12 }]}>Importancia Cultural</Text>
                <Text style={[styles.contextText, { color: colors.textSecondary }]}>{context.importancia}</Text>
                
                <Text style={[styles.contextLabel, { color: colors.primary, marginTop: 12 }]}>Historia General</Text>
                <Text style={[styles.contextText, { color: colors.textSecondary }]}>{festival.historia}</Text>
              </View>
            )}

            {/* SECCIÓN 3: Producto Destacado */}
            {visibleSections >= 3 && (
              <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitleTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Producto Destacado</Text>
                <View style={[styles.featuredProductCard, { backgroundColor: colors.primary + '0c', borderColor: colors.primary + '25' }]}>
                  <Ionicons name="sparkles" size={24} color={colors.primary} />
                  <View style={styles.featuredProductInfo}>
                    <Text style={[styles.featuredProductLabel, { color: colors.primary }]}>Sabor e Identidad</Text>
                    <Text style={[styles.featuredProductName, { color: colors.text }]}>{festival.productoDestacado}</Text>
                    <Text style={[styles.featuredProductDesc, { color: colors.textSecondary }]}>
                      Este ingrediente es el corazón de la festividad en {festival.localidad}, representando una tradición gastronómica única de las rutas del Taragüí.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* SECCIÓN 4: Receta Tradicional */}
            {visibleSections >= 4 && (
              <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitleTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Receta Tradicional</Text>
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
                      const isChecked = prog ? prog.completedIngredients.includes(i) : false;
                      return (
                        <Pressable
                          key={i}
                          onPress={() => updateIngredientProgress(relatedRecipe.id, i, !isChecked)}
                          style={({ pressed }) => [styles.checklistRow, { borderBottomColor: colors.border }, isChecked && styles.checklistRowChecked, pressed && styles.pressedFeedback]}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: isChecked }}
                          accessibilityLabel={`${isChecked ? 'Ingrediente listo:' : 'Marcar listo:'} ${ing}`}
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
                <Text style={[styles.sectionTitleTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Contenido Multimedia</Text>
                
                <Text style={[styles.contextLabel, { color: colors.primary }]}>Galería de Fotos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                  {festival.galeria?.map((img, i) => (
                    <Image 
                      key={i} 
                      source={{ uri: img }} 
                      style={styles.galleryImageItem} 
                      contentFit="cover"
                      placeholder={`${img}?w=100&blur=30`}
                    />
                  ))}
                </ScrollView>

                <Text style={[styles.contextLabel, { color: colors.primary, marginTop: 12 }]}>Video Resumen</Text>
                {!isPlayingVideo ? (
                  <Pressable 
                    style={({ pressed }) => [styles.videoPlayerMock, pressed && styles.pressedFeedback]} 
                    onPress={() => setIsPlayingVideo(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Reproducir video resumen"
                  >
                    <Image 
                      source={{ uri: festival.video }} 
                      style={styles.videoMockThumbnail} 
                      contentFit="cover"
                      placeholder={`${festival.video}?w=100&blur=30`}
                    />
                    <View style={styles.videoPlayOverlay}>
                      <View style={[styles.playButtonCircle, { backgroundColor: colors.primary }]}>
                        <Ionicons name="play" size={32} color={colors.white} style={{ marginLeft: 4 }} />
                      </View>
                      <Text style={[styles.videoPlayText, { color: colors.white }]}>Reproducir Video Resumen</Text>
                    </View>
                  </Pressable>
                ) : (
                  <Pressable 
                    style={({ pressed }) => [styles.videoPlayingMock, pressed && styles.pressedFeedback]} 
                    onPress={() => setIsPlayingVideo(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Pausar video"
                  >
                    <Image 
                      source={{ uri: festival.galeria?.[0] }} 
                      style={styles.videoMockThumbnail} 
                      contentFit="cover"
                      placeholder={`${festival.galeria?.[0]}?w=100&blur=30`}
                    />
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
                    alert(`¡Enlace de la ${festival.nombre} copiado al portapapeles!`);
                  }}
                  style={({ pressed }) => [styles.shareBtn, { backgroundColor: colors.secondary }, pressed && styles.pressedFeedback]}
                  accessibilityRole="button"
                  accessibilityLabel="Compartir ruta gastronómica"
                >
                  <Ionicons name="share-social-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.shareBtnText}>Compartir Ruta Gastronómica</Text>
                </Pressable>
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
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLocationText: {
    fontSize: Theme.typography.sizes.xs,
    color: '#FFF',
    marginLeft: 4,
    fontWeight: Theme.typography.weights.medium,
  },
  detailSection: {
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  sectionTitleTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.sm,
    borderLeftWidth: 3,
    paddingLeft: Theme.spacing.sm,
  },
  contextLabel: {
    fontSize: 10.5,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
    marginBottom: Theme.spacing.xs - 2,
    marginTop: Theme.spacing.sm,
  },
  contextText: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
  },
  featuredProductCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Theme.roundness.md,
    borderWidth: 1.5,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.xs,
  },
  featuredProductInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  featuredProductLabel: {
    fontSize: 8.5,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  featuredProductName: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: 6,
  },
  featuredProductDesc: {
    fontSize: Theme.typography.sizes.xs + 1,
    lineHeight: 16,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    marginBottom: Theme.spacing.md,
  },
  recipeMetaItem: {
    alignItems: 'center',
    flex: 1,
  },
  recipeMetaValue: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    marginTop: 4,
  },
  recipeMetaLabel: {
    fontSize: 9.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  recipeTitleName: {
    fontSize: Theme.typography.sizes.md + 2,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.md,
  },
  recipeSubheading: {
    fontSize: Theme.typography.sizes.sm + 1,
    fontWeight: Theme.typography.weights.bold,
    marginTop: Theme.spacing.sm,
    marginBottom: 2,
  },
  recipeHelpText: {
    fontSize: 10.5,
    fontStyle: 'italic',
    marginBottom: Theme.spacing.xs,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  checklistRowChecked: {
    opacity: 0.55,
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
    alignItems: 'flex-start',
    marginTop: Theme.spacing.sm,
    paddingHorizontal: 2,
  },
  stepNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
    marginTop: 1,
  },
  stepNumText: {
    fontSize: 10.5,
    fontWeight: Theme.typography.weights.bold,
  },
  stepText: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 18,
    flex: 1,
  },
  grandmaTipCard: {
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
    fontSize: Theme.typography.sizes.md - 1,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.sm,
  },
  grandmaCardBody: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  galleryScroll: {
    flexDirection: 'row',
    marginVertical: Theme.spacing.xs,
  },
  galleryImageItem: {
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  videoPlayText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayingText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
  },
  videoProgressOuter: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  videoProgressInner: {
    width: '35%',
    height: '100%',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Theme.roundness.sm,
    marginTop: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  pressedFeedback: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});

export default FestivalDetailModal;
