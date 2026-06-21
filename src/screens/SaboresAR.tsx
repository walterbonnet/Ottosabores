import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import { useGlobalState } from '../services/GlobalStateContext';
import { MULTIMEDIA_ITEMS } from '../services/mockData';

interface FoodSubItem {
  name: string;
  color: string;
  shape: 'circle' | 'square' | 'bowl' | 'pot' | 'cinnamon' | 'star';
  angleOffset: number; // in radians on the circular platter
  size: number;
  heightOffset: number;
}

interface ARItem {
  id: string; // matches recipe ID
  name: string;
  category: string;
  difficulty: string;
  duration: string;
  description: string;
  history: string;
  ingredients: string[];
  video: string;
  audioTrackId: string; // matches multimedia item ID
  platterColor: string;
  foodItems: FoodSubItem[];
}

const AR_ITEMS: ARItem[] = [
  {
    id: 'r1',
    name: 'Chipá Tradicional',
    category: 'Sabores Guaraníes',
    difficulty: 'Fácil',
    duration: '45 min',
    description: 'Bollitos dorados calientes con masa de almidón de mandioca, huevos, manteca y abundante queso criollo correntino.',
    history: 'El chipá es herencia directa de la cultura guaraní y las misiones jesuíticas. Originalmente, los guaraníes preparaban un pan de mandioca rallada envuelto en hojas de güembé cocinado sobre cenizas. Con la llegada de los jesuitas, se incorporaron productos lácteos, dando origen al chipá actual.',
    ingredients: [
      '500g de almidón de mandioca',
      '3 huevos medianos',
      '100g de grasa vacuna derretida',
      '250g de queso criollo en cubos',
      '150g de queso rallado sardo',
      '1 cucharada de jugo de naranja natural'
    ],
    video: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=60',
    audioTrackId: 'p1', // El Secreto del Almidón de Mandioca
    platterColor: '#E6D7C3', // Light wood
    foodItems: [
      { name: 'Chipá 1', color: '#E9C46A', shape: 'circle', angleOffset: 0, size: 24, heightOffset: 0 },
      { name: 'Chipá 2', color: '#F4A261', shape: 'circle', angleOffset: 1.25, size: 22, heightOffset: 2 },
      { name: 'Chipá 3', color: '#E9C46A', shape: 'circle', angleOffset: 2.5, size: 25, heightOffset: -1 },
      { name: 'Chipá 4', color: '#E76F51', shape: 'circle', angleOffset: 3.75, size: 23, heightOffset: 3 },
      { name: 'Chipá 5', color: '#E9C46A', shape: 'circle', angleOffset: 5.0, size: 24, heightOffset: 0 },
    ]
  },
  {
    id: 'r2',
    name: 'Mbaipy (Polenta Guaraní)',
    category: 'Sabores Guaraníes',
    difficulty: 'Media',
    duration: '60 min',
    description: 'Densa y calórica crema de harina de maíz de molienda casera cocida en olla de tres patas con pollo de campo y queso derretido.',
    history: 'El Mbaipy es uno de los platos más antiguos de la región, consumido por los guaraníes mucho antes de la colonización. Consiste en una crema espesa a base de maíz. Con el tiempo se le incorporaron carnes y abundante queso criollo, convirtiéndose en el almuerzo ideal para los días fríos del invierno correntino.',
    ingredients: [
      '300g de harina de maíz criollo',
      '500g de pollo de campo en cubos',
      '1 cebolla picada',
      '1 morrón rojo picado',
      '300g de queso criollo correntino',
      'Caldo de verduras caliente (1 litro)'
    ],
    video: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=60',
    audioTrackId: 'p2', // El Sonido del Fuego y el Mbaipy
    platterColor: '#8D5B4C', // Clay/redwood
    foodItems: [
      { name: 'Olla de Mbaipy', color: '#5C382A', shape: 'bowl', angleOffset: 0, size: 55, heightOffset: 0 },
      { name: 'Mazorca', color: '#DFB15B', shape: 'square', angleOffset: 1.8, size: 18, heightOffset: 0 },
      { name: 'Queso Criollo', color: '#F1E3D3', shape: 'square', angleOffset: 3.8, size: 16, heightOffset: 0 },
      { name: 'Pollo de Campo', color: '#E6C1B1', shape: 'circle', angleOffset: 5.4, size: 14, heightOffset: 0 }
    ]
  },
  {
    id: 'r3',
    name: 'Guiso de Arroz Riachuelero',
    category: 'Guisos y Comidas Populares',
    difficulty: 'Fácil',
    duration: '50 min',
    description: 'Arroz largo fino del litoral sofrito con cebolla, morrón y dados de carne, cocido lentamente en olla de hierro fundido a la leña.',
    history: 'El guiso de arroz es el plato representativo de Riachuelo, cocinado tradicionalmente en ollas de hierro a la leña. Su cocción lenta concentra los sabores de las carnes y condimentos locales, utilizando el arroz largo fino producido en los campos arroceros de la provincia.',
    ingredients: [
      '300g de arroz largo fino correntino',
      '500g de carne de res (paleta o aguja)',
      '1 cebolla y 1 morrón picados',
      '2 dientes de ajo picados',
      '1 cucharada de pimentón dulce correntino',
      'Caldo de carne caliente (1 litro)'
    ],
    video: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=60',
    audioTrackId: 'p3', // El Gofio y el Chicharrón Trenzado
    platterColor: '#3E3A33', // Iron dark wood
    foodItems: [
      { name: 'Pot de Hierro', color: '#1A1817', shape: 'pot', angleOffset: 0, size: 54, heightOffset: 0 },
      { name: 'Tomate y Morrón', color: '#D13C3C', shape: 'circle', angleOffset: 1.5, size: 15, heightOffset: 0 },
      { name: 'Arroz Cosecha', color: '#F4EAD4', shape: 'square', angleOffset: 3.5, size: 14, heightOffset: 0 },
      { name: 'Trozo de Carne', color: '#7E301F', shape: 'circle', angleOffset: 5.1, size: 16, heightOffset: 0 }
    ]
  },
  {
    id: 'r4',
    name: 'Dulce de Mamón en Almíbar',
    category: 'Frutas y Productos Naturales',
    difficulty: 'Media',
    duration: '120 min',
    description: 'Gajos dorados semi-translucidos de mamón verde cocidos a fuego mínimo en almíbar espeso con clavos de olor y vainilla.',
    history: 'El mamón crece de forma silvestre en los patios correntinos. El dulce de mamón en almíbar es la conserva insignia del litoral argentino, transmitida de generación en generación como forma de preservar los frutos dorados del verano para todo el año.',
    ingredients: [
      '1 kg de mamones verdes o semi maduros',
      '800g de azúcar blanca',
      '1 cucharadita de bicarbonato de sodio',
      '1 litro de agua',
      '3 clavos de olor',
      'Esencia de vainilla'
    ],
    video: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=60',
    audioTrackId: 'p4', // Pescados del Paraná
    platterColor: '#DFB15B', // Light gold wood
    foodItems: [
      { name: 'Copa de Cristal', color: 'rgba(230, 245, 245, 0.45)', shape: 'bowl', angleOffset: 0, size: 48, heightOffset: 0 },
      { name: 'Canela en Rama', color: '#825638', shape: 'cinnamon', angleOffset: 1.6, size: 30, heightOffset: 0 },
      { name: 'Estrella Anís', color: '#542E16', shape: 'star', angleOffset: 3.6, size: 14, heightOffset: 0 },
      { name: 'Mamón Verde', color: '#2E6F40', shape: 'circle', angleOffset: 5.2, size: 18, heightOffset: 0 }
    ]
  }
];

