
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import LearningPathCard from './LearningPathCard';
import { useLearningPathData } from '@/hooks/useLearningPathData';
import { useUserProgress } from '@/contexts/UserProgressContext';

const LevelFilteredLearningPaths = () => {
  const { session } = useUserProgress();
  const userId = session.userId || undefined;
  const [currentLevel, setCurrentLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  
  const { 
    recommendedLearningPaths, 
    loading,
  } = useLearningPathData(userId, currentLevel);

  const handleLevelChange = (level: 'Beginner' | 'Intermediate' | 'Advanced') => {
    setCurrentLevel(level);
  };

  return (
    <div className="py-8">
      <div className="container px-4 mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Learning Paths by Level</h2>
          <p className="text-muted-foreground">
            Choose the right learning path based on your experience level
          </p>
        </div>

        <Tabs defaultValue="Beginner" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger 
                value="Beginner" 
                onClick={() => handleLevelChange('Beginner')}
              >
                Beginner
              </TabsTrigger>
              <TabsTrigger 
                value="Intermediate" 
                onClick={() => handleLevelChange('Intermediate')}
              >
                Intermediate
              </TabsTrigger>
              <TabsTrigger 
                value="Advanced" 
                onClick={() => handleLevelChange('Advanced')}
              >
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <TabsContent value="Beginner">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Beginner Learning Paths</h3>
                <p className="text-muted-foreground">Perfect for those just starting their journey</p>
              </div>
              <LevelContent 
                paths={recommendedLearningPaths} 
                loading={loading}
                level="Beginner"
              />
            </TabsContent>

            <TabsContent value="Intermediate">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Intermediate Learning Paths</h3>
                <p className="text-muted-foreground">For learners with some experience</p>
              </div>
              <LevelContent 
                paths={recommendedLearningPaths} 
                loading={loading}
                level="Intermediate"
              />
            </TabsContent>

            <TabsContent value="Advanced">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Advanced Learning Paths</h3>
                <p className="text-muted-foreground">For experienced learners ready for a challenge</p>
              </div>
              <LevelContent 
                paths={recommendedLearningPaths} 
                loading={loading}
                level="Advanced"
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

const LevelContent = ({ 
  paths, 
  loading, 
  level 
}: { 
  paths: any[], 
  loading: boolean,
  level: 'Beginner' | 'Intermediate' | 'Advanced'
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
              <div className="mt-4 flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (paths.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>No learning paths found</CardTitle>
          <CardDescription>
            We couldn't find any {level.toLowerCase()} level learning paths at the moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="mt-2" variant="outline" asChild>
            <a href="/learning-path-explorer">Explore all learning paths</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paths.map((path) => (
        <LearningPathCard key={path.id} learningPath={path} />
      ))}
    </div>
  );
};

export default LevelFilteredLearningPaths;
