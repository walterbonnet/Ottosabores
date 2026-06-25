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
      'Volcar esta mezcla en la olla con la carne and los vegetales, revolviendo constantemente con una cuchara de madera.',
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
    historia: 'El cordero de la zona de Mercedes y Lomas de Vallejos se destaca por su sabor singular debido a los pastizales naturales de la zona. Se cocina tradicionalmente a la estaca o a la parrilla, rociado con salmuera de ajo y hierbas locales.',
    ingredientes: [
      '1 cordero entero limpio (aprox. 8 a 10 kg)',
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
  },
  {
    id: 'r10',
    nombre: 'Búfalo a la Estaca',
    categoría: 'Carnes Tradicionales',
    historia: 'La carne de búfalo es una alternativa saludable y muy popular en el norte de Corrientes, particularmente en Caá Catí. Su cocción lenta a la estaca ablanda sus fibras firmes y realza un sabor intenso único, rociada constantemente con una salmuera de hierbas del monte.',
    ingredientes: [
      '1 costillar entero de búfalo (aprox. 5 a 6 kg)',
      '1 cabeza de ajo machado',
      'Sal marina gruesa a gusto',
      'Laurel, orégano silvestre y tomillo',
      '1 litro de agua tibia para la salmuera'
    ],
    preparación: [
      'Hacer un buen fuego con leña dura de la zona y preparar brasas abundantes.',
      'Disolver la sal gruesa en agua tibia junto al ajo machacado y las hierbas en una botella perforada para la salmuera.',
      'Asegurar el costillar a la estaca de hierro y clavarla inclinada hacia el fuego.',
      'Asar despacio durante 4 horas del lado del hueso, rociando con salmuera cada 20 minutos.',
      'Dar vuelta y terminar de cocinar del lado de la carne por 1 hora hasta dorar.'
    ],
    duración: '300 min',
    dificultad: 'Difícil',
    video: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r11',
    nombre: 'Lechón Artesanal al Horno de Barro',
    categoría: 'Carnes Tradicionales',
    historia: 'El lechón artesanal cocinado en horno de barro con leña de espinillo es un manjar de festividades familiares y regionales de Pago de los Deseos. Las técnicas tradicionales aseguran un cuero crocante (el "cuerito") y una carne tierna y sabrosa.',
    ingredientes: [
      '1 lechón de 6 a 8 kg limpio y abierto',
      'Jugo de 4 limones y 2 naranjas agrias',
      '6 dientes de ajo machacados',
      'Pimienta negra molida, sal gruesa y ají molido a gusto',
      'Aceite de girasol para untar el cuero'
    ],
    preparación: [
      'Calentar bien el horno de barro con leña aromática hasta que las paredes estén blancas y no quede humo.',
      'Frotar todo el lechón con el jugo de cítricos, sal gruesa, ajo machacado y condimentos.',
      'Pintar la parte del cuero con un poco de aceite de girasol (esto ayuda a lograr el crocante).',
      'Colocar en una asadera grande con el cuero hacia arriba y meter al horno de barro precalentado.',
      'Cerrar herméticamente la boca del horno y cocinar por 3 a 3.5 horas sin abrir hasta que el cuero esté bien dorado y crujiente.'
    ],
    duración: '240 min',
    dificultad: 'Media',
    video: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r12',
    nombre: 'Asado Criollo con Salmuera de Campo',
    categoría: 'Carnes Tradicionales',
    historia: 'El asado criollo a la parrilla representa el punto de encuentro de las familias correntinas en Empedrado. Los cortes típicos como la tira de asado, vacío y matambre se cocinan lentamente con leña de espinillo y se sazonan con una salmuera tibia especial con ajo y laurel.',
    ingredientes: [
      '2 kg de costillar vacuno de corte ancho',
      '1.5 kg de vacío de ternera',
      'Sal gruesa a gusto',
      '1 taza de agua tibia',
      '2 dientes de ajo picados, hojas de laurel'
    ],
    preparación: [
      'Encender el fuego con leña y extender una cama de brasas uniforme bajo la parrilla.',
      'Colocar las tiras de asado y el vacío con los huesos y la parte más gruesa hacia abajo.',
      'Preparar la salmuera mezclando agua tibia, sal gruesa, ajo y laurel en un frasco.',
      'Pincelar la carne periódicamente con la salmuera tibia durante la cocción.',
      'Cocinar a fuego moderado durante 1.5 horas del primer lado, dar vuelta y dorar por 30 minutos más.'
    ],
    duración: '120 min',
    dificultad: 'Fácil',
    video: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r13',
    nombre: 'Mbejú Tradicional',
    categoría: 'Sabores Guaraníes',
    historia: 'El Mbejú es un pan plano frito o tostado a base de almidón de mandioca, harina de maíz y abundante queso criollo. De origen guaraní, es uno de los platos más antiguos y calóricos de la región, consumido habitualmente en el desayuno o la merienda acompañado de cocido quemado.',
    ingredientes: [
      '400g de almidón de mandioca',
      '100g de harina de maíz fina',
      '150g de manteca o grasa de cerdo',
      '250g de queso criollo semiduro desmenuzado',
      '1 cucharadita de sal fina',
      '50-80ml de leche fría (según necesidad)'
    ],
    preparación: [
      'En un bol, desmenuzar la grasa o manteca junto con el almidón, la harina de maíz, la sal y el queso usando la punta de los dedos hasta formar un arenado húmedo (sin amasar).',
      'Agregar la leche muy de a poco, mezclando suavemente para mantener la textura suelta de migas gruesas.',
      'Calentar una sartén antiadherente (o con un toque de grasa) a fuego medio.',
      'Esparcir una capa del arenado en la sartén caliente sin aplastar demasiado, formando un disco de 1 cm de espesor.',
      'Cocinar por 3 minutos hasta que los bordes se unan y dore, dar vuelta con la ayuda de un plato y dorar del otro lado por 2 minutos más.'
    ],
    duración: '20 min',
    dificultad: 'Fácil',
    video: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r14',
    nombre: 'Mandioca Frita Litoraleña',
    categoría: 'Sabores Guaraníes',
    historia: 'La mandioca es el acompañamiento fundamental de la mesa correntina, reemplazando al pan en casi todas las comidas tradicionales. Hervida primero para lograr una textura blanda y luego frita en abundante grasa o aceite, adquiere un exterior dorado sumamente crujiente e irresistible.',
    ingredientes: [
      '1 kg de mandiocas frescas tiernas',
      'Sal gruesa a gusto para el hervor',
      'Abundante aceite de girasol o grasa para freír'
    ],
    preparación: [
      'Pelar las mandiocas retirando la cáscara marrón gruesa y la película rosada interior.',
      'Cortar en trozos medianos de unos 8-10 cm de largo.',
      'Hervir en abundante agua con sal gruesa durante 25 a 30 minutos hasta que estén tiernas y comiencen a abrirse en las puntas. Escurrir bien y dejar enfriar.',
      'Retirar la fibra central leñosa de cada trozo y cortarlas en bastones.',
      'Freír en aceite o grasa bien caliente hasta que estén perfectamente doradas y crocantes. Servir con sal fina.'
    ],
    duración: '45 min',
    dificultad: 'Fácil',
    video: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r15',
    nombre: 'Miel de Monte y Yuyos',
    categoría: 'Frutas y Productos Naturales',
    historia: 'La miel de monte correntina destaca por sus matices multiflorales y silvestres. Utilizada desde la antigüedad por los guaraníes, se consume sola, para endulzar infusiones tradicionales como el cocido quemado, o en la elaboración de postres y jarabes medicinales caseros mezclados con yuyos locales.',
    ingredientes: [
      '500g de miel pura de monte',
      'Hojas de menta silvestre, boldo y cedrón',
      'Cáscaras secas de naranja de campo'
    ],
    preparación: [
      'Colocar la miel pura en un frasco de vidrio limpio.',
      'Incorporar las hierbas seleccionadas (previamente lavadas y bien secas) y las cáscaras de naranja.',
      'Cerrar el frasco herméticamente y dejar macerar en un lugar fresco y oscuro durante al menos 15 días antes de consumir.',
      'Utilizar como endulzante natural o para acompañar postres típicos.'
    ],
    duración: '10 min',
    dificultad: 'Fácil',
    video: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r16',
    nombre: 'Mermelada Artesanal de Mango',
    categoría: 'Frutas y Productos Naturales',
    historia: 'Los árboles de mango tapizan las veredas y patios de Santa Ana de los Guácaras en el verano. Esta mermelada es el método artesanal por excelencia para aprovechar la enorme abundancia de esta sabrosa fruta tropical, logrando una conserva dulce y aromática ideal para panificados.',
    ingredientes: [
      '1.5 kg de pulpa de mangos maduros de la zona',
      '750g de azúcar blanca',
      'Jugo de 1 limón mediano',
      '1 ramita de canela (opcional)'
    ],
    preparación: [
      'Pelar los mangos y cortar la pulpa en trozos pequeños descartando el carozo fibroso.',
      'Colocar la pulpa en una olla de fondo grueso junto con el azúcar, el jugo de limón y la canela.',
      'Mezclar bien y dejar reposar durante 30 minutos para que la fruta suelte sus jugos.',
      'Llevar a fuego medio hasta romper el hervor, luego bajar el fuego al mínimo y cocinar revolviendo con cuchara de madera regularmente.',
      'Cocinar por 45 a 60 minutos hasta obtener una consistencia espesa. Retirar la canela y envasar en caliente en frascos esterilizados.'
    ],
    duración: '90 min',
    dificultad: 'Fácil',
    video: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r17',
    nombre: 'Clericó de Sandía Esquinense',
    categoría: 'Frutas y Productos Naturales',
    historia: 'La sandía de Esquina es célebre por su frescura y dulzura incomparables. Este refrescante clericó es una preparación tradicional de verano que combina la sandía jugosa con frutas de estación y vinos locales para combatir las altas temperaturas litoraleñas.',
    ingredientes: [
      '1 sandía mediana bien dulce de Esquina',
      '1 metro de vino blanco dulce o sidra bien fría',
      '2 naranjas picadas y frutillas de estación',
      '4 cucharadas de azúcar blanca común',
      'Hielo picado abundante y hojas de menta'
    ],
    preparación: [
      'Cortar la parte superior de la sandía para usarla como contenedor o ahuecarla con cuidado.',
      'Extraer la pulpa roja de la sandía retirando la mayor cantidad de semillas posible y cortarla en cubitos.',
      'Colocar los cubitos en el interior ahuecado de la sandía o en una jarra grande, junto con las naranjas y frutillas picadas.',
      'Espolvorear el azúcar y verter el vino blanco o la sidra.',
      'Llevar a la heladera durante al menos 1 hora para macerar los sabores. Servir bien frío con hielo picado y menta.'
    ],
    duración: '20 min',
    dificultad: 'Fácil',
    video: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r18',
    nombre: 'Licor Artesanal de Yatay',
    categoría: 'Frutas y Productos Naturales',
    historia: 'El yatay es el fruto de la palmera nativa *Butia yatay*, muy abundante en el sur correntino (Mantilla). Este licor artesanal rescata un saber ancestral que aprovecha el fruto maduro de la palmera, de sabor ácido y dulce, para elaborar una bebida espirituosa muy apreciada.',
    ingredientes: [
      '1 kg de frutos maduros de Yatay limpios',
      '1 litro de alcohol etílico de uso alimentario (96°)',
      '1 litro de agua y 800g de azúcar blanca (para el almíbar)'
    ],
    preparación: [
      'Lavar muy bien los frutos de yatay retirando la parte fibrosa exterior y colocarlos en un botellón grande de vidrio.',
      'Cubrir por completo los frutos con el alcohol, tapar herméticamente y dejar macerar en un sitio oscuro durante 40 días.',
      'Preparar un almíbar disolviendo el azúcar en agua a fuego suave hasta que hierva por 5 minutos. Dejar enfriar por completo.',
      'Filtrar el alcohol macerado con los frutos de yatay usando un lienzo fino o filtro de café.',
      'Mezclar el alcohol filtrado con el almíbar frío, embotellar y dejar estacionar al menos 15 días antes de degustar.'
    ],
    duración: '60 min',
    dificultad: 'Media',
    video: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'r19',
    nombre: 'Dulce de Batata Casero',
    categoría: 'Frutas y Productos Naturales',
    historia: 'La batata producida en las chacras de Tres de Abril tiene una cremosidad y dulzura excepcionales. El dulce de batata casero es el postre tradicional de la mesa familiar, consumido habitualmente en rodajas acompañado de queso criollo correntino (el clásico postre "vigilante").',
    ingredientes: [
      '1 kg de batatas peladas de la zona',
      '800g de azúcar blanca',
      '1 chaucha de vainilla',
      '15g de gelatina sin sabor o agar-agar',
      'Agua en cantidad necesaria'
    ],
    preparación: [
      'Hervir las batatas peladas y cortadas en cubos hasta que estén bien tiernas. Escurrir y pisarlas hasta obtener un puré liso y sin grumos.',
      'En una olla, cocinar el azúcar con media taza de agua y la vainilla hasta lograr un almíbar espeso.',
      'Incorporar el puré de batatas al almíbar caliente, mezclando constantemente a fuego mínimo con cuchara de madera por 20 minutos.',
      'Disolver la gelatina en un poquito de agua tibia y añadirla al puré de batata revolviendo enérgicamente.',
      'Volcar la mezcla en un molde previamente humedecido o forrado con papel film, alisar la superficie y refrigerar por 6 horas antes de desmoldar.'
    ],
    duración: '90 min',
    dificultad: 'Media',
    video: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=60'
  }
];

