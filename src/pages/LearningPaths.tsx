
import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import LearningPathCard from '@/components/LearningPathCard';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { LearningPath } from '@/types/database';

const LearningPathsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch learning paths from Supabase
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('learning_paths')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setLearningPaths(data as LearningPath[]);
        }
      } catch (error) {
        console.error('Error fetching learning paths:', error);
        toast({
          title: 'Error',
          description: 'Failed to load learning paths. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLearningPaths();
  }, [toast]);
  
  // Filter learning paths based on search
  const filteredLearningPaths = learningPaths.filter(path => {
    const matchesSearch = searchQuery === '' || 
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container px-4 mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Learning Paths</h1>
            <p className="text-muted-foreground text-lg">
              Discover curated learning paths to guide your educational journey
            </p>
          </div>
          
          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border border-border/50 p-6 mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search learning paths..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Filter className="h-4 w-4 mr-2" />
              <span>{filteredLearningPaths.length} learning paths</span>
            </div>
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading learning paths...</span>
            </div>
          )}
          
          {/* Learning Paths Grid */}
          {!loading && filteredLearningPaths.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredLearningPaths.map((learningPath) => (
                <div key={learningPath.id} className="animate-scale-in">
                  <LearningPathCard learningPath={learningPath} />
                </div>
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold mb-2">No learning paths found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search to find what you're looking for
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </div>
          ) : null}
          
          {/* Pagination */}
          {!loading && filteredLearningPaths.length > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
    </div>
  );
};

export default LearningPathsPage;
