import { useEffect } from 'react';

interface PageMetadataProps {
  title: string;
  description: string;
}

function upsertMetaTag(name: string, content: string) {
  let metaTag = document.querySelector(`meta[name="${name}"]`);

  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', name);
    document.head.appendChild(metaTag);
  }

  metaTag.setAttribute('content', content);
}

export function PageMetadata({ title, description }: PageMetadataProps) {
  useEffect(() => {
    document.title = title;
    upsertMetaTag('description', description);
  }, [title, description]);

  return null;
}