export const FESTIVALS: Festival[] = [
  {
    id: '1',
    nombre: 'Fiesta Provincial del Búfalo',
    localidad: 'Caá Catí',
    ubicación: 'Predio de la Sociedad Rural de Caá Catí, Ruta Provincial 5. Autobuses locales desde terminal.',
    fecha: 'Noviembre',
    historia: 'Esta festividad celebra el creciente desarrollo y la cría del búfalo en el norte de Corrientes. Caá Catí se viste de fiesta para recibir a productores y familias que disfrutan de demostraciones de destreza gaucha, peñas de chamamé y una inmensa feria culinaria donde la carne de búfalo es la estrella indiscutida en empanadas, asados y guisados.',
    recetaRelacionada: 'r10',
    galeria: [
      'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop&q=60',
    categoría: 'Carnes Tradicionales',
    productoDestacado: 'Búfalo',
    descripcionCorta: 'Disfrutá de los mejores cortes de carne de búfalo cocinados a la estaca por expertos asadores camperos.',
    rutaGastronomica: 'Carnes Tradicionales'
  },
  {
    id: '2',
    nombre: 'Fiesta del Cordero Mercedeño',
    localidad: 'Mercedes',
    ubicación: 'Predio de la Sociedad Rural de Mercedes, Ruta Nacional 123. Acceso en automóvil y micros de larga distancia.',
    fecha: 'Enero',
    historia: 'El cordero de Mercedes es famoso en toda la Patagonia y el Litoral argentino por el particular sabor de la carne, alimentada en pastizales naturales únicos del Iberá. Anualmente, la Fiesta del Cordero rinde homenaje a los trabajadores rurales con una multitudinaria competencia de asadores a la estaca, ferias artesanales y espectáculos artísticos chamameceros.',
    recetaRelacionada: 'r5',
    galeria: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
    categoría: 'Carnes Tradicionales',
    productoDestacado: 'Cordero Mercedeño',
    descripcionCorta: 'Tradicional asado de cordero a la estaca rociado con salmuera de romero y ajo, un manjar criollo del Iberá.',
    rutaGastronomica: 'Carnes Tradicionales'
  },
  {
    id: '3',
    nombre: 'Fiesta Provincial del Lechón Artesanal',
    localidad: 'Pago de los Deseos',
    ubicación: 'Polideportivo Municipal Pago de los Deseos, Ruta Provincial 13.',
    fecha: 'Diciembre',
    historia: 'Un homenaje directo a la producción porcina artesanal del centro de la provincia de Corrientes. En esta fiesta popular, los pequeños productores exponen sus mejores lechones, que luego son cocinados a fuego lento en hornos de barro o a la parrilla para deleite de miles de comensales que se reúnen bajo la sombra de los algarrobos.',
    recetaRelacionada: 'r11',
    galeria: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
    categoría: 'Carnes Tradicionales',
    productoDestacado: 'Lechón Artesanal',
    descripcionCorta: 'Exquisitos lechones asados a fuego lento en hornos de barro tradicionales con aroma a leña de espinillo.',
    rutaGastronomica: 'Carnes Tradicionales'
  },
  {
    id: '4',
    nombre: 'Festival del Asado Criollo',
    localidad: 'Empedrado',
    ubicación: 'Camping Municipal Gerónimo Sand, Costanera de Empedrado. Colectivos de media distancia.',
    fecha: 'Octubre',
    historia: 'A orillas del imponente río Paraná y rodeado de las barrancas de Empedrado, este festival reúne a los mejores parrilleros y asadores de la región para competir por el gran título. Con fogones a leña viva esparcidos en la costa, se cocinan costillares vacunos, vacíos y chinchulines, acompañados de música litoraleña en vivo.',
    recetaRelacionada: 'r12',
    galeria: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
    categoría: 'Carnes Tradicionales',
    productoDestacado: 'Asado Criollo',
    descripcionCorta: 'Grandes costillares vacunos dorados lentamente a las brasas con leña seleccionada y adobo tradicional.',
    rutaGastronomica: 'Carnes Tradicionales'
  },
  {
    id: '5',
    nombre: 'Fiesta Nacional del Chipá',
    localidad: 'Santa Rosa',
    ubicación: 'Complejo Polideportivo Municipal de Santa Rosa, Ruta Nacional 118.',
    fecha: 'Enero',
    historia: 'Santa Rosa es una de las cunas de la elaboración artesanal e industrial del chipá en Corrientes. Su festival nacional rinde homenaje a las familias panificadoras tradicionales que conservan la receta heredada de los guaraníes, elaborando el chipá con el mejor almidón de mandioca de sus plantaciones y quesos locales.',
    recetaRelacionada: 'r1',
    galeria: [
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=60',
    categoría: 'Herencia Guaraní',
    productoDestacado: 'Chipá',
    descripcionCorta: 'Celebración y degustación del pan emblemático correntino elaborado con almidón de mandioca y queso.',
    rutaGastronomica: 'Herencia Guaraní'
  },
  {
    id: '6',
    nombre: 'Fiesta Provincial del Chipacuerito',
    localidad: 'Tabay',
    ubicación: 'Plaza Central de Tabay, Corrientes. Acceso por Ruta Provincial 6.',
    fecha: 'Julio',
    historia: 'El chipacuerito es la torta frita con sello correntino. Su festival en Tabay convoca a cientos de familias que compiten en grandes ollas de hierro a leña por preparar la masa más esponjosa y el frito más seco. Es la comida de campo tradicional que alegra los días fríos del litoral argentino.',
    recetaRelacionada: 'r6',
    galeria: [
      'https://images.unsplash.com/photo-1542362567-b07eac79094f?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1542362567-b07eac79094f?w=600&auto=format&fit=crop&q=60',
    categoría: 'Herencia Guaraní',
    productoDestacado: 'Chipacuerito',
    descripcionCorta: 'La clásica torta frita correntina en grasa vacuna. La compañía perfecta de un buen mate chamamecero.',
    rutaGastronomica: 'Herencia Guaraní'
  },
  {
    id: '7',
    nombre: 'Festival del Mbejú y el Mbaipy',
    localidad: 'El Sombrero',
    ubicación: 'Predio del Mbaipy y la Tradición, Ruta Nacional 12, km 1024.',
    fecha: 'Septiembre',
    historia: 'El Sombrero reúne anualmente a miles de comensales en torno a dos comidas guaraníes de fuerte arraigo invernal: el Mbaipy (crema espesa de maíz con quesos y carnes) y el Mbejú (pan plano de almidón y queso tostado). Cocineros de toda la provincia compiten cocinando en gigantescas ollas de hierro y sartenes a fuego de leña.',
    recetaRelacionada: 'r2',
    galeria: [
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=60',
    categoría: 'Herencia Guaraní',
    productoDestacado: 'Mbejú y Mbaipy',
    descripcionCorta: 'Ancestrales preparaciones calientes a base de harina de maíz y almidón de mandioca con queso criollo.',
    rutaGastronomica: 'Herencia Guaraní'
  },
  {
    id: '8',
    nombre: 'Fiesta Provincial de la Mandioca',
    localidad: 'Gobernador Virasoro',
    ubicación: 'Gimnasio Municipal de Gobernador Virasoro, Ruta Nacional 14. Autobuses interurbanos diarios.',
    fecha: 'Julio',
    historia: 'La mandioca es el tubérculo sagrado y la base del sustento alimenticio guaraní en todo el litoral. Virasoro le rinde homenaje con esta fiesta popular que expone los mejores cultivos del año de las chacras de la región, complementada con muestras culinarias que van desde la simple mandioca hervida y frita hasta sofisticados postres.',
    recetaRelacionada: 'r14',
    galeria: [
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=60',
    categoría: 'Herencia Guaraní',
    productoDestacado: 'Mandioca',
    descripcionCorta: 'Homenaje al cultivo estrella de las chacras correntinas, base de toda la comida tradicional de la región.',
    rutaGastronomica: 'Herencia Guaraní'
  },
  {
    id: '9',
    nombre: 'Fiesta del Almidón Artesanal',
    localidad: 'San Cosme',
    ubicación: 'Plaza Bartolomé Mitre, San Cosme. Colectivos urbanos desde Corrientes Capital.',
    fecha: 'Junio',
    historia: 'En San Cosme, las familias artesanas demuestran de generación en generación cómo extraer el almidón puro de mandioca rallando las raíces en ralladores tradicionales de chapa y lavándolas en tamices de lienzo. El festival celebra este insumo imprescindible con muestras de cocina en vivo de chipas, mbejú y dulces regionales.',
    recetaRelacionada: 'r13',
    galeria: [
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=60',
    categoría: 'Herencia Guaraní',
    productoDestacado: 'Almidón Artesanal',
    descripcionCorta: 'Demostración del proceso artesanal de extracción del almidón de mandioca y su uso culinario tradicional.',
    rutaGastronomica: 'Herencia Guaraní'
  },
  {
    id: '10',
    nombre: 'Fiesta Provincial de la Miel',
    localidad: 'Saladas',
    ubicación: 'Complejo Turístico Municipal de Saladas, Ruta Provincial 13.',
    fecha: 'Noviembre',
    historia: 'Saladas rinde tributo a la labor apícola regional con la Fiesta de la Miel. La zona, rica en montes nativos y flores silvestres, produce una miel oscura y aromática muy valorada. El festival ofrece degustaciones de mieles puras, concursos de platos dulces y salados que incorporan la miel, y espectáculos musicales chamameceros en el anfiteatro municipal.',
    recetaRelacionada: 'r15',
    galeria: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=60',
    categoría: 'Sabores Naturales',
    productoDestacado: 'Miel',
    descripcionCorta: 'Degustación y venta de mieles multiflorales extraídas directamente de los montes nativos correntinos.',
    rutaGastronomica: 'Sabores Naturales'
  },
  {
    id: '11',
    nombre: 'Fiesta Provincial del Mango',
    localidad: 'Santa Ana de los Guácaras',
    ubicación: 'Polideportivo Municipal de Santa Ana, Corrientes. Acceso por Ruta Provincial 43.',
    fecha: 'Enero',
    historia: 'Santa Ana de los Guácaras se caracteriza por sus calles de tierra con frondosos e históricos árboles de mango. Cada verano, la Fiesta del Mango celebra la enorme cosecha de este fruto exótico y dorado con una gran feria gastronómica de jugos naturales, licores, tartas dulces, empanadas agridulces y conservas artesanales en almíbar.',
    recetaRelacionada: 'r16',
    galeria: [
      'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=60',
    categoría: 'Sabores Naturales',
    productoDestacado: 'Mango',
    descripcionCorta: 'Frescos dulces, helados, mermeladas y platos dulces a base del mango cosechado en los antiguos patios locales.',
    rutaGastronomica: 'Sabores Naturales'
  },
  {
    id: '12',
    nombre: 'Fiesta Provincial de la Sandía',
    localidad: 'Esquina',
    ubicación: 'Predio de la Costanera de Esquina, bajada de lanchas. Ruta Nacional 12.',
    fecha: 'Diciembre',
    historia: 'Esquina es una gran zona de producción de sandías de primicia en la Argentina, cosechando frutos sumamente dulces y jugosos. El festival premia anualmente a los productores que presentan los ejemplares más pesados y dulces de la cosecha de verano. Hay desfiles de carrozas, ferias artesanales de postres frescos y peñas folclóricas.',
    recetaRelacionada: 'r17',
    galeria: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=60',
    categoría: 'Sabores Naturales',
    productoDestacado: 'Sandía',
    descripcionCorta: 'Disfrutá de refrescantes postres, jugos y el tradicional clericó elaborados con sandías esquinenses gigantes.',
    rutaGastronomica: 'Sabores Naturales'
  },
  {
    id: '13',
    nombre: 'Fiesta del Yatay',
    localidad: 'Mantilla',
    ubicación: 'Predio del Ferrocarril, Mantilla. Acceso por Ruta Nacional 12 y Ruta Provincial 100.',
    fecha: 'Febrero',
    historia: 'Mantilla rinde tributo a las palmeras yatay, un elemento identitario del paisaje y la cultura correntina. Los frutos del yatay, de un sabor agridulce muy particular, se cosechan en el verano para elaborar artesanalmente licores espirituosos, jaleas, dulces espesos en almíbar y vinagres saborizados muy apreciados en la cocina regional.',
    recetaRelacionada: 'r18',
    galeria: [
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=60',
    categoría: 'Sabores Naturales',
    productoDestacado: 'Yatay',
    descripcionCorta: 'Artesanales licores, conservas en almíbar y dulces tradicionales de yatay elaborados en base a recetas históricas.',
    rutaGastronomica: 'Sabores Naturales'
  },
  {
    id: '14',
    nombre: 'Fiesta Provincial de la Batata',
    localidad: 'Tres de Abril',
    ubicación: 'Paraje Tres de Abril, Departamento de Bella Vista. Colectivos locales e interurbanos.',
    fecha: 'Abril',
    historia: 'Tres de Abril es el epicentro de la producción hortícola de batatas dulces de Corrientes. En esta fiesta regional, las familias productoras exponen sus batatas blancas y coloradas de sabor dulce incomparable. Se realiza una gran cena comunitaria con platos salados que incorporan la batata, asados criollos y excelentes dulces caseros en almíbar.',
    recetaRelacionada: 'r19',
    galeria: [
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60'
    ],
    video: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=60',
    categoría: 'Sabores Naturales',
    productoDestacado: 'Batata',
    descripcionCorta: 'Tradicionales postres dulces en almíbar, pasteles y purés elaborados con la batata dulce correntina.',
    rutaGastronomica: 'Sabores Naturales'
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
    festivalRelacionado: '9' // Fiesta del Almidón Artesanal
  },
  {
    id: 'p2',
    title: 'El Sonido del Fuego y el Mbaipy',
    artist: 'Panchi Quevedo (Cocinero de Estero)',
    duration: '06:45',
    type: 'recipe_audio',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60',
    festivalRelacionado: '7' // Festival del Mbejú y el Mbaipy
  },
  {
    id: 'p3',
    title: 'El Asado Criollo y sus Secretos',
    artist: 'Don Sosa de Empedrado',
    duration: '12:30',
    type: 'podcast',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&auto=format&fit=crop&q=60',
    festivalRelacionado: '4' // Festival del Asado Criollo
  },
  {
    id: 'p4',
    title: 'El Cordero Mercedeño a las Brasas',
    artist: 'Cocineros de Mercedes',
    duration: '08:15',
    type: 'recipe_audio',
    image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&auto=format&fit=crop&q=60',
    festivalRelacionado: '2' // Fiesta del Cordero Mercedeño
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
    question: '¿En qué localidad de Corrientes se realiza anualmente el famoso "Festival del Mbaipy"?',
    options: ['Goya', 'Esquina', 'El Sombrero', 'Mercedes'],
    correctAnswer: 2,
    explanation: 'El Festival del Mbaipy se lleva a cabo en la localidad de El Sombrero, reuniendo a cocineros de toda la región que preparan su versión del guiso en grandes ollas de hierro a leña.'
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
    localDishes: ['Asado Criollo', 'Chipacuerito', 'Mbejú', 'Almidón Artesanal'],
    localIngredients: ['Mandioca', 'Naranja', 'Queso Criollo'],
    description: 'Zona de arraigo cultural jesuítico-guaraní. Aquí abunda la mandioca fresca y la elaboración de empanadas fritas. San Luis del Palmar aporta el legendario chicharrón y El Sombrero el mbaipy.',
    x: 25,
    y: 20,
    festivalesEnZona: ['4', '6', '7', '9'] // Asado Criollo, Chipacuerito, Mbejú y Mbaipy, Almidón Artesanal
  },
  {
    id: 'zone-2',
    name: 'Corredor Alto Paraná',
    localDishes: ['Búfalo a la Estaca', 'Mermelada de Mango'],
    localIngredients: ['Carne de Búfalo', 'Mango fresco', 'Pescado fresco de río', 'Citrus (Limón, Naranja)'],
    description: 'Zona que bordea el río Paraná superior. Caá Catí destaca por su cría y cocina de Búfalo y Santa Ana por su enorme producción y dulces de Mango.',
    x: 65,
    y: 18,
    festivalesEnZona: ['1', '11'] // Búfalo, Mango
  },
  {
    id: 'zone-3',
    name: 'Eco-Región del Iberá (Mercedes y San Miguel)',
    localDishes: ['Cordero Mercedeño a las Brasas', 'Lechón Artesanal', 'Miel de Monte'],
    localIngredients: ['Carne ovina y porcina', 'Miel de monte silvestre', 'Charqui'],
    description: 'El corazón de la provincia y acceso a los esteros. Gastronomía campesina de ollas populares y fuegos lentos. Famosa por su Cordero Mercedeño y el Lechón asado al horno de barro.',
    x: 48,
    y: 52,
    festivalesEnZona: ['2', '3', '10', '14'] // Cordero, Lechón, Miel, Batata
  },
  {
    id: 'zone-4',
    name: 'Corredor de la Costa del Uruguay',
    localDishes: ['Chipá Tradicional', 'Mandioca Frita', 'Clericó de Sandía', 'Licor de Yatay'],
    localIngredients: ['Almidón de Mandioca', 'Sandía de Esquina', 'Fruto de Yatay', 'Yerba Mate'],
    description: 'Frontera e intercambio cultural. Gran zona de producción de arroz, sandías de Esquina y frutos de palmera Yatay en Mantilla.',
    x: 75,
    y: 70,
    festivalesEnZona: ['5', '8', '12', '13'] // Chipá, Mandioca, Sandía, Yatay
  }
];

export default RECIPES;
