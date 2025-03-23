
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NavbarSearchProps {
  isMobile?: boolean;
}

const NavbarSearch = ({ isMobile = false }: NavbarSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={isMobile ? "relative" : "relative w-[240px]"}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
      <Input
        type="search"
        placeholder="Search courses..."
        className="pl-10 h-9 border-none bg-secondary dark:bg-gray-800/60 dark:placeholder:text-gray-400 dark:text-gray-200"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isSearching}
      />
    </form>
  );
};

export default NavbarSearch;
