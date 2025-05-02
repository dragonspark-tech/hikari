import { cn } from '../lib/utils';
import type { ReactNode } from 'react';

export const LabelInputContainer = ({
                               children,
                               className,
                             }: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};