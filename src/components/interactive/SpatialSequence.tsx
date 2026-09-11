"use client";

import { useRef, useState } from "react";

const scenes = [
  {
    number: "01",
    title: "LIFE UNIT",
    zh: "生活单元",
    description:
      "学生宿舍构成学习之外的日常生活空间，以相对安静、私密的单元形成稳定的居住秩序。",
  },
  {
    number: "02",
    title: "TRANSITION",
    zh: "过渡空间",
    description:
      "连接不同功能区域的半开放空间，在通行之外创造停留、交流与观察建筑内部活动的机会。",
  },
  {
    number: "03",
    title: "LIVING",
    zh: "生活空间",
    description:
      "原有结构被重新组织为更加开放的日常空间，使生活行为进入建筑内部的公共系统。",
  },
  {
    number: "04",
    title: "LEARNING CORE",
    zh: "中央学习空间",
    description:
      "围绕垂直交通形成连续的学习空间，让教学、交流与非正式活动在不同楼层之间发生。",
  },
  {
    number: "05",
    title: "VERTICAL LINK",
    zh: "垂直连接",
    description:
      "新的垂直交通系统穿过原有建筑结构，将不同高度的公共空间重新连接。",
  },
  {
    number: "06",
    title: "ROOF SYSTEM",
    zh: "屋顶空间",
    description:
      "新增的轻型屋顶结构形成新的活动界面，并延伸建筑与城市之间的公共关系。",
  },
  {
    number: "07",
    title: "WORKSHOP",
    zh: "工艺空间",
    description:
      "工艺教学与制作空间被嵌入原有结构，使生产、学习与展示形成连续关系。",
  },
  {
    number: "08",
    title: "PUBLIC HALL",
    zh: "公共空间",
    description:
      "开放的大尺度空间承载展览、集会与公共活动，成为学院与城市发生联系的重要界面。",
  },
];

export default function SpatialSequence() {
  const [activeScene, setActiveScene] = useState(0);

  const viewerRef = useRef<HTMLDivElement>(null);

  const selectFromOverview = (index: number) => {
  setActiveScene(index);

  window.setTimeout(() => {
    const viewer = viewerRef.current;

    if (!viewer) return;

    const headerHeight = 48;

    const targetY =
      viewer.getBoundingClientRect().top +
      window.scrollY -
      headerHeight;

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  }, 80);
};

  return (
    <div className="spatial-sequence">
      {/* ========================================
          SCREEN 01 — MAIN SECTION
      ======================================== */}

      <section className="spatial-overview">
        <div className="spatial-heading">
          <div>
            <span className="spatial-number">
              03
            </span>

            <span className="spatial-label">
              SPATIAL SEQUENCE
            </span>
          </div>

          <p>
            Eight spatial moments across the transformed structure.
          </p>
        </div>

        <MagnifiableSection />
      </section>

      {/* ========================================
          ONE SHARED NAVIGATION
      ======================================== */}

      <div
  ref={viewerRef}
  className="spatial-viewer-screen"
>
  <div className="spatial-navigation-sticky">
    <SceneNavigation
      activeScene={activeScene}
      onSelect={selectFromOverview}
    />
  </div>

  <section className="spatial-detail">
    <div className="spatial-detail-image">
      <img
        key={activeScene}
        src={`/projects/craft-academy/spatial/scene-${scenes[activeScene].number}.png`}
        alt={scenes[activeScene].zh}
      />

      <div className="spatial-detail-counter">
        {scenes[activeScene].number} / 08
      </div>

      <div className="spatial-detail-info">
        <div className="spatial-info-index">
          {scenes[activeScene].number}
        </div>

        <div className="spatial-info-content">
          <div className="spatial-info-title">
            <span className="spatial-info-en">
              {scenes[activeScene].title}
            </span>

            <h3>
              {scenes[activeScene].zh}
            </h3>

            <span className="spatial-info-plus">
              +
            </span>
          </div>

          <div className="spatial-info-description">
            <div className="spatial-info-line" />

            <p>
              {scenes[activeScene].description}
            </p>

            <p>
              改造并非将新的空间系统简单覆盖于原有建筑之上，
              而是通过对既有结构、交通路径与公共界面的重新组织，
              建立学习、生活、展示与交流之间更加连续的空间关系。
            </p>

            <p>
              新增结构以轻介入的方式进入原有框架，
              在保留既有建筑结构逻辑的同时形成新的空间层次。
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
    </div>
  );
}

/* ========================================
   SCENE NAVIGATION
======================================== */

function SceneNavigation({
  activeScene,
  onSelect,
}: {
  activeScene: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav
      className="spatial-scene-nav"
      aria-label="Spatial scenes"
    >
      {scenes.map((scene, index) => (
        <button
          key={scene.number}
          type="button"
          className={`spatial-scene-item ${
            activeScene === index
              ? "is-active"
              : ""
          }`}
          onClick={() => onSelect(index)}
        >
          <div className="spatial-thumb">
            <img
              src={`/projects/craft-academy/spatial/scene-${scene.number}.png`}
              alt={scene.zh}
            />
          </div>

          <div className="spatial-thumb-meta">
            <span>
              {scene.number}
            </span>

            <strong>
              {scene.title}
            </strong>
          </div>
        </button>
      ))}
    </nav>
  );
}

/* ========================================
   MAGNIFIABLE MAIN SECTION
======================================== */

function MagnifiableSection() {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [lens, setLens] = useState({
    visible: false,
    x: 0,
    y: 0,
    bgX: 0,
    bgY: 0,
    bgWidth: 0,
    bgHeight: 0,
  });

  const handleMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const element = containerRef.current;

    if (!element) return;

    const rect =
      element.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const y =
      event.clientY - rect.top;

    const percentX =
      (x / rect.width) * 100;

    const percentY =
      (y / rect.height) * 100;

    const zoom = 3;

    setLens({
      visible: true,
      x,
      y,

      bgX: percentX,
      bgY: percentY,

      bgWidth:
        rect.width * zoom,

      bgHeight:
        rect.height * zoom,
    });
  };

  const showLens = () => {
    setLens((prev) => ({
      ...prev,
      visible: true,
    }));
  };

  const hideLens = () => {
    setLens((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <div
      ref={containerRef}
      className="spatial-main-section"
      onMouseMove={handleMove}
      onMouseEnter={showLens}
      onMouseLeave={hideLens}
    >
      <img
        src="/projects/craft-academy/page-04-spatial-overview/p04-main-section.png"
        alt="Craft Academy main architectural section"
      />

      <div
        className={`section-lens ${
          lens.visible
            ? "is-visible"
            : ""
        }`}
        style={{
          left: lens.x,
          top: lens.y,

          backgroundImage:
            "url('/projects/craft-academy/page-04-spatial-overview/p04-main-section.png')",

          backgroundPosition:
            `${lens.bgX}% ${lens.bgY}%`,

          backgroundSize:
            `${lens.bgWidth}px ${lens.bgHeight}px`,
        }}
      />

      <div className="section-magnify-hint">
        MOVE TO EXPLORE +
      </div>
    </div>
  );
}