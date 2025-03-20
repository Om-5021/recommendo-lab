
import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroRef.current.style.opacity = `${1 - scrollY * 0.002}`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden min-h-[90vh] flex items-center justify-center py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white"></div>
      
      {/* Floating elements */}
      <div ref={heroRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-blue-200/30 blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-200/30 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/5 w-72 h-72 rounded-full bg-sky-200/30 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Content */}
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 inline-flex px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm">
            <span className="text-sm font-medium text-primary">AI-Powered Learning Recommendations</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-up">
            Discover Your Perfect Learning Path
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 mx-auto max-w-2xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Personalized course recommendations that adapt to your learning style, goals, and progress. Learn smarter, not harder.
          </p>
          
          <div className="relative max-w-md mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input 
              type="search" 
              placeholder="What do you want to learn today?" 
              className="w-full pl-10 py-6 bg-white/80 backdrop-blur-sm border-blue-100 rounded-lg shadow-md"
            />
            <Button 
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 shadow-md" 
              size="sm"
            >
              Explore
            </Button>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.6s' }}>
            <Button variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm">Machine Learning</Button>
            <Button variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm">Web Development</Button>
            <Button variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm">Data Science</Button>
            <Button variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm">UX Design</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
