
import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, Award } from 'lucide-react';
import { getInProgressCourses, getRecommendedCourses } from '@/lib/data';
import { Course } from '@/types/database';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useLearningPathData } from '@/hooks/useLearningPathData';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { useLearningGoals } from '@/hooks/useLearningGoals';
import { useWeeklyProgress } from '@/hooks/useWeeklyProgress';

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
  const { user, profile } = useUser();
  const [courses, setCourses] = useState<(Course & { progress?: number })[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  // Get learning path data
  const { 
    userLearningPaths, 
    activeLearningPathDetails, 
    loading: loadingLearningPaths
  } = useLearningPathData(session.userId || undefined);
  
  // Get learning goals
  const { goals } = useLearningGoals(user?.id);
  
  // Get weekly progress
  const { weeklyData } = useWeeklyProgress(user?.id);

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

  // Format learning goals for DashboardSidebar
  const formattedLearningGoals = goals.map(goal => {
    // Calculate days remaining
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let deadlineText = '';
    if (daysRemaining < 0) {
      deadlineText = 'Overdue';
    } else if (daysRemaining === 0) {
      deadlineText = 'Due today';
    } else if (daysRemaining === 1) {
      deadlineText = '1 day left';
    } else if (daysRemaining <= 7) {
      deadlineText = `${daysRemaining} days left`;
    } else {
      deadlineText = `${Math.ceil(daysRemaining / 7)} weeks left`;
    }
    
    return {
      title: goal.title,
      deadline: deadlineText,
      progress: goal.progress,
      id: goal.id
    };
  });

  return (
    <DashboardContainer 
      isLoading={isLoading || loadingCourses} 
      isAuthenticated={isAuthenticated}
    >
      <DashboardHeader 
        userName={profile?.full_name || user?.email?.split('@')[0] || 'Student'}
        avatarUrl={profile?.avatar_url}
      />
      
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
            <ProgressChart data={weeklyData} />
          </section>
        </div>
        
        {/* Right Column */}
        <DashboardSidebar 
          recommendedCourses={recommendedCourses} 
          learningGoals={formattedLearningGoals}
        />
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;
