"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import type { Project, Language } from "@/types/project";
import styles from "./pdf-portfolio.module.css";

export default function PdfPortfolioProject({ project, nextProject }: { project: Project; nextProject?: Project }) {
  const [language, setLanguage] = useState<Language>("zh");
  useEffect(() => {
    const query = new URL(location.href).searchParams.get("lang");
    let saved = "zh";
    try { saved = localStorage.getItem("zoya-house-language") || "zh"; } catch {}
    setLanguage((query || saved) === "en" ? "en" : "zh");
  }, []);
  function toggleLanguage() {
    const next = language === "zh" ? "en" : "zh";
    setLanguage(next);
    try { localStorage.setItem("zoya-house-language", next); } catch {}
    const url = new URL(location.href);
    url.searchParams.set("lang", next);
    history.replaceState(history.state, "", url);
  }
  return (
    <div className={styles.root} lang={language === "zh" ? "zh-CN" : "en"}>
      <div className={styles.navigation} onClick={(event) => {
        if ((event.target as HTMLElement).closest("button.language-switch")) toggleLanguage();
      }}><Header /></div>
      <main className={styles.pages} aria-label={project.title[language]}>
        {project.pages?.map((page, index) => (
          // Serve the lossless original directly: avoid recompressing fine drawing text.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={page.src} className={styles.page} src={page.src}
            width={page.width} height={page.height}
            alt={`${project.title[language]} — ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"} decoding="async" />
        ))}
      </main>
      <footer className={styles.end}>
        {nextProject ? <Link prefetch={false} href={`/projects/${nextProject.slug}?lang=${language}`}>
          <span>NEXT PROJECT →</span><strong>{nextProject.title[language]}</strong>
        </Link> : <Link href={`/?lang=${language}`}><span>BACK TO DIRECTORY ↑</span></Link>}
      </footer>
    </div>
  );
}
