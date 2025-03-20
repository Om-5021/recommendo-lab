
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LearningPathCard from './LearningPathCard';
import { LearningPath } from '@/types/database';

interface LearningPathsListProps {
  title: string;
  subtitle?: string;
  learningPaths: LearningPath[];
  showViewAll?: boolean;
  viewAllLink?: string;
  className?: string;
  showProgress?: boolean;
  progressMap?: Record<string, number>;
}

const LearningPathsList: React.FC<LearningPathsListProps> = ({
  title,
  subtitle,
  learningPaths,
  showViewAll = true,
  viewAllLink = '/learning-paths',
  className,
  showProgress = false,
  progressMap = {}
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.map((learningPath) => (
            <div key={learningPath.id} className="animate-scale-in">
              <LearningPathCard 
                learningPath={learningPath} 
                showProgress={showProgress}
                progress={progressMap[learningPath.id] || 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningPathsList;
