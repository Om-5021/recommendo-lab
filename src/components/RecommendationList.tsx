
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CourseCard from './CourseCard';
import { Course } from '@/types/database';

interface RecommendationListProps {
  title: string;
  subtitle?: string;
  courses: Course[];
  showViewAll?: boolean;
  viewAllLink?: string;
  className?: string;
}

const RecommendationList: React.FC<RecommendationListProps> = ({
  title,
  subtitle,
  courses,
  showViewAll = true,
  viewAllLink = '/courses',
  className
}) => {
  return (
    <section className={cn("py-12", className)}>
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          {showViewAll && (
            <Button variant="ghost" className="group" asChild>
              <a href={viewAllLink}>
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="animate-scale-in">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendationList;
