import React from 'react';
import { cn, initials } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: Size;
  className?: string;
}

const sizeMap: Record<Size, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export default function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizeMap[size], className)} />;
  }
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex-shrink-0',
        sizeMap[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
