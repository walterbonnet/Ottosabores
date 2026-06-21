import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import { useGlobalState } from '../services/GlobalStateContext';
import { RECIPES } from '../services/mockData';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: '¿Qué es Sabores 4.0?',
    answer: 'Es una iniciativa tecnológica y cultural destinada a rescatar, digitalizar y difundir el patrimonio gastronómico ancestral de la provincia de Corrientes, combinando saberes tradicionales con plataformas digitales de última generación.'
  },
  {
    question: '¿De dónde provienen las recetas?',
    answer: 'Las recetas son recolectadas a través de un trabajo de campo colaborativo con cocineras comunitarias, abuelas de pueblos del interior, e historiadores locales que custodian el legado jesuítico-guaraní.'
  },
  {
    question: '¿Puedo proponer una receta familiar?',
    answer: '¡Por supuesto! Podés escribirnos usando el formulario de contacto para enviar los detalles de tu receta. Nuestro equipo la revisará y la incorporará en próximas actualizaciones de la plataforma.'
  },
  {
    question: '¿La app funciona sin conexión a internet?',
    answer: 'Sí. Sabores 4.0 está pensada para ser accesible en cualquier rincón litoraleño, por lo que toda la base de datos de recetas, mapas y trivia está disponible sin conexión.'
  }
];

