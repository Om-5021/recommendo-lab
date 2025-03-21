
import React from 'react';
import { ArrowRight, BookOpen, CheckCircle2, CircleDot, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Course } from '@/types/database';

interface LearningPathRoadmapProps {
  roadmap: {
    pathName: string;
    pathDescription: string;
    pathId?: string;
    isCustom?: boolean;
    courses: Course[];
  };
}

const LearningPathRoadmap: React.FC<LearningPathRoadmapProps> = ({ roadmap }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 animate-scale-in">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary">{roadmap.pathName}</h2>
            <p className="text-muted-foreground mt-1">{roadmap.pathDescription}</p>
          </div>
          {roadmap.pathId && !roadmap.isCustom && (
            <Button variant="outline" asChild>
              <a href={`/learning-path/${roadmap.pathId}`}>
                View Full Path <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{roadmap.courses.length} Courses</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {roadmap.courses.reduce((total, course) => {
                const hours = parseInt(course.duration.split(' ')[0]) || 0;
                return total + hours;
              }, 0)} hours
            </span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        {/* Timeline connecting courses */}
        <div className="absolute left-7 top-8 bottom-24 w-0.5 bg-blue-200 z-0"></div>
        
        {/* Courses in sequence */}
        <div className="space-y-6">
          {roadmap.courses.map((course, index) => (
            <div key={course.id} className="flex gap-4">
              <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 z-10">
                {index === 0 ? (
                  <CircleDot className="h-6 w-6 text-primary" />
                ) : index === roadmap.courses.length - 1 ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                )}
              </div>
              
              <Card className="flex-1 transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm">{course.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2">
                    {course.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                    {course.tags.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{course.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-0">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{course.instructor}</span> • {course.duration}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/course/${course.id}`}>View Course</a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
        
        {/* Action footer */}
        <div className="mt-8 flex justify-center">
          <Button className="mr-4" asChild>
            <a href={roadmap.pathId ? `/learning-path/${roadmap.pathId}` : '#'}>
              Start This Path
            </a>
          </Button>
          {roadmap.isCustom && (
            <Button variant="outline">
              Save This Path
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPathRoadmap;
