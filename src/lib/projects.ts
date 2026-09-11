import { projects } from "@/content/projects";

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const collection = getProjectBySlug(slug)?.collection;
  const sortedProjects = projects.filter((project) => project.collection === collection).sort(
    (a, b) => a.order - b.order
  );

  const currentIndex = sortedProjects.findIndex(
    (project) => project.slug === slug
  );

  if (currentIndex === -1) {
    return undefined;
  }

  const nextIndex =
    (currentIndex + 1) % sortedProjects.length;

  return sortedProjects[nextIndex];
}