interface Particle {
  id: number;
  left: number;
  top: number;
  opacity: number;
  scale: number;
}

export const SaboresARScreen: React.FC = () => {
  const [arState, setArState] = useState<'scanning' | 'ar_view'>('scanning');
  const [scanStatus, setScanStatus] = useState<'idle' | 'focusing' | 'detected'>('idle');
  const [activeItem, setActiveItem] = useState<ARItem | null>(null);
  
  // Camera permission & stream state (Web standard getUserMedia)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<any>(null);

  // 3D Dish drag-to-rotate state
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const touchStartX = useRef<number>(0);
  const startAngle = useRef<number>(0);

  // Animated visual effects
  const [scanLineAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [flashAnim] = useState(() => new Animated.Value(0));

  // Particle engine state (rising steam bubbles)
  const [particles, setParticles] = useState<Particle[]>([]);

  // Local recipe checked ingredients state
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);

  // Collapsible media states
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Global Context audio controller
  const { playAudio, currentAudio, isPlaying, colors, isDarkMode } = useGlobalState();

  // Web camera activation standard API
  const startCamera = async () => {
    if (Platform.OS === 'web' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err: any) => console.log('Video auto-play blocked/error:', err));
        }
        setHasCameraPermission(true);
      } catch (err) {
        console.warn('Camera access error:', err);
        setHasCameraPermission(false);
      }
    } else {
      setHasCameraPermission(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Scanning Sweep line and pulse animations
  useEffect(() => {
    if (arState === 'scanning') {
      // Loop sweep scan line
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: Platform.OS !== 'web',
          })
        ])
      ).start();

      // Loop grid pulsing ring
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          })
        ])
      ).start();
      
      setTimeout(() => {
        startCamera();
      }, 0);
    } else {
      setTimeout(() => {
        stopCamera();
      }, 0);
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arState]);

  // Rising steam particle engine loop
  useEffect(() => {
    if (arState !== 'ar_view') {
      return;
    }

    const interval = setInterval(() => {
      setParticles(prev => {
        // Move active particles up and fade them
        const active = prev
          .map(p => ({
            ...p,
            top: p.top - 2.5,
            opacity: p.top < -30 ? p.opacity - 0.08 : p.opacity,
          }))
          .filter(p => p.opacity > 0 && p.top > -95);

        // Spawn a new particle from center with slight horizontal offset
        return [
          ...active,
          {
            id: Math.random(),
            left: (Math.random() - 0.5) * 50,
            top: 0,
            opacity: 0.6,
            scale: 0.8 + Math.random() * 0.7,
          }
        ];
      });
    }, 150);

    return () => {
      clearInterval(interval);
      setParticles([]);
    };
  }, [arState]);

  // Handle Drag to Rotate
  const handleTouchStart = (e: any) => {
    const pageX = e.nativeEvent.pageX || (e.nativeEvent.touches && e.nativeEvent.touches[0].pageX) || 0;
    touchStartX.current = pageX;
    startAngle.current = rotationAngle;
  };

  const handleTouchMove = (e: any) => {
    const pageX = e.nativeEvent.pageX || (e.nativeEvent.touches && e.nativeEvent.touches[0].pageX) || 0;
    const deltaX = pageX - touchStartX.current;
    
    // Drag mapping: 1 pixel = 0.8 degrees of rotation
    const newAngle = startAngle.current + deltaX * 0.8;
    setRotationAngle(newAngle);
  };

  // Simulated QR recognition sequence
  const triggerSimulatedScan = (item: ARItem) => {
    if (scanStatus !== 'idle') return;

    setScanStatus('focusing');
    
    // Simulate auto-focus lock
    setTimeout(() => {
      setScanStatus('detected');
      setActiveItem(item);
      setCheckedIngredients([]);

      // Play camera shutter flash overlay
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        })
      ]).start(() => {
        // Transition to AR viewport
        setArState('ar_view');
        setScanStatus('idle');
      });
    }, 1500);
  };

  // Play audio track narrator in global state
  const handlePlayNarrator = () => {
    if (!activeItem) return;
    const track = MULTIMEDIA_ITEMS.find(t => t.id === activeItem.audioTrackId);
    if (track) {
      playAudio(track);
    }
  };

  // Toggle checklist ingredient
  const toggleIngredient = (ing: string) => {
    setCheckedIngredients(prev =>
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  // Trig projection formulas for rotating 3D food items
  const getProjectedCoords = (offset: number) => {
    const radius = 64; // distance from platter center
    const angleRad = ((rotationAngle + (offset * 180 / Math.PI)) * Math.PI) / 180;

    const x = Math.cos(angleRad) * radius;
    // Squashed Y projection for a tilted perspective (55 degrees tilt)
    const y = Math.sin(angleRad) * radius * Math.cos(55 * Math.PI / 180);

    const zIndex = Math.round((Math.sin(angleRad) + 1) * 100);
    const scale = 0.8 + (Math.sin(angleRad) + 1) * 0.22; // shrink items in back

    return { x, y, zIndex, scale };
  };

  const VideoTag = Platform.OS === 'web' ? 'video' as any : View;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Sabores AR" 
        subtitle={arState === 'scanning' ? 'Enfocá códigos QR de platos correntinos' : 'Girá y descubrí la receta interactiva'} 
        showDivider={true}
      />

      <Animated.View 
        style={[
          styles.shutterFlash, 
          { 
            opacity: flashAnim,
            zIndex: flashAnim.interpolate({
              inputRange: [0, 0.1, 1],
              outputRange: [-1, 9999, 9999]
            })
          }
        ]} 
      />

      {arState === 'scanning' ? (
        /* SCANNING INTERFACE MODE */
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.scanWrapper}>
            <View style={styles.viewportOuter}>
              {/* Camera Area wrapper */}
              <View style={[styles.viewport, { borderColor: colors.border }]}>
                {Platform.OS === 'web' && hasCameraPermission ? (
                  <VideoTag
                    ref={videoRef}
                    style={styles.realCameraStream}
                    autoPlay
                    playsInline
                    muted
                  />
                ) : (
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&auto=format&fit=crop&q=60' }} 
                    style={styles.fallbackCamBg} 
                  />
                )}

                {/* Grid Scanning Overlay */}
                <View style={styles.darkenOverlay} />
                
                <Animated.View 
                  style={[
                    styles.scanReticle,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  <View style={[styles.corner, styles.topLeft, { borderColor: colors.accent }]} />
                  <View style={[styles.corner, styles.topRight, { borderColor: colors.accent }]} />
                  <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.accent }]} />
                  <View style={[styles.corner, styles.bottomRight, { borderColor: colors.accent }]} />

                  {/* Pulsing Scan sweep line */}
                  <Animated.View 
                    style={[
                      styles.scanLaser,
                      {
                        backgroundColor: colors.accent,
                        shadowColor: colors.accent,
                        top: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['4%', '94%']
                        })
                      }
                    ]}
                  />

                  {scanStatus === 'focusing' && (
                    <View style={styles.focusingState}>
                      <Ionicons name="scan-circle" size={48} color={colors.accent} />
                      <Text style={[styles.focusText, { color: colors.accent }]}>ENFOCANDO...</Text>
                    </View>
                  )}

                  {scanStatus === 'detected' && (
                    <View style={styles.focusingState}>
                      <Ionicons name="checkmark-circle" size={48} color={colors.correct} />
                      <Text style={[styles.focusText, { color: colors.correct }]}>¡DETECTADO!</Text>
                    </View>
                  )}
                </Animated.View>

                {/* Bottom guidance bar */}
                <View style={styles.cameraBanner}>
                  <Ionicons name="qr-code-outline" size={16} color={Theme.colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.cameraBannerText}>
                    {scanStatus === 'idle' ? 'Alineá el QR del plato en el centro' : 'Analizando código...'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Simulated actions if permission denied or for testing purposes */}
            <Card style={[styles.simulatorCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="md">
              <View style={styles.simCardHeader}>
                <Ionicons name="construct" size={18} color={colors.primary} />
                <Text style={[styles.simCardTitle, { color: colors.text }]}>Simulador de Códigos QR</Text>
              </View>
              <Text style={[styles.simCardDesc, { color: colors.textSecondary }]}>
                ¿No tenés el libro del recetario impreso para escanear, chamigo? Tocá una de las opciones para simular la lectura de su código QR:
              </Text>

              <View style={styles.simGrid}>
                {AR_ITEMS.map((item) => (
                  <Pressable
                    key={item.id}
                    disabled={scanStatus !== 'idle'}
                    onPress={() => triggerSimulatedScan(item)}
                    style={[
                      styles.simBtn,
                      {
                        backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.15)' : 'rgba(200, 92, 56, 0.04)',
                        borderColor: isDarkMode ? 'rgba(200, 92, 56, 0.3)' : 'rgba(200, 92, 56, 0.12)'
                      },
                      scanStatus !== 'idle' && { opacity: 0.6 }
                    ]}
                  >
                    <Ionicons name="play-forward" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.simBtnText, { color: colors.primary }]} numberOfLines={1}>
                      {item.name.replace(' (Polenta Guaraní)', '')}
                    </Text>
                  </Pressable>
                ))}
              </View>
              
              {Platform.OS === 'web' && !hasCameraPermission && (
                <Pressable style={[styles.cameraRequestBtn, { backgroundColor: colors.secondary }]} onPress={startCamera}>
                  <Ionicons name="camera" size={18} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.cameraRequestBtnText}>Activar Cámara de Dispositivo</Text>
                </Pressable>
              )}
            </Card>
          </View>
        </ScrollView>
      ) : (
        /* AR IMMERSIVE VIEWPORT MODE */
        <View style={styles.arViewportContainer}>
          {/* Main 3D Platter Box */}
          <View 
            style={styles.ar3DBox}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {/* Dark wood table background */}
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800' }} 
              style={styles.woodTableBg} 
            />
            <View style={styles.darkTableOverlay} />

            {/* Platter disk wrapper with 3D tilts */}
            <View style={styles.platter3DWrapper}>
              <View 
                style={[
                  styles.platterDisk, 
                  { 
                    backgroundColor: activeItem?.platterColor || '#D7C7A7',
                    transform: [
                      { perspective: 800 },
                      { rotateX: '55deg' },
                      { rotateZ: `${rotationAngle}deg` }
                    ] as any
                  }
                ]}
              >
                {/* Platter dark rings and inner rim */}
                <View style={styles.platterRimOuter} />
                <View style={styles.platterRimInner} />
              </View>

              {/* Steam Particles Emitter (Always float straight up, outside rotateZ) */}
              <View style={styles.steamEmitter}>
                {particles.map(p => (
                  <View
                    key={p.id}
                    style={[
                      styles.steamParticle,
                      {
                        left: p.left,
                        top: p.top,
                        opacity: p.opacity,
                        transform: [{ scale: p.scale }]
                      }
                    ]}
                  />
                ))}
              </View>

              {/* Tilted Projected Food items (Calculated in trig-ortho relative coords) */}
              {activeItem?.foodItems.map((food, i) => {
                const proj = getProjectedCoords(food.angleOffset);
                return (
                  <View
                    key={i}
                    style={[
                      styles.foodProjectionItem,
                      {
                        left: proj.x,
                        top: proj.y + food.heightOffset,
                        zIndex: proj.zIndex,
                      }
                    ]}
                  >
                    {/* Render different shape styles based on food items */}
                    {food.shape === 'bowl' && (
                      <View style={[styles.shapeBowl, { backgroundColor: food.color, transform: [{ scale: proj.scale }] }]}>
                        {/* Inner soup / cream content */}
                        <View style={styles.bowlCreamContent}>
                          <View style={styles.bowlGreenGarnish} />
                        </View>
                      </View>
                    )}
                    {food.shape === 'pot' && (
                      <View style={[styles.shapePot, { backgroundColor: food.color, transform: [{ scale: proj.scale }] }]}>
                        <View style={styles.potStewContent}>
                          <View style={styles.potIronHandlesLeft} />
                          <View style={styles.potIronHandlesRight} />
                        </View>
                      </View>
                    )}
                    {food.shape === 'circle' && (
                      <View 
                        style={[
                          styles.shapeCircle, 
                          { 
                            backgroundColor: food.color, 
                            width: food.size, 
                            height: food.size, 
                            borderRadius: food.size / 2,
                            transform: [{ scale: proj.scale }]
                          }
                        ]} 
                      />
                    )}
                    {food.shape === 'square' && (
                      <View 
                        style={[
                          styles.shapeSquare, 
                          { 
                            backgroundColor: food.color, 
                            width: food.size, 
                            height: food.size,
                            transform: [{ scale: proj.scale }, { rotate: '25deg' }]
                          }
                        ]} 
                      />
                    )}
                    {food.shape === 'cinnamon' && (
                      <View 
                        style={[
                          styles.shapeCinnamon, 
                          { 
                            backgroundColor: food.color, 
                            width: food.size, 
                            height: 6,
                            transform: [{ scale: proj.scale }, { rotate: '-35deg' }]
                          }
                        ]} 
                      />
                    )}
                    {food.shape === 'star' && (
                      <View style={[styles.shapeStar, { transform: [{ scale: proj.scale }] }]}>
                        <Ionicons name="star" size={food.size} color={food.color} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Interaction Instructions Overlay */}
            <View style={styles.instructOverlay}>
              <Ionicons name="move" size={16} color="rgba(255,255,255,0.7)" style={{ marginRight: 4 }} />
              <Text style={styles.instructText}>Arrastrá para girar el plato 360°</Text>
            </View>

            {/* Immersive HUD controls */}
            <View style={styles.hudHeader}>
              <Pressable 
                onPress={() => setArState('scanning')}
                style={styles.hudBackBtn}
              >
                <Ionicons name="arrow-back" size={20} color={colors.white} />
                <Text style={styles.hudBackBtnText}>Volver</Text>
              </Pressable>
              
              <View style={styles.hudActiveIndicator}>
                <Text style={[styles.hudIndicatorText, { color: colors.accent }]}>SABORES AR VIRTUAL</Text>
              </View>
            </View>

            {/* Floating media action HUD buttons */}
            <View style={styles.floatingHudControls}>
              <Pressable 
                onPress={handlePlayNarrator}
                style={[
                  styles.hudFloatingBtn, 
                  isPlaying && currentAudio?.id === activeItem?.audioTrackId && [styles.hudFloatingBtnPlaying, { borderColor: colors.primary, backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.4)' : 'rgba(200, 92, 56, 0.35)' }]
                ]}
              >
                <Ionicons name="volume-medium" size={20} color={colors.white} />
                <Text style={styles.hudFloatingBtnText}>Audio Relato</Text>
              </Pressable>

              <Pressable 
                onPress={() => setShowVideoModal(true)}
                style={styles.hudFloatingBtn}
              >
                <Ionicons name="play-circle" size={20} color={colors.white} />
                <Text style={styles.hudFloatingBtnText}>Ver Video</Text>
              </Pressable>

              <Pressable 
                onPress={() => setShowHistoryModal(true)}
                style={styles.hudFloatingBtn}
              >
                <Ionicons name="book" size={20} color={colors.white} />
                <Text style={styles.hudFloatingBtnText}>Historia</Text>
              </Pressable>
            </View>
          </View>

          {/* Floating Glassmorphic Recipe Card */}
          {activeItem && (
            <Card style={[styles.floatingRecipeOverlay, { backgroundColor: isDarkMode ? 'rgba(41, 37, 36, 0.95)' : 'rgba(255, 253, 249, 0.95)', borderColor: colors.border }]} elevation="lg" border={true}>
              <View style={styles.recipeOverlayHeader}>
                <View>
                  <Text style={[styles.overlayCategory, { color: colors.primary }]}>{activeItem.category}</Text>
                  <Text style={[styles.overlayTitle, { color: colors.text }]}>{activeItem.name}</Text>
                </View>
                <View style={styles.badgesCol}>
                  <View style={[styles.badge, styles.diffBadge, { backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.2)' : 'rgba(46, 111, 64, 0.08)' }]}>
                    <Text style={[styles.badgeLabel, { color: colors.text }]}>{activeItem.difficulty}</Text>
                  </View>
                  <View style={[styles.badge, styles.timeBadge, { backgroundColor: isDarkMode ? 'rgba(249, 115, 22, 0.2)' : 'rgba(200, 92, 56, 0.08)' }]}>
                    <Text style={[styles.badgeLabel, { color: colors.text }]}>{activeItem.duration}</Text>
                  </View>
                </View>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.overlayScrollBody}
              >
                <Text style={[styles.overlayDesc, { color: colors.textSecondary }]}>{activeItem.description}</Text>
                
                {/* Collapsible/Floating ingredients check list */}
                <View style={styles.checklistSection}>
                  <Text style={[styles.checklistSecTitle, { color: colors.text }]}>Ingredientes en tu mesa ({checkedIngredients.length}/{activeItem.ingredients.length})</Text>
                  {activeItem.ingredients.map((ing, i) => {
                    const isChecked = checkedIngredients.includes(ing);
                    return (
                      <Pressable
                        key={i}
                        onPress={() => toggleIngredient(ing)}
                        style={[styles.overlayCheckRow, { borderBottomColor: colors.border }, isChecked && [styles.overlayCheckRowActive, { backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(46, 111, 64, 0.02)' }]]}
                      >
                        <Ionicons 
                          name={isChecked ? "checkbox" : "square-outline"} 
                          size={16} 
                          color={isChecked ? colors.secondary : colors.textSecondary} 
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.overlayCheckText, { color: colors.textSecondary }, isChecked && [styles.overlayCheckTextActive, { color: colors.secondary }]]}>
                          {ing}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </Card>
          )}
        </View>
      )}

      {/* Video Sub-Modal Overlay */}
      {activeItem && showVideoModal && (
        <Modal
          visible={showVideoModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowVideoModal(false)}
        >
          <View style={styles.hudModalOverlay}>
            <View style={styles.hudModalContent}>
              <View style={styles.hudModalHeader}>
                <Text style={styles.hudModalTitle}>Preparación: {activeItem.name}</Text>
                <Pressable onPress={() => setShowVideoModal(false)} style={styles.hudModalCloseBtn}>
                  <Ionicons name="close" size={24} color={colors.white} />
                </Pressable>
              </View>

              <Image source={{ uri: activeItem.video }} style={styles.hudVideoMock} />
              
              <View style={styles.hudVideoPlayerControls}>
                <Ionicons name="play" size={24} color={colors.white} />
                <View style={styles.hudVideoProgressOuter}>
                  <View style={[styles.hudVideoProgressInner, { backgroundColor: colors.primary }]} />
                </View>
                <Text style={styles.hudVideoTimeText}>0:45 / 2:30</Text>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* History Sub-Modal Overlay */}
      {activeItem && showHistoryModal && (
        <Modal
          visible={showHistoryModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowHistoryModal(false)}
        >
          <View style={styles.hudModalOverlay}>
            <View style={[styles.hudModalContent, styles.hudModalContentHistory, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.hudModalHeader}>
                <Text style={[styles.hudModalTitle, { color: colors.text }]}>Historia del Plato</Text>
                <Pressable onPress={() => setShowHistoryModal(false)} style={styles.hudModalCloseBtn}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.hudHistoryScroll}>
                <Text style={[styles.hudHistoryMainTitle, { color: colors.text }]}>{activeItem.name}</Text>
                <Text style={[styles.hudHistoryCategory, { color: colors.primary }]}>{activeItem.category} • Herencia Histórica</Text>
                <View style={[styles.hudHistoryDivider, { backgroundColor: colors.border }]} />
                <Text style={[styles.hudHistoryText, { color: colors.textSecondary }]}>{activeItem.history}</Text>
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
  shutterFlash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Theme.colors.white,
  },
  scrollContainer: {
    paddingBottom: 110,
  },
  scanWrapper: {
    padding: Theme.spacing.md,
  },
  viewportOuter: {
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  viewport: {
    width: '100%',
    maxWidth: 480,
    height: 340,
    borderRadius: Theme.roundness.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E1B18',
    ...Theme.shadows.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
  },
  realCameraStream: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  fallbackCamBg: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  darkenOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanReticle: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: '60%',
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Theme.colors.accent,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: Theme.roundness.sm,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: Theme.roundness.sm,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: Theme.roundness.sm,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: Theme.roundness.sm,
  },
  scanLaser: {
    position: 'absolute',
    left: '4%',
    right: '4%',
    height: 3,
    backgroundColor: Theme.colors.accent,
    borderRadius: 2,
    shadowColor: Theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  focusingState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Theme.spacing.sm,
    borderRadius: Theme.roundness.md,
  },
  focusText: {
    color: Theme.colors.accent,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    marginTop: 6,
    letterSpacing: 1,
  },
  cameraBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBannerText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
  },
  simulatorCard: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  simCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  simCardTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginLeft: Theme.spacing.sm - 2,
  },
  simCardDesc: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: Theme.spacing.md,
  },
  simGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  simBtn: {
    width: '48%',
    backgroundColor: 'rgba(200, 92, 56, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(200, 92, 56, 0.12)',
    paddingVertical: Theme.spacing.sm + 2,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.roundness.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
  },
  simBtnText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
  },
  cameraRequestBtn: {
    backgroundColor: Theme.colors.secondary,
    paddingVertical: Theme.spacing.sm + 2,
    borderRadius: Theme.roundness.round,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: Theme.spacing.sm,
    ...Theme.shadows.sm,
  },
  cameraRequestBtnText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  // AR Viewport Styles
  arViewportContainer: {
    flex: 1,
    position: 'relative',
  },
  ar3DBox: {
    width: '100%',
    height: 330,
    backgroundColor: '#0F0E0D',
    position: 'relative',
    overflow: 'hidden',
  },
  woodTableBg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.45,
  },
  darkTableOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 14, 13, 0.4)',
  },
  platter3DWrapper: {
    position: 'absolute',
    top: '32%',
    left: '50%',
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platterDisk: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'relative',
    borderWidth: 6,
    borderColor: '#4E3E34',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
  },
  platterRimOuter: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  platterRimInner: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    bottom: 18,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  // Trig food items positioning relative to central platter wrapper
  foodProjectionItem: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }], // center items
  },
  shapeBowl: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#7A4839',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  bowlCreamContent: {
    width: '84%',
    height: '84%',
    borderRadius: 20,
    backgroundColor: '#DFB15B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bowlGreenGarnish: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E6F40',
  },
  shapePot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: '#3E3A33',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  potStewContent: {
    width: '85%',
    height: '85%',
    borderRadius: 20,
    backgroundColor: '#C85C38',
    position: 'relative',
  },
  potIronHandlesLeft: {
    position: 'absolute',
    left: -6,
    top: '40%',
    width: 6,
    height: 8,
    backgroundColor: '#3E3A33',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  potIronHandlesRight: {
    position: 'absolute',
    right: -6,
    top: '40%',
    width: 6,
    height: 8,
    backgroundColor: '#3E3A33',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  shapeCircle: {
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 2,
  },
  shapeSquare: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  shapeCinnamon: {
    borderRadius: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 2.5,
  },
  shapeStar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2.5,
  },
  // Particle rising steam bubbles
  steamEmitter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999, // overlay above platter
  },
  steamParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(240, 240, 240, 0.4)',
    shadowColor: '#FFFFFF',
    shadowRadius: 4,
    shadowOpacity: 0.3,
  },
  instructOverlay: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Theme.spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: Theme.roundness.round,
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10.5,
    fontWeight: Theme.typography.weights.semibold,
  },
  hudHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 14, 13, 0.75)',
    paddingVertical: Theme.spacing.xs + 2,
    paddingHorizontal: Theme.spacing.sm + 2,
    borderRadius: Theme.roundness.round,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  hudBackBtnText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: 4,
  },
  hudActiveIndicator: {
    backgroundColor: 'rgba(223, 177, 91, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(223, 177, 91, 0.4)',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.roundness.sm,
  },
  hudIndicatorText: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.accent,
    letterSpacing: 1,
  },
  floatingHudControls: {
    position: 'absolute',
    right: 12,
    top: '25%',
    alignItems: 'center',
  },
  hudFloatingBtn: {
    backgroundColor: 'rgba(15, 14, 13, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    width: 76,
    height: 48,
    borderRadius: Theme.roundness.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
    ...Theme.shadows.sm,
  },
  hudFloatingBtnPlaying: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(200, 92, 56, 0.35)',
  },
  hudFloatingBtnText: {
    color: Theme.colors.white,
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
    marginTop: 3,
  },
  // Floating Glassmorphic Recipe Card
  floatingRecipeOverlay: {
    flex: 1,
    marginHorizontal: Theme.spacing.md,
    marginVertical: Theme.spacing.md,
    backgroundColor: 'rgba(255, 253, 249, 0.95)',
    borderRadius: Theme.roundness.xl,
    padding: Theme.spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 226, 213, 0.9)',
    ...Theme.shadows.lg,
    maxHeight: 280,
  },
  recipeOverlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: Theme.spacing.sm - 2,
    marginBottom: Theme.spacing.sm - 2,
  },
  overlayCategory: {
    fontSize: 10,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
  },
  overlayTitle: {
    fontSize: Theme.typography.sizes.md + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  badgesCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.roundness.sm,
    marginLeft: 4,
  },
  diffBadge: {
    backgroundColor: 'rgba(46, 111, 64, 0.08)',
  },
  timeBadge: {
    backgroundColor: 'rgba(200, 92, 56, 0.08)',
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  overlayScrollBody: {
    paddingBottom: Theme.spacing.md,
  },
  overlayDesc: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: Theme.spacing.md,
  },
  checklistSection: {
    marginTop: Theme.spacing.xs,
  },
  checklistSecTitle: {
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm - 2,
  },
  overlayCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(232, 226, 213, 0.5)',
  },
  overlayCheckRowActive: {
    backgroundColor: 'rgba(46, 111, 64, 0.02)',
  },
  overlayCheckText: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
  },
  overlayCheckTextActive: {
    color: Theme.colors.secondary,
    fontWeight: Theme.typography.weights.semibold,
  },
  // HUD Modal Styles
  hudModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 14, 13, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.md,
  },
  hudModalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E1B18',
    borderRadius: Theme.roundness.lg,
    padding: Theme.spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hudModalContentHistory: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    maxHeight: '60%',
  },
  hudModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  hudModalTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.white,
  },
  hudModalCloseBtn: {
    padding: 2,
  },
  hudVideoMock: {
    width: '100%',
    height: 180,
    borderRadius: Theme.roundness.md,
    resizeMode: 'cover',
  },
  hudVideoPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xs,
  },
  hudVideoProgressOuter: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginHorizontal: Theme.spacing.md,
    overflow: 'hidden',
  },
  hudVideoProgressInner: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    width: '30%',
  },
  hudVideoTimeText: {
    color: Theme.colors.textLight,
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  hudHistoryScroll: {
    paddingVertical: Theme.spacing.xs,
  },
  hudHistoryMainTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  hudHistoryCategory: {
    fontSize: 10,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  hudHistoryDivider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.sm,
  },
  hudHistoryText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
  },
});

export default SaboresARScreen;
