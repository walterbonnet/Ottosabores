import { Recipe, Festival, MultimediaItem, TriviaQuestion, DepartmentHotspot } from '../types';

export const RECIPES: Recipe[] = [
  {
    id: 'r1',
    nombre: 'Chipá Tradicional',
    categoría: 'Sabores Guaraníes',
    historia: 'El chipá (o la chipa) es herencia directa de la cultura guaraní y las misiones jesuíticas. Originalmente, los guaraníes preparaban un pan de mandioca rallada envuelto en hojas de güembé cocinado sobre cenizas. Con la llegada de los jesuitas, se incorporaron productos de origen vacuno como la leche, el queso y los huevos, dando origen al chipá que conocemos hoy.',
    ingredientes: [
      '500g de almidón de mandioca (fariña de mandioca)',
      '3 huevos medianos',
      '100g de manteca o grasa vacuna derretida',
      '250g de queso criollo (semiduro) cortado en cubitos',
      '150g de queso rallado (reggianito o sardo)',
      '1 cucharadita de sal marina',
      '100ml de leche entera (cantidad necesaria)',
      '1 cucharada de jugo de naranja natural (secreto para darle frescura)'
    ],
    preparación: [
      'En un bol grande, colocar el almidón de mandioca en forma de corona y hacer un hueco en el centro.',
      'Añadir la sal, la manteca a temperatura ambiente, los huevos enteros y los quesos.',
      'Mezclar con las manos integrando los ingredientes desde el centro hacia afuera. Ir agregando leche de a poco hasta obtener una masa suave y maleable, pero que no se pegue en las manos.',
      'Dejar descansar la masa tapada con un paño limpio durante 15 minutos en la heladera.',
      'Precalentar el horno a 200°C (horno caliente).',
      'Formar bollitos del tamaño de una nuez y colocarlos en una placa para horno engrasada, dejando espacio entre ellos.',
      'Hornear durante 15 a 20 minutos hasta que estén ligeramente dorados por fuera y cocidos por dentro. ¡Servir calientes con mate o tereré!'
    ],
    duración: '45 min',
    dificultad: 'Fácil',
    video: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r2',
    nombre: 'Mbaipy (Polenta Guaraní)',
    categoría: 'Sabores Guaraníes',
    historia: 'El Mbaipy es uno de los platos más antiguos de la región, consumido originalmente por los guaraníes mucho antes de la colonización. Consiste en una crema espesa a base de maíz. Con el tiempo se le incorporaron carnes (pollo, charqui o chorizo) y abundante queso criollo, convirtiéndose en el almuerzo ideal para los días fríos del invierno correntino.',
    ingredientes: [
      '300g de harina de maíz (de molienda fina)',
      '500g de pechuga de pollo o carne vacuna cortada en cubitos',
      '1 cebolla mediana picada finalmente',
      '1 morrón rojo picado',
      '2 dientes de ajo picados',
      '1 litro de caldo de verduras caliente',
      '300g de queso cremoso o queso criollo correntino',
      'Sal, pimienta, comino y pimentón dulce a gusto',
      '2 cucharadas de aceite de girasol'
    ],
    preparación: [
      'En una olla de hierro o de fondo grueso, calentar el aceite y dorar las piezas de carne elegidas.',
      'Agregar la cebolla, el morrón y el ajo picados. Rehogar todo junto hasta que los vegetales estén tiernos.',
      'Sazonar con sal, pimienta, una pizca de comino y una cucharada de pimentón dulce.',
      'En un recipiente aparte, disolver la harina de maíz en la mitad del caldo frío para evitar grumos.',
      'Volcar esta mezcla en la olla con la carne y los vegetales, revolviendo constantemente con una cuchara de madera.',
      'Ir agregando el resto del caldo caliente poco a poco, mientras continúa la cocción a fuego lento durante 20-25 minutos sin parar de revolver para que no se pegue.',
      'Una vez que la preparación esté espesa y la harina cocida, apagar el fuego y agregar el queso cortado en dados.',
      'Tapar la olla por 5 minutos para que el queso se derrita por completo. Servir bien caliente.'
    ],
    duración: '60 min',
    dificultad: 'Media',
    video: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r3',
    nombre: 'Guiso de Arroz Riachuelero',
    categoría: 'Guisos y Comidas Populares',
    historia: 'El guiso de arroz es el plato representativo de Riachuelo, cocinado tradicionalmente en ollas de hierro a la leña. Su cocción lenta concentra los sabores de las carnes y condimentos locales, utilizando el arroz largo fino producido en los campos arroceros de la provincia.',
    ingredientes: [
      '300g de arroz largo fino correntino',
      '500g de carne de res (paleta o aguja) cortada en cubos',
      '1 cebolla mediana picada',
      '1 morrón rojo picado',
      '2 dientes de ajo picados',
      '1 litro de caldo caliente de carne o verduras',
      '1 cucharada de pimentón dulce y comino a gusto',
      '2 cucharadas de grasa de cerdo o aceite vegetal'
    ],
    preparación: [
      'En una olla de hierro caliente, derretir la grasa y dorar la carne a fuego fuerte.',
      'Añadir la cebolla, el morrón y el ajo. Rehogar todo junto hasta que los vegetales estén tiernos.',
      'Condimentar con sal, pimienta, pimentón dulce y una pizca de comino.',
      'Agregar el arroz y remover bien para que absorba los jugos de la carne (nacarar).',
      'Verter el caldo caliente poco a poco, cocinando a fuego lento y revolviendo suavemente con cuchara de madera durante unos 18 minutos.',
      'Apagar el fuego, tapar la olla y dejar reposar 5 minutos antes de servir.'
    ],
    duración: '50 min',
    dificultad: 'Fácil',
    video: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r4',
    nombre: 'Dulce de Mamón en Almíbar',
    categoría: 'Frutas y Productos Naturales',
    historia: 'El mamón (o papaya) crece de forma silvestre en los patios correntinos. El dulce de mamón en almíbar es la conserva insignia del litoral argentino, transmitida de generación en generación como forma de preservar los frutos dorados del verano para todo el año. Se sirve tradicionalmente acompañado de una porción de queso fresco.',
    ingredientes: [
      '1 kg de mamones verdes o semi maduros',
      '800g de azúcar blanca común',
      '1 cucharadita de bicarbonato de sodio',
      '1 litro de agua',
      'Clavos de olor (3 unidades)',
      '1 chaucha de vainilla o unas gotas de esencia de vainilla'
    ],
    preparación: [
      'Pelar los mamones con cuidado (se aconseja usar guantes ya que la cáscara suelta un látex lechoso que puede irritar la piel).',
      'Cortar los frutos por la mitad, retirar las semillas y cortarlos en gajos medianos.',
      'Colocar los trozos de mamón en un bol, cubrirlos con agua y espolvorear el bicarbonato de sodio. Dejar reposar por 1 hora (este paso endurece el exterior del fruto para que no se deshaga al cocinarse).',
      'Enjuagar muy bien los frutos con abundante agua fría.',
      'En una cacerola grande de cobre o acero inoxidable, armar un almíbar suave disolviendo el azúcar en el litro de agua junto con la vainilla y los clavos de olor. Llevar a hervor.',
      'Incorporar los trozos de mamón al almíbar hirviendo. Bajar el fuego al mínimo y cocinar tapado durante aproximadamente 2 horas.',
      'A mitad de cocción, destapar para que el almíbar se espese y los mamones tomen un color ámbar oscuro, casi traslúcido.',
      'Dejar enfriar en el almíbar y conservar en frascos esterilizados en la heladera.'
    ],
    duración: '120 min',
    dificultad: 'Media',
    video: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r5',
    nombre: 'Cordero Lomeño a las Brasas',
    categoría: 'Carnes Tradicionales',
    historia: 'El cordero de la zona de Lomas de Vallejos se destaca por su sabor singular debido a los pastizales naturales de la zona. Se cocina tradicionalmente a la estaca o a la parrilla, rociado con salmuera de ajo y hierbas locales.',
    ingredientes: [
      '1 cordero lomeño entero limpio (aprox. 8 a 10 kg)',
      'Sal marina gruesa o sal entrefina a gusto',
      '1 cabeza de ajo machacada',
      '2 ramitas de romero fresco y laurel',
      '1 litro de agua tibia (para la salmuera)'
    ],
    preparación: [
      'Preparar un fuego abundante con leña de espinillo y dejar hacer brasa suave.',
      'Preparar la salmuera en una botella disolviendo la sal marina en el agua tibia junto con el ajo machacado, romero y laurel.',
      'Sujetar firmemente el cordero en cruz de hierro (estaca).',
      'Clavar la estaca con inclinación de 70 grados frente a las brasas, cocinando primero del lado de las costillas durante unas 3 horas.',
      'Humedecer la carne con la salmuera periódicamente usando una ramita aromática como pincel.',
      'Girar la estaca para dorar el lado de los cuartos y cocinar por 1 hora y media más hasta que la carne esté tierna y crujiente.'
    ],
    duración: '270 min',
    dificultad: 'Difícil',
    video: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r6',
    nombre: 'Chipá Cuerito (Torta Frita Correntina)',
    categoría: 'Panificados y Dulces',
    historia: 'El chipá cuerito es la versión litoraleña de la torta frita. Se elabora amasando harina con grasa vacuna y a veces una pizca de queso criollo. Es la compañía inseparable de las tardes lluviosas correntinas, tradicionalmente frita en ollas de hierro a leña.',
    ingredientes: [
      '500g de harina de trigo común 000',
      '100g de grasa vacuna a temperatura ambiente',
      '1 huevo mediano',
      '200ml de agua tibia con sal gruesa disuelta',
      'Grasa vacuna o aceite abundante para freír'
    ],
    preparación: [
      'Colocar la harina en forma de corona en un bol y agregar la grasa vacuna y el huevo en el centro.',
      'Verter el agua salada tibia gradualmente mientras se mezcla con las manos desde el centro hacia afuera.',
      'Amasar hasta lograr un bollo homogéneo, suave y elástico. Tapar y dejar descansar 20 minutos.',
      'Dividir la masa en bollitos y estirarlos finos de forma circular con un palo de amasar, pinchando el centro con un tenedor.',
      'Freír en abundante grasa vacuna bien caliente hasta que estén infladas y doradas de ambos lados. Servir espolvoreadas con azúcar o solas con el mate.'
    ],
    duración: '30 min',
    dificultad: 'Fácil',
    video: 'https://images.unsplash.com/photo-1542362567-b07eac79094f?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r7',
    nombre: 'Sopa Correntina',
    categoría: 'Guisos y Comidas Populares',
    historia: 'Bizcochuelo salado tradicional a base de harina de maíz, cebolla caramelizada y abundante queso. Es una "sopa sólida" emblemática del nordeste argentino. Su origen se remonta a una equivocación culinaria en la cocina del palacio de gobierno a mediados del siglo XIX, cuando un cocinero agregó demasiada harina de maíz a una sopa tradicional líquida.',
    ingredientes: [
      '400g de harina de maíz (polenta de molienda fina)',
      '3 cebollas grandes cortadas en pluma',
      '4 huevos enteros',
      '500ml de leche entera',
      '150g de manteca o grasa vacuna',
      '300g de queso criollo desmenuzado',
      '1 cucharada de sal fina'
    ],
    preparación: [
      'En una sartén grande, derretir la manteca y rehogar las cebollas con sal a fuego muy bajo hasta que estén transparentes y tiernas (caramelizadas). Dejar enfriar.',
      'En un bol grande, batir los huevos enérgicamente hasta que dupliquen su volumen y queden espumosos.',
      'Incorporar la cebolla rehogada, la leche a temperatura ambiente y el queso desmenuzado al bol con los huevos.',
      'Agregar la harina de maíz en forma de lluvia, mezclando suavemente con movimientos envolventes para conservar el aire del batido.',
      'Volcar la mezcla en una fuente para horno previamente engrasada (debe quedar con una altura de unos 3 a 4 cm).',
      'Cocinar en horno medio-alto (190°C) durante 30 a 35 minutos hasta que la superficie esté dorada.'
    ],
    duración: '50 min',
    dificultad: 'Fácil',
    video: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r8',
    nombre: 'Chicharrón Trenzado',
    categoría: 'Carnes Tradicionales',
    historia: 'El chicharrón trenzado con gofio es el plato emblemático de San Luis del Palmar. Se elabora trenzando tiras de carne de matambre que luego se cocinan lentamente en su propia grasa en ollas de hierro y se rebozan con gofio dulce.',
    ingredientes: [
      '1 kg de matambre vacuno desgrasado',
      '1 taza de gofio dulce (harina de maíz tostado)',
      'Sal gruesa a gusto',
      'Agua para hervir'
    ],
    preparación: [
      'Cortar el matambre en tiras largas de unos 2 cm de ancho.',
      'Trenzar las tiras de a tres, sujetando los extremos con un palillo de madera para que no se desarme la trenza.',
      'Hervir las trenzas de carne en agua con sal durante 45 minutos hasta que estén tiernas.',
      'Escurrir las trenzas y colocarlas en una olla de hierro a fuego medio cocinándolas en su propia grasa hasta que queden doradas y crujientes.',
      'Retirar del fuego y rebozar inmediatamente las trenzas calientes en un bol con abundante gofio dulce. Servir templado.'
    ],
    duración: '90 min',
    dificultad: 'Media',
    video: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r9',
    nombre: 'Dorado a la Parrilla con Naranja',
    categoría: 'Carnes Tradicionales',
    historia: 'El dorado asado a la parrilla es el plato estelar de Paso de la Patria. El secreto correntino consiste en asar la pieza abierta en forma de libro sobre la parrilla con las escamas hacia abajo, rociándolo periódicamente con abundante jugo de naranjas frescas cosechadas en la zona.',
    ingredientes: [
      '1 dorado entero limpio, abierto en mariposa (aprox. 3 kg)',
      '4 naranjas dulces correntinas exprimidas',
      '1 limón exprimido',
      '3 dientes de ajo picados con provenzal',
      'Sal entrefina a gusto'
    ],
    preparación: [
      'Preparar un fuego medio-suave a la parrilla con leña de espinillo.',
      'Mezclar en un recipiente el jugo de naranja, limón, provenzal, ajo picado y sal entrefina para armar el adobo.',
      'Colocar el dorado sobre la parrilla con el lado de las escamas hacia abajo (hacia el fuego).',
      'Pintar abundantemente la carne del pescado con el adobo de naranja usando una ramita.',
      'Cocinar durante 40 a 45 minutos sin dar vuelta, humedeciendo la carne para que no se seque. Dar vuelta los últimos 10 minutos para dorar la superficie.'
    ],
    duración: '60 min',
    dificultad: 'Media',
    video: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&auto=format&fit=crop&q=60'
  }
];

