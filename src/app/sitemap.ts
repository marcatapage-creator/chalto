import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://chalto.fr',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    // Ajoutez vos futures pages ici
  ];
}
