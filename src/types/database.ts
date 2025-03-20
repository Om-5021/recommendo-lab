
// Type definitions for database tables

export interface Course {
  id: string;
  title: string;
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
