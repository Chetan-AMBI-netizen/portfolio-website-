

(function () {

  // ── Inject Three.js from CDN ──────────────────────────────
  const threeScript = document.createElement("script");
  threeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  threeScript.onload = initPortfolio;
  document.head.appendChild(threeScript);

  function initPortfolio() {

    // ── 1. SCENE SETUP ──────────────────────────────────────
    const canvas = document.createElement("canvas");
    canvas.id = "bg3d";
    Object.assign(canvas.style, {
      position: "fixed", top: "0", left: "0",
      width: "100vw", height: "100vh",
      zIndex: "-1", display: "block"
    });
    document.body.prepend(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x020008, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020008, 0.0012);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, 0, 120);

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });


    // ── 2. GALAXY STAR FIELD ────────────────────────────────
    const STAR_COUNT = 14000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(STAR_COUNT * 3);
    const starColors = new Float32Array(STAR_COUNT * 3);

    const cyberPalette = [
      [0.0, 1.0, 1.0],
      [1.0, 0.0, 1.0],
      [0.4, 0.8, 1.0],
      [1.0, 1.0, 1.0],
      [0.8, 0.4, 1.0],
      [0.0, 0.8, 0.5],
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      const arm    = Math.floor(Math.random() * 3);
      const angle  = (arm / 3) * Math.PI * 2 + Math.random() * 1.2;
      const radius = Math.pow(Math.random(), 0.5) * 600 + 50;
      const spread = (1 - radius / 650) * 30 + 5;

      starPos[i * 3]     = Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * spread * 2.5;
      starPos[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread;

      const col = cyberPalette[Math.floor(Math.random() * cyberPalette.length)];
      const brightness = 0.5 + Math.random() * 0.5;
      starColors[i * 3]     = col[0] * brightness;
      starColors[i * 3 + 1] = col[1] * brightness;
      starColors[i * 3 + 2] = col[2] * brightness;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color",    new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.2, vertexColors: true,
      transparent: true, opacity: 0.9, sizeAttenuation: true
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);


    // ── 3. NEBULA CLOUDS ────────────────────────────────────
    const nebulaData = [
      { pos: [180,  30, -200], color: 0x00ffff, r: 80 },
      { pos: [-200,-40, -180], color: 0xff00ff, r: 70 },
      { pos: [50,   80, -300], color: 0x4400ff, r: 100 },
      { pos: [-100,-60, -250], color: 0x00ff88, r: 60 },
    ];
    nebulaData.forEach(n => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(n.r, 16, 16),
        new THREE.MeshBasicMaterial({ color: n.color, transparent: true, opacity: 0.04, side: THREE.BackSide })
      );
      mesh.position.set(...n.pos);
      scene.add(mesh);
    });


    // ── 4. FLOATING WIREFRAME GEOMETRIES ────────────────────
    const wireObjects = [];

    function makeWire(geo, color, x, y, z) {
      const mat  = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.55 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData.rotSpeed = {
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.012,
        z: (Math.random() - 0.5) * 0.006
      };
      scene.add(mesh);
      wireObjects.push(mesh);
    }

    makeWire(new THREE.IcosahedronGeometry(12, 1),  0x00ffff,  60,  20, -60);
    makeWire(new THREE.OctahedronGeometry(10, 0),   0xff00ff, -55, -15, -50);
    makeWire(new THREE.TorusGeometry(14, 3, 8, 24), 0x00ff88,   0,  35, -80);
    makeWire(new THREE.TetrahedronGeometry(10, 0),  0xff44ff, -70,  30, -70);
    makeWire(new THREE.IcosahedronGeometry(8, 0),   0x44aaff,  40, -30, -55);
    makeWire(new THREE.TorusGeometry(9, 2, 6, 18),  0xffff00, -30, -40, -65);


    // ── 5. CENTRAL GLOWING CORE SPHERE ──────────────────────
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.18 });
    const core    = new THREE.Mesh(new THREE.SphereGeometry(18, 64, 64), coreMat);
    core.position.set(0, 0, -30);
    scene.add(core);

    const innerCore = new THREE.Mesh(
      new THREE.SphereGeometry(14, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x001133, transparent: true, opacity: 0.9 })
    );
    innerCore.position.set(0, 0, -30);
    scene.add(innerCore);


    // ── 6. EXPLODING PARTICLES SYSTEM ───────────────────────
    const PARTICLE_COUNT = 800;
    const explodeGeo    = new THREE.BufferGeometry();
    const explodePos    = new Float32Array(PARTICLE_COUNT * 3);
    const explodeVel    = new Float32Array(PARTICLE_COUNT * 3);
    const explodeOrigin = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = Math.random() * 25;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi) - 30;
      explodePos[i*3]=x; explodePos[i*3+1]=y; explodePos[i*3+2]=z;
      explodeOrigin[i*3]=x; explodeOrigin[i*3+1]=y; explodeOrigin[i*3+2]=z;
    }

    explodeGeo.setAttribute("position", new THREE.BufferAttribute(explodePos, 3));
    const explodeMat = new THREE.PointsMaterial({
      color: 0xff44ff, size: 2.5, transparent: true, opacity: 0.9, sizeAttenuation: true
    });
    const explodeParticles = new THREE.Points(explodeGeo, explodeMat);
    scene.add(explodeParticles);

    let exploding = false, explodeTimer = 0;

    function triggerExplosion() {
      exploding = true; explodeTimer = 0;
      explodeMat.color.setHex([0x00ffff,0xff00ff,0x00ff88,0xffff00,0xff4444][Math.floor(Math.random()*5)]);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const speed = 1.5 + Math.random() * 3.5;
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        explodeVel[i*3]   = speed * Math.sin(phi) * Math.cos(theta);
        explodeVel[i*3+1] = speed * Math.sin(phi) * Math.sin(theta);
        explodeVel[i*3+2] = speed * Math.cos(phi);
      }
    }

    function updateExplosion() {
      if (!exploding) return;
      explodeTimer++;
      const pos = explodeGeo.attributes.position.array;
      const ret = explodeTimer > 60 ? 0.04 : 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        explodeVel[i*3]   *= 0.96; explodeVel[i*3+1] *= 0.96; explodeVel[i*3+2] *= 0.96;
        pos[i*3]   += explodeVel[i*3];
        pos[i*3+1] += explodeVel[i*3+1];
        pos[i*3+2] += explodeVel[i*3+2];
        if (ret > 0) {
          pos[i*3]   += (explodeOrigin[i*3]   - pos[i*3])   * ret;
          pos[i*3+1] += (explodeOrigin[i*3+1] - pos[i*3+1]) * ret;
          pos[i*3+2] += (explodeOrigin[i*3+2] - pos[i*3+2]) * ret;
        }
      }
      explodeGeo.attributes.position.needsUpdate = true;
      if (explodeTimer > 140) exploding = false;
    }

    window.addEventListener("click", triggerExplosion);


    // ── 7. SCROLL TO ZOOM ───────────────────────────────────
    let targetZ = 120;
    window.addEventListener("wheel", (e) => {
      targetZ = Math.max(40, Math.min(280, targetZ + e.deltaY * 0.08));
    });

    let lastPinchDist = null;
    window.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (lastPinchDist !== null)
          targetZ = Math.max(40, Math.min(280, targetZ + (lastPinchDist - dist) * 0.5));
        lastPinchDist = dist;
      }
    }, { passive: true });
    window.addEventListener("touchend", () => { lastPinchDist = null; });


    // ── 8. MOUSE PARALLAX ───────────────────────────────────
    let mouseX = 0, mouseY = 0;
    window.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });


    // ── 9. RENDER LOOP ───────────────────────────────────────
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      starField.rotation.y = t * 0.012;
      starField.rotation.x = Math.sin(t * 0.005) * 0.05;

      wireObjects.forEach(obj => {
        obj.rotation.x += obj.userData.rotSpeed.x;
        obj.rotation.y += obj.userData.rotSpeed.y;
        obj.rotation.z += obj.userData.rotSpeed.z;
        obj.material.opacity = 0.35 + Math.sin(t * 1.5 + obj.position.x) * 0.2;
      });

      coreMat.opacity = 0.14 + Math.sin(t * 2.0) * 0.06;
      core.rotation.y = t * 0.3;
      core.rotation.x = t * 0.15;

      updateExplosion();

      camera.position.z += (targetZ - camera.position.z) * 0.06;
      camera.position.x += (mouseX * 18 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 12 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animate();


    // ── 10. CYBERPUNK UI STYLES ──────────────────────────────
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
      * { box-sizing: border-box; }
      body { background: transparent !important; font-family: 'Share Tech Mono', monospace; cursor: none; }

      #cyber-cursor {
        position: fixed; width: 20px; height: 20px;
        border: 2px solid #00ffff; border-radius: 50%;
        pointer-events: none; z-index: 99999;
        transform: translate(-50%,-50%);
        transition: width .2s, height .2s, border-color .2s;
        mix-blend-mode: screen;
      }
      #cyber-cursor-dot {
        position: fixed; width: 4px; height: 4px;
        background: #ff00ff; border-radius: 50%;
        pointer-events: none; z-index: 99999;
        transform: translate(-50%,-50%);
      }
      body:active #cyber-cursor { width: 40px; height: 40px; border-color: #ff00ff; }

      header {
        background: rgba(0,20,40,0.75) !important;
        border-bottom: 1px solid #00ffff44;
        backdrop-filter: blur(12px);
        transform: none !important;
        box-shadow: 0 0 30px #00ffff22;
      }
      header h1 {
        font-family: 'Orbitron', monospace !important;
        font-weight: 900; font-size: 2rem;
        color: #00ffff !important;
        text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff88;
        letter-spacing: 4px; text-transform: uppercase;
      }
      u { color: #ff00ff !important; text-decoration-color: #ff00ff; }

      .navbar a {
        font-family: 'Orbitron', monospace;
        color: #00ffff !important; font-size: .85rem;
        letter-spacing: 2px; text-decoration: none;
        padding: 4px 10px; border: 1px solid transparent;
        transition: all .3s;
      }
      .navbar a:hover {
        border-color: #00ffff; background: #00ffff15;
        text-shadow: 0 0 10px #00ffff; box-shadow: 0 0 12px #00ffff44;
      }

      .resumer {
        font-family: 'Orbitron', monospace !important;
        background: transparent !important; color: #00ffff !important;
        border: 2px solid #00ffff !important; letter-spacing: 2px;
        text-transform: uppercase; font-size: .8rem;
        padding: 12px 28px !important; position: relative; overflow: hidden;
        transition: all .3s !important; box-shadow: 0 0 18px #00ffff44 !important;
      }
      .resumer::before {
        content:''; position: absolute; top:0; left:-100%;
        width:100%; height:100%;
        background: linear-gradient(90deg, transparent, #00ffff33, transparent);
        transition: left .4s;
      }
      .resumer:hover::before { left: 100%; }
      .resumer:hover {
        background: #00ffff22 !important;
        box-shadow: 0 0 35px #00ffff88 !important;
        transform: scale(1.05) !important;
      }

      .mainer {
        background: rgba(0,10,25,0.6) !important;
        backdrop-filter: blur(8px);
        border: 1px solid #00ffff22;
        border-radius: 4px; margin: 20px; padding: 20px;
      }
      .asider {
        background: rgba(0,5,20,0.7) !important;
        border-left: 3px solid #ff00ff; border-radius: 4px;
        padding: 20px; box-shadow: -4px 0 20px #ff00ff33;
      }
      .asider h2 {
        font-family: 'Orbitron', monospace;
        color: #ff00ff !important;
        text-shadow: 0 0 15px #ff00ff; letter-spacing: 3px;
      }
      .asider p { color: #aaeeff !important; font-style: italic; line-height: 1.8; text-align: left !important; transform: none !important; }

      h2 {
        font-family: 'Orbitron', monospace;
        color: #00ffff !important; letter-spacing: 3px;
        text-transform: uppercase; text-shadow: 0 0 15px #00ffff88;
        transform: none !important;
      }
      p { transform: none !important; }

      .project {
        background: rgba(0,15,35,0.85) !important;
        border: 1px solid #00ffff44 !important; border-radius: 8px !important;
        color: #cceeff !important; transition: all .4s !important;
        box-shadow: 0 0 15px #00ffff22; position: relative; overflow: hidden;
      }
      .project::before {
        content:''; position:absolute; top:-2px; left:-2px; right:-2px; bottom:-2px;
        background: linear-gradient(45deg, #00ffff, #ff00ff, #00ff88, #00ffff);
        border-radius: 9px; z-index:-1; opacity:0;
        transition: opacity .4s; background-size: 300%;
        animation: borderGlow 3s linear infinite;
      }
      .project:hover::before { opacity: 1; }
      .project:hover {
        transform: perspective(600px) translateZ(30px) !important;
        box-shadow: 0 20px 60px #00ffff55 !important;
        border-color: #00ffff !important;
      }
      @keyframes borderGlow {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .project h3 {
        color: #00ffff !important; font-family: 'Orbitron', monospace;
        font-size: .85rem; letter-spacing: 2px; text-shadow: 0 0 10px #00ffff;
      }
      .project a {
        color: #ff00ff !important; border: 1px solid #ff00ff55;
        padding: 4px 12px; border-radius: 3px; font-size: .8rem;
        letter-spacing: 1px; transition: all .3s;
      }
      .project a:hover { background: #ff00ff22; box-shadow: 0 0 12px #ff00ff66; text-shadow: 0 0 8px #ff00ff; }

      footer {
        background: rgba(0,5,20,0.85) !important;
        border-top: 1px solid #00ffff33; backdrop-filter: blur(8px);
      }
      footer p { color: #00ffff88 !important; font-family: 'Orbitron', monospace; font-size: .75rem; letter-spacing: 2px; text-align: center !important; }
      marquee { color: #00ffff !important; font-family: 'Share Tech Mono', monospace; font-size: .9rem; letter-spacing: 3px; text-shadow: 0 0 8px #00ffff; }

      body::after {
        content:''; position:fixed; top:0; left:0; width:100%; height:100%;
        background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.015) 2px, rgba(0,255,255,0.015) 4px);
        pointer-events:none; z-index:9998;
        animation: scanlines 8s linear infinite;
      }
      @keyframes scanlines { from { background-position: 0 0; } to { background-position: 0 100px; } }

      #scroll-hint {
        position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
        color:#00ffff88; font-family:'Orbitron',monospace; font-size:.65rem;
        letter-spacing:3px; z-index:1000; pointer-events:none;
        animation: fadeHint 3s ease-in-out infinite;
      }
      @keyframes fadeHint { 0%,100%{opacity:0;} 50%{opacity:1;} }

      .click-flash {
        position:fixed; border-radius:50%; pointer-events:none; z-index:9990;
        transform: translate(-50%,-50%) scale(0);
        animation: clickFlash .6s ease-out forwards;
      }
      @keyframes clickFlash {
        0%   { transform:translate(-50%,-50%) scale(0); opacity:1; }
        100% { transform:translate(-50%,-50%) scale(8); opacity:0; }
      }

      .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease, transform .8s ease; }
      .reveal.visible { opacity:1; transform:translateY(0); }
    `;
    document.head.appendChild(style);


    // ── 11. CYBERPUNK CURSOR ─────────────────────────────────
    const cursor    = Object.assign(document.createElement("div"), { id: "cyber-cursor" });
    const cursorDot = Object.assign(document.createElement("div"), { id: "cyber-cursor-dot" });
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    let cx = 0, cy = 0, cdx = 0, cdy = 0;
    document.addEventListener("mousemove", e => { cx = e.clientX; cy = e.clientY; });
    (function animCursor() {
      cdx += (cx - cdx) * 0.15; cdy += (cy - cdy) * 0.15;
      cursor.style.left    = cdx + "px"; cursor.style.top     = cdy + "px";
      cursorDot.style.left = cx  + "px"; cursorDot.style.top  = cy  + "px";
      requestAnimationFrame(animCursor);
    })();


    // ── 12. CLICK FLASH ──────────────────────────────────────
    window.addEventListener("click", e => {
      const flash = document.createElement("div");
      flash.className = "click-flash";
      const c = ["#00ffff","#ff00fff9","#00ff88","#ffff00"][Math.floor(Math.random()*4)];
      Object.assign(flash.style, {
        left: e.clientX+"px", top: e.clientY+"px",
        width:"60px", height:"60px",
        border:`2px solid ${c}`, boxShadow:`0 0 20px ${c}`
      });
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 700);
    });


    // ── 13. SCROLL HINT ──────────────────────────────────────
    const hint = Object.assign(document.createElement("div"), {
      id: "scroll-hint",
      textContent: "[ SCROLL TO ZOOM  ·  CLICK TO DETONATE ]"
    });
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 7000);


    // ── 14. SCROLL REVEAL ────────────────────────────────────
    document.querySelectorAll(".project, .asider, footer").forEach(el => el.classList.add("reveal"));
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("visible"), i * 150);
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(el => ro.observe(el));


    // ── 15. MARQUEE PAUSE ON HOVER ───────────────────────────
    const mq = document.querySelector("marquee");
    if (mq) {
      mq.addEventListener("mouseenter", () => mq.stop());
      mq.addEventListener("mouseleave", () => mq.start());
    }

    console.log("%c⚡ CYBERPUNK 3D PORTFOLIO ONLINE", "color:#00ffff;font-size:16px;font-weight:bold;background:#000;padding:8px 16px;");
    console.log("%cGalaxy · Click to Detonate · Scroll to Zoom", "color:#ff00ff;font-size:12px;");

  } // end initPortfolio

})();