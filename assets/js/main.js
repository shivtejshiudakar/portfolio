/**
 * ============================================================================
 * Shivtej Shiudakar - Portfolio Main Script
 * Features:
 *   1. EmailJS Contact Form Integration (with validation, feedback & fallback)
 *   2. Theme Toggle (Dark / Light) with LocalStorage Persistence
 *   3. Active Navigation ScrollSpy
 *   4. 3D Card and Avatar Tilt Effects
 *   5. Three.js 3D Interactive Neural Network Animation
 * ============================================================================
 */

/* ==========================================================================
   1. EMAILJS CONFIGURATION
   --------------------------------------------------------------------------
   Steps to activate:
   1. Sign up at https://www.emailjs.com/
   2. Add an Email Service (e.g. Gmail) -> Copy your Service ID below
   3. Create an Email Template -> Copy your Template ID below
      (Use variables: {{from_name}}, {{from_email}}, {{subject}}, {{message}})
   4. Account > General / Security -> Copy your Public Key below
   ========================================================================== */
const EMAILJS_CONFIG = {
  publicKey: "ZgGqMLyJOfAH1a6txB",      // e.g. "user_xxxxxxxxxxxxxx" or public key
  serviceId: "service_7gaehy4",      // e.g. "service_gmail"
  templateId: "template_jb8lt87"     // e.g. "template_contact"
};

// Initialize EmailJS if public key has been replaced
(function initEmailJS() {
  if (typeof emailjs !== "undefined" && EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.publicKey !== "YOUR_PUBLIC_KEY") {
    emailjs.init({
      publicKey: EMAILJS_CONFIG.publicKey
    });
  }
})();

/* ==========================================================================
   2. THEME & APP STATE INITIALIZATION
   ========================================================================== */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  let onTheme = function () { };

  // Theme management with localStorage persistence
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    const themeIcon = document.querySelector('#th use');
    if (themeIcon) {
      themeIcon.setAttribute('href', t === 'dark' ? '#moon' : '#sun');
    }
    onTheme(t);
  }

  // Load saved theme or match system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme(matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }

  const themeBtn = document.getElementById('th');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const current = root.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ==========================================================================
     3. ACTIVE NAVIGATION LINK (SCROLL SPY)
     ========================================================================== */
  const links = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (a) {
            a.classList.toggle('on', a.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('section[id]').forEach(function (sec) {
      io.observe(sec);
    });
  }

  /* ==========================================================================
     4. 3D TILT EFFECT ON CARDS & AVATAR
     ========================================================================== */
  function addTilt(el, maxRotateX, maxRotateY) {
    if (reduce || !el) return;
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `rotateX(${-y * maxRotateX}deg) rotateY(${x * maxRotateY}deg) translateZ(8px)`;
    });
    el.addEventListener('pointerleave', function () {
      el.style.transform = '';
    });
  }

  document.querySelectorAll('.tilt').forEach(function (el) {
    addTilt(el, 9, 11);
  });
  addTilt(document.getElementById('ring'), 16, 20);

  /* ==========================================================================
     5. CONTACT FORM (EMAILJS + FALLBACK)
     ========================================================================== */
  const contactForm = document.getElementById('cf');
  const statusBox = document.getElementById('form-status');

  function showStatus(msg, type) {
    if (!statusBox) return;
    statusBox.textContent = msg;
    statusBox.className = 'form-status ' + type;
    statusBox.style.display = 'flex';
  }

  function hideStatus() {
    if (!statusBox) return;
    statusBox.style.display = 'none';
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameInput = document.getElementById('n');
      const emailInput = document.getElementById('e');
      const subjectInput = document.getElementById('s');
      const msgInput = document.getElementById('m');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = msgInput.value.trim();

      if (!name || !email || !subject || !message) {
        showStatus('Please fill in all fields before sending.', 'error');
        return;
      }

      // Check if EmailJS is configured
      const isConfigured = (
        typeof emailjs !== "undefined" &&
        EMAILJS_CONFIG.publicKey &&
        EMAILJS_CONFIG.publicKey !== "YOUR_PUBLIC_KEY" &&
        EMAILJS_CONFIG.serviceId !== "YOUR_SERVICE_ID" &&
        EMAILJS_CONFIG.templateId !== "YOUR_TEMPLATE_ID"
      );

      // Graceful fallback to mailto if EmailJS is not configured
      if (!isConfigured) {
        showStatus('EmailJS keys not configured yet. Opening your email app...', 'info');
        setTimeout(function () {
          location.href = `mailto:shivtejshiudakar@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')')}`;
        }, 1200);
        return;
      }

      // Button loading state
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
      hideStatus();

      const templateParams = {
        from_name: name,
        from_email: email,
        reply_to: email,
        subject: subject,
        message: message
      };

      emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
        .then(function (response) {
          console.log('EmailJS Success:', response.status, response.text);
          showStatus('Thank you! Your message has been sent successfully.', 'success');
          contactForm.reset();
        })
        .catch(function (error) {
          console.error('EmailJS Error:', error);
          showStatus('Could not send message via EmailJS. Falling back to email client...', 'error');
          setTimeout(function () {
            location.href = `mailto:shivtejshiudakar@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')')}`;
          }, 1500);
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        });
    });
  }

  /* ==========================================================================
     6. 3D NEURAL NETWORK (THREE.JS)
     ========================================================================== */
  const canvas = document.getElementById('bg');
  if (!window.THREE || !canvas) return;

  let R;
  try {
    R = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (err) {
    console.warn('WebGL not supported:', err);
    return;
  }

  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const S = new THREE.Scene();
  const C = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  C.position.z = 9;

  const G = new THREE.Group();
  S.add(G);

  const layers = [4, 6, 6, 3];
  const nodes = [];
  const outM = new THREE.MeshBasicMaterial();
  const inM = new THREE.MeshBasicMaterial();
  const sg = new THREE.SphereGeometry(0.14, 16, 16);

  layers.forEach(function (n, li) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(sg, li === 3 ? outM : inM);
      m.position.set((li - 1.5) * 2.3, (i - (n - 1) / 2) * 1.05, (Math.random() - 0.5) * 2.4);
      G.add(m);
      arr.push(m);
    }
    nodes.push(arr);
  });

  const pts = [];
  const edges = [];
  for (let l = 0; l < 3; l++) {
    nodes[l].forEach(function (a) {
      nodes[l + 1].forEach(function (b) {
        pts.push(a.position.x, a.position.y, a.position.z, b.position.x, b.position.y, b.position.z);
        edges.push([a.position, b.position]);
      });
    });
  }

  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const lineM = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 });
  G.add(new THREE.LineSegments(lg, lineM));

  const N = 50;
  const pg = new THREE.BufferGeometry();
  const pp = new Float32Array(N * 3);
  const st = [];
  const pM = new THREE.PointsMaterial({ size: 0.16 });

  for (let i = 0; i < N; i++) {
    st.push({
      e: edges[(Math.random() * edges.length) | 0],
      t: Math.random(),
      v: 0.004 + Math.random() * 0.006
    });
  }
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  G.add(new THREE.Points(pg, pM));

  onTheme = function (t) {
    const d = t === 'dark';
    inM.color.set(d ? 0xe5e5e5 : 0x262626);
    outM.color.set(d ? 0x22c55e : 0x16a34a);
    lineM.color.set(d ? 0x9a9a9a : 0x555555);
    pM.color.set(d ? 0x22c55e : 0x16a34a);
    if (reduce) frame();
  };
  onTheme(root.getAttribute('data-theme'));

  function handleResize() {
    R.setSize(window.innerWidth, window.innerHeight, false);
    C.aspect = window.innerWidth / window.innerHeight;
    C.updateProjectionMatrix();
    G.scale.setScalar(window.innerWidth < 760 ? 0.6 : 1);
  }
  handleResize();
  window.addEventListener('resize', function () {
    handleResize();
    if (reduce) frame();
  });

  let mx = 0, my = 0, prog = 0;
  window.addEventListener('pointermove', function (e) {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  });

  function onScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    prog = h > 0 ? window.scrollY / h : 0;
  }
  window.addEventListener('scroll', function () {
    onScroll();
    if (reduce) frame();
  }, { passive: true });
  onScroll();

  function frame() {
    for (let k = 0; k < N; k++) {
      const p = st[k];
      if (!reduce) p.t += p.v;
      if (p.t > 1) {
        p.t = 0;
        p.e = edges[(Math.random() * edges.length) | 0];
      }
      pp[k * 3] = p.e[0].x + (p.e[1].x - p.e[0].x) * p.t;
      pp[k * 3 + 1] = p.e[0].y + (p.e[1].y - p.e[0].y) * p.t;
      pp[k * 3 + 2] = p.e[0].z + (p.e[1].z - p.e[0].z) * p.t;
    }
    pg.attributes.position.needsUpdate = true;

    const wide = window.innerWidth >= 760;
    const tx = wide ? 2.4 * Math.cos(prog * Math.PI * 4) : 0;
    const ty = wide ? 0 : 2 * Math.cos(prog * Math.PI * 4);

    G.position.x += (tx - G.position.x) * 0.05;
    G.position.y += (ty - G.position.y) * 0.05;
    G.rotation.y += ((mx * 1.1 + prog * Math.PI * 3) - G.rotation.y) * 0.05;
    G.rotation.x += ((my * 0.6) - G.rotation.x) * 0.05;

    R.render(S, C);
    if (!reduce) requestAnimationFrame(frame);
  }

  frame();
})();
