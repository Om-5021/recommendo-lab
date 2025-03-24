// Type definitions for database tables

export interface Course {
  id?: string;
  course_id: number; // Standardizing to number format based on Supabase structure
  title?: string;
  course_title: string; // Actual field in Supabase
  description?: string;
  instructor?: string;
  thumbnail?: string;
  duration?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | string; // Making level more flexible
  category?: string;
  rating?: number;
  enrollments?: number;
  tags?: string[];
  preview?: string | null;
  created_at?: string;
  progress?: number; // Added optional progress property
  // Backend specific fields
  subject?: string;
  url?: string;
  price?: string;
  num_lectures?: number;
  num_subscribers?: number;
  num_reviews?: number;
  is_paid?: boolean;
  content_duration?: number;
  published_timestamp?: string;
}

export interface CourseVideo {
  id: string;
  course_id: number; // Standardizing to number format based on Supabase structure
  title?: string;
  description?: string;
  video_url?: string;
  duration?: string;
  order_index?: number;
  created_at?: string;
  // Include only the fields that are actually in the database
  course_title?: string | null;
  subject?: string | null;
  url?: string | null;
}

export interface UserProgress {
  courseId: string;
  progress: number;
  lastAccessed: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface LearningPathStep {
  id: string;
  learning_path_id: string;
  course_id: string;
  step_order: number;
  created_at: string;
  course?: Course;
}

export interface UserLearningPath {
  id: string;
  user_id?: string;
  learning_path_id: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  last_watched_video: string | null;
  started_at: string;
  updated_at: string;
  completed: boolean;
}
