
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Book, Compass, BarChart2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import useSession from '@/hooks/useSession';
import { useLocation } from 'react-router-dom';

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

const NavLink = ({ href, icon, label, className }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link 
      to={href} 
      className={cn(
        "flex items-center gap-2 text-base font-medium transition-colors hover:text-foreground/80",
        isActive ? "text-foreground" : "text-foreground/60",
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const NavbarLinks = () => {
  const { session } = useSession();

  return (
    <div className="hidden md:flex items-center gap-6">
      <NavLink href="/" icon={<Home className="h-4 w-4" />} label="Home" />
      <NavLink href="/courses" icon={<Book className="h-4 w-4" />} label="Courses" />
      <NavLink href="/learning-paths" icon={<Compass className="h-4 w-4" />} label="Learning Paths" />
      {session && (
        <>
          <NavLink href="/dashboard" icon={<BarChart2 className="h-4 w-4" />} label="Dashboard" />
          <NavLink href="/course-import" icon={<Upload className="h-4 w-4" />} label="Import Courses" />
        </>
      )}
    </div>
  );
};

export default NavbarLinks;
