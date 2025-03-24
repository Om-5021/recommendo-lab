
import { Course, CourseVideo } from '@/types/database';

/**
 * Transforms raw course data from the Supabase database to match our Course interface
 */
export const transformCourseData = (course: any): Course => {
  if (!course) {
    console.error('No course data provided to transformCourseData');
    return {
      id: '0',
      course_id: 0,
      title: 'Unknown Course',
      course_title: 'Unknown Course',
      description: 'No description available',
      instructor: 'Unknown Instructor',
      thumbnail: 'https://via.placeholder.com/640x360?text=Course+Image',
      duration: '0 hours',
      level: 'Beginner',
      category: 'General',
      rating: 0,
      enrollments: 0,
      tags: ['General'],
      created_at: new Date().toISOString()
    };
  }

  return {
    id: String(course.course_id),
    course_id: typeof course.course_id === 'string' ? parseInt(course.course_id, 10) : course.course_id,
    title: course.course_title || 'Untitled Course',
    course_title: course.course_title || 'Untitled Course',
    description: course.subject || 'No description available',
    instructor: 'Instructor',
    thumbnail: course.url || 'https://via.placeholder.com/640x360?text=Course+Image',
    duration: `${Math.round(((course.content_duration || 0) / 60))} hours`,
    level: course.level as 'Beginner' | 'Intermediate' | 'Advanced' || 'Beginner',
    category: course.subject || 'General',
    rating: 4.5, // Default rating
    enrollments: course.num_subscribers || 0,
    tags: course.subject ? [course.subject] : ['General'],
    created_at: course.published_timestamp || new Date().toISOString(),
    // Include original fields
    subject: course.subject,
    url: course.url,
    price: course.price || '0',
    num_lectures: course.num_lectures || 0,
    num_subscribers: course.num_subscribers || 0,
    num_reviews: course.num_reviews || 0,
    is_paid: course.is_paid || false,
    content_duration: course.content_duration || 0,
    published_timestamp: course.published_timestamp || new Date().toISOString()
  };
};

/**
 * Transforms raw video data from the Supabase database to match our CourseVideo interface
 */
export const transformVideoData = (video: any, index: number): CourseVideo => {
  if (!video) {
    console.error('No video data provided to transformVideoData');
    return {
      id: `unknown-${index}`,
      course_id: 0,
      title: `Video ${index + 1}`,
      description: 'No description available',
      video_url: 'https://example.com/video.mp4',
      duration: '10 min',
      order_index: index,
      created_at: new Date().toISOString()
    };
  }

  return {
    id: `${video.course_id}-${index}`,
    course_id: typeof video.course_id === 'string' ? parseInt(video.course_id, 10) : video.course_id,
    title: video.course_title || `Video ${index + 1}`,
    description: video.subject || 'No description available',
    video_url: video.url || 'https://example.com/video.mp4',
    duration: '10 min', // Default duration
    order_index: index,
    created_at: new Date().toISOString(),
    // Include fields that exist in the database
    course_title: video.course_title,
    subject: video.subject,
    url: video.url
  };
};

/**
 * Parse a course ID to the appropriate type (number)
 */
export const parseCourseId = (courseId: string | number): number | null => {
  if (typeof courseId === 'number') return courseId;
  
  if (courseId && /^\d+$/.test(courseId.toString())) {
    return parseInt(courseId.toString(), 10);
  }
  
  console.error('Invalid course ID format:', courseId);
  return null;
};

/**
 * Creates a valid course ID string for URLs
 */
export const formatCourseIdForUrl = (course: Course): string => {
  return String(course.id || course.course_id);
};

/**
 * Safely access course properties with fallbacks
 */
export const getCourseProperty = <T>(
  course: Course | null | undefined,
  property: keyof Course,
  fallback: T
): T => {
  if (!course) return fallback;
  return (course[property] as unknown as T) || fallback;
};
