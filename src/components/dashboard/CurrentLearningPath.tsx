
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DetailedLearningPath from '@/components/DetailedLearningPath';
import { LearningPath, Course } from '@/types/database';

interface CurrentLearningPathProps {
  pathDetails: LearningPath | null;
  courses: (Course & { step_order: number })[];
  progress: number;
  isLoading: boolean;
}

const CurrentLearningPath: React.FC<CurrentLearningPathProps> = ({
  pathDetails,
  courses,
  progress,
  isLoading
}) => {
  if (isLoading || !pathDetails) {
    return null;
  }

  return (
    <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">Your Current Learning Path</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/learning-paths" className="flex items-center">
            View All Paths <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <DetailedLearningPath 
        learningPath={pathDetails}
        courses={courses}
        userProgress={progress}
      />
    </section>
  );
};

export default CurrentLearningPath;
