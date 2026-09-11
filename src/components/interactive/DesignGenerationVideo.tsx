"use client";

import { useEffect, useRef, useState } from "react";

const stages = [
  {
    number: "01",
    title: "CONTEXT",
    zh: "回应城市脉络",
    start: 0,
  },
  {
    number: "02",
    title: "DECOUPLE",
    zh: "解构体量关系",
    start: 3,
  },
  {
    number: "03",
    title: "DIFFERENTIATE",
    zh: "区分功能层次",
    start: 6,
  },
  {
    number: "04",
    title: "ARTICULATE",
    zh: "组织空间系统",
    start: 9,
  },
  {
    number: "05",
    title: "INTEGRATE",
    zh: "整合结构与空间",
    start: 12,
  },
  {
    number: "06",
    title: "EXPRESS",
    zh: "表达建筑语言",
    start: 15,
  },
];

export default function DesignGenerationVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activeStage, setActiveStage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const jumpToStage = (index: number) => {
    const video = videoRef.current;

    if (!video) return;

    video.currentTime = stages[index].start;

    video.play();

    setActiveStage(index);
    setIsPaused(false);
  };

  const togglePlayback = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const updateStage = () => {
      const time = video.currentTime;

      const stageIndex = Math.min(
        Math.floor(time / 3),
        stages.length - 1
      );

      setActiveStage(stageIndex);
    };

    video.addEventListener("timeupdate", updateStage);

    return () => {
      video.removeEventListener(
        "timeupdate",
        updateStage
      );
    };
  }, []);

  return (
    <section className="craft-generation-screen">
      {/* LEFT */}

      <aside className="craft-generation-sidebar">
        <div className="craft-generation-index">
          <span>02</span>
          <p>PROCESS</p>
        </div>

        <div className="craft-generation-intro">
          <h2>
            从策略生成，
            <br />
            到空间表达。
          </h2>

          <p>
            通过六个连续步骤，
            将城市关系、功能需求与既有结构
            转化为新的空间系统。
          </p>
        </div>

        <div className="craft-generation-progress">
          <span>
            {String(activeStage + 1).padStart(2, "0")}
          </span>

          <span>/</span>

          <span>06</span>
        </div>
      </aside>


      {/* RIGHT */}

      <div className="craft-generation-content">

        <div className="craft-generation-topline">
          <span>
            DESIGN GENERATION
          </span>

          <span>
            18 SEC / AUTO PLAY
          </span>
        </div>


        {/* VIDEO */}

        <div
          className="craft-video-container"
          onClick={togglePlayback}
        >
          <video
            ref={videoRef}
            className="craft-generation-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
      
          >
            <source
              src="/projects/craft-academy/page-03-generation/p03-design-generation.mp4"
              type="video/mp4"
            />
          </video>

          <div className="craft-video-status">
            <span>
              {isPaused ? "PLAY" : "PAUSE"}
            </span>
          </div>
        </div>


        {/* TIMELINE */}

        <nav
          className="craft-generation-timeline"
          aria-label="Design generation stages"
        >
          {stages.map((stage, index) => (
            <button
              key={stage.number}
              type="button"
              className={`craft-generation-stage ${
                activeStage === index
                  ? "is-active"
                  : ""
              }`}
              onClick={() => jumpToStage(index)}
            >
              <div className="craft-stage-number">
                {stage.number}
              </div>

              <div className="craft-stage-text">
                <strong>
                  {stage.title}
                </strong>

                <span>
                  {stage.zh}
                </span>
              </div>

              <div className="craft-stage-marker" />
            </button>
          ))}
        </nav>


        {/* LOGIC */}

        <div className="craft-generation-logic">
          <span>CITY</span>
          <i>→</i>

          <span>CRAFT</span>
          <i>→</i>

          <span>LEARNING</span>
          <i>→</i>

          <span>DAILY LIFE</span>
          <i>→</i>

          <strong>
            PUBLIC INTERFACE
          </strong>
        </div>

      </div>
    </section>
  );
}