import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Award, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Course, CourseVideo } from '@/types/database';
import { useToast } from '@/components/ui/use-toast';

interface CourseSidebarProps {
  course: Course;
  courseProgress: number;
  userCourse: any;
  selectedVideo: CourseVideo | null;
  handleSelectVideo: (video: CourseVideo | null) => void;
  updateCourseProgress: (courseId: string, progress: number, videoId?: string, completed?: boolean) => void;
  session: { userId: string | null };
  similarCourses: Course[];
  loadingSimilar: boolean;
  courseId: string;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  course,
  courseProgress,
  userCourse,
  selectedVideo,
  handleSelectVideo,
  updateCourseProgress,
  session,
  similarCourses,
  loadingSimilar,
  courseId
}) => {
  const { toast } = useToast();

  return (
    <div className="glass-card rounded-xl p-6 space-y-6 sticky top-32">
      <div className="text-center">
        {userCourse ? (
          <>
            <div className="text-3xl font-bold mb-2">{courseProgress}%</div>
            <p className="text-muted-foreground mb-6">Course Completion</p>
            <Button 
              className="w-full mb-3" 
              onClick={() => {
                const video = selectedVideo || null;
                handleSelectVideo(video || {
                  id: '', 
                  course_id: courseId as string | number,
                  title: 'Introduction',
                  description: '',
                  video_url: '',
                  duration: '',
                  order_index: 0,
                  created_at: ''
                } as CourseVideo);
              }}
            >
              Continue Learning
            </Button>
          </>
        ) : (
          <>
            <div className="text-3xl font-bold mb-2">Free</div>
            <p className="text-muted-foreground mb-6">Full access to this course</p>
            <Button 
              className="w-full mb-3"
              onClick={() => {
                if (session.userId) {
                  updateCourseProgress(courseId, 0);
                  toast({
                    title: "Enrolled!",
                    description: "You've been enrolled in this course.",
                  });
                } else {
                  toast({
                    title: "Login Required",
                    description: "Please login to enroll in courses",
                    variant: "destructive"
                  });
                }
              }}
            >
              Enroll Now
            </Button>
          </>
        )}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            toast({
              title: "Added to Wishlist",
              description: "Course has been added to your wishlist",
            });
          }}
        >
          Add to Wishlist
        </Button>
      </div>
      
      <Separator />
      
      <div className="space-y-3">
        <h3 className="font-semibold">This course includes:</h3>
        
        <div className="flex items-start">
          <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
          <div>
            <p>12 hours on-demand video</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
          <div>
            <p>48 lessons in 8 modules</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
          <div>
            <p>Full lifetime access</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
          <div>
            <p>25 downloadable resources</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Award className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
          <div>
            <p>Certificate of completion</p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="font-semibold mb-3">Similar Courses</h3>
        {loadingSimilar ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {similarCourses.map(course => (
              <Link to={`/course/${course.id}`} key={course.id} className="group block">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h4>
                    <div className="flex items-center mt-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500 mr-1" />
                      <span className="text-xs">{course.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSidebar;
