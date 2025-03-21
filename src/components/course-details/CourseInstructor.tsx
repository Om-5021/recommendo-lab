
import React from 'react';
import { Star, Users, BookOpen } from 'lucide-react';
import { Course } from '@/types/database';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

interface CourseInstructorProps {
  course: Course;
}

const CourseInstructor: React.FC<CourseInstructorProps> = ({ course }) => {
  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
          <Avatar className="h-24 w-24 rounded-xl">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={course.instructor} />
            <AvatarFallback className="text-2xl">{course.instructor[0]}</AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">{course.instructor}</h2>
            <p className="text-muted-foreground mb-3">
              Lead Instructor & Industry Expert in {course.category}
            </p>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500 mr-1" />
                <span>4.9 Instructor Rating</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground mr-1" />
                <span>32,547 Students</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-muted-foreground mr-1" />
                <span>12 Courses</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {course.instructor} is a seasoned professional with over 15 years of experience in {course.category}. 
            After earning a Ph.D. from Stanford University, they worked at leading technology companies 
            before transitioning to education full-time.
          </p>
          
          <p className="text-muted-foreground">
            Their teaching approach combines academic rigor with practical industry insights, 
            helping students not just understand concepts but apply them in real-world scenarios. 
            They have taught over 30,000 students across various platforms and are known for their 
            clear explanations and engaging teaching style.
          </p>
          
          <p className="text-muted-foreground">
            When not teaching, they consult for Fortune 500 companies and contribute to open-source 
            projects. Their work has been featured in prestigious journals and conferences in the field.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CourseInstructor;
