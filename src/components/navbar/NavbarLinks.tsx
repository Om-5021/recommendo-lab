
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavbarLinksProps {
  isMobile?: boolean;
  onClick?: () => void;
}

const NavbarLinks = ({ isMobile = false, onClick }: NavbarLinksProps) => {
  const location = useLocation();
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <nav className={isMobile ? "flex flex-col space-y-4" : "hidden md:flex items-center space-x-8"}>
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          onClick={onClick}
          className={cn(
            'font-medium transition-colors hover:text-primary dark:hover:text-primary',
            location.pathname === link.path 
              ? 'text-primary dark:text-primary' 
              : 'text-foreground dark:text-gray-200',
            isMobile && 'py-2'
          )}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
};

export default NavbarLinks;
