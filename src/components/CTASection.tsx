
import React from 'react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 text-white">
      <div className="container px-4 mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Learning?</h2>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Join thousands of learners advancing their careers with our AI-powered recommendations
        </p>
        <Button size="lg" className="bg-white text-primary hover:bg-white/90 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-100">
          Get Started Now
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
