import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  SafeAreaView,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../theme';
import Card from '../components/Card';
import Header from '../components/Header';
import { useGlobalState } from '../services/GlobalStateContext';


interface LocalQuestion {
  id: string;
  difficulty: 'Fácil' | 'Media' | 'Difícil';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const LOCAL_QUESTIONS: LocalQuestion[] = [
  // FÁCIL (0, 1, 2)
  {
    id: 'q1',
    difficulty: 'Fácil',
    question: '¿Cuál es el ingrediente principal, libre de gluten, utilizado para elaborar la masa del Chipá tradicional?',
    options: ['Harina de trigo', 'Almidón de mandioca', 'Harina de maíz', 'Semolín'],
    correctAnswer: 1,
    explanation: 'El almidón de mandioca (extraído de la raíz de mandioca, un tubérculo nativo) es la base del chipá. Esto le da esa consistencia elástica única y lo hace libre de gluten de forma natural.'
  },
  {
    id: 'q2',
    difficulty: 'Fácil',
    question: '¿Cómo se le llama a la infusión de yerba mate preparada con agua helada y hierbas medicinales aromáticas típicas?',
    options: ['Mate cocido', 'Chimarrão', 'Tereré', 'Mate dulce'],
    correctAnswer: 2,
    explanation: 'El Tereré es la infusión helada por excelencia para combatir el calor del verano correntino. Se prepara con agua helada, yerba mate y "yuyos" machacados (como menta peperina, boldo, etc.).'
  },
  {
    id: 'q3',
    difficulty: 'Fácil',
    question: '¿Qué fruta cítrica es sumamente abundante en la provincia de Corrientes y se usa para jugos, postres y dulces tradicionales?',
    options: ['Naranja', 'Manzana', 'Plátano', 'Frutilla'],
    correctAnswer: 0,
    explanation: 'La naranja (tanto agria como dulce) es uno de los frutos cítricos más abundantes y tradicionales en el litoral correntino, base de múltiples postres.'
  },
  // MEDIA (3, 4, 5)
  {
    id: 'q4',
    difficulty: 'Media',
    question: '¿En qué localidad de Corrientes se realiza anualmente el famoso "Festival del Guiso de Arroz"?',
    options: ['Goya', 'Esquina', 'Mercedes', 'Riachuelo'],
    correctAnswer: 3,
    explanation: 'El Festival del Guiso de Arroz se lleva a cabo en la localidad de Riachuelo, reuniendo a cocineros de toda la región que preparan su versión del guiso en grandes ollas de hierro a leña.'
  },
  {
    id: 'q5',
    difficulty: 'Media',
    question: '¿Qué es el "Chipá Mbocá" y cómo se diferencia del chipá común?',
    options: [
      'Un chipá relleno de carne picada picante.',
      'Un chipá dulce bañado en almíbar de mamón.',
      'Un chipá cocinado a las brasas, enrollado alrededor de una caña o palo.',
      'Un chipá frito en grasa de cerdo.'
    ],
    correctAnswer: 2,
    explanation: 'El Chipá Mbocá se cocina enrollando la masa alrededor de una rama de caña o madera tacuara y haciéndolo girar sobre las brasas ardientes. Es sumamente tradicional y aromático.'
  },
  {
    id: 'q6',
    difficulty: 'Media',
    question: '¿Qué textura y consistencia tiene el plato típico conocido como "Sopa Correntina"?',
    options: [
      'Es un caldo líquido caliente con fideos finos.',
      'Es una crema espesa fría que se come con cuchara.',
      'Es una sopa sólida, similar a un bizcochuelo salado esponjoso.',
      'Es una salsa densa para acompañar pescados.'
    ],
    correctAnswer: 2,
    explanation: 'A pesar de llamarse sopa, es una preparación sólida. Nació de un error culinario y se convirtió en una torta salada esponjosa a base de harina de maíz, cebolla caramelizada y queso criollo.'
  },
  // DIFÍCIL (6, 7, 8)
  {
    id: 'q7',
    difficulty: 'Difícil',
    question: '¿Qué es el "Mbaipy" en la tradición gastronómica correntina?',
    options: [
      'Una infusión de hojas de naranja y miel.',
      'Un postre a base de dulce de leche y coco rallado.',
      'Una polenta cremosa de origen guaraní, cocida lentamente con queso y carnes.',
      'Un pan plano horneado bajo cenizas.'
    ],
    correctAnswer: 2,
    explanation: 'El Mbaipy es una preparación cremosa y calórica de origen prehispánico (guaraní), elaborada con harina de maíz de molienda casera, queso criollo y carne (pollo de campo, charqui o cordero).'
  },
  {
    id: 'q8',
    difficulty: 'Difícil',
    question: '¿Cuál es la principal característica del "Chicharrón Trenzado", típico de San Luis del Palmar?',
    options: [
      'Se hace con tripa cocida en leche.',
      'Son tiras de carne vacuna trenzadas y cocidas en su propia grasa y naranja agria.',
      'Es un dulce de cuero de cerdo con miel de caña.',
      'Es pan de maíz trenzado con grasa.'
    ],
    correctAnswer: 1,
    explanation: 'El Chicharrón Trenzado se elabora trenzando tiras finas de falda o matambre vacuno, cocidas lentamente en ollas de hierro con sal y jugo de naranja agria hasta dorarse en su grasa.'
  },
  {
    id: 'q9',
    difficulty: 'Difícil',
    question: '¿De dónde proviene históricamente la conserva del dulce de mamón en almíbar?',
    options: [
      'De la fusión de la conservación de frutas jesuita con los frutos nativos de la selva paranaense.',
      'De los inmigrantes italianos que se asentaron en Goya.',
      'De una antigua receta galesa de la costa del Uruguay.',
      'De las corrientes migratorias andinas.'
    ],
    correctAnswer: 0,
    explanation: 'El almíbar es una técnica europea de conservación introducida por los jesuitas en las reducciones, la cual se aplicó con éxito al mamón silvestre (carica papaya) abundante del litoral.'
  }
];

interface CuriosityItem {
  id: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  content: string;
  image: string;
}

const CURIOSITIES: CuriosityItem[] = [
  {
    id: 'c1',
    title: 'El Origen de la Sopa Paraguaya',
    subtitle: 'Un dichoso error de cocina',
    shortDesc: 'Cómo un cocinero arruinó una sopa líquida y creó el bizcochuelo salado más famoso del mundo.',
    content: 'A mediados del siglo XIX, el cocinero de don Carlos Antonio López (presidente del Paraguay) intentó hacer una sopa líquida de harina de maíz. Se le pasó la mano con la harina, quedando sumamente espesa. Decidió cocinarla al horno de barro y servirla como un pan sólido. Al presidente le encantó y la bautizó "sopa paraguaya". En Corrientes, esta tradición se adaptó incorporándole abundante queso criollo y cebollas caramelizadas.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'c2',
    title: 'El Secreto del Chipá Mbocá',
    subtitle: 'Cocinado al calor de las brasas',
    shortDesc: 'El chipá en caña tacuara que gira al ritmo del chamamé.',
    content: 'El Chipá Mbocá es una de las técnicas culinarias más tradicionales y vistosas de Corrientes. En lugar de hornearse, la masa elástica de almidón y queso se enrolla alrededor de una caña tacuara húmeda. Se hace girar manualmente sobre un fogón de brasas encendidas. El resultado es un chipá crocante por fuera y tierno por dentro, con un aroma ahumado único.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'c3',
    title: 'La Mandioca: Raíz Ancestral',
    subtitle: 'El pan del guaraní',
    shortDesc: 'El cultivo sagrado precolombino que define cada plato de nuestra mesa.',
    content: 'Para las comunidades guaraníes, la mandioca ("mandiog") era un regalo de los dioses. A diferencia del trigo europeo, prospera en la tierra roja y calurosa del litoral. Es rica en almidón y libre de gluten. Se come hervida como acompañamiento ("mandioca cali"), frita, o procesada en almidón para chipás y mbaipy, siendo el pilar fundamental del patrimonio alimentario regional.',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'c4',
    title: 'El Mbaipy de Olla de Hierro',
    subtitle: 'Energía campesina pura',
    shortDesc: 'La densa crema de maíz que reconfortaba a los mensajeros del estero.',
    content: 'El Mbaipy es el plato preferido para los días frescos del invierno correntino. Heredado de la molienda guaraní, se prepara en grandes ollas de tres patas de hierro fundido sobre leña. Consiste en una harina de maíz disuelta en caldo hirviendo, batida enérgicamente hasta espesar, enriquecida con abundante queso criollo, pollo de granja o charqui (carne secada al sol).',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'c5',
    title: 'Dulces en Almíbar Jesuíticos',
    subtitle: 'Legado de los huertos de las misiones',
    shortDesc: 'Cómo la técnica de conservación europea se adaptó a los frutos silvestres.',
    content: 'Los misioneros jesuitas trajeron al Taragüí la técnica de cocción de frutas en almíbar denso para conservarlas en el clima húmedo. Los guaraníes aplicaron esto al mamón (carica papaya), la guayaba y el andai (calabaza), creando postres dulces que hoy son el broche de oro de cualquier almuerzo correntino, usualmente acompañados con una rodaja de queso criollo.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60'
  }
];

export const TriviaScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trivia' | 'curiosidades'>('trivia');
  
