export type UserRole = 'user' | 'editor' | 'admin';

export interface DbProfile {
  id: string;
  email: string | null;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  xp: number;
  level_title: string;
  created_at: string;
  updated_at: string;
}

export interface DbRecipe {
  id: string;
  recipe_code: string;
  title: string;
  category_id: string | null;
  category_name: string;
  story: string;
  duration_display: string;
  duration_min: number;
  difficulty: string;
  video_url: string | null;
  audio_track_id: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbFestival {
  id: string;
  festival_code: string;
  name: string;
  location: string;
  department: string;
  date_display: string;
  history: string;
  featured_product: string;
  gastronomic_route: string;
  related_recipe_id: string | null;
  related_recipe_code: string | null;
  video_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbMultimedia {
  id: string;
  item_code: string;
  title: string;
  artist: string;
  duration: string;
  type: 'podcast' | 'recipe_audio' | 'video';
  image_url: string;
  audio_url: string | null;
  related_festival_code: string | null;
  is_published: boolean;
  created_at: string;
}

export interface DbTriviaQuestion {
  id: string;
  question_code: string;
  difficulty: 'Fácil' | 'Media' | 'Difícil';
  question: string;
  explanation: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface DbTriviaAnswer {
  id: string;
  question_id: string;
  option_index: number;
  option_text: string;
}

export interface DbAuditLog {
  id: string;
  user_id: string | null;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  resource_table: string;
  resource_id: string | null;
  metadata: Record<string, any>;
  timestamp: string;
}
