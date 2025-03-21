
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import RecommendationList from '@/components/RecommendationList';
import LearningPathsList from '@/components/LearningPathsList';
import { mockCategories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { LearningPath, Course } from '@/types/database';

const Index = () => {
  // Smooth load animation
  useEffect(() => {
    document.body.classList.add('page-transition');
    return () => {
      document.body.classList.remove('page-transition');
    };
  }, []);

  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch popular courses (based on enrollments)
        const { data: popularData, error: popularError } = await supabase
          .from('courses')
          .select('*')
          .order('enrollments', { ascending: false })
          .limit(4);
        
        if (popularError) throw popularError;
        if (popularData) setPopularCourses(popularData as Course[]);
        
        // Fetch recommended courses (based on rating)
        const { data: recommendedData, error: recommendedError } = await supabase
          .from('courses')
          .select('*')
          .order('rating', { ascending: false })
          .limit(4);
        
        if (recommendedError) throw recommendedError;
        if (recommendedData) {
          setRecommendedCourses(recommendedData as Course[]);
          
          // Generate related courses based on the first recommended course's category and tags
          if (recommendedData.length > 0) {
            const mainCourse = recommendedData[0];
            const { data: relatedData, error: relatedError } = await supabase
              .from('courses')
              .select('*')
              .neq('id', mainCourse.id)
              .or(`category.eq.${mainCourse.category},tags.cs.{${mainCourse.tags.join(',')}}`)
              .limit(4);
            
            if (relatedError) throw relatedError;
            if (relatedData) setRelatedCourses(relatedData as Course[]);
          }
        }
        
        // Fetch learning paths
        const { data: pathsData, error: pathsError } = await supabase
          .from('learning_paths')
          .select('*')
          .limit(3);
        
        if (pathsError) throw pathsError;
        if (pathsData) setLearningPaths(pathsData as LearningPath[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
        
        {/* Categories Section */}
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Explore Categories</h2>
            <p className="text-muted-foreground text-center mb-12">Discover courses from various fields of study</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockCategories.map((category, index) => (
                <CategoryCard 
                  key={category} 
                  category={category} 
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Learning?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of learners advancing their careers with our AI-powered recommendations
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Get Started Now
            </Button>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Recommendo
              </h3>
              <p className="text-muted-foreground">
                The AI-powered learning platform that adapts to your unique educational journey
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Browse Courses</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">For Teams</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Become an Instructor</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API Reference</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-gray-200 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Recommendo AI Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface CategoryCardProps {
  category: string;
  index: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, index }) => {
  // Different animation delays based on index for staggered animation
  const animationDelay = `${0.1 + (index * 0.05)}s`;
  
  return (
    <div 
      className="animate-fade-up" 
      style={{ animationDelay }}
    >
      <Button 
        variant="outline" 
        className={cn(
          "w-full h-24 text-lg justify-center bg-white/80 backdrop-blur-sm hover:bg-white",
          "border-blue-100 shadow-sm transition-all-300 hover:shadow-md hover:-translate-y-1"
        )}
      >
        {category}
      </Button>
    </div>
  );
};

export default Index;
