import ExplodedTransformation from "@/components/interactive/ExplodedTransformation";
import ExhibitionDetail from "@/components/interactive/ExhibitionDetail";
import SpatialSequence from "@/components/interactive/SpatialSequence";
import DesignGenerationVideo from "@/components/interactive/DesignGenerationVideo";
import Image from "next/image";
import type { Project } from "@/types/project";

type CraftAcademyProjectProps = {
  project: Project;
};

export default function CraftAcademyProject({
  project,
}: CraftAcademyProjectProps) {
  return (
    <main className="craft-project">
      {/* =========================
          OPENING
      ========================== */}

      <section className="craft-hero">
        <Image
          src="/projects/craft-academy/page-01-hero/p01-after-original.png"
          alt="手工艺学院改造项目鸟瞰图"
          fill
          priority
          className="craft-hero-image"
          sizes="100vw"
        />

        <div className="craft-hero-overlay" />

        <div className="craft-hero-content">
          <div className="craft-hero-number">
            <span>01</span>
            <span className="craft-number-line" />
          </div>

          <div className="craft-hero-title">
            <h1>{project.title.zh}</h1>

            <p className="craft-hero-title-en">
              CRAFT ACADEMY RENOVATION
            </p>

            <p className="craft-hero-location">
              浙江 · 松阳&nbsp;&nbsp;/&nbsp;&nbsp;2025
            </p>

            <div className="craft-hero-statement">
              <span className="craft-statement-line" />

              <p>
                在城市边界中重新建立公共、学习与日常生活之间的空间联系。
              </p>
            </div>
          </div>

          <div className="craft-hero-meta">
            <div>
              <span>TYPE</span>
              <p>Architecture / Renovation</p>
            </div>

            <div>
              <span>LOCATION</span>
              <p>Songyang, Zhejiang</p>
            </div>

            <div>
              <span>YEAR</span>
              <p>{project.year}</p>
            </div>
          </div>
        </div>

        <div className="craft-project-count">
          01 / 06
        </div>

        <a
          href="#craft-context"
          className="craft-scroll-indicator"
          aria-label="继续浏览项目"
        >
          <span className="craft-scroll-line" />
          <span>SCROLL</span>
          <span className="craft-scroll-arrow">⌄</span>
        </a>
      </section>


      {/* ======================================
    01 / CONTEXT
====================================== */}

<section
  id="craft-context"
  className="craft-analysis-screen"
>
  <div className="craft-analysis-sidebar">
    <div className="craft-analysis-index">
      <span>01</span>
      <p>CONTEXT</p>
    </div>

    <div className="craft-analysis-title">
      <h2>
        从城市关系，
        <br />
        推导空间需求。
      </h2>

      <p>
        从新华路所处的新老城区边界出发，
        将周边人群、活动需求与既有建筑条件
        转化为设计变量。
      </p>
    </div>

    <div className="craft-analysis-axis">
      <span>DATA</span>
      <span>RESEARCH</span>
      <span>LOGIC</span>
      <span>DESIGN</span>

      <div className="craft-axis-horizontal" />
      <div className="craft-axis-vertical" />
      <div className="craft-axis-dot" />
    </div>
  </div>


  <div className="craft-analysis-main">

    {/* LEFT — USER / URBAN DATA */}

    <div className="craft-analysis-program">
      <div className="craft-panel-header">
        <span>01</span>
        <p>URBAN CONTEXT / USER DEMAND</p>
      </div>

      <div className="craft-program-image">
        <img
          src="/projects/craft-academy/page-02-context/p02-research-original.png"
          alt="新华路城市关系与使用者需求分析"
        />
      </div>

      <div className="craft-program-data">
        <div>
          <strong>100%</strong>
          <span>NEW URBAN</span>
          <p>LIVING</p>
        </div>

        <div>
          <strong>40 / 60</strong>
          <span>RIVERSIDE</span>
          <p>OPEN SPACE</p>
        </div>

        <div>
          <strong>70 / 30</strong>
          <span>SITE</span>
          <p>EXHIBITION</p>
        </div>

        <div>
          <strong>20 / 80</strong>
          <span>OLD TOWN</span>
          <p>TEACHING</p>
        </div>
      </div>
    </div>


    {/* RIGHT */}

    <div className="craft-analysis-right">

      {/* EXISTING BUILDING */}

      <div className="craft-existing-panel">
        <div className="craft-panel-header">
          <span>02</span>
          <p>EXISTING BUILDING</p>
        </div>

        <div className="craft-existing-images">
          <img
            src="/projects/craft-academy/page-02-context/p02-existing-front.png"
            alt="既有建筑正面模型"
          />

          <img
            src="/projects/craft-academy/page-02-context/p02-existing-side.png"
            alt="既有建筑侧面模型"
          />
        </div>

        <div className="craft-existing-stats">
          <div>
            <span>STRUCTURE</span>
            <strong>RC FRAME</strong>
          </div>

          <div>
            <span>TYPOLOGY</span>
            <strong>L-SHAPE</strong>
          </div>

          <div>
            <span>CONDITION</span>
            <strong>INTACT</strong>
          </div>

          <div>
            <span>ISSUE</span>
            <strong>CLOSED</strong>
          </div>
        </div>
      </div>


      {/* DESIGN QUESTION */}

      <div className="craft-question-panel">
        <div className="craft-panel-header">
          <span>03</span>
          <p>DESIGN QUESTION</p>
        </div>

        <div className="craft-question-content">
          <div className="craft-question-core">
            <span>
              HOW MIGHT WE
            </span>

            <h3>
              激活城市边界？
            </h3>

            <p>
              如何将封闭的行政办公楼，
              转化为连接城市、工艺、学习
              与日常生活的公共界面？
            </p>
          </div>

          <div className="craft-question-orbit">
            <span>CITY</span>
            <span>CRAFT</span>
            <span>LEARNING</span>
            <span>DAILY LIFE</span>

            <div className="craft-orbit-circle craft-orbit-one" />
            <div className="craft-orbit-circle craft-orbit-two" />
            <div className="craft-orbit-center">
              PUBLIC
            </div>
          </div>
        </div>

        <div className="craft-question-reveal">
          <span>HOVER TO EXPLORE</span>

          <p>
            城市 × 工艺 × 学习 × 日常生活
            <br />
            → PUBLIC INTERFACE
          </p>
        </div>
      </div>

    </div>
  </div>
</section>



{/* ======================================
    02 / TRANSFORMATION
====================================== */}
<DesignGenerationVideo />



      {/* =========================
          SPATIAL SEQUENCE
      ========================== */}

      <SpatialSequence />

      <ExhibitionDetail />
      <ExplodedTransformation />


      {/* =========================
          DRAWINGS
      ========================== */}

      <section className="craft-section">
        <div className="craft-section-label">
          06 / DRAWINGS
        </div>

        <div className="craft-section-heading">
          <h2>
            建筑图纸
          </h2>
        </div>
      </section>


      {/* =========================
          MODEL
      ========================== */}

      <section className="craft-section">
        <div className="craft-section-label">
          07 / MODEL
        </div>

        <div className="craft-section-heading">
          <h2>
            建筑模型与细节
          </h2>
        </div>
      </section>
    </main>
  );
}

