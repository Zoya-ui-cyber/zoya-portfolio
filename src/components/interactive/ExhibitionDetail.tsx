"use client";

import { useEffect, useRef, useState } from "react";

type DetailItem = {
  number: string;
  title: string;
  en: string;
  description: string;
  image: string;
  anchorX: number;
  anchorY: number;
};

const details: DetailItem[] = [
  {
    number: "01",
    title: "聚碳酸酯板顶棚",
    en: "POLYCARBONATE ROOF",
    description:
      "轻质聚碳酸酯板覆盖于新增钢结构体系之上，在满足遮蔽与防护要求的同时，通过半透明材料过滤自然光，并降低新增屋面对于既有建筑体量的视觉重量。",
    image:
      "/projects/craft-academy/page-06-exhibition-details/p06-detail-01-polycarbonate-roof.png",
    anchorX: 60,
    anchorY: 21,
  },

  {
    number: "02",
    title: "石质铺面",
    en: "STONE FLOOR",
    description:
      "开放展览区域采用架空石材铺面，在形成连续公共地面的同时，为排水、构造层与设备组织预留空间。铺装系统与主体结构保持相对独立，以适应公共空间后续使用与维护。",
    image:
      "/projects/craft-academy/page-06-exhibition-details/p06-detail-02-stone-floor.png",
    anchorX: 58,
    anchorY: 48,
  },

  {
    number: "03",
    title: "轻钢龙骨及玻璃幕墙结构",
    en: "LIGHT STEEL + CURTAIN WALL",
    description:
      "轻钢龙骨作为新增外围护体系的次级结构，与玻璃幕墙共同形成轻质、透明的建筑界面，使新的空间系统与原有结构保持可辨识的层次关系。",
    image:
      "/projects/craft-academy/page-06-exhibition-details/p06-detail-03-steel-curtain-wall.png",
    anchorX: 57,
    anchorY: 68,
  },
];

