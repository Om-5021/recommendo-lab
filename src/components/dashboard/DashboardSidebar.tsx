
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types/database';

interface LearningGoal {
  title: string;
  deadline: string;
  progress: number;
}

interface DashboardSidebarProps {
  recommendedCourses: Course[];
  learningGoals?: LearningGoal[];
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  recommendedCourses,
  learningGoals = [
    { title: 'Complete Machine Learning Basics', deadline: '3 days left', progress: 65 },
    { title: 'Finish Data Science Project', deadline: '1 week left', progress: 32 },
    { title: 'Read NLP Research Papers', deadline: '2 days left', progress: 78 }
  ]
}) => {
  return (
    <div className="space-y-8">
      {/* Recommendations */}
      <section className="animate-fade-up" style={{ animationDelay: "0.5s" }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Recommended For You</h2>
        </div>
        
        <div className="space-y-5">
          {recommendedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        
        <Button className="w-full mt-4">
          View More Recommendations
        </Button>
      </section>
      
      {/* Learning Goals */}
      <section className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: "0.6s" }}>
        <h2 className="text-xl font-bold mb-4">Learning Goals</h2>
        
        <div className="space-y-4">
          {learningGoals.map((goal, index) => (
            <div key={index} className="border border-border/50 rounded-lg p-3 bg-background/50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{goal.title}</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {goal.deadline}
                </Badge>
              </div>
              <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <div className="mt-1 text-right text-xs text-muted-foreground">
                {goal.progress}% complete
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardSidebar;
