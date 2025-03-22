
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { addDays, subDays, format } from 'date-fns';

export interface WeeklyProgressItem {
  id?: string;
  user_id?: string;
  date: string;
  value: number;
  name?: string; // For chart display
}

export const useWeeklyProgress = (userId?: string) => {
  const [weeklyData, setWeeklyData] = useState<WeeklyProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyProgress = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get the date 6 days ago
        const sixDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd');
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Fetch data from Supabase
        const { data, error } = await supabase
          .from('weekly_progress')
          .select('*')
          .eq('user_id', userId)
          .gte('date', sixDaysAgo)
          .lte('date', today)
          .order('date', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Create an array of the last 7 days
        const lastSevenDays: WeeklyProgressItem[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
          const dayName = format(subDays(new Date(), i), 'EEE');
          
          // Find if we have data for this day
          const existingData = data?.find(item => item.date === date);
          
          lastSevenDays.push({
            date,
            name: dayName,
            value: existingData ? existingData.value : 0,
            id: existingData?.id,
            user_id: existingData?.user_id || userId
          });
        }
        
        setWeeklyData(lastSevenDays);
      } catch (error: any) {
        console.error('Error fetching weekly progress:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyProgress();

    // Set up realtime subscription
    const channel = supabase
      .channel('weekly_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_progress',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchWeeklyProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const updateDailyProgress = async (date: string, value: number) => {
    if (!userId) return null;
    
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');
    const existingItem = weeklyData.find(item => item.date === formattedDate);
    
    try {
      let result;
      
      if (existingItem?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('weekly_progress')
          .update({
            value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingItem.id)
          .select('*')
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('weekly_progress')
          .insert({
            user_id: userId,
            date: formattedDate,
            value,
          })
          .select('*')
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      // Update local state
      setWeeklyData(prev => 
        prev.map(item => 
          item.date === formattedDate 
            ? { ...item, value, id: result.id, user_id: result.user_id }
            : item
        )
      );
      
      return result;
    } catch (error: any) {
      console.error('Error updating daily progress:', error.message);
      return null;
    }
  };

  return { weeklyData, loading, updateDailyProgress };
};
