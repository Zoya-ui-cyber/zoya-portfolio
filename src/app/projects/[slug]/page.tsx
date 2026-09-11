import PdfPortfolioProject from "@/components/project/PdfPortfolioProject";
import CraftAcademy from "@/components/project/craft/CraftAcademy";

import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  getNextProject,
  getProjectBySlug,
} from "@/lib/projects";
import { notFound } from "next/navigation";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;

  const project = getProjectBySlug(slug);

  if (!project) {
     notFound();
  }

  const nextProject = getNextProject(slug);

  // 手工艺学院使用自己的独立页面

  if (project.slug === "craft-academy") {
  return (
    <>
      <CraftAcademy />
    </>
  );
}

if (project.mode === "pdf" && project.pages?.length) {
  return <PdfPortfolioProject key={project.slug} project={project} nextProject={nextProject?.order === 1 ? undefined : nextProject} />;
}

// 保留原有定制页面的回退逻辑

  return (
    <>
      <Header />

      <main className="project-page">
        <section className="project-hero">
          <div className="project-hero-number">
            {String(project.order).padStart(2, "0")}
          </div>

          <div className="project-hero-title">
            <p className="eyebrow">
              {project.category.join(" / ")}
            </p>

            <h1>{project.title.zh}</h1>

            {project.subtitle && (
              <p className="project-subtitle">
                {project.subtitle.zh}
              </p>
            )}
          </div>

          <div className="project-hero-meta">
            <div>
              <span>YEAR</span>
              <p>{project.year}</p>
            </div>

            <div>
              <span>TYPE</span>
              <p>{project.projectType.zh}</p>
            </div>

            {project.period && (
              <div>
                <span>PERIOD</span>
                <p>{project.period}</p>
              </div>
            )}

            {project.instructors && (
              <div>
                <span>INSTRUCTOR</span>
                <p>{project.instructors.join(" / ")}</p>
              </div>
            )}
          </div>
        </section>

        <section className="project-introduction">
          <p>{project.description?.zh}</p>
        </section>
      
      {nextProject && (
  <section className="next-project">
    <Link
      href={`/projects/${nextProject.slug}`}
      className="next-project-link"
    >
      <span className="next-project-label">
        NEXT PROJECT
      </span>

      <div className="next-project-main">
        <span>
          {String(nextProject.order).padStart(2, "0")}
        </span>

        <h2>{nextProject.title.zh}</h2>
      </div>

      {nextProject.subtitle && (
        <p>{nextProject.subtitle.zh}</p>
      )}

      <span className="next-project-arrow">
        ↓
      </span>
    </Link>
  </section>
)}

      </main>
    </>
  );
}