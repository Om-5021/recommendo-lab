
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Award, ChevronUp, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import ProgressChart from '@/components/ProgressChart';
import { getInProgressCourses, mockProgressStats, getRecommendedCourses } from '@/lib/data';
import { Course } from '@/types/database';

const Dashboard = () => {
  // Smooth load animation
  useEffect(() => {
    document.body.classList.add('page-transition');
    return () => {
      document.body.classList.remove('page-transition');
    };
  }, []);

  const inProgressCourses = getInProgressCourses();
  const recommendedCourses = getRecommendedCourses().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container px-4 mx-auto">
          {/* Header with user info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-up">
            <div className="flex items-center mb-4 md:mb-0">
              <Avatar className="h-16 w-16 mr-4 border-2 border-white shadow-md">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>MP</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, Michael!</h1>
                <p className="text-muted-foreground">Ready to continue your learning journey?</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Bell size={16} />
                <span>Notifications</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Settings size={16} />
                <span>Settings</span>
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { 
                icon: <BookOpen className="h-6 w-6 text-blue-600" />, 
                title: 'Courses in Progress', 
                value: '3', 
                trend: '+1 this week', 
                trendUp: true 
              },
              { 
                icon: <Clock className="h-6 w-6 text-purple-600" />, 
                title: 'Learning Hours', 
                value: '27.5', 
                trend: '+4.5 this week', 
                trendUp: true 
              },
              { 
                icon: <Award className="h-6 w-6 text-amber-600" />, 
                title: 'Completed Courses', 
                value: '8', 
                trend: '2 this month', 
                trendUp: true 
              },
              { 
                icon: <BookOpen className="h-6 w-6 text-emerald-600" />, 
                title: 'Daily Streak', 
                value: '12', 
                trend: 'days', 
                trendUp: null 
              }
            ].map((stat, index) => (
              <div 
                key={stat.title} 
                className="glass-card p-5 rounded-xl animate-slide-right" 
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 rounded-md bg-background/80">{stat.icon}</div>
                  {stat.trendUp !== null && (
                    <Badge variant={stat.trendUp ? "outline" : "destructive"} className={stat.trendUp ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                      <ChevronUp className={`h-3 w-3 mr-1 ${!stat.trendUp && "rotate-180"}`} />
                      {stat.trend}
                    </Badge>
                  )}
                </div>
                <h3 className="text-muted-foreground text-sm">{stat.title}</h3>
                <p className="text-2xl font-bold">{stat.value} <span className="text-muted-foreground text-sm font-normal">{stat.trendUp === null && stat.trend}</span></p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* In Progress Courses */}
              <section className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold">Continue Learning</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard/courses" className="flex items-center">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {inProgressCourses.map((course, index) => (
                    <CourseCard 
                      key={course.id} 
                      course={course as Course} 
                      progress={course.progress}
                    />
                  ))}
                </div>
              </section>
              
              {/* Weekly Progress Chart */}
              <section className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
                <ProgressChart data={mockProgressStats} />
              </section>
            </div>
            
            {/* Right Column */}
            <div className="space-y-8">
              {/* Recommendations */}
              <section className="animate-fade-up" style={{ animationDelay: "0.5s" }}>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold">Recommended For You</h2>
                </div>
                
                <div className="space-y-5">
                  {recommendedCourses.map((course) => (
                    <CourseCard key={course.id} course={course as Course} />
                  ))}
                </div>
                
                <Button className="w-full mt-4">
                  View More Recommendations
                </Button>
              </section>
              
              {/* Upcoming Deadlines or Learning Goals */}
              <section className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: "0.6s" }}>
                <h2 className="text-xl font-bold mb-4">Learning Goals</h2>
                
                <div className="space-y-4">
                  {[
                    { title: 'Complete Machine Learning Basics', deadline: '3 days left', progress: 65 },
                    { title: 'Finish Data Science Project', deadline: '1 week left', progress: 32 },
                    { title: 'Read NLP Research Papers', deadline: '2 days left', progress: 78 }
                  ].map((goal, index) => (
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
