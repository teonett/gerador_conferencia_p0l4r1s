import type { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHero({ title, description, children }: PageHeroProps) {
  return (
    <div className="bg-gradient-to-br from-corPadrao to-mint rounded-2xl p-8 mb-8">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {description && (
        <p className="text-white/90 mt-2 whitespace-pre-line">{description}</p>
      )}
      {children}
    </div>
  );
}
