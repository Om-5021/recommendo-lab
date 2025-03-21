
import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Course } from '@/types/database';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

interface CourseReviewsProps {
  course: Course;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({ course }) => {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 flex flex-col items-center justify-center p-6 glass-card rounded-xl">
            <div className="text-5xl font-bold text-primary mb-2">{course.rating}</div>
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={`h-5 w-5 ${star <= Math.floor(course.rating) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} 
                />
              ))}
            </div>
            <p className="text-muted-foreground">Course Rating</p>
            <p className="text-sm mt-1 text-muted-foreground">{course.enrollments.toLocaleString()} students</p>
          </div>
          
          <div className="md:col-span-2 glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">Rating Distribution</h3>
            {[5, 4, 3, 2, 1].map(rating => {
              // Generate a percentage based on the course rating
              const percentage = rating === 5 ? 68 : 
                                rating === 4 ? 22 : 
                                rating === 3 ? 7 : 
                                rating === 2 ? 2 : 1;
              
              return (
                <div key={rating} className="flex items-center mb-2 last:mb-0">
                  <div className="flex items-center w-1/6">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                    <span>{rating}</span>
                  </div>
                  <div className="w-4/6 mx-4">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <div className="w-1/6 text-muted-foreground text-sm">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <Separator className="my-8" />
        
        {/* Sample reviews */}
        {[
          {
            name: "Sarah Johnson",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            rating: 5,
            date: "2 months ago",
            comment: "This course exceeded my expectations! The instructor explains complex concepts in a simple and understandable way. The projects were challenging but helped reinforce what I learned. Highly recommended for anyone wanting to master this subject."
          },
          {
            name: "David Williams",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            rating: 4,
            date: "1 month ago",
            comment: "Great course with lots of practical examples. I found the explanations clear and concise. My only suggestion would be to include more advanced topics in the later sections. Otherwise, this was exactly what I needed to progress in my learning journey."
          },
          {
            name: "Emily Chen",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            rating: 5,
            date: "3 weeks ago",
            comment: "As a beginner, I was worried this course might be too advanced, but the instructor does an excellent job of breaking down difficult concepts. The pace is perfect, and I feel much more confident in my skills now. The community support is also fantastic!"
          }
        ].map((review, index) => (
          <div key={index} className="mb-6 last:mb-0 pb-6 last:pb-0 border-b last:border-0 border-border">
            <div className="flex justify-between mb-3">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={review.avatar} alt={review.name} />
                  <AvatarFallback>{review.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{review.name}</h4>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`h-3 w-3 ${star <= review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">{review.comment}</p>
          </div>
        ))}
        
        <Button variant="outline" className="mt-4 w-full">Load More Reviews</Button>
      </section>
    </div>
  );
};

export default CourseReviews;
