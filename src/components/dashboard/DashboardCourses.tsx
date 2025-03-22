
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types/database';

interface DashboardCoursesProps {
  courses: (Course & { progress?: number })[];
}

const DashboardCourses: React.FC<DashboardCoursesProps> = ({ courses }) => {
  return (
    <section className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">Continue Learning</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/courses" className="flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              progress={course.progress}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 rounded-xl text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No courses in progress yet</h3>
          <p className="text-muted-foreground mb-4">Start learning today by enrolling in a course</p>
          <Button asChild>
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      )}
    </section>
  );
};

export default DashboardCourses;
