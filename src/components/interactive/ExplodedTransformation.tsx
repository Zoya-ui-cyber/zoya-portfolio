"use client";

import { useState } from "react";
import Image from "next/image";


export default function ExplodedTransformation() {

  const [expanded, setExpanded] = useState(false);


  return (

    <section className="exploded-section">


      {/* ================= HEADER ================= */}

      <div className="exploded-header">

        <div className="exploded-number">
          05
        </div>


        <div className="exploded-title">

          <h2>
            EXPLODED TRANSFORMATION
          </h2>

          <p>
            The existing structure is reorganized through layered
            intervention and spatial insertion.
          </p>

        </div>


      </div>



      {/* ================= MAIN ================= */}

      <div className="exploded-content">


        {/* LEFT EXISTING */}

        <div className="existing-panel">


          <div className="existing-label">
            EXISTING STRUCTURE
          </div>


          <Image

            src="/projects/craft-academy/page-07-transformation/p07-before-model-original.png"

            alt="existing structure"

            width={800}

            height={500}

            className="existing-image"

          />


          <p>
            Existing building before intervention.
          </p>


        </div>





        {/* CENTER ARROW */}

        <div className="exploded-wrapper">


<div className="explode-trigger">

<button
onClick={()=>setExpanded(true)}
>
EXPLORE ↓
</button>

</div>



<div className="exploded-panel">


<Image

src="/projects/craft-academy/page-07-transformation/p07-exploded-axonometric-original.png"

alt="exploded transformation"

width={1200}

height={1800}

className="exploded-image"

/>


</div>


</div>





        {/* RIGHT EXPLODED */}

        <div className="exploded-panel">


          <Image

            src="/projects/craft-academy/page-07-transformation/p07-exploded-axonometric-original.png"

            alt="exploded transformation"

            width={1200}

            height={1600}

            className="exploded-image"

          />


        </div>



      </div>







      {/* ================= FULL SCREEN ================= */}


      {
        expanded && (

          <div className="exploded-overlay">


            <button

              className="close-button"

              onClick={()=>setExpanded(false)}

            >

              CLOSE ×

            </button>



            <Image

              src="/projects/craft-academy/page-07-transformation/p07-exploded-axonometric-original.png"

              alt="exploded full view"

              width={1400}

              height={2200}

              className="exploded-full-image"

            />


          </div>

        )

      }



    </section>


  );

}