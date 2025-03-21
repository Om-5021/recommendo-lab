
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
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
  isLoading?: boolean;
  showExplore?: boolean;
  explorePath?: string;
}

const RecommendationList: React.FC<RecommendationListProps> = ({
  title,
  subtitle,
  courses,
  showViewAll = true,
  viewAllLink = '/courses',
  className,
  isLoading = false,
  showExplore = false,
  explorePath = '/learning-paths'
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
          
          <div className="flex gap-3">
            {showExplore && (
              <Button variant="default" className="group" asChild>
                <a href={explorePath}>
                  Explore Learning Path
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            )}
            
            {showViewAll && (
              <Button variant="ghost" className="group" asChild>
                <a href={viewAllLink}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton UI
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="rounded-xl overflow-hidden border border-border/50">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            courses.map((course) => (
              <div key={course.id} className="animate-scale-in">
                <CourseCard course={course} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default RecommendationList;
