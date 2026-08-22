import type { ReactNode } from 'react';
import { COLORS } from '../../domain/constants';

interface PageHeroProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHero({ title, description, children }: PageHeroProps) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.corPadrao}, ${COLORS.mint})`,
        borderRadius: 16,
        padding: '32px',
        marginBottom: 32,
      }}
    >
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{title}</h2>
      {description && (
        <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: 8, whiteSpace: 'pre-line' }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
