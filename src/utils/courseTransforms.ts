
import { Course, CourseVideo } from '@/types/database';

/**
 * Transforms raw course data from the Supabase database to match our Course interface
 */
export const transformCourseData = (course: any): Course => {
  return {
    id: String(course.course_id),
    course_id: course.course_id,
    title: course.course_title,
    course_title: course.course_title,
    description: course.subject || 'No description available',
    instructor: 'Instructor',
    thumbnail: course.url || 'https://via.placeholder.com/640x360?text=Course+Image',
    duration: `${Math.round((course.content_duration || 0) / 60)} hours`,
    level: course.level as 'Beginner' | 'Intermediate' | 'Advanced' || 'Beginner',
    category: course.subject || 'General',
    rating: 4.5, // Default rating
    enrollments: course.num_subscribers || 0,
    tags: [course.subject || 'General'],
    created_at: course.published_timestamp || new Date().toISOString(),
    // Include original fields
    subject: course.subject,
    url: course.url,
    price: course.price,
    num_lectures: course.num_lectures,
    num_subscribers: course.num_subscribers,
    num_reviews: course.num_reviews,
    is_paid: course.is_paid,
    content_duration: course.content_duration,
    published_timestamp: course.published_timestamp
  };
};

/**
 * Transforms raw video data from the Supabase database to match our CourseVideo interface
 */
export const transformVideoData = (video: any, index: number): CourseVideo => {
  return {
    id: `${video.course_id}-${index}`,
    course_id: video.course_id,
    title: video.course_title || `Video ${index + 1}`,
    description: video.subject || 'No description available',
    video_url: video.url || 'https://example.com/video.mp4',
    duration: `${Math.round((video.content_duration || 0) / 60)} min`,
    order_index: index,
    created_at: video.published_timestamp || new Date().toISOString(),
    // Include all original fields too
    course_title: video.course_title,
    subject: video.subject,
    price: video.price,
    level: video.level,
    is_paid: video.is_paid,
    num_subscribers: video.num_subscribers,
    num_reviews: video.num_reviews,
    num_lectures: video.num_lectures,
    content_duration: video.content_duration,
    published_timestamp: video.published_timestamp,
    url: video.url
  };
};

/**
 * Parse a course ID to the appropriate type (number)
 */
export const parseCourseId = (courseId: string | number): number | null => {
  if (typeof courseId === 'number') return courseId;
  
  if (/^\d+$/.test(courseId.toString())) {
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
