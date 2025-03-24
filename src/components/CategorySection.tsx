
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mockCategories } from '@/lib/data';

const CategorySection = () => {
  return (
    <section className="py-20 dark:bg-gray-900">
      <div className="container px-4 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center dark:text-gray-100">Explore Categories</h2>
        <p className="text-muted-foreground dark:text-gray-400 text-center mb-12">Discover courses from various fields of study</p>
        
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
          "w-full h-24 text-lg justify-center",
          // Light mode styling
          "bg-white/80 backdrop-blur-sm hover:bg-white border-blue-100 shadow-sm",
          // Dark mode styling
          "dark:bg-gray-800/60 dark:backdrop-blur-sm dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700",
          // Shared styling
          "transition-all duration-300 hover:shadow-md hover:-translate-y-1"
        )}
      >
        {category}
      </Button>
    </div>
  );
};

export default CategorySection;
