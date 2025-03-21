
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Course } from '@/types/database';

interface CourseOverviewProps {
  course: Course;
}

const CourseOverview: React.FC<CourseOverviewProps> = ({ course }) => {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-4">About This Course</h2>
        <p className="text-muted-foreground mb-3">
          This comprehensive course takes you through all aspects of {course.title.toLowerCase()}, from basic concepts to advanced techniques. Whether you're a beginner or looking to expand your knowledge, this course provides a structured learning path with hands-on exercises and real-world projects.
        </p>
        <p className="text-muted-foreground mb-3">
          You'll learn through a combination of video lectures, practical assignments, quizzes, and a final project that consolidates all your learning. By the end of this course, you'll have gained practical skills that you can immediately apply in your work or studies.
        </p>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Master core principles and best practices",
            "Build real-world projects for your portfolio",
            "Learn from industry experts with practical experience",
            "Access to cutting-edge tools and frameworks",
            "Develop problem-solving skills through challenges",
            "Understand advanced concepts and applications",
            "Join a community of like-minded learners",
            "Receive personalized feedback on your progress"
          ].map((item, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 mr-2 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Requirements</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Basic understanding of {course.category.toLowerCase()} concepts</li>
          <li>Access to a computer with internet connection</li>
          <li>Willingness to practice and apply what you learn</li>
          <li>No specific software is required - all tools used are free</li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Who This Course is For</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Students wanting to gain practical skills in {course.category.toLowerCase()}</li>
          <li>Professionals looking to expand their knowledge and expertise</li>
          <li>Career changers entering the field of {course.category.toLowerCase()}</li>
          <li>Anyone with an interest in {course.title.toLowerCase()}</li>
        </ul>
      </section>
    </div>
  );
};

export default CourseOverview;
