
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Award, ChevronUp } from 'lucide-react';

interface StatItem {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendUp: boolean | null;
}

interface DashboardStatsProps {
  statItems: StatItem[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ statItems }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((stat, index) => (
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
  );
};

export default DashboardStats;
