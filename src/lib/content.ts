import site from '../content/site.json';
import services from '../content/services.json';
import projects from '../content/projects.json';
import plants from '../content/plants.json';
import clients from '../content/clients.json';
import resources from '../content/resources.json';
import processSteps from '../content/process.json';
import pages from '../content/pages.json';
import materials from '../content/materials.json';

export { site, services, projects, plants, clients, resources, pages, materials, processSteps as process };

export function materialBySlug(slug: string) {
  return materials.find((item) => item.slug === slug);
}

export function materialsIn(category: string) {
  const want = category.trim().toLowerCase();
  if (!want) return [];
  return materials.filter((item) =>
    String(item.category || '')
      .split(',')
      .map((part) => part.trim().toLowerCase())
      .includes(want),
  );
}

export function materialsForProject(slug: string, tags: string) {
  const named = materials.filter((item) =>
    String(item.projects || '')
      .split(',')
      .map((part) => part.trim())
      .includes(slug),
  );
  if (named.length) return named;
  const tag = String(tags || '')
    .split(',')
    .map((part) => part.trim())
    .find(Boolean);
  return tag ? materialsIn(tag) : [];
}

export function linesOf(value: string) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

const waText = 'Hello Vakratund Construction. I have a site to discuss.';

export const links = {
  tel: `tel:${site.phoneTel}`,
  whatsapp: `https://wa.me/${site.phoneWa}?text=${encodeURIComponent(waText)}`,
  email: `mailto:${site.email}`,
  proprietorEmail: `mailto:${site.proprietorEmail}`,
  maps: site.office.maps,
};

export function projectBySlug(slug: string) {
  return projects.find((item) => item.slug === slug);
}

export function serviceBySlug(slug: string) {
  return services.find((item) => item.slug === slug);
}

/** Prefix a site path so GitHub Pages project URLs and the custom domain both work. */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return base.endsWith('/') ? base : `${base}/`;
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${prefix}${normalized}`;
}