export const FESTIVALS: Festival[] = [
  {
    id: '1',
    nombre: 'Fiesta Nacional del Chamamé',
    localidad: 'Corrientes Capital',
    ubicación: 'Anfiteatro Cocomarola, Av. Patagonia y Sarmiento. Colectivos: 102, 103.',
    fecha: 'Enero (10 días)',
    historia: 'La Fiesta Nacional del Chamamé nació en 1985 para homenajear al género musical que define el alma correntina, declarado Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO. Se celebra durante diez noches de enero, donde la danza y los acordeones se mezclan con comidas criollas para alimentar a miles de bailarines de todo el país.',
    recetaRelacionada: 'r1', // Chipá Tradicional
    galeria: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60',
    categoría: 'Música y Fogón'
  },
  {
    id: '2',
    nombre: 'Festival del Guiso de Arroz',
    localidad: 'Riachuelo',
    ubicación: 'Predio de la Sociedad Rural de Corrientes, Ruta Nacional 12, km 1015.',
    fecha: 'Septiembre',
    historia: 'El Guiso de Arroz es el plato comunitario por excelencia de Riachuelo. Desde hace más de 20 años, cocineros aficionados y profesionales de toda la provincia se dan cita a orillas del río Riachuelo con sus ollas de hierro y fogatas a leña para competir por la preparación más sabrosa. Es una festividad que resalta el arroz largo fino, principal cultivo agrícola correntino.',
    recetaRelacionada: 'r3', // Guiso de Arroz Riachuelero
    galeria: [
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=60',
    categoría: 'Ollas y Campo'
  },
  {
    id: '3',
    nombre: 'Fiesta Provincial del Chicharrón',
    localidad: 'San Luis del Palmar',
    ubicación: 'Polideportivo Municipal de San Luis del Palmar, Ruta Provincial 5.',
    fecha: 'Enero',
    historia: 'San Luis del Palmar rinde tributo a una de las facturas cárnicas más consumidas en el campo correntino: el chicharrón trenzado con gofio. Este plato ayudaba a los arrieros y peones rurales a conservar la carne en los viajes largos. El festival cuenta con peñas chamameceras, desfiles gauchos y demostraciones de destreza a caballo.',
    recetaRelacionada: 'r8', // Chicharrón Trenzado
    galeria: [
      'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop&q=60',
    categoría: 'Tradición Criolla'
  },
  {
    id: '4',
    nombre: 'Fiesta Nacional del Dorado',
    localidad: 'Paso de la Patria',
    ubicación: 'Costanera de Paso de la Patria, bajada de lanchas municipal.',
    fecha: 'Agosto',
    historia: 'La Fiesta Nacional del Dorado en Paso de la Patria es una de las competencias náuticas de pesca deportiva con devolución más emblemáticas del país. Nacida en la década de 1960, atrae pescadores de todo el mundo. En la costanera de Paso de la Patria se celebra un festival folclórico y una feria gastronómica de platos de río cocinados a fuego de leña.',
    recetaRelacionada: 'r9', // Dorado a la Parrilla con Naranja
    galeria: [
      'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&auto=format&fit=crop&q=60',
    categoría: 'Pesca y Río'
  }
];

export const MULTIMEDIA_ITEMS: MultimediaItem[] = [
  {
    id: 'p1',
    title: 'El Secreto del Almidón de Mandioca',
    artist: 'Abuela Cata de San Cosme',
    duration: '04:12',
    type: 'podcast',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400&auto=format&fit=crop&q=60',
    festivalRelacionado: '1' // Fiesta Nacional del Chamamé
  },
  {
    id: 'p2',
    title: 'El Sonido del Fuego y el Mbaipy',
    artist: 'Panchi Quevedo (Cocinero de Estero)',
    duration: '06:45',
    type: 'recipe_audio',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60',
    festivalRelacionado: '2' // Festival del Guiso de Arroz
  },
  {
    id: 'p3',
    title: 'El Gofio y el Chicharrón Trenzado',
    artist: 'Don Sosa de San Luis del Palmar',
    duration: '12:30',
    type: 'podcast',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&auto=format&fit=crop&q=60',
    festivalRelacionado: '3' // Fiesta Provincial del Chicharrón
  },
  {
    id: 'p4',
    title: 'Pescados del Paraná: Del río a la estaca',
    artist: 'Pescadores de Paso de la Patria',
    duration: '08:15',
    type: 'recipe_audio',
    image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&auto=format&fit=crop&q=60',
    festivalRelacionado: '4' // Fiesta Nacional del Dorado
  }
];

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 'q1',
    question: '¿Cuál es el ingrediente principal, libre de gluten, utilizado para elaborar la masa del Chipá tradicional?',
    options: ['Harina de trigo', 'Almidón de mandioca', 'Harina de maíz', 'Semolín'],
    correctAnswer: 1,
    explanation: 'El almidón de mandioca (extraído de la raíz de mandioca, un tubérculo nativo) es la base del chipá. Esto le da esa consistencia elástica única y lo hace libre de gluten de forma natural.'
  },
  {
    id: 'q2',
    question: '¿En qué localidad de Corrientes se realiza anualmente el famoso "Festival del Guiso de Arroz"?',
    options: ['Goya', 'Esquina', 'Riachuelo', 'Mercedes'],
    correctAnswer: 2,
    explanation: 'El Festival del Guiso de Arroz se lleva a cabo en la localidad de Riachuelo, reuniendo a cocineros de toda la región que preparan su versión del guiso en grandes ollas de hierro a leña.'
  },
  {
    id: 'q3',
    question: '¿Qué es el "Chipá Mbocá" y cómo se diferencia del chipá común?',
    options: [
      'Un chipá relleno de carne picada picante.',
      'Un chipá dulce bañado en almíbar de mamón.',
      'Un chipá cocinado a las brasas, enrollado alrededor de una caña o palo.',
      'Un chipá frito en grasa de cerdo.'
    ],
    correctAnswer: 2,
    explanation: 'El Chipá Mbocá se cocina enrollando la masa alrededor de una rama de caña o madera y haciéndolo girar sobre las brasas ardientes. Es sumamente tradicional en las fiestas de pueblo y el Chamamé.'
  },
  {
    id: 'q4',
    question: '¿Cómo se le llama a la infusión de yerba mate preparada con agua helada y hierbas medicinales aromáticas típicas?',
    options: ['Mate cocido', 'Tereré', 'Chimarrão', 'Mate dulce'],
    correctAnswer: 1,
    explanation: 'El Tereré es la bebida insignia para combatir el calor del verano correntino. Se prepara con agua helada, yerba mate y "yuyos" machacados (como menta peperina, coco, boldo, etc.).'
  },
  {
    id: 'q5',
    question: '¿Qué textura y consistencia tiene el plato típico conocido como "Sopa Correntina"?',
    options: [
      'Es un caldo líquido caliente con fideos finos.',
      'Es una crema espesa fría que se come con cuchara.',
      'Es una sopa sólida, similar a un bizcochuelo salado esponjoso.',
      'Es una salsa densa para acompañar pescados.'
    ],
    correctAnswer: 2,
    explanation: 'A pesar de llamarse sopa, es una preparación sólida. Nació de un error culinario y se convirtió en una torta salada esponjosa a base de harina de maíz, cebolla caramelizada y queso fresco.'
  }
];

export const MAP_HOTSPOTS: DepartmentHotspot[] = [
  {
    id: 'zone-1',
    name: 'Corredor Gran Corrientes',
    localDishes: ['Chipá Tradicional', 'Chicharrón Trenzado', 'Guiso de Arroz'],
    localIngredients: ['Mandioca', 'Naranja', 'Queso Criollo'],
    description: 'Zona de arraigo cultural jesuítico-guaraní. Aquí abunda la mandioca fresca y la elaboración de empanadas fritas. San Luis del Palmar aporta el legendario chicharrón y Riachuelo el guiso.',
    x: 25,
    y: 20,
    festivalesEnZona: ['1', '2', '3'] // Chamamé, Guiso de Arroz, Chicharrón
  },
  {
    id: 'zone-2',
    name: 'Corredor Alto Paraná',
    localDishes: ['Dorado a la Parrilla', 'Chupín de Surubí', 'Pacú al Horno'],
    localIngredients: ['Pescado fresco de río', 'Citrus (Limón, Naranja)', 'Batata'],
    description: 'Zona que bordea el río Paraná superior. Paso de la Patria e Ituzaingó destacan por su exquisita cocina de río, donde los grandes peces se asan enteros con jugos cítricos.',
    x: 65,
    y: 18,
    festivalesEnZona: ['4'] // Fiesta Nacional del Dorado
  },
  {
    id: 'zone-3',
    name: 'Eco-Región del Iberá (Mercedes y San Miguel)',
    localDishes: ['Mbaipy de Pollo de Campo', 'Cordero Lomeño a las Brasas', 'Guiso de Charqui'],
    localIngredients: ['Carne vacuna y ovina', 'Maíz amarillo de molienda casera', 'Charqui'],
    description: 'El corazón de la provincia y acceso a los esteros. Gastronomía campesina de ollas populares y fuegos lentos. Famosa por sus carnes asadas y su Mbaipy de maíz criollo.',
    x: 48,
    y: 52,
    festivalesEnZona: [] 
  },
  {
    id: 'zone-4',
    name: 'Corredor de la Costa del Uruguay',
    localDishes: ['Feijoada Litoraleña', 'Arroz con Pollo en Disco de Arado', 'Dulce de Mamón en Almíbar'],
    localIngredients: ['Arroz largo fino', 'Yerba Mate', 'Frutas tropicales (Mamón, Guayaba)'],
    description: 'Frontera e intercambio cultural con Brasil. Gran zona productora de arroz y yerba mate. Se destacan las preparaciones con arroz y postres artesanales de frutos en almíbar.',
    x: 75,
    y: 70,
    festivalesEnZona: [] 
  }
];
export default RECIPES;