export const PerfilScreen: React.FC = () => {
  const [profileTab, setProfileTab] = useState<'progreso' | 'actividad' | 'proyecto'>('progreso');
  const [activeProjTab, setActiveProjTab] = useState<'objetivos' | 'metodologia' | 'impacto'>('objetivos');
  const [expandedFaqIdx, setExpandedFaqIdx] = useState<number | null>(null);

  // Form states (Institutional)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formError, setFormError] = useState('');

  // Global State hooks
  const {
    favorites,
    recipeProgress,
    recentlyViewed,
    triviaHighScore,
    triviaHistory,
    viewedHotspots,
    playedAudios,
    readCuriosities,
    colors,
    isDarkMode,
  } = useGlobalState();

  // Dynamic calculations
  const completedRecipesCount = RECIPES.reduce((acc, recipe) => {
    const prog = recipeProgress[recipe.id];
    if (prog && prog.completedSteps.length === recipe.preparación.length && recipe.preparación.length > 0) {
      return acc + 1;
    }
    return acc;
  }, 0);

  // Route Progress
  const routeRecipes = {
    carnes: ['r5', 'r8', 'r9'],
    guarani: ['r1', 'r2', 'r7'],
    naturales: ['r3', 'r4', 'r6']
  };

  const getRouteProgress = (recipeIds: string[]) => {
    let totalProgress = 0;
    recipeIds.forEach(id => {
      const recipe = RECIPES.find(r => r.id === id);
      if (!recipe) return;
      const prog = recipeProgress[id];
      if (prog && recipe.preparación.length > 0) {
        totalProgress += (prog.completedSteps.length / recipe.preparación.length) * 100;
      }
    });
    return Math.round(totalProgress / recipeIds.length);
  };

  const carnesProgress = getRouteProgress(routeRecipes.carnes);
  const guaraniProgress = getRouteProgress(routeRecipes.guarani);
  const naturalesProgress = getRouteProgress(routeRecipes.naturales);

  // Achievements/Badges definitions
  const badges = [
    {
      id: 'badge-first-trivia',
      title: 'Matrero Primerizo',
      desc: 'Completaste tu primera trivia litoraleña.',
      icon: 'trophy' as const,
      color: '#C85C38',
      unlocked: triviaHistory.length > 0,
    },
    {
      id: 'badge-trivia-scholar',
      title: 'Sabio del Almidón',
      desc: 'Lograste un puntaje de 3 o más en la trivia.',
      icon: 'school' as const,
      color: '#9E7A1C',
      unlocked: triviaHighScore >= 3,
    },
    {
      id: 'badge-perfect-trivia',
      title: 'Fuego Sagrado',
      desc: 'Puntaje perfecto (9/9) en la trivia progresiva.',
      icon: 'flame' as const,
      color: '#D13C3C',
      unlocked: triviaHighScore === 9,
    },
    {
      id: 'badge-litoral-chef',
      title: 'Gourmet del Litoral',
      desc: 'Completaste al menos 3 recetas al 100% de preparación.',
      icon: 'restaurant' as const,
      color: '#2E6F40',
      unlocked: completedRecipesCount >= 3,
    },
    {
      id: 'badge-explorer-esteros',
      title: 'Explorador de Esteros',
      desc: 'Abriste los 4 corredores turísticos del mapa interactivo.',
      icon: 'compass' as const,
      color: '#3B7EC8',
      unlocked: viewedHotspots.length === 4,
    },
    {
      id: 'badge-melomano-fogon',
      title: 'Melómano del Fogón',
      desc: 'Escuchaste al menos 3 relatos o podcasts litoraleños.',
      icon: 'musical-notes' as const,
      color: '#A03BC8',
      unlocked: playedAudios.length >= 3,
    },
  ];

  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;

  // Total XP Formula
  const totalXP = (favorites.length * 10) +
                  (completedRecipesCount * 50) +
                  (triviaHighScore * 20) +
                  (unlockedBadgesCount * 100) +
                  (readCuriosities.length * 5);

  const getLevelDetails = (xp: number) => {
    if (xp < 150) {
      return {
        level: 1,
        title: 'Cocinero Novato 🌾',
        minXp: 0,
        maxXp: 150,
        nextTitle: 'Cocinero de Estero 🦎'
      };
    }
    if (xp < 400) {
      return {
        level: 2,
        title: 'Cocinero de Estero 🦎',
        minXp: 150,
        maxXp: 400,
        nextTitle: 'Maestro Asador del Litoral 🔥'
      };
    }
    if (xp < 800) {
      return {
        level: 3,
        title: 'Maestro Asador del Litoral 🔥',
        minXp: 400,
        maxXp: 800,
        nextTitle: 'Embajador del Taragüí 👑'
      };
    }
    return {
      level: 4,
      title: 'Embajador del Taragüí 👑',
      minXp: 800,
      maxXp: 1500, // Top rank milestone
      nextTitle: 'Fogón de Oro'
    };
  };

  const levelInfo = getLevelDetails(totalXP);
  const xpInLevel = totalXP - levelInfo.minXp;
  const xpNeededInLevel = levelInfo.maxXp - levelInfo.minXp;
  const levelProgress = levelInfo.level === 4 ? 1 : Math.max(0, Math.min(1, xpInLevel / xpNeededInLevel));

  // Dynamic Leaderboard Sorting
  const mockLeaderboard = [
    { name: 'Abuela Cata 👵', xp: 680, rankTitle: 'Maestro Asador del Litoral 🔥', isUser: false },
    { name: 'Panchi Quevedo 👨‍🍳', xp: 450, rankTitle: 'Maestro Asador del Litoral 🔥', isUser: false },
    { name: 'Don Sosa 👴', xp: 260, rankTitle: 'Cocinero de Estero 🦎', isUser: false },
    { name: 'Gurí Arrocero 👦', xp: 90, rankTitle: 'Cocinero Novato 🌾', isUser: false },
    { name: 'Cocinerito Correntino 👶', xp: 20, rankTitle: 'Cocinero Novato 🌾', isUser: false },
  ];

  const leaderboardWithUser = [
    ...mockLeaderboard,
    { name: 'Tú (Usuario) 🧑‍🍳', xp: totalXP, rankTitle: levelInfo.title, isUser: true }
  ].sort((a, b) => b.xp - a.xp);

  const toggleFaq = (index: number) => {
    setExpandedFaqIdx(expandedFaqIdx === index ? null : index);
  };

  const handleSendForm = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError('Por favor, completa todos los campos del formulario, chamigo.');
      return;
    }
    
    if (!email.includes('@')) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }

    setFormError('');
    setShowConfirmModal(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setMessage('');
    setShowConfirmModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Perfil Cultural" 
        subtitle="Tu bitácora y logros en la cocina de Corrientes" 
        showDivider={true}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Main Tab Controller */}
        <View style={[styles.profileTabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {(['progreso', 'actividad', 'proyecto'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setProfileTab(tab)}
              style={[
                styles.profileTabBtn,
                profileTab === tab && [styles.profileTabBtnActive, { borderBottomColor: colors.primary }]
              ]}
            >
              <Text style={[styles.profileTabBtnText, { color: colors.textSecondary }, profileTab === tab && [styles.profileTabBtnTextActive, { color: colors.primary }]]}>
                {tab === 'progreso' ? 'Mi Progreso' : tab === 'actividad' ? 'Actividad' : 'El Proyecto'}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* TAB 1: MI PROGRESO */}
          {profileTab === 'progreso' && (
            <View style={styles.tabContent}>
              {/* Level card */}
              <Card style={[styles.levelCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="md" border={true}>
                <View style={styles.avatarRow}>
                  <View style={[styles.avatarCircle, { borderColor: colors.primary, backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.16)' : 'rgba(200, 92, 56, 0.08)' }]}>
                    <Text style={styles.avatarText}>🧑‍🍳</Text>
                  </View>
                  <View style={styles.avatarMeta}>
                    <Text style={[styles.userName, { color: colors.text }]}>Gourmet del Litoral</Text>
                    <Text style={[styles.userTitle, { color: colors.primary }]}>{levelInfo.title}</Text>
                  </View>
                </View>

                <View style={styles.xpProgressRow}>
                  <View style={styles.xpTextRow}>
                    <Text style={[styles.xpLabel, { color: colors.textSecondary }]}>Puntos de Cultura</Text>
                    <Text style={[styles.xpValue, { color: colors.text }]}>{totalXP} / {levelInfo.maxXp} XP</Text>
                  </View>
                  <View style={[styles.xpTrack, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(232, 226, 213, 0.5)' }]}>
                    <View style={[styles.xpBar, { width: `${levelProgress * 100}%`, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={[styles.xpSubtext, { color: colors.textSecondary }]}>
                    {levelInfo.level === 4 ? '¡Felicidades, alcanzaste el rango máximo!' : `Faltan ${levelInfo.maxXp - totalXP} XP para ascender a ${levelInfo.nextTitle}`}
                  </Text>
                </View>
              </Card>

              {/* Exploration Routes Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Rutas de Exploración</Text>
                
                {/* Route 1 */}
                <Card style={[styles.routeCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="none" border={true}>
                  <View style={styles.routeHeader}>
                    <Ionicons name="flame" size={24} color="#C85C38" />
                    <View style={styles.routeMeta}>
                      <Text style={[styles.routeName, { color: colors.text }]}>Ruta: Carnes Tradicionales</Text>
                      <Text style={[styles.routeSub, { color: colors.textSecondary }]}>Cordero lomeño, Dorado a la parrilla, Chicharrón</Text>
                    </View>
                    <Text style={[styles.routePercent, { color: colors.text }]}>{carnesProgress}%</Text>
                  </View>
                  <View style={[styles.routeTrack, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(232, 226, 213, 0.5)' }]}>
                    <View style={[styles.routeBar, { width: `${carnesProgress}%`, backgroundColor: '#C85C38' }]} />
                  </View>
                </Card>

                {/* Route 2 */}
                <Card style={[styles.routeCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="none" border={true}>
                  <View style={styles.routeHeader}>
                    <Ionicons name="leaf" size={24} color="#2E6F40" />
                    <View style={styles.routeMeta}>
                      <Text style={[styles.routeName, { color: colors.text }]}>Ruta: Herencia Guaraní</Text>
                      <Text style={[styles.routeSub, { color: colors.textSecondary }]}>Chipá tradicional, Mbaipy, Sopa correntina</Text>
                    </View>
                    <Text style={[styles.routePercent, { color: colors.text }]}>{guaraniProgress}%</Text>
                  </View>
                  <View style={[styles.routeTrack, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(232, 226, 213, 0.5)' }]}>
                    <View style={[styles.routeBar, { width: `${guaraniProgress}%`, backgroundColor: '#2E6F40' }]} />
                  </View>
                </Card>

                {/* Route 3 */}
                <Card style={[styles.routeCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="none" border={true}>
                  <View style={styles.routeHeader}>
                    <Ionicons name="sunny" size={24} color="#DFB15B" />
                    <View style={styles.routeMeta}>
                      <Text style={[styles.routeName, { color: colors.text }]}>Ruta: Sabores Naturales</Text>
                      <Text style={[styles.routeSub, { color: colors.textSecondary }]}>Mamón en almíbar, Chipá cuerito, Guiso de arroz</Text>
                    </View>
                    <Text style={[styles.routePercent, { color: colors.text }]}>{naturalesProgress}%</Text>
                  </View>
                  <View style={[styles.routeTrack, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(232, 226, 213, 0.5)' }]}>
                    <View style={[styles.routeBar, { width: `${naturalesProgress}%`, backgroundColor: '#DFB15B' }]} />
                  </View>
                </Card>
              </View>

              {/* Achievements Badges grid */}
              <View style={styles.section}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Insignias Culturales ({unlockedBadgesCount}/6)</Text>
                <View style={styles.badgeGrid}>
                  {badges.map((b) => (
                    <Card
                      key={b.id}
                      style={[
                        styles.badgeCell,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        b.unlocked ? styles.badgeCellUnlocked : styles.badgeCellLocked
                      ]}
                      elevation="none"
                      border={true}
                    >
                      <View style={[styles.badgeIconCircle, { backgroundColor: b.unlocked ? `${b.color}15` : (isDarkMode ? '#3E3A33' : '#EBE6DA') }]}>
                        <Ionicons 
                          name={b.icon} 
                          size={24} 
                          color={b.unlocked ? b.color : '#8E8272'} 
                        />
                      </View>
                      <Text style={[styles.badgeCellTitle, { color: b.unlocked ? colors.text : colors.textSecondary }]}>
                        {b.title}
                      </Text>
                      <Text style={[styles.badgeCellDesc, { color: colors.textSecondary }]}>{b.desc}</Text>
                    </Card>
                  ))}
                </View>
              </View>

              {/* Leaderboard */}
              <View style={styles.section}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Ranking de Cocineros del Taragüí</Text>
                <Card style={[styles.leaderboardCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="sm" border={true}>
                  {leaderboardWithUser.map((chef, idx) => {
                    const isUserRow = chef.isUser;
                    return (
                      <View 
                        key={idx} 
                        style={[
                          styles.leaderboardRow,
                          { borderBottomColor: colors.border },
                          isUserRow && [styles.leaderboardRowActive, { backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.12)' : 'rgba(200, 92, 56, 0.04)' }],
                          idx === leaderboardWithUser.length - 1 && { borderBottomWidth: 0 }
                        ]}
                      >
                        <Text style={[styles.leaderboardPosition, { color: isUserRow ? colors.primary : colors.text }]}>
                          {idx + 1}
                        </Text>
                        <View style={styles.leaderboardMeta}>
                          <Text style={[styles.leaderboardName, { color: isUserRow ? colors.primary : colors.text }, isUserRow && { fontWeight: 'bold' }]}>
                            {chef.name}
                          </Text>
                          <Text style={[styles.leaderboardTitle, { color: colors.textSecondary }]}>{chef.rankTitle}</Text>
                        </View>
                        <Text style={[styles.leaderboardXp, { color: isUserRow ? colors.primary : colors.text }, isUserRow && { fontWeight: 'bold' }]}>
                          {chef.xp} XP
                        </Text>
                      </View>
                    );
                  })}
                </Card>
              </View>
            </View>
          )}

          {/* TAB 2: HISTORIAL Y ACTIVIDAD */}
          {profileTab === 'actividad' && (
            <View style={styles.tabContent}>
              {/* Stat breakdown */}
              <View style={[styles.statsOverviewRow, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: Theme.roundness.md }]}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>{favorites.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Favoritas</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>{completedRecipesCount}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cocinadas</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>{triviaHighScore}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Récord Trivia</Text>
                </View>
              </View>

              {/* Viewed Hotspots */}
              <View style={styles.section}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Regiones Exploradas ({viewedHotspots.length}/4)</Text>
                <View style={styles.explorationBadgesRow}>
                  {['zone-1', 'zone-2', 'zone-3', 'zone-4'].map((zoneId) => {
                    const isViewed = viewedHotspots.includes(zoneId);
                    const label = zoneId === 'zone-1' ? 'Gran Corrientes' : zoneId === 'zone-2' ? 'Alto Paraná' : zoneId === 'zone-3' ? 'Eco-Iberá' : 'Costa Uruguay';
                    return (
                      <View 
                        key={zoneId} 
                        style={[
                          styles.explorationBadge,
                          { backgroundColor: isViewed ? (isDarkMode ? 'rgba(200, 92, 56, 0.16)' : 'rgba(200, 92, 56, 0.08)') : (isDarkMode ? '#292524' : '#EBE6DA') },
                          isViewed ? { borderColor: colors.primary, borderWidth: 1 } : { borderColor: colors.border, borderWidth: 1 }
                        ]}
                      >
                        <Ionicons 
                          name="compass" 
                          size={12} 
                          color={isViewed ? colors.primary : '#8E8272'} 
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.explorationBadgeText, { color: isViewed ? colors.primary : '#8E8272' }, isViewed ? styles.explorationBadgeTextActive : null]}>
                          {label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* History of Trivia runs */}
              <View style={styles.section}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Historial de Trivia</Text>
                {triviaHistory.length > 0 ? (
                  triviaHistory.map((run, i) => (
                    <Card key={i} style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="none" border={true}>
                      <View style={styles.historyHeader}>
                        <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
                        <Text style={[styles.historyTitle, { color: colors.text }]}>Intento Trivia #{triviaHistory.length - i}</Text>
                        <Text style={[styles.historyScore, { color: colors.primary }]}>{run.score} / {run.total}</Text>
                      </View>
                      <Text style={[styles.historyMeta, { color: colors.textSecondary }]}>
                        Fecha: {new Date(run.date).toLocaleDateString()} a las {new Date(run.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Card>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="trophy-outline" size={40} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Todavía no jugaste ninguna trivia, chamigo.</Text>
                  </View>
                )}
              </View>

              {/* Recently Viewed activity feed */}
              <View style={styles.section}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Últimas Visitas</Text>
                {recentlyViewed.length > 0 ? (
                  recentlyViewed.map((item, i) => {
                    const isRecipe = item.type === 'recipe';
                    const iconName = isRecipe ? 'restaurant-outline' : 'sparkles-outline';
                    const label = isRecipe ? 'Receta' : 'Fiesta';
                    return (
                      <View key={i} style={[styles.activityRow, { borderBottomColor: colors.border }]}>
                        <View style={[styles.activityIcon, { backgroundColor: colors.surfaceDark }]}>
                          <Ionicons name={iconName} size={18} color={colors.textSecondary} />
                        </View>
                        <View style={styles.activityDetails}>
                          <Text style={[styles.activityLabel, { color: colors.primary }]}>{label}</Text>
                          <Text style={[styles.activityItemName, { color: colors.text }]}>
                            {isRecipe ? RECIPES.find(r => r.id === item.id)?.nombre : 'Detalle de Fiesta'}
                          </Text>
                        </View>
                        <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                          {new Date(item.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <View style={[styles.emptyContainer, styles.emptyActivityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.16)' : 'rgba(200, 92, 56, 0.08)' }]}>
                      <Ionicons name="journal-outline" size={48} color={colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin Actividad Reciente</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay registros de actividad todavía. ¡Comenzá a cocinar, leer curiosidades o jugar trivias!</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TAB 3: EL PROYECTO INSTITUCIONAL */}
          {profileTab === 'proyecto' && (
            <View style={styles.tabContent}>
              {/* Segmented Institutional Selector */}
              <View style={[styles.projTabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                {(['objetivos', 'metodologia', 'impacto'] as const).map((tab) => (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveProjTab(tab)}
                    style={[
                      styles.projTabButton,
                      activeProjTab === tab && [styles.projTabButtonActive, { borderBottomColor: colors.primary }]
                    ]}
                  >
                    <Text style={[styles.projTabButtonText, { color: colors.textSecondary }, activeProjTab === tab && [styles.projTabButtonTextActive, { color: colors.primary }]]}>
                      {tab === 'objetivos' ? 'Objetivos' : tab === 'metodologia' ? 'Metodología' : 'Impacto'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Institutional Content */}
              <View style={styles.section}>
                <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="sm" border={true}>
                  {activeProjTab === 'objetivos' && (
                    <View style={styles.infoTabBlock}>
                      <Text style={[styles.infoTabTitle, { color: colors.primary }]}>Objetivos del Proyecto</Text>
                      <Text style={[styles.infoTabText, { color: colors.text }]}>
                        • **Rescatar y Digitalizar**: Catalogar las recetas familiares del interior provincial para evitar que se pierdan con el paso del tiempo.
                      </Text>
                      <Text style={[styles.infoTabText, { color: colors.text }]}>
                        • **Visibilidad al Productor**: Conectar las economías regionales (cultivos de mandioca, citrus, arroz) con el circuito gastronómico local.
                      </Text>
                      <Text style={[styles.infoTabText, { color: colors.text }]}>
                        • **Promoción Turística**: Ofrecer a los viajeros un mapa de sabores interactivo que enriquezca su paso por Corrientes y los Esteros del Iberá.
                      </Text>
                    </View>
                  )}

                  {activeProjTab === 'metodologia' && (
                    <View style={styles.infoTabBlock}>
                      <Text style={[styles.infoTabTitle, { color: colors.primary }]}>Metodología de Campo</Text>
                      <Text style={[styles.infoTabText, { color: colors.text }]}>
                        Nuestra base de datos es el resultado de un relevamiento etnográfico continuo:
                      </Text>
                      <Text style={[styles.infoTabText, { color: colors.textSecondary }]}>
                        1. **Entrevistas en Predio**: Grabamos audios y tomamos registros fotográficos directamente en las cocinas de leña del interior de la provincia.
                      </Text>
                      <Text style={[styles.infoTabText, { color: colors.textSecondary }]}>
                        2. **Curaduría Histórica**: Historiadores y cocineros contrastan las recetas recopiladas con registros históricos de las reducciones jesuitas.
                      </Text>
                      <Text style={[styles.infoTabText, { color: colors.textSecondary }]}>
                        3. **Validación Nutricional**: Analizamos las propiedades del almidón de mandioca, pescados de río y carne deshidratada (charqui).
                      </Text>
                    </View>
                  )}

                  {activeProjTab === 'impacto' && (
                    <View style={styles.infoTabBlock}>
                      <Text style={[styles.infoTabTitle, { color: colors.primary }]}>Impacto Cultural</Text>
                      <Text style={[styles.infoTabText, { color: colors.text }]}>
                        La comida es lenguaje. El proyecto busca mantener vivos términos y nombres guaraníes que definen la cocina litoral (Mbaipy, Chipá, Chicharrón, Yopará).
                      </Text>
                      <Text style={[styles.infoTabText, { color: colors.textSecondary }]}>
                        Promovemos la declaración de patrimonio de técnicas culinarias singulares como el chipá mbocá en caña tacuara y el asado a dos fuegos en cruz.
                      </Text>
                      <Text style={[styles.infoTabText, { color: colors.textSecondary }]}>
                        Esto fortalece el arraigo de las comunidades locales y genera empleo de valor agregado para cocineros artesanales en toda la provincia.
                      </Text>
                    </View>
                  )}
                </Card>
              </View>

              {/* FAQs Accordion */}
              <View style={styles.section}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Preguntas Frecuentes</Text>
                {FAQS.map((faq, idx) => {
                  const isExpanded = expandedFaqIdx === idx;
                  return (
                    <Card 
                      key={idx}
                      style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      elevation="none"
                      border={true}
                      onPress={() => toggleFaq(idx)}
                    >
                      <View style={styles.faqHeader}>
                        <Text style={[styles.faqQuestion, { color: colors.text }, isExpanded && { color: colors.primary }]}>
                          {faq.question}
                        </Text>
                        <Ionicons 
                          name={isExpanded ? "chevron-up" : "chevron-down"} 
                          size={18} 
                          color={isExpanded ? colors.primary : colors.textSecondary} 
                        />
                      </View>
                      {isExpanded && (
                        <View style={[styles.faqAnswerContainer, { borderTopColor: colors.border }]}>
                          <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
                        </View>
                      )}
                    </Card>
                  );
                })}
              </View>

              {/* Suggestion Form */}
              <View style={styles.section}>
                <Card style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="sm" border={true}>
                  <Text style={[styles.formTitle, { color: colors.text }]}>Sumá tu Receta Familiar</Text>
                  <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                    Envianos un mensaje con tus datos y la historia de tu plato típico. ¡Hagamos crecer este recetario!
                  </Text>

                  {formError.length > 0 && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="warning" size={16} color={colors.primary} />
                      <Text style={styles.errorText}>{formError}</Text>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Tu Nombre</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surfaceDark, color: colors.text, borderColor: colors.border }]}
                      placeholder="Ej: Walter Gómez"
                      placeholderTextColor={colors.textSecondary}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Correo Electrónico</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surfaceDark, color: colors.text, borderColor: colors.border }]}
                      placeholder="Ej: walter@correo.com"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Mensaje o Receta</Text>
                    <TextInput
                      style={[styles.input, styles.textArea, { backgroundColor: colors.surfaceDark, color: colors.text, borderColor: colors.border }]}
                      placeholder="Escribe aquí el nombre del plato, sus ingredientes e historia..."
                      placeholderTextColor={colors.textSecondary}
                      multiline={true}
                      numberOfLines={4}
                      value={message}
                      onChangeText={setMessage}
                    />
                  </View>

                  <Pressable style={[styles.sendButton, { backgroundColor: colors.primary }]} onPress={handleSendForm}>
                    <Ionicons name="mail" size={18} color={colors.white} style={{ marginRight: 6 }} />
                    <Text style={[styles.sendButtonText, { color: colors.white }]}>Enviar Propuesta</Text>
                  </Pressable>
                </Card>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Dialog Overlay */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, maxHeight: 320, width: '85%', alignSelf: 'center', borderRadius: Theme.roundness.lg, padding: Theme.spacing.lg, justifyContent: 'center' }]}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle" size={54} color={colors.secondary} />
            </View>
            <Text style={[styles.modalConfirmTitle, { color: colors.text }]}>¡Propuesta Recibida!</Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Muchas gracias por colaborar, chamigo. Registramos tu propuesta culinaria. Nuestro equipo revisará la información y te contactará pronto.
            </Text>
            <Pressable style={[styles.modalBtn, { backgroundColor: colors.secondary }]} onPress={resetForm}>
              <Text style={styles.modalBtnText}>Aceptar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  profileTabs: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.sm,
  },
  profileTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm + 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  profileTabBtnActive: {
    borderBottomColor: Theme.colors.primary,
  },
  profileTabBtnText: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.semibold,
  },
  profileTabBtnTextActive: {
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.bold,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  tabContent: {
    width: '100%',
  },
  section: {
    paddingHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.md,
  },
  sectionHeaderTitle: {
    fontSize: Theme.typography.sizes.md + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  levelCard: {
    backgroundColor: Theme.colors.white,
    margin: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(200, 92, 56, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  avatarText: {
    fontSize: 28,
  },
  avatarMeta: {
    marginLeft: Theme.spacing.md,
  },
  userName: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  userTitle: {
    fontSize: Theme.typography.sizes.sm - 1,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.primary,
    marginTop: 2,
  },
  xpProgressRow: {
    marginTop: Theme.spacing.md,
  },
  xpTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 11,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  xpValue: {
    fontSize: Theme.typography.sizes.sm - 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.secondary,
  },
  xpTrack: {
    height: 8,
    backgroundColor: Theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBar: {
    height: '100%',
    backgroundColor: Theme.colors.secondary,
    borderRadius: 4,
  },
  xpSubtext: {
    fontSize: 10.5,
    color: Theme.colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  routeCard: {
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.sm + 4,
    marginBottom: Theme.spacing.sm,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeMeta: {
    flex: 1,
    marginLeft: Theme.spacing.sm + 2,
  },
  routeName: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  routeSub: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  routePercent: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginLeft: Theme.spacing.sm,
  },
  routeTrack: {
    height: 4,
    backgroundColor: Theme.colors.border,
    borderRadius: 2,
    marginTop: Theme.spacing.sm,
    overflow: 'hidden',
  },
  routeBar: {
    height: '100%',
    borderRadius: 2,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCell: {
    width: '48%',
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md - 2,
    marginBottom: Theme.spacing.md,
    alignItems: 'center',
  },
  badgeCellUnlocked: {
    opacity: 1,
  },
  badgeCellLocked: {
    opacity: 0.45,
    backgroundColor: '#F3EFE9',
  },
  badgeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xs + 2,
  },
  badgeCellTitle: {
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    textAlign: 'center',
  },
  badgeTextLocked: {
    color: '#8E8272',
  },
  badgeCellDesc: {
    fontSize: 9.5,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 12,
  },
  leaderboardCard: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.roundness.lg,
    padding: 0,
    overflow: 'hidden',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm + 2,
    paddingHorizontal: Theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.border,
  },
  leaderboardRowActive: {
    backgroundColor: 'rgba(200, 92, 56, 0.06)',
  },
  leaderboardPosition: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.textSecondary,
    width: 24,
    textAlign: 'center',
  },
  leaderboardMeta: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
  },
  leaderboardName: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text,
  },
  leaderboardTitle: {
    fontSize: 9.5,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  leaderboardXp: {
    fontSize: Theme.typography.sizes.sm - 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  statsOverviewRow: {
    flexDirection: 'row',
    marginHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.md,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.roundness.md,
    alignItems: 'center',
    paddingVertical: Theme.spacing.md - 2,
    marginHorizontal: 4,
    ...Theme.shadows.sm,
  },
  statNumber: {
    fontSize: Theme.typography.sizes.lg + 2,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
  },
  statLabel: {
    fontSize: 9.5,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
    fontWeight: Theme.typography.weights.medium,
  },
  explorationBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Theme.spacing.xs,
  },
  explorationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: Theme.roundness.round,
    marginRight: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
  },
  explorationBadgeActive: {
    backgroundColor: 'rgba(200, 92, 56, 0.05)',
    borderColor: 'rgba(200, 92, 56, 0.25)',
  },
  explorationBadgeInactive: {
    backgroundColor: '#F3EFE9',
    borderColor: Theme.colors.border,
    opacity: 0.5,
  },
  explorationBadgeText: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.medium,
  },
  explorationBadgeTextActive: {
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.bold,
  },
  historyCard: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md - 2,
    marginBottom: Theme.spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTitle: {
    flex: 1,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginLeft: 6,
  },
  historyScore: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.secondary,
  },
  historyMeta: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    marginTop: 4,
    marginLeft: 26,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    paddingVertical: Theme.spacing.sm + 2,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.sm,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EFE9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  activityDetails: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 8.5,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  activityItemName: {
    fontSize: Theme.typography.sizes.sm - 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginTop: 1,
  },
  activityTime: {
    fontSize: 9.5,
    color: Theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xl,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.roundness.md,
  },
  emptyText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  projTabs: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.sm,
  },
  projTabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm + 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  projTabButtonActive: {
    borderBottomColor: Theme.colors.primary,
  },
  projTabButtonText: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.semibold,
  },
  projTabButtonTextActive: {
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.bold,
  },
  infoCard: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.lg,
  },
  infoTabBlock: {
    width: '100%',
  },
  infoTabTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
  },
  infoTabText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.sm,
  },
  faqCard: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md - 2,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.roundness.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  faqAnswerContainer: {
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: Theme.colors.border,
  },
  faqAnswer: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.lg,
  },
  formTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
  },
  formSubtitle: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: Theme.spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 92, 56, 0.08)',
    borderColor: 'rgba(200, 92, 56, 0.2)',
    borderWidth: 1,
    borderRadius: Theme.roundness.sm,
    padding: Theme.spacing.sm - 2,
    marginBottom: Theme.spacing.md,
  },
  errorText: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.semibold,
    marginLeft: 6,
    flex: 1,
  },
  inputGroup: {
    marginBottom: Theme.spacing.md,
  },
  inputLabel: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.roundness.sm,
    paddingHorizontal: Theme.spacing.sm,
    height: 42,
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text,
  },
  textArea: {
    height: 90,
    paddingTop: Theme.spacing.sm,
    textAlignVertical: 'top',
  },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.secondary,
    paddingVertical: Theme.spacing.sm + 2,
    borderRadius: Theme.roundness.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    ...Theme.shadows.sm,
  },
  sendButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.sm + 1,
    fontWeight: Theme.typography.weights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: Theme.colors.white,
    width: '90%',
    borderRadius: Theme.roundness.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    ...Theme.shadows.lg,
  },
  modalIconContainer: {
    marginBottom: Theme.spacing.sm,
  },
  modalConfirmTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.secondary,
    marginBottom: Theme.spacing.sm,
  },
  modalText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Theme.spacing.lg,
  },
  modalBtn: {
    backgroundColor: Theme.colors.secondary,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.roundness.round,
    alignItems: 'center',
  },
  modalBtnText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.bold,
  },
  emptyActivityCard: {
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
