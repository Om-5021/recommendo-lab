
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types/database';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/UserContext';
import { useLearningGoals } from '@/hooks/useLearningGoals';

interface LearningGoal {
  id?: string;
  title: string;
  deadline: string;
  progress: number;
}

interface DashboardSidebarProps {
  recommendedCourses: Course[];
  learningGoals?: LearningGoal[];
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  recommendedCourses,
  learningGoals = []
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const { user } = useUser();
  const { addGoal, updateGoal, deleteGoal } = useLearningGoals(user?.id);

  const handleAddGoal = async () => {
    if (!goalTitle.trim() || !goalDeadline) return;
    
    if (editingGoalId) {
      await updateGoal(editingGoalId, {
        title: goalTitle,
        deadline: new Date(goalDeadline).toISOString(),
        progress: 0
      });
    } else {
      await addGoal({
        title: goalTitle,
        deadline: new Date(goalDeadline).toISOString(),
        progress: 0
      });
    }
    
    resetForm();
  };

  const handleEditGoal = (goal: LearningGoal) => {
    if (!goal.id) return;
    
    setEditingGoalId(goal.id);
    setGoalTitle(goal.title);
    
    // Convert deadline string to a date
    const deadlineDate = (() => {
      const today = new Date();
      
      if (goal.deadline.includes('day left')) {
        const days = parseInt(goal.deadline.split(' ')[0]) || 1;
        return new Date(today.setDate(today.getDate() + days));
      } else if (goal.deadline.includes('week')) {
        const weeks = parseInt(goal.deadline.split(' ')[0]) || 1;
        return new Date(today.setDate(today.getDate() + (weeks * 7)));
      } else if (goal.deadline === 'Due today') {
        return today;
      } else {
        return today; // Default fallback
      }
    })();
    
    setGoalDeadline(deadlineDate.toISOString().split('T')[0]);
    setIsDialogOpen(true);
  };

  const handleDeleteGoal = async (id: string | undefined) => {
    if (!id) return;
    await deleteGoal(id);
  };

  const resetForm = () => {
    setGoalTitle('');
    setGoalDeadline('');
    setEditingGoalId(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Recommendations */}
      <section className="animate-fade-up" style={{ animationDelay: "0.5s" }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Recommended For You</h2>
        </div>
        
        <div className="space-y-5">
          {recommendedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        
        <Button className="w-full mt-4">
          View More Recommendations
        </Button>
      </section>
      
      {/* Learning Goals */}
      <section className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: "0.6s" }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Learning Goals</h2>
          <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Goal
          </Button>
        </div>
        
        <div className="space-y-4">
          {learningGoals && learningGoals.length > 0 ? (
            learningGoals.map((goal, index) => (
              <div key={goal.id || index} className="border border-border/50 rounded-lg p-3 bg-background/50 relative group">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditGoal(goal)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDeleteGoal(goal.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
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
            ))
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              No learning goals yet. Add your first goal to track your progress!
            </div>
          )}
        </div>
      </section>
      
      {/* Add/Edit Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGoalId ? 'Edit Learning Goal' : 'Add Learning Goal'}</DialogTitle>
            <DialogDescription>
              {editingGoalId 
                ? 'Update your learning goal and deadline.' 
                : 'Set a new learning goal to track your progress.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input
                id="goal-title"
                placeholder="e.g., Complete Machine Learning Course"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal-deadline">Deadline</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>
              {editingGoalId ? 'Update Goal' : 'Add Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardSidebar;
