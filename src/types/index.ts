export interface Recipe {
  id: string;
  nombre: string;
  historia: string;
  ingredientes: string[];
  preparación: string[];
  duración: string;
  dificultad: 'Fácil' | 'Media' | 'Difícil';
  video?: string;
  audioTrackId?: string;
  categoría:
    | 'Carnes Tradicionales'
    | 'Sabores Guaraníes'
    | 'Guisos y Comidas Populares'
    | 'Frutas y Productos Naturales'
    | 'Panificados y Dulces';
}

export interface Festival {
  id: string;
  nombre: string;
  localidad: string;
  ubicación: string;
  fecha: string;
  historia: string;
  recetaRelacionada?: string; // Links to Recipe ID
  galeria: string[];
  video: string; // Video player thumbnail mock
  categoría: string;
  productoDestacado: string;
  descripcionCorta: string;
  rutaGastronomica: 'Carnes Tradicionales' | 'Herencia Guaraní' | 'Sabores Naturales';
  latitud?: number;
  longitud?: number;
}

export interface MultimediaItem {
  id: string;
  title: string;
  artist: string;
  duration: string;
  type: 'podcast' | 'recipe_audio';
  image: string;
  audioUrl?: string;
  festivalRelacionado?: string; // Links to Festival ID
}

export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  instructor: string;
  thumbnail: string;
  description: string;
  festivalRelacionado?: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  url: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct answer
  explanation: string;
  image?: string;
}

export interface DepartmentHotspot {
  id: string;
  name: string;
  localDishes: string[];
  localIngredients: string[];
  description: string;
  x: number; // Percentual position on mock map grid (0-100)
  y: number; // Percentual position on mock map grid (0-100)
  festivalesEnZona: string[]; // List of Festival IDs
}

// Database Row DTOs (Supabase Mapping)
export interface RecipeIngredientRow {
  ingredient_name: string;
  display_order?: number;
}

export interface RecipeStepRow {
  step_number?: number;
  instruction_text: string;
}

export interface RecipeRow {
  id: string;
  recipe_code?: string;
  nombre: string;
  categoría: string;
  dificultad: string;
  tiempo_preparacion_min: number;
  porciones?: number;
  historia: string;
  video?: string;
  imagen_banner?: string;
  recipe_ingredients?: RecipeIngredientRow[];
  recipe_steps?: RecipeStepRow[];
}

export interface FestivalMediaRow {
  url: string;
  display_order?: number;
}

export interface FestivalRow {
  id: string;
  nombre: string;
  localidad: string;
  ubicacion?: string;
  fecha_celebracion?: string;
  historia: string;
  categoria?: string;
  producto_destacado?: string;
  descripcion_corta?: string;
  ruta_gastronomica?: string;
  latitud?: number;
  longitud?: number;
  video_url?: string;
  festival_media?: FestivalMediaRow[];
}

export interface TriviaOptionRow {
  option_index: number;
  option_text: string;
  is_correct?: boolean;
}

export interface TriviaQuestionRow {
  id: string;
  question: string;
  explanation: string;
  image_url?: string;
  trivia_options: TriviaOptionRow[];
}

export interface DepartmentHotspotRow {
  id: string;
  name: string;
  description: string;
  dishes?: string[];
  ingredients?: string[];
  grid_x?: number;
  grid_y?: number;
  festivals?: string[];
}

export default Recipe;
