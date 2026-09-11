import HouseHomepage from "@/components/house/HouseHomepage";
import { projects } from "@/content/projects";

export default function Home() {
  const entries = projects.map((project) => ({
    slug: project.slug,
    title: { zh: project.title.zh, en: project.title.en || project.title.zh },
    category: [...project.category],
    year: String(project.year),
    order: project.order,
  }));
  return <HouseHomepage projects={entries} />;
}