  // Trivia game state
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'answered' | 'finished'>('intro');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);

  // Curiosidades details modal state
  const [selectedCuriosity, setSelectedCuriosity] = useState<CuriosityItem | null>(null);
  const [showSparkle, setShowSparkle] = useState<boolean>(false);

  // Global State context hooks
  const {
    addTriviaRun,
    triviaHighScore,
    readCuriosities,
    markCuriosityRead,
    colors,
    isDarkMode,
  } = useGlobalState();

  const currentQuestion = LOCAL_QUESTIONS[currentIdx];
  const totalQuestions = LOCAL_QUESTIONS.length;

  const handleStartGame = () => {
    setScore(0);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setGameState('playing');
  };

  const handleSelectOption = (optIdx: number) => {
    if (gameState !== 'playing') return;
    
    setSelectedOpt(optIdx);
    const isCorrect = optIdx === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setGameState('answered');
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < totalQuestions) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setGameState('playing');
    } else {
      // Save trivia run
      addTriviaRun(score, totalQuestions);
      setGameState('finished');
    }
  };

  // Get progressive difficulty colors and styling
  const getDifficultyTheme = (diff: 'Fácil' | 'Media' | 'Difícil') => {
    switch (diff) {
      case 'Fácil':
        return {
          primaryColor: isDarkMode ? '#4ADE80' : '#2E6F40', // Green
          bgColor: isDarkMode ? 'rgba(74, 222, 128, 0.15)' : '#EAF5EC',
          label: 'Nivel: Fácil 🌾',
          accent: isDarkMode ? 'rgba(74, 222, 128, 0.15)' : 'rgba(46, 111, 64, 0.08)',
        };
      case 'Media':
        return {
          primaryColor: isDarkMode ? '#F97316' : '#C85C38', // Terracota
          bgColor: isDarkMode ? 'rgba(249, 115, 22, 0.15)' : '#FCECE7',
          label: 'Nivel: Medio 🔥',
          accent: isDarkMode ? 'rgba(249, 115, 22, 0.15)' : 'rgba(200, 92, 56, 0.08)',
        };
      case 'Difícil':
        return {
          primaryColor: isDarkMode ? '#FACC15' : '#9E7A1C', // Dark Gold
          bgColor: isDarkMode ? 'rgba(250, 204, 21, 0.15)' : '#FBF5E6',
          label: 'Nivel: Difícil 👑',
          accent: isDarkMode ? 'rgba(250, 204, 21, 0.15)' : 'rgba(158, 122, 28, 0.08)',
        };
      default:
        return {
          primaryColor: colors.primary,
          bgColor: colors.surface,
          label: 'Trivia',
          accent: isDarkMode ? 'rgba(200, 92, 56, 0.15)' : 'rgba(200, 92, 56, 0.08)',
        };
    }
  };

  const activeTheme = getDifficultyTheme(currentQuestion?.difficulty || 'Fácil');

  // Dynamic ranking medals computed at the end
  const getBadgeRank = (finalScore: number) => {
    const pct = finalScore / totalQuestions;
    if (pct === 1) return { title: 'Fuego Sagrado 👑', color: '#D13C3C', desc: '¡Un verdadero sabio del fogón correntino! Respondiste todas las preguntas a la perfección.' };
    if (pct >= 0.6) return { title: 'Sabio del Almidón 🎓', color: '#9E7A1C', desc: '¡Gran conocimiento, chamigo! Conocés el origen y secretos de nuestras delicias.' };
    if (pct >= 0.1) return { title: 'Matrero Primerizo 🌾', color: '#C85C38', desc: '¡Buen intento! Estás empezando a explorar la riqueza culinaria del Taragüí.' };
    return { title: 'Fuego Apagado 🪵', color: '#6E675F', desc: '¡Se te enfrió la pava! Te sugerimos leer más recetas en la pestaña de Curiosidades y volver a intentar.' };
  };

  const rank = getBadgeRank(score);

  // Handle curiosity click
  const handleOpenCuriosity = (item: CuriosityItem) => {
    setSelectedCuriosity(item);
    setShowSparkle(false);
  };

  const handleMarkAsRead = (id: string) => {
    const isAlreadyRead = readCuriosities.includes(id);
    markCuriosityRead(id);
    if (!isAlreadyRead) {
      setShowSparkle(true);
      setTimeout(() => {
        setShowSparkle(false);
      }, 1500);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Trivia & Saberes" 
        subtitle="¿Cuánto sabés sobre el patrimonio del Taragüí?" 
        showDivider={true}
      />

      {/* Segmented Tab Controller */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(['trivia', 'curiosidades'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabBtn,
              activeTab === tab && [styles.tabBtnActive, { borderBottomColor: colors.primary }]
            ]}
          >
            <Text style={[
              styles.tabBtnText,
              { color: colors.textSecondary },
              activeTab === tab && [styles.tabBtnTextActive, { color: colors.primary }]
            ]}>
              {tab === 'trivia' ? 'Desafío Trivia' : 'Curiosidades del Litoral'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'trivia' ? (
          <View style={styles.stateContainer}>
            {/* INTRO STATE */}
            {gameState === 'intro' && (
              <Card style={[styles.introCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="md">
                <View style={[styles.introIconCircle, { backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.15)' : 'rgba(200, 92, 56, 0.08)' }]}>
                  <Ionicons name="help-circle" size={48} color={colors.primary} />
                </View>
                <Text style={[styles.introTitle, { color: colors.primary }]}>¡Desafío del Sabor!</Text>
                <Text style={[styles.introText, { color: colors.textSecondary }]}>
                  Poné a prueba tus conocimientos sobre recetas típicas, técnicas de cocción, ingredientes de la tierra e historias de los festivales gastronómicos de Corrientes.
                </Text>

                <View style={styles.difficultyIndicators}>
                  <View style={[styles.diffIndicatorCell, { backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.15)' : '#EAF5EC' }]}>
                    <Text style={[styles.diffIndicatorText, { color: isDarkMode ? '#4ADE80' : '#2E6F40' }]}>3 Fácil 🌾</Text>
                  </View>
                  <View style={[styles.diffIndicatorCell, { backgroundColor: isDarkMode ? 'rgba(249, 115, 22, 0.15)' : '#FCECE7' }]}>
                    <Text style={[styles.diffIndicatorText, { color: isDarkMode ? '#F97316' : '#C85C38' }]}>3 Medio 🔥</Text>
                  </View>
                  <View style={[styles.diffIndicatorCell, { backgroundColor: isDarkMode ? 'rgba(250, 204, 21, 0.15)' : '#FBF5E6' }]}>
                    <Text style={[styles.diffIndicatorText, { color: isDarkMode ? '#FACC15' : '#9E7A1C' }]}>3 Difícil 👑</Text>
                  </View>
                </View>
                
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.secondary} />
                    <Text style={[styles.bulletText, { color: colors.text }]}>{totalQuestions} preguntas con dificultad progresiva</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons name="ribbon" size={18} color={colors.secondary} />
                    <Text style={[styles.bulletText, { color: colors.text }]}>Ganá +20 XP por respuesta correcta en tu récord</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Ionicons name="trophy" size={18} color={colors.secondary} />
                    <Text style={[styles.bulletText, { color: colors.text }]}>Desbloqueá insignias exclusivas para tu perfil</Text>
                  </View>
                </View>

                <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleStartGame}>
                  <Text style={styles.primaryButtonText}>Iniciar Desafío</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 6 }} />
                </Pressable>

                {triviaHighScore > 0 && (
                  <View style={[styles.recordBox, { backgroundColor: colors.surfaceDark }]}>
                    <Text style={[styles.recordText, { color: colors.textSecondary }]}>Tu mejor marca actual: {triviaHighScore} / {totalQuestions} aciertos</Text>
                  </View>
                )}
              </Card>
            )}

            {/* PLAYING & ANSWERED STATES */}
            {(gameState === 'playing' || gameState === 'answered') && (
              <View style={styles.gamePlayContainer}>
                {/* Difficulty Header */}
                <View style={[styles.difficultyHeader, { backgroundColor: activeTheme.bgColor }]}>
                  <Ionicons 
                    name={currentQuestion.difficulty === 'Fácil' ? 'leaf' : currentQuestion.difficulty === 'Media' ? 'flame' : 'sunny'} 
                    size={16} 
                    color={activeTheme.primaryColor} 
                  />
                  <Text style={[styles.difficultyLabelText, { color: activeTheme.primaryColor }]}>
                    {activeTheme.label}
                  </Text>
                </View>

                {/* Progress Header */}
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    Pregunta {currentIdx + 1} de {totalQuestions}
                  </Text>
                  <Text style={[styles.scoreCounterText, { color: colors.secondary }]}>Aciertos: {score}</Text>
                </View>

                <View style={[styles.progressBarOuter, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.progressBarInner, 
                      { 
                        width: `${((currentIdx + 1) / totalQuestions) * 100}%`,
                        backgroundColor: activeTheme.primaryColor
                      }
                    ]} 
                  />
                </View>

                {/* Question Card */}
                <Card style={[styles.questionCard, { backgroundColor: colors.surface, borderLeftColor: activeTheme.primaryColor }]} elevation="sm">
                  <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion.question}</Text>
                </Card>

                {/* Options List */}
                <View style={styles.optionsList}>
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOpt === idx;
                    const isCorrectAns = idx === currentQuestion.correctAnswer;
                    
                    let optionStyle: any[] = [styles.optionBtn, { backgroundColor: colors.surface, borderColor: colors.border }];
                    let optionTextStyle: any[] = [styles.optionBtnText, { color: colors.text }];
                    let iconName: any = "ellipse-outline";
                    let iconColor = colors.textSecondary;

                    if (gameState === 'answered') {
                      if (isCorrectAns) {
                        optionStyle.push(styles.optionBtnCorrect, { borderColor: colors.correct, backgroundColor: isDarkMode ? 'rgba(46, 111, 64, 0.2)' : 'rgba(46, 111, 64, 0.06)' });
                        optionTextStyle.push(styles.optionBtnTextCorrect, { color: colors.correct });
                        iconName = "checkmark-circle";
                        iconColor = colors.correct;
                      } else if (isSelected) {
                        optionStyle.push(styles.optionBtnIncorrect, { borderColor: colors.incorrect, backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.15)' : 'rgba(200, 92, 56, 0.06)' });
                        optionTextStyle.push(styles.optionBtnTextIncorrect, { color: colors.incorrect });
                        iconName = "close-circle";
                        iconColor = colors.incorrect;
                      } else {
                        optionStyle.push(styles.optionBtnMuted);
                        optionTextStyle.push(styles.optionBtnTextMuted, { color: colors.textSecondary });
                      }
                    } else if (isSelected) {
                      optionStyle.push(styles.optionBtnSelected, { borderColor: colors.primary, backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.15)' : 'rgba(200, 92, 56, 0.03)' });
                      iconName = "radio-button-on";
                      iconColor = activeTheme.primaryColor;
                    }

                    return (
                      <Pressable
                        key={idx}
                        onPress={() => handleSelectOption(idx)}
                        disabled={gameState === 'answered'}
                        style={optionStyle}
                      >
                        <Ionicons name={iconName} size={18} color={iconColor} style={{ marginRight: Theme.spacing.sm }} />
                        <Text style={optionTextStyle}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Answer Feedback Panel */}
                {gameState === 'answered' && (
                  <Card style={[styles.feedbackCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="none">
                    <View style={styles.feedbackHeader}>
                      <Ionicons 
                        name={selectedOpt === currentQuestion.correctAnswer ? "happy" : "alert-circle"} 
                        size={22} 
                        color={selectedOpt === currentQuestion.correctAnswer ? colors.correct : colors.incorrect} 
                      />
                      <Text 
                        style={[
                          styles.feedbackTitle, 
                          { color: selectedOpt === currentQuestion.correctAnswer ? colors.correct : colors.incorrect }
                        ]}
                      >
                        {selectedOpt === currentQuestion.correctAnswer ? '¡Correcto chamigo!' : '¡Casi acertás!'}
                      </Text>
                    </View>
                    <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{currentQuestion.explanation}</Text>
                    
                    <Pressable 
                      style={[styles.primaryButton, { marginTop: Theme.spacing.md, backgroundColor: activeTheme.primaryColor }]} 
                      onPress={handleNextQuestion}
                    >
                      <Text style={[styles.primaryButtonText, { color: colors.white }]}>
                        {currentIdx + 1 === totalQuestions ? 'Ver Resultados' : 'Siguiente Pregunta'}
                      </Text>
                      <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 6 }} />
                    </Pressable>
                  </Card>
                )}
              </View>
            )}

            {/* FINISHED STATE */}
            {gameState === 'finished' && (
              <Card style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]} elevation="md">
                <View style={styles.ribbonContainer}>
                  <Ionicons name="ribbon" size={64} color={rank.color} />
                </View>
                
                <Text style={[styles.resultTitle, { color: colors.text }]}>Desafío Completado</Text>
                
                <View style={styles.scoreWrapper}>
                  <Text style={[styles.resultScoreNum, { color: rank.color }]}>{score}</Text>
                  <Text style={[styles.resultScoreSlash, { color: colors.textSecondary }]}>/</Text>
                  <Text style={[styles.resultScoreTotal, { color: colors.textSecondary }]}>{totalQuestions}</Text>
                </View>
                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Respuestas Correctas</Text>

                {/* Rank Badge Box */}
                <View style={[styles.rankBox, { borderColor: rank.color, backgroundColor: `${rank.color}15` }]}>
                  <Text style={[styles.rankBadgeTitle, { color: rank.color }]}>{rank.title}</Text>
                  <Text style={[styles.rankBadgeDesc, { color: colors.textSecondary }]}>{rank.desc}</Text>
                </View>

                {/* Cultural XP Gained Breakdown */}
                <View style={[styles.xpBreakdown, { backgroundColor: colors.surfaceDark }]}>
                  <Text style={[styles.xpBreakdownTitle, { color: colors.text }]}>Puntos de Cultura ganados:</Text>
                  <View style={styles.xpRow}>
                    <Text style={[styles.xpRowText, { color: colors.textSecondary }]}>Aciertos (+20 XP c/u en récord):</Text>
                    <Text style={[styles.xpRowValue, { color: colors.secondary }]}>+{score * 20} XP</Text>
                  </View>
                  <View style={styles.xpRow}>
                    <Text style={[styles.xpRowText, { color: colors.textSecondary }]}>Insignia desbloqueada:</Text>
                    <Text style={[styles.xpRowValue, { color: colors.secondary }]}>+100 XP</Text>
                  </View>
                </View>

                <Pressable style={[styles.primaryButton, { width: '100%', marginBottom: Theme.spacing.sm, backgroundColor: colors.primary }]} onPress={handleStartGame}>
                  <Ionicons name="refresh" size={18} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={[styles.primaryButtonText, { color: colors.white }]}>Jugar de Nuevo</Text>
                </Pressable>
                
                <Pressable style={styles.secondaryButton} onPress={() => setGameState('intro')}>
                  <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Volver a la Introducción</Text>
                </Pressable>
              </Card>
            )}
          </View>
        ) : (
          /* CURIOSIDADES EDITORIAL FEED TAB */
          <View style={styles.curiositiesContainer}>
            <View style={[styles.curiosityIntro, { 
              backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.15)' : 'rgba(200, 92, 56, 0.04)', 
              borderColor: isDarkMode ? 'rgba(200, 92, 56, 0.3)' : 'rgba(200, 92, 56, 0.15)' 
            }]}>
              <Ionicons name="book" size={24} color={colors.primary} />
              <Text style={[styles.curiosityIntroText, { color: colors.textSecondary }]}>
                Explorá relatos editoriales breves de la historia culinaria del litoral correntino. Cada lectura suma **+5 XP** de cultura a tu perfil.
              </Text>
            </View>

            {CURIOSITIES.map((item) => {
              const isRead = readCuriosities.includes(item.id);
              return (
                <Card 
                  key={item.id} 
                  style={[styles.curiosityCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
                  elevation="sm"
                  onPress={() => handleOpenCuriosity(item)}
                >
                  <Image source={{ uri: item.image }} style={styles.curiosityCardImage} />
                  <View style={styles.curiosityCardContent}>
                    <View style={styles.curiosityStatusRow}>
                      <View style={[
                        styles.curiosityBadge, 
                        isRead ? styles.curiosityBadgeRead : styles.curiosityBadgeUnread,
                        { backgroundColor: isRead ? (isDarkMode ? 'rgba(46, 111, 64, 0.2)' : 'rgba(46, 111, 64, 0.08)') : (isDarkMode ? 'rgba(200, 92, 56, 0.2)' : 'rgba(200, 92, 56, 0.08)') }
                      ]}>
                        <Ionicons 
                          name={isRead ? "checkmark-circle" : "sparkles"} 
                          size={12} 
                          color={isRead ? colors.correct : colors.primary} 
                          style={{ marginRight: 3 }}
                        />
                        <Text style={[
                          styles.curiosityBadgeText, 
                          isRead ? styles.curiosityBadgeTextRead : styles.curiosityBadgeTextUnread,
                          { color: isRead ? colors.correct : colors.primary }
                        ]}>
                          {isRead ? 'Leído' : '+5 XP'}
                        </Text>
                      </View>
                      <Text style={[styles.curiositySubtitleText, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                    </View>
                    <Text style={[styles.curiosityCardTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.curiosityCardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.shortDesc}</Text>
                    
                    <View style={styles.readMoreRow}>
                      <Text style={[styles.readMoreText, { color: colors.primary }]}>Continuar leyendo</Text>
                      <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Curiosity Detailed Modal */}
      {selectedCuriosity && (
        <Modal
          visible={!!selectedCuriosity}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedCuriosity(null)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.75)' : 'rgba(62, 58, 51, 0.65)' }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                <Image source={{ uri: selectedCuriosity.image }} style={styles.modalImage} />
                
                <Pressable 
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedCuriosity(null)}
                >
                  <Ionicons name="close" size={24} color={colors.white} />
                </Pressable>

                <View style={styles.modalTextBody}>
                  <View style={styles.modalSubtitleContainer}>
                    <Text style={[styles.modalSubtitle, { color: colors.primary }]}>{selectedCuriosity.subtitle}</Text>
                    {readCuriosities.includes(selectedCuriosity.id) ? (
                      <View style={[styles.curiosityBadge, styles.curiosityBadgeRead, { backgroundColor: isDarkMode ? 'rgba(46, 111, 64, 0.2)' : 'rgba(46, 111, 64, 0.08)' }]}>
                        <Ionicons name="checkmark-circle" size={12} color={colors.correct} style={{ marginRight: 3 }} />
                        <Text style={[styles.curiosityBadgeText, styles.curiosityBadgeTextRead, { color: colors.correct }]}>Leído</Text>
                      </View>
                    ) : (
                      <View style={[styles.curiosityBadge, styles.curiosityBadgeUnread, { backgroundColor: isDarkMode ? 'rgba(200, 92, 56, 0.2)' : 'rgba(200, 92, 56, 0.08)' }]}>
                        <Ionicons name="sparkles" size={12} color={colors.primary} style={{ marginRight: 3 }} />
                        <Text style={[styles.curiosityBadgeText, styles.curiosityBadgeTextUnread, { color: colors.primary }]}>+5 XP</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedCuriosity.title}</Text>
                  
                  {/* Divider line */}
                  <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

                  <Text style={[styles.modalMainText, { color: colors.textSecondary }]}>{selectedCuriosity.content}</Text>
                  
                  {showSparkle && (
                    <View style={[styles.sparkleContainer, { backgroundColor: isDarkMode ? 'rgba(223, 177, 91, 0.15)' : 'rgba(223, 177, 91, 0.1)', borderColor: isDarkMode ? 'rgba(223, 177, 91, 0.3)' : 'rgba(223, 177, 91, 0.25)' }]}>
                      <Ionicons name="sparkles" size={32} color={colors.accent} />
                      <Text style={[styles.sparkleText, { color: isDarkMode ? '#DFB15B' : '#9E7A1C' }]}>¡+5 XP de Saberes Litoraleños!</Text>
                    </View>
                  )}

                  <Pressable 
                    style={[
                      styles.readConfirmBtn, 
                      { backgroundColor: colors.primary },
                      readCuriosities.includes(selectedCuriosity.id) && [styles.readConfirmBtnRead, { backgroundColor: colors.textSecondary }]
                    ]}
                    onPress={() => {
                      handleMarkAsRead(selectedCuriosity.id);
                      // Close after a brief delay if just marked read
                      if (!readCuriosities.includes(selectedCuriosity.id)) {
                        setTimeout(() => setSelectedCuriosity(null), 1200);
                      } else {
                        setSelectedCuriosity(null);
                      }
                    }}
                  >
                    <Ionicons 
                      name={readCuriosities.includes(selectedCuriosity.id) ? "checkmark" : "book"} 
                      size={20} 
                      color={colors.white} 
                      style={{ marginRight: Theme.spacing.sm }}
                    />
                    <Text style={styles.readConfirmBtnText}>
                      {readCuriosities.includes(selectedCuriosity.id) ? 'Cerrar Relato' : 'Marcar como Leído (+5 XP)'}
                    </Text>
                  </Pressable>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.sm,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm + 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: Theme.colors.primary,
  },
  tabBtnText: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.semibold,
  },
  tabBtnTextActive: {
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.bold,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  stateContainer: {
    padding: Theme.spacing.md,
  },
  introCard: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderRadius: Theme.roundness.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  introIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(200, 92, 56, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  introTitle: {
    fontSize: Theme.typography.sizes.xl + 2,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
  },
  introText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  difficultyIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: Theme.spacing.lg,
  },
  diffIndicatorCell: {
    paddingHorizontal: Theme.spacing.sm + 2,
    paddingVertical: Theme.spacing.xs + 1,
    borderRadius: Theme.roundness.sm,
    marginHorizontal: 4,
  },
  diffIndicatorText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
  },
  bulletList: {
    width: '100%',
    marginBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  bulletText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text,
    marginLeft: Theme.spacing.sm,
    fontWeight: Theme.typography.weights.medium,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md - 2,
    paddingHorizontal: Theme.spacing.lg + 4,
    borderRadius: Theme.roundness.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.sm,
  },
  primaryButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
  },
  recordBox: {
    marginTop: Theme.spacing.md + 4,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    backgroundColor: Theme.colors.surfaceDark,
    borderRadius: Theme.roundness.md,
  },
  recordText: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.semibold,
  },
  gamePlayContainer: {
    width: '100%',
  },
  difficultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.roundness.sm,
    marginBottom: Theme.spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: Theme.spacing.sm,
  },
  difficultyLabelText: {
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.textSecondary,
  },
  scoreCounterText: {
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.secondary,
  },
  progressBarOuter: {
    height: 6,
    backgroundColor: Theme.colors.border,
    borderRadius: 3,
    width: '100%',
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 3,
  },
  questionCard: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.lg,
    borderRadius: Theme.roundness.md,
    marginBottom: Theme.spacing.md,
    borderLeftWidth: 4,
  },
  questionText: {
    fontSize: Theme.typography.sizes.md + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    lineHeight: 24,
  },
  optionsList: {
    marginBottom: Theme.spacing.md,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md - 2,
    marginBottom: Theme.spacing.sm,
    ...Theme.shadows.sm,
  },
  optionBtnSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(200, 92, 56, 0.03)',
  },
  optionBtnCorrect: {
    borderColor: Theme.colors.correct,
    backgroundColor: 'rgba(46, 111, 64, 0.06)',
  },
  optionBtnIncorrect: {
    borderColor: Theme.colors.incorrect,
    backgroundColor: 'rgba(200, 92, 56, 0.06)',
  },
  optionBtnMuted: {
    opacity: 0.5,
  },
  optionBtnText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.text,
    fontWeight: Theme.typography.weights.medium,
    flex: 1,
  },
  optionBtnTextCorrect: {
    color: Theme.colors.correct,
    fontWeight: Theme.typography.weights.bold,
  },
  optionBtnTextIncorrect: {
    color: Theme.colors.incorrect,
    fontWeight: Theme.typography.weights.bold,
  },
  optionBtnTextMuted: {
    color: Theme.colors.textSecondary,
  },
  feedbackCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    marginTop: Theme.spacing.xs,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm - 2,
  },
  feedbackTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    marginLeft: Theme.spacing.sm,
  },
  explanationText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.sm,
  },
  resultCard: {
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.lg,
    borderRadius: Theme.roundness.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  ribbonContainer: {
    marginBottom: Theme.spacing.sm,
  },
  resultTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
  },
  scoreWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Theme.spacing.md,
  },
  resultScoreNum: {
    fontSize: 54,
    fontWeight: Theme.typography.weights.bold,
  },
  resultScoreSlash: {
    fontSize: 28,
    color: Theme.colors.textLight,
    marginHorizontal: 4,
  },
  resultScoreTotal: {
    fontSize: 28,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.textSecondary,
  },
  scoreLabel: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.md,
  },
  rankBox: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: Theme.roundness.md,
    padding: Theme.spacing.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  rankBadgeTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    textAlign: 'center',
  },
  rankBadgeDesc: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
  xpBreakdown: {
    width: '100%',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surfaceDark,
    borderRadius: Theme.roundness.md,
    marginBottom: Theme.spacing.lg,
  },
  xpBreakdownTitle: {
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  xpRowText: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
  },
  xpRowValue: {
    fontSize: Theme.typography.sizes.xs + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.secondary,
  },
  secondaryButton: {
    marginTop: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
  },
  curiositiesContainer: {
    padding: Theme.spacing.md,
  },
  curiosityIntro: {
    flexDirection: 'row',
    backgroundColor: 'rgba(200, 92, 56, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(200, 92, 56, 0.15)',
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  curiosityIntroText: {
    flex: 1,
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.sm,
    lineHeight: 18,
  },
  curiosityCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.roundness.md,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  curiosityCardImage: {
    width: 110,
    height: '100%',
    minHeight: 120,
  },
  curiosityCardContent: {
    flex: 1,
    padding: Theme.spacing.sm + 2,
    justifyContent: 'space-between',
  },
  curiosityStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  curiosityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.roundness.xs,
  },
  curiosityBadgeRead: {
    backgroundColor: 'rgba(46, 111, 64, 0.08)',
  },
  curiosityBadgeUnread: {
    backgroundColor: 'rgba(200, 92, 56, 0.08)',
  },
  curiosityBadgeText: {
    fontSize: 9,
    fontWeight: Theme.typography.weights.bold,
  },
  curiosityBadgeTextRead: {
    color: Theme.colors.correct,
  },
  curiosityBadgeTextUnread: {
    color: Theme.colors.primary,
  },
  curiositySubtitleText: {
    fontSize: 10,
    color: Theme.colors.textLight,
    fontWeight: Theme.typography.weights.semibold,
  },
  curiosityCardTitle: {
    fontSize: Theme.typography.sizes.sm + 1,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    marginTop: 4,
  },
  curiosityCardDesc: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
    marginVertical: 4,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  readMoreText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.primary,
    marginRight: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(62, 58, 51, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.roundness.xl,
    borderTopRightRadius: Theme.roundness.xl,
    height: '85%',
    overflow: 'hidden',
  },
  modalScroll: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTextBody: {
    padding: Theme.spacing.lg,
  },
  modalSubtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: Theme.typography.sizes.xs + 1,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.bold,
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
    lineHeight: 28,
  },
  modalDivider: {
    height: 2,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md,
  },
  modalMainText: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: Theme.spacing.lg,
  },
  sparkleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(223, 177, 91, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(223, 177, 91, 0.25)',
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    marginBottom: Theme.spacing.lg,
  },
  sparkleText: {
    fontSize: Theme.typography.sizes.sm + 1,
    fontWeight: Theme.typography.weights.bold,
    color: '#9E7A1C',
    marginLeft: Theme.spacing.sm,
  },
  readConfirmBtn: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md - 2,
    borderRadius: Theme.roundness.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.md,
  },
  readConfirmBtnRead: {
    backgroundColor: Theme.colors.textSecondary,
  },
  readConfirmBtnText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
  },
});

export default TriviaScreen;
