import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarWithFallbackProps {
  src?: string | null;
  name: string;
}

export const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({ src, name }) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Avatar className="h-24 w-24">
      <AvatarImage src={src || ''} alt={name} />
      <AvatarFallback className="text-lg font-semibold">{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
};
