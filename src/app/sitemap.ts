import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://envevidence.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${siteUrl}/search`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${siteUrl}/topics`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${siteUrl}/research`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${siteUrl}/sources`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${siteUrl}/methodology`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${siteUrl}/professional`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${siteUrl}/legal`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.4 },
  ];

  const domains = [
    'water', 'air', 'carbon-climate', 'plastic-microplastic',
    'chemical-pollution', 'industrial',
  ];

  const domainPages = domains.map((domain) => ({
    url: `${siteUrl}/environment/${domain}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // In production, dynamically add:
  // - /location/[slug] for each location in the database
  // - /evidence/[id] for verified, published evidence
  // - /environment/[domain]/[location] for location-specific domain pages

  return [...staticPages, ...domainPages];
}