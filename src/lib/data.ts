
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
  preview?: string;
}

export interface UserProgress {
  courseId: string;
  progress: number;
  lastAccessed: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export const mockCourses: Course[] = [
  {
    id: 'c001',
    title: 'Machine Learning Fundamentals',
    description: 'A comprehensive introduction to machine learning concepts, algorithms, and practical applications. Perfect for beginners who want to understand the core principles.',
    instructor: 'Dr. Alan Smith',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
    duration: '8 weeks',
    level: 'Beginner',
    category: 'Data Science',
    rating: 4.8,
    enrollments: 15420,
    tags: ['Machine Learning', 'Python', 'Data Science', 'AI'],
    preview: 'https://images.unsplash.com/photo-1581092921461-fd3e4b315b8a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80'
  },
  {
    id: 'c002',
    title: 'Advanced React Patterns',
    description: 'Master advanced React patterns to build scalable, maintainable, and high-performance applications. Designed for experienced React developers.',
    instructor: 'Sarah Johnson',
    thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
    duration: '6 weeks',
    level: 'Advanced',
    category: 'Web Development',
    rating: 4.9,
    enrollments: 8745,
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development']
  },
  {
    id: 'c003',
    title: 'Data Structures & Algorithms',
    description: 'Learn essential data structures and algorithms for coding interviews and software engineering roles. Includes practical examples and coding challenges.',
    instructor: 'Prof. Michael Chen',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
    duration: '10 weeks',
    level: 'Intermediate',
    category: 'Computer Science',
    rating: 4.7,
    enrollments: 12350,
    tags: ['Algorithms', 'Data Structures', 'Computer Science', 'Programming']
  },
  {
    id: 'c004',
    title: 'UI/UX Design Principles',
    description: 'A complete guide to modern UI/UX design principles, tools, and methodologies. Learn to create beautiful, user-centered digital experiences.',
    instructor: 'Emma Rodriguez',
    thumbnail: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
    duration: '8 weeks',
    level: 'Beginner',
    category: 'Design',
    rating: 4.9,
    enrollments: 9870,
    tags: ['UI', 'UX', 'Design', 'Figma', 'Adobe XD']
  },
  {
    id: 'c005',
    title: 'Cloud Architecture on AWS',
    description: 'Learn to design, deploy, and manage scalable, highly available, and fault-tolerant systems on AWS. Prepare for AWS certification exams.',
    instructor: 'David Wilson',
    thumbnail: 'https://images.unsplash.com/photo-1535191042502-e6a9a3d407e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
    duration: '12 weeks',
    level: 'Advanced',
    category: 'Cloud Computing',
    rating: 4.8,
    enrollments: 7450,
    tags: ['AWS', 'Cloud', 'DevOps', 'Infrastructure']
  },
  {
    id: 'c006',
    title: 'Introduction to Natural Language Processing',
    description: 'Explore the fundamentals of natural language processing (NLP) and understand how computers process and analyze human language.',
    instructor: 'Dr. Priya Sharma',
    thumbnail: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80',
    duration: '9 weeks',
    level: 'Intermediate',
    category: 'Artificial Intelligence',
    rating: 4.7,
    enrollments: 6320,
    tags: ['NLP', 'AI', 'Machine Learning', 'Python', 'NLTK']
  }
];

export const mockUserProgress: UserProgress[] = [
  { courseId: 'c001', progress: 65, lastAccessed: '2023-09-10T15:30:00Z' },
  { courseId: 'c003', progress: 32, lastAccessed: '2023-09-12T09:15:00Z' },
  { courseId: 'c006', progress: 78, lastAccessed: '2023-09-11T18:45:00Z' }
];

export const mockProgressStats: ChartData[] = [
  { name: 'Monday', value: 45 },
  { name: 'Tuesday', value: 52 },
  { name: 'Wednesday', value: 60 },
  { name: 'Thursday', value: 75 },
  { name: 'Friday', value: 68 },
  { name: 'Saturday', value: 55 },
  { name: 'Sunday', value: 40 }
];

export const mockCategories = [
  'Data Science',
  'Web Development',
  'Computer Science',
  'Design',
  'Cloud Computing',
  'Artificial Intelligence',
  'Business',
  'Mobile Development'
];

export const getRecommendedCourses = (): Course[] => {
  // In a real app, this would be based on user preferences and ML algorithms
  return mockCourses.slice(0, 4);
};

export const getPopularCourses = (): Course[] => {
  return [...mockCourses].sort((a, b) => b.enrollments - a.enrollments).slice(0, 4);
};

export const getInProgressCourses = (): (Course & { progress: number })[] => {
  return mockUserProgress.map(progress => {
    const course = mockCourses.find(c => c.id === progress.courseId);
    return { ...course!, progress: progress.progress };
  });
};

export const getCourseById = (id: string): Course | undefined => {
  return mockCourses.find(course => course.id === id);
};
