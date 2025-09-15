'use client';

import { generateJsonLd } from '@/utils/seo';

interface StructuredDataProps {
  type: 'Organization' | 'WebApplication' | 'MobileApplication';
}

export function StructuredData({ type }: StructuredDataProps) {
  const jsonLd = generateJsonLd(type);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
