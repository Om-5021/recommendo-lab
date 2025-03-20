
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, ArrowRight, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LearningPath, LearningPathStep } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface LearningPathCardProps {
  learningPath: LearningPath;
  className?: string;
  showProgress?: boolean;
  progress?: number;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ 
  learningPath, 
  className, 
  showProgress = false,
  progress = 0
}) => {
  const [courseCount, setCourseCount] = useState(0);

  useEffect(() => {
    const fetchCourseCount = async () => {
      try {
        const { count, error } = await supabase
          .from('learning_path_steps')
          .select('*', { count: 'exact', head: true })
          .eq('learning_path_id', learningPath.id);
          
        if (error) {
          throw error;
        }
        
        if (count !== null) {
          setCourseCount(count);
        }
      } catch (error) {
        console.error('Error fetching course count:', error);
      }
    };
    
    fetchCourseCount();
  }, [learningPath.id]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
            <Layers className="h-3 w-3" /> {courseCount} courses
          </Badge>
          {showProgress && (
            <Badge variant="secondary" className="text-xs font-normal">
              {progress}% complete
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-bold mt-2">{learningPath.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {learningPath.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        {showProgress && (
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full group" asChild>
          <Link to={`/learning-path/${learningPath.id}`}>
            <Book className="mr-2 h-4 w-4" />
            View Learning Path
            <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LearningPathCard;
