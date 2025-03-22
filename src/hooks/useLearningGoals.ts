
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export interface LearningGoal {
  id: string;
  user_id: string;
  title: string;
  deadline: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export const useLearningGoals = (userId?: string) => {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGoals = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('learning_goals')
          .select('*')
          .eq('user_id', userId)
          .order('deadline', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setGoals(data as LearningGoal[]);
        }
      } catch (error: any) {
        console.error('Error fetching learning goals:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();

    // Set up realtime subscription
    const channel = supabase
      .channel('learning_goals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learning_goals',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const addGoal = async (goal: Omit<LearningGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('learning_goals')
        .insert({
          ...goal,
          user_id: userId,
        })
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Goal added',
        description: 'Your learning goal has been added successfully.',
      });
      
      return data;
    } catch (error: any) {
      console.error('Error adding goal:', error.message);
      toast({
        variant: 'destructive',
        title: 'Failed to add goal',
        description: error.message,
      });
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Omit<LearningGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('learning_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Goal updated',
        description: 'Your learning goal has been updated successfully.',
      });
      
      return data;
    } catch (error: any) {
      console.error('Error updating goal:', error.message);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message,
      });
      return null;
    }
  };

  const deleteGoal = async (id: string) => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase
        .from('learning_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Goal deleted',
        description: 'Your learning goal has been deleted successfully.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting goal:', error.message);
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message,
      });
      return false;
    }
  };

  return { goals, loading, addGoal, updateGoal, deleteGoal };
};
