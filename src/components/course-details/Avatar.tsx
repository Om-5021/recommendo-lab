
import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Avatar = ({ children, className, ...props }: AvatarProps) => {
  return (
    <div className={cn("relative overflow-hidden rounded-full", className)} {...props}>
      {children}
    </div>
  );
};

export const AvatarImage = ({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return <img src={src} alt={alt} className={cn("aspect-square h-full w-full", className)} {...props} />;
};

export const AvatarFallback = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
