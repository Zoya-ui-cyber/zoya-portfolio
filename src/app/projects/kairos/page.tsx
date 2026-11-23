"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import s from "./kairos.module.css";

const KEY = "zoya-house-language";

export default function KairosProject() {
  const [en, setEn] = useState(false);
  useEffect(() => {
    const query = new URLSearchParams(location.search).get("lang");
    let saved = "zh";
    try { saved = localStorage.getItem(KEY) || "zh"; } catch {}
    setEn((query || saved) === "en");
  }, []);
  function toggle() {
    const next = !en;
    setEn(next);
    try { localStorage.setItem(KEY, next ? "en" : "zh"); } catch {}
    const address = new URL(location.href);
    address.searchParams.set("lang", next ? "en" : "zh");
    history.replaceState(history.state, "", address);
  }
  const lang = en ? "en" : "zh";
  const t = (zh: string, eng: string) => (en ? eng : zh);
  const shots: [string, string, string, string, string][] = [
    ["read", "链接放在家具上", "Links live on furniture", "电视、音响、衣帽架和阅读桌各自连着一个网页。点开看，也可以缩回家具里，或先藏起来。", "The TV, speaker, coat rack and reading desk each hold a web page. Open it, shrink it back into the furniture, or tuck it away."],
    ["edit", "房间由自己布置", "Arrange your own room", "拖动家具，换地板和墙纸，给任何一件家具改名字、绑网址。", "Drag furniture, swap floors and wallpaper, and give any piece a name and a URL."],
    ["home", "换个头像就进来", "Pick a face and walk in", "选头像、填昵称，走进房间。把链接发给朋友，头像框就能变成彼此的画面，也能把屏幕放到房间的电脑、平板和手机上。", "Choose an avatar, enter a nickname and walk in. Send the link to friends, see each other in the avatar frames, and put your screen on the room's laptop, tablet or phone."],
  ];
  return (
    <div className={s.page}>
      <header className={s.header}>
        <Link href={`/?lang=${lang}`}>ZOYA YIN</Link>
        <button onClick={toggle} aria-label={t("切换到英文", "Switch to Chinese")}>中 / EN</button>
      </header>
      <main className={s.main}>
        <section className={s.hero}>
          <div>
            <p className={s.meta}>{t("团队项目，2026", "Team project, 2026")}</p>
            <h1>{t("共此刻 KAIROS", "KAIROS")}</h1>
            <p className={s.sub}>{t("和朋友一起，进入互联网。", "Enter the internet, together.")}</p>
            <p className={s.lead}>{t("一个可以布置的 2D 共享房间。网页不再挤在标签页里，而是放在电脑、电视和书桌上。", "An editable 2D shared room where web pages live on the laptop, the TV and the desk instead of in a row of tabs.")}</p>
            <a className={s.cta} href="/kairos" target="_blank" rel="noopener noreferrer">{t("打开实机 Demo ↗", "Open the live demo ↗")}</a>
            <p className={s.note}>{t("支持 2 到 4 人，建议用电脑打开。", "Rooms for 2 to 4 people. Best on desktop.")}</p>
          </div>
          <img src="/projects/kairos/room.webp" width="1920" height="1200" alt={t("共此刻房间全景", "Overview of the KAIROS room")} />
        </section>
        {shots.map(([id, zh, eng, a, b]) => (
          <section className={s.row} key={id}>
            <div><h2>{t(zh, eng)}</h2><p>{t(a, b)}</p></div>
            <img src={`/projects/kairos/${id}.webp`} width="1920" height="1200" alt={t(zh, eng)} loading="lazy" />
          </section>
        ))}
        <footer className={s.footer}>
          <Link href={`/?lang=${lang}`}>{t("← 返回作品集", "← Back to portfolio")}</Link>
          <a href="/kairos" target="_blank" rel="noopener noreferrer">{t("打开实机 Demo ↗", "Open the live demo ↗")}</a>
        </footer>
      </main>
    </div>
  );
}
