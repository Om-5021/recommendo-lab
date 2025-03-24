// Type definitions for database tables

export interface Course {
  id: string;
  course_id?: number; // Added to match the backend schema
  title: string;
  course_title?: string; // Added to match the backend schema
  description: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  rating: number;
  enrollments: number;
  tags: string[];
  preview?: string | null;
  created_at: string;
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
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  duration: string;
  order_index: number;
  created_at: string;
  // Backend specific fields
  course_title?: string;
  subject?: string;
  price?: string;
  level?: string;
  is_paid?: boolean;
  num_subscribers?: number;
  num_reviews?: number;
  num_lectures?: number;
  content_duration?: number;
  published_timestamp?: string;
  url?: string;
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
