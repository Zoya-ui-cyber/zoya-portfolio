import Header from "@/components/layout/Header";

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="about-page">
        <section className="about-hero">
          <div className="about-photo">
            {/* 以后放你的个人照片 */}
          </div>

          <div className="about-intro">
            <p className="eyebrow">ABOUT</p>

            <h1>ZINA YIN</h1>

            <p className="about-role">
              Spatial / Digital Designer
            </p>

            <p className="about-summary">
              我关注建筑、空间、材料与数字媒介之间的关系，
              并通过在地研究、空间叙事、3D 可视化与数字工具，
              探索不同媒介之间的设计可能。
            </p>
          </div>
        </section>

        <section className="about-details">
          <div className="about-block">
            <span>EDUCATION</span>

            <p>
              中国美术学院 · 建筑艺术学院
              <br />
              环境艺术设计
              <br />
              2021 — 2025
            </p>
          </div>

          <div className="about-block">
            <span>EXPERIENCE</span>

            <p>
              3D / AIGC / Visualization
              <br />
              Architecture & Spatial Design
            </p>
          </div>

          <div className="about-block">
            <span>SKILLS</span>

            <p>
              Architecture
              <br />
              3D Modeling
              <br />
              Rendering
              <br />
              AIGC
              <br />
              UI / Visual Design
            </p>
          </div>

          <div className="about-block">
            <span>AWARDS</span>

            <p>
              Selected Design Awards
            </p>
          </div>
        </section>
      </main>
    </>
  );
}