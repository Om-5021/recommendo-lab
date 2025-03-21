
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import RecommendationList from '@/components/RecommendationList';
import LearningPathsList from '@/components/LearningPathsList';
import CategorySection from '@/components/CategorySection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { useHomeData } from '@/hooks/useHomeData';

const Index = () => {
  // Smooth load animation
  useEffect(() => {
    document.body.classList.add('page-transition');
    return () => {
      document.body.classList.remove('page-transition');
    };
  }, []);

  const {
    recommendedCourses,
    popularCourses,
    relatedCourses,
    learningPaths,
    isLoading
  } = useHomeData();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <Hero />
        
        <RecommendationList
          title="Recommended for You"
          subtitle="Based on highest ratings across our platform"
          courses={recommendedCourses}
          isLoading={isLoading}
          showExplore={true}
          explorePath="/learning-path-explorer"
        />
        
        {relatedCourses.length > 0 && (
          <RecommendationList
            title="Courses You Might Like"
            subtitle="Based on your interests in similar topics"
            courses={relatedCourses}
            className="bg-blue-50/50"
            isLoading={isLoading}
          />
        )}
        
        <RecommendationList
          title="Most Popular Courses"
          subtitle="Join thousands of learners exploring these courses"
          courses={popularCourses}
          className={relatedCourses.length > 0 ? "" : "bg-blue-50/50"}
          isLoading={isLoading}
        />
        
        {learningPaths.length > 0 && (
          <LearningPathsList
            title="Recommended Learning Paths"
            subtitle="Structured paths to help you achieve your learning goals"
            learningPaths={learningPaths}
            isLoading={isLoading}
          />
        )}
        
        <CategorySection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
