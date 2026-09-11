"use client";

import { useEffect, useRef } from "react";

type Entry = { slug: string; title: { zh: string; en: string }; category: string[]; year: string; order: number };
export default function HouseHomepage({ projects }: { projects: Entry[] }) {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const previous = document.documentElement.lang;
    const readLanguage = () => {
      const query = new URL(location.href).searchParams.get("lang");
      if (query === "zh" || query === "en") return query;
      try { return localStorage.getItem("zoya-house-language") === "en" ? "en" : "zh"; } catch { return "zh"; }
    };
    const saveLanguage = (lang: string) => {
      document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
      try { localStorage.setItem("zoya-house-language", lang); } catch {}
      const url = new URL(location.href); url.searchParams.set("lang", lang);
      history.replaceState(history.state, "", url);
    };
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      const message = event.data;
      if (!message || typeof message !== "object") return;
      if (message.type === "house-ready") {
        const language = readLanguage(); saveLanguage(language);
        frame.current?.contentWindow?.postMessage({ type: "house-init", projects, language }, location.origin);
      }
      if (message.type === "house-language" && ["zh", "en"].includes(message.language)) saveLanguage(message.language);
      if (message.type === "house-project" && projects.some((p) => p.slug === message.slug)) {
        const language = message.language === "en" ? "en" : "zh";
        saveLanguage(language);
        location.assign(`/projects/${encodeURIComponent(message.slug)}?lang=${language}`);
      }
    };
    window.addEventListener("message", receive);
    // Recover the handshake if the iframe loaded before this effect.
    frame.current?.contentWindow?.postMessage({ type: "house-ping" }, location.origin);
    return () => { window.removeEventListener("message", receive); document.documentElement.lang = previous; };
  }, [projects]);
  return <iframe ref={frame} src="/house/index.html" title="互动作品集首页 / Interactive portfolio home" style={{ position: "fixed", inset: 0, width: "100%", height: "100dvh", border: 0, display: "block", background: "#f8f8f4", zIndex: 1 }} />;
}
