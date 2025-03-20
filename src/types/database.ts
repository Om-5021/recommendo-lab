
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