type LineData = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export default function ExhibitionDetail() {
  const sectionRef = useRef<HTMLElement>(null);

  const cutawayRef =
    useRef<HTMLDivElement>(null);

  const triggerRefs =
    useRef<(HTMLButtonElement | null)[]>([]);

  const [activeDetail, setActiveDetail] =
    useState<number | null>(null);

  const [lines, setLines] =
    useState<LineData[]>([]);

  const updateLines = () => {
    const section = sectionRef.current;
    const cutaway = cutawayRef.current;

    if (!section || !cutaway) return;

    const sectionRect =
      section.getBoundingClientRect();

    const cutawayRect =
      cutaway.getBoundingClientRect();

    const newLines = details.map(
      (detail, index) => {
        const trigger =
          triggerRefs.current[index];

        if (!trigger) {
          return {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
          };
        }

        const triggerRect =
          trigger.getBoundingClientRect();

        /*
         * 引线起点：
         * 不再对准文字中间。
         *
         * 直接接在 trigger 顶部 border 上。
         */
        const startX =
          triggerRect.right -
          sectionRect.left;

        const startY =
          triggerRect.top -
          sectionRect.top +
          0.5;

        /*
         * 引线终点：
         * 仍然使用主剖透图百分比坐标，
         * 后面换高清图时只调 anchorX / anchorY。
         */
        const endX =
          cutawayRect.left -
          sectionRect.left +
          cutawayRect.width *
            (detail.anchorX / 100);

        const endY =
          cutawayRect.top -
          sectionRect.top +
          cutawayRect.height *
            (detail.anchorY / 100);

        return {
          startX,
          startY,
          endX,
          endY,
        };
      }
    );

    setLines(newLines);
  };

  useEffect(() => {
    const timer =
      window.setTimeout(
        updateLines,
        100
      );

    window.addEventListener(
      "resize",
      updateLines
    );

    return () => {
      window.clearTimeout(timer);

      window.removeEventListener(
        "resize",
        updateLines
      );
    };
  }, [activeDetail]);

  const toggleDetail = (
    index: number
  ) => {
    setActiveDetail((current) =>
      current === index
        ? null
        : index
    );
  };



  return (
    <section
      ref={sectionRef}
      className="exhibition-detail-screen"
    >
      {/* ========================================
          HEADER
      ======================================== */}

      <header className="exhibition-page-header">
        <div className="exhibition-page-index">
          <strong>04</strong>

          <span>
            OPEN EXHIBITION SPACE
          </span>
        </div>

        <h2>
          开放展览场地
        </h2>

        <p>
          作为建筑与城市之间新的公共界面，
          屋顶展览空间通过轻质结构、
          开放流线与透明外围护重新组织公共活动。
        </p>
      </header>


      {/* ========================================
    BODY
======================================== */}

<div className="exhibition-layout">

  {/* ========================================
      LEFT
  ======================================== */}

  <div className="exhibition-left">

    <div className="exhibition-left-label">
      <span>
        MATERIAL / DETAIL
      </span>

      <p>
        Select a construction detail to explore the assembly.
      </p>
    </div>


    {/* ========================================
        DETAIL STACK
    ======================================== */}

    <div className="exhibition-detail-stack">

      {details.map((detail, index) => {
        const isActive = activeDetail === index;

        const isMuted =
          activeDetail !== null &&
          !isActive;

        return (
          <article
            key={detail.number}
            className={[
              "exhibition-detail-item",
              isActive ? "is-active" : "",
              isMuted ? "is-muted" : "",
            ].join(" ")}
          >

            {/* TITLE / TRIGGER */}

            <button
              ref={(element) => {
                triggerRefs.current[index] = element;
              }}
              type="button"
              className="exhibition-detail-trigger"
              onClick={() => toggleDetail(index)}
            >

              <span className="exhibition-detail-number">
                {detail.number}
              </span>

              <div className="exhibition-detail-title">
                <h3>
                  {detail.title}
                </h3>

                <span>
                  {detail.en}
                </span>
              </div>

              <span className="exhibition-detail-action">
                {isActive ? "CLOSE" : "OPEN"}

                <i>
                  {isActive ? "↖" : "↘"}
                </i>
              </span>

            </button>


            {/* EXPANDED DETAIL */}

            <div className="exhibition-inline-detail">

              <div className="exhibition-inline-drawing">
                <img
                  src={detail.image}
                  alt={detail.title}
                />
              </div>

              <div className="exhibition-inline-copy">

                <span>
                  DETAIL {detail.number}
                </span>

                <p>
                  {detail.description}
                </p>

                <div className="exhibition-inline-points">
                  <span>
                    KEY POINTS
                  </span>

                  <ul>
                    <li>
                      轻质新增构造体系
                    </li>

                    <li>
                      新旧结构保持可辨识关系
                    </li>

                    <li>
                      兼顾公共使用与维护需求
                    </li>
                  </ul>
                </div>

              </div>

            </div>

          </article>
        );
      })}

    </div>


    {/* ========================================
        LOCATION
    ======================================== */}

    <div className="exhibition-locator">

      <span>
        LOCATION IN BUILDING
      </span>

      <div className="exhibition-locator-box">
      <img
        src="/projects/craft-academy/page-06-exhibition-details/p06-location.png"
        alt="Location of the open exhibition space within the building"
       />
    </div>

    <div className="exhibition-location-copy">
  <span>SECTION POSITION</span>

  <p>
    剖透位置选取建筑屋顶展览空间与原有主体结构的交接区域，
    集中呈现新增轻型屋面、玻璃幕墙、铺地系统与既有混凝土框架之间的构造关系。
    这一位置同时也是公共流线、展览空间与城市界面发生交汇的关键节点。
  </p>
</div>

    </div>

  </div>


  {/* ========================================
      RIGHT CUTAWAY
  ======================================== */}

  <div
    ref={cutawayRef}
    className="exhibition-cutaway"
  >
    <img
      src="/projects/craft-academy/page-06-exhibition-details/p06-section-perspective-original.png"
      alt="开放展览场地剖透轴测"
    />

    <span className="exhibition-cutaway-label">
      CUTAWAY AXONOMETRIC
    </span>
  </div>

</div>


      {/* ========================================
          CONNECTOR LINES
      ======================================== */}

      <svg
        className="exhibition-connector-layer"
        aria-hidden="true"
      >
        {lines.map(
          (line, index) => {
            const isActive =
              activeDetail === index;

            const isMuted =
              activeDetail !== null &&
              !isActive;

            /*
             * 折点更靠右，
             * 引线不会再横跨半个页面。
             */
            const elbowX =
              line.startX +
              (line.endX -
                line.startX) *
                0.68;

            const points = [
              `${line.startX},${line.startY}`,
              `${elbowX},${line.startY}`,
              `${elbowX},${line.endY}`,
              `${line.endX},${line.endY}`,
            ].join(" ");

            return (
              <g
                key={index}
                className={[
                  "exhibition-connector-group",
                  isActive
                    ? "is-active"
                    : "",
                  isMuted
                    ? "is-muted"
                    : "",
                ].join(" ")}
              >
                <polyline
                  points={points}
                  className="exhibition-connector"
                />

                <circle
                  cx={
                    line.endX
                  }
                  cy={
                    line.endY
                  }
                  r={
                    isActive
                      ? 4
                      : 2.5
                  }
                  className="exhibition-connector-dot"
                />
              </g>
            );
          }
        )}
      </svg>

    </section>
  );
}