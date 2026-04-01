/* ════════════════════════════════════════════════
   CAD VIEWER — cad-viewer.js
   Uses Three.js (loaded via CDN in the HTML).

   HOW TO USE
   ──────────
   1. Place your .glb model file in:   portfolio/models/your-model.glb
   2. In your HTML add:
        <div class="cad-viewer-wrap" data-model="../models/your-model.glb"></div>
   3. Include the Three.js CDN scripts BEFORE this file (already done in project pages).
   4. This script auto-initialises every .cad-viewer-wrap on the page.

   CONTROLS
   ──────────
   • Left-click  + drag  → Rotate
   • Right-click + drag  → Pan
   • Scroll wheel        → Zoom

   EXPORTING YOUR MODEL AS .GLB
   ──────────────────────────────
   SolidWorks:  File → Save As → choose "GLTF (*.glb)" from the dropdown
   Fusion 360:  File → Export → Format: GLB
   Blender:     File → Export → glTF 2.0 → Format: GLB

   WHERE TO PUT THE FILE
   ──────────────────────
   Drop your .glb file into:   portfolio/models/
   Then set data-model="../models/your-filename.glb" on the viewer div.
════════════════════════════════════════════════ */

(function () {
  'use strict';

  var wrappers = document.querySelectorAll('.cad-viewer-wrap');
  if (!wrappers.length) return;

  wrappers.forEach(function (wrap) { initViewer(wrap); });

  function initViewer(wrap) {
    var modelPath = wrap.getAttribute('data-model');
    var W = wrap.clientWidth  || 800;
    var H = wrap.clientHeight || 480;

    /* ── 1. RENDERER ── */
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding     = THREE.sRGBEncoding;  /* r134 compatible */
    renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    /* Append the canvas inside the wrapper */
    var canvasWrap = wrap.querySelector('.cav-canvas');
    if (canvasWrap) canvasWrap.appendChild(renderer.domElement);
    else wrap.appendChild(renderer.domElement);

    /* ── 2. SCENE ── */
    var scene = new THREE.Scene();

    /* ── 3. CAMERA ── */
    var camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1000);
    camera.position.set(2, 1.5, 3);

    /* ── 4. LIGHTING — three-point setup for clean engineering look ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    var key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(5, 8, 5);
    key.castShadow = true;
    key.shadow.mapSize.width  = 2048;
    key.shadow.mapSize.height = 2048;
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xb0c8ff, 0.7); /* cool blue fill */
    fill.position.set(-4, 2, -3);
    scene.add(fill);

    var rim = new THREE.DirectionalLight(0xffffff, 0.35);
    rim.position.set(0, 8, -6);
    scene.add(rim);

    /* ── 5. ORBIT CONTROLS ── */
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping    = true;
    controls.dampingFactor    = 0.06;
    controls.screenSpacePanning = true;
    controls.minDistance      = 0.1;
    controls.maxDistance      = 50;
    controls.autoRotate       = true;
    controls.autoRotateSpeed  = 0.7;
    renderer.domElement.addEventListener('pointerdown', function () {
      controls.autoRotate = false;
    });

    /* ── 6. LOAD MODEL ── */
    var spinner     = wrap.querySelector('.cav-spinner');
    var errorEl     = wrap.querySelector('.cav-error');
    var placeholder = wrap.querySelector('.cav-placeholder');

    /* Always start with spinner hidden and placeholder visible.
       Only show the spinner once we confirm the file is reachable. */
    if (spinner)     spinner.style.display     = 'none';
    if (placeholder) placeholder.style.display = 'flex';

    if (!modelPath) {
      return; /* No model path set at all — done */
    }

    function showPlaceholder(msg) {
      if (spinner)     spinner.style.display     = 'none';
      if (placeholder) placeholder.style.display = 'flex';
      /* Optionally update the hint text */
      if (msg) {
        var hint = placeholder.querySelector('.cav-ph-hint');
        if (hint) hint.innerHTML = msg;
      }
    }

    function startLoad() {
      /* File confirmed reachable — switch to spinner and load */
      if (placeholder) placeholder.style.display = 'none';
      if (spinner)     spinner.style.display     = 'flex';

      var loader = new THREE.GLTFLoader();

      loader.load(
        modelPath,

        /* onLoad — model ready */
        function (gltf) {
          if (spinner) spinner.style.display = 'none';

          var model = gltf.scene;

          /* Auto-scale and centre the model */
          var box    = new THREE.Box3().setFromObject(model);
          var centre = box.getCenter(new THREE.Vector3());
          var size   = box.getSize(new THREE.Vector3());
          var maxDim = Math.max(size.x, size.y, size.z);
          var scale  = 2.5 / maxDim;
          model.scale.setScalar(scale);
          model.position.sub(centre.multiplyScalar(scale));

          model.traverse(function (child) {
            if (child.isMesh) {
              child.castShadow    = true;
              child.receiveShadow = true;
            }
          });

          scene.add(model);

          /* Frame camera on the loaded model */
          camera.position.set(0, maxDim * scale * 0.7, maxDim * scale * 2);
          controls.target.set(0, 0, 0);
          controls.update();
        },

        /* onProgress */
        function (xhr) {
          if (xhr.lengthComputable && spinner) {
            var pct   = Math.round((xhr.loaded / xhr.total) * 100);
            var label = spinner.querySelector('.cav-pct');
            if (label) label.textContent = pct + '%';
          }
        },

        /* onError — file failed mid-load */
        function (err) {
          console.warn('CAD Viewer: model load failed', err);
          showPlaceholder('Model file could not be loaded.<br/>Check the file path and format.');
        }
      );
    }

    /*
      Check if the model file actually exists before trying to load it.
      fetch() works on both http:// and file:// in modern browsers.
      If fetch itself isn't supported, fall straight through to load.
    */
    if (typeof fetch !== 'undefined') {
      fetch(modelPath, { method: 'HEAD' })
        .then(function (res) {
          if (res.ok) {
            startLoad();
          } else {
            /* File not found (404) — stay on placeholder, no error */
            showPlaceholder(null);
          }
        })
        .catch(function () {
          /*
            fetch blocked (e.g. file:// CORS restriction in some browsers).
            Try loading anyway — GLTFLoader may still succeed.
          */
          startLoad();
        });
    } else {
      startLoad();
    }

    /* ── 7. WIREFRAME TOGGLE ── */
    var btnWire = wrap.querySelector('.cav-btn-wireframe');
    var isWire  = false;
    if (btnWire) {
      btnWire.addEventListener('click', function () {
        isWire = !isWire;
        scene.traverse(function (obj) {
          if (obj.isMesh && obj.material) obj.material.wireframe = isWire;
        });
        btnWire.textContent = isWire ? 'Solid' : 'Wireframe';
        btnWire.classList.toggle('cav-btn-active', isWire);
      });
    }

    /* ── 8. BACKGROUND TOGGLE ── */
    var btnBg = wrap.querySelector('.cav-btn-bg');
    var isDark = true;
    function applyBg() {
      var canvas = wrap.querySelector('.cav-canvas');
      if (canvas) canvas.style.background = isDark ? '#0d0d0d' : '#efefef';
    }
    applyBg();
    if (btnBg) {
      btnBg.addEventListener('click', function () {
        isDark = !isDark;
        applyBg();
        btnBg.textContent = isDark ? 'Light BG' : 'Dark BG';
      });
    }

    /* ── 9. RESIZE ── */
    var ro = new ResizeObserver(function () {
      var w = wrap.clientWidth;
      var h = wrap.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(wrap);

    /* ── 10. ANIMATION LOOP ── */
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  }

})();
