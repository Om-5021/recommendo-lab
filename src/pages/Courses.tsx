import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import CourseCard from '@/components/CourseCard';
import Navbar from '@/components/Navbar';
import { mockCategories } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { Course } from '@/types/database';
import { Link } from 'react-router-dom';
import { transformCourseData } from '@/utils/courseTransforms';

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch courses from Supabase
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        console.log('Fetching courses from Supabase...');
        
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .limit(100); // Adding a limit to ensure we don't fetch too many
          
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        if (data) {
          console.log('Courses data received:', data.length);
          // Transform data to match our Course interface
          const transformedCourses: Course[] = data.map(course => transformCourseData(course));
          
          console.log('Transformed courses:', transformedCourses.length);
          setCourses(transformedCourses);
        } else {
          console.log('No courses data received');
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load courses. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [toast]);
  
  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });
  
  // Sort courses based on the selected option
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'popular') return (b.enrollments || 0) - (a.enrollments || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'newest') {
      const dateA = new Date(a.created_at || '');
      const dateB = new Date(b.created_at || '');
      return dateB.getTime() - dateA.getTime();
    }
    return 0;
  });
  
  // Get unique categories from courses
  const categories = [...new Set(courses.map(course => course.category))].filter(Boolean);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container px-4 mx-auto">
          <div className="mb-12">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Explore Courses</h1>
                <p className="text-muted-foreground dark:text-gray-400 text-lg">
                  Browse through our catalog of professionally curated courses
                </p>
              </div>
              
              <Button asChild variant="outline" size="lg" className="flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700">
                <Link to="/learning-paths">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Learning Paths
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border/50 dark:border-gray-700 p-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search bar */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Category filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700">All Categories</SelectItem>
                  {categories.length > 0 
                    ? categories.map((category) => (
                        <SelectItem key={category} value={category} className="dark:text-white dark:hover:bg-gray-700">
                          {category}
                        </SelectItem>
                      ))
                    : mockCategories.map((category) => (
                        <SelectItem key={category} value={category} className="dark:text-white dark:hover:bg-gray-700">
                          {category}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
              
              {/* Level filter */}
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700">All Levels</SelectItem>
                  <SelectItem value="Beginner" className="dark:text-white dark:hover:bg-gray-700">Beginner</SelectItem>
                  <SelectItem value="Intermediate" className="dark:text-white dark:hover:bg-gray-700">Intermediate</SelectItem>
                  <SelectItem value="Advanced" className="dark:text-white dark:hover:bg-gray-700">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
                <Filter className="h-4 w-4 mr-2" />
                <span>{sortedCourses.length} courses</span>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="popular" className="dark:text-white dark:hover:bg-gray-700">Most Popular</SelectItem>
                  <SelectItem value="rating" className="dark:text-white dark:hover:bg-gray-700">Highest Rated</SelectItem>
                  <SelectItem value="newest" className="dark:text-white dark:hover:bg-gray-700">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg dark:text-white">Loading courses...</span>
            </div>
          )}
          
          {/* Course Grid */}
          {!loading && sortedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {sortedCourses.map((course) => (
                <div key={course.id} className="animate-scale-in">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-20 dark:text-white">
              <h3 className="text-2xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground dark:text-gray-400">
                Try adjusting your search or filters to find what you're looking for
              </p>
              <Button 
                variant="outline" 
                className="mt-4 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setLevelFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : null}
          
          {/* Pagination */}
          {!loading && sortedCourses.length > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" className="dark:text-white dark:hover:bg-gray-800" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive className="dark:bg-primary dark:text-white">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" className="dark:text-white dark:hover:bg-gray-800">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" className="dark:text-white dark:hover:bg-gray-800">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" className="dark:text-white dark:hover:bg-gray-800" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
    </div>
  );
};

export default CoursesPage;
