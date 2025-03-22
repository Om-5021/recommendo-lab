
import React, { useEffect } from 'react';
import { BookOpen, Clock, Award } from 'lucide-react';
import { getInProgressCourses, mockProgressStats, getRecommendedCourses } from '@/lib/data';
import { Course } from '@/types/database';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useLearningPathData } from '@/hooks/useLearningPathData';
import { supabase } from '@/lib/supabase';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardCourses from '@/components/dashboard/DashboardCourses';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ProgressChart from '@/components/ProgressChart';
import CurrentLearningPath from '@/components/dashboard/CurrentLearningPath';
import LevelFilteredLearningPaths from '@/components/LevelFilteredLearningPaths';

const Dashboard = () => {
  const { session, userCourses, isLoading } = useUserProgress();
  const [courses, setCourses] = React.useState<(Course & { progress?: number })[]>([]);
  const [loadingCourses, setLoadingCourses] = React.useState(true);
  const [user, setUser] = React.useState<{ name: string } | null>(null);
  
  // Get learning path data
  const { 
    userLearningPaths, 
    activeLearningPathDetails, 
    loading: loadingLearningPaths
  } = useLearningPathData(session.userId || undefined);

  // Fetch user information
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ 
          name: user.email?.split('@')[0] || 'Student' 
        });
      }
    };
    
    fetchUserData();
  }, []);

  // Fetch course data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!userCourses.length) {
          const inProgressCourses = getInProgressCourses();
          setCourses(inProgressCourses as Course[]);
          setLoadingCourses(false);
          return;
        }
        
        setLoadingCourses(true);
        const courseIds = userCourses.map(uc => uc.course_id);
        
        if (courseIds.length === 0) {
          const inProgressCourses = getInProgressCourses();
          setCourses(inProgressCourses as Course[]);
          setLoadingCourses(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const coursesWithProgress = data.map(course => {
            const userCourse = userCourses.find(uc => uc.course_id === course.id);
            return {
              ...course,
              progress: userCourse?.progress || 0
            };
          });
          
          setCourses(coursesWithProgress as Course[]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };
    
    fetchCourses();
  }, [userCourses]);

  // Get recommended courses
  const recommendedCourses = getRecommendedCourses().slice(0, 2);

  // Calculate learning stats
  const learningStats = [
    { 
      icon: <BookOpen className="h-6 w-6 text-blue-600" />, 
      title: 'Courses in Progress', 
      value: courses.length.toString(), 
      trend: `${courses.length > 0 ? '+1' : '0'} this week`, 
      trendUp: courses.length > 0 
    },
    { 
      icon: <Clock className="h-6 w-6 text-purple-600" />, 
      title: 'Learning Hours', 
      value: userCourses.length ? `${(userCourses.length * 3.5).toFixed(1)}` : '0', 
      trend: `+${userCourses.length ? '4.5' : '0'} this week`, 
      trendUp: userCourses.length > 0 
    },
    { 
      icon: <Award className="h-6 w-6 text-amber-600" />, 
      title: 'Completed Courses', 
      value: userCourses.filter(c => c.completed).length.toString(), 
      trend: userCourses.filter(c => c.completed).length > 0 ? '1 this month' : '0 this month', 
      trendUp: userCourses.filter(c => c.completed).length > 0 
    },
    { 
      icon: <BookOpen className="h-6 w-6 text-emerald-600" />, 
      title: 'Daily Streak', 
      value: '1', 
      trend: 'days', 
      trendUp: null 
    }
  ];
  
  const isAuthenticated = !!session.userId && !isLoading;

  return (
    <DashboardContainer 
      isLoading={isLoading || loadingCourses} 
      isAuthenticated={isAuthenticated}
    >
      <DashboardHeader userName={user?.name} />
      
      <DashboardStats statItems={learningStats} />
      
      <CurrentLearningPath 
        pathDetails={activeLearningPathDetails.pathDetails}
        courses={activeLearningPathDetails.courses}
        progress={userLearningPaths[0]?.progress || 0}
        isLoading={loadingLearningPaths}
      />
      
      <LevelFilteredLearningPaths />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <DashboardCourses courses={courses} />
          
          {/* Weekly Progress Chart */}
          <section className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <ProgressChart data={mockProgressStats} />
          </section>
        </div>
        
        {/* Right Column */}
        <DashboardSidebar recommendedCourses={recommendedCourses} />
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;
