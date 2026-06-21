export interface Recipe {
  id: string;
  nombre: string;
  historia: string;
  ingredientes: string[];
  preparación: string[];
  duración: string;
  dificultad: 'Fácil' | 'Media' | 'Difícil';
  video?: string;
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

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct answer
  explanation: string;
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
export default Recipe;
