
/* ============================================================
   EMAILJS CONFIGURATION
   ============================================================ */

const EMAILJS_CONFIG = {
  publicKey: "ZgGqMLyJOfAH1a6txB",
  serviceId: "service_7gaehy4",
  templateId: "template_jb8lt87"
};

// Initialize EmailJS
(function initEmailJS() {
  if (typeof emailjs !== "undefined") {
    emailjs.init({
      publicKey: EMAILJS_CONFIG.publicKey
    });

    console.log("EmailJS initialized successfully");
  } else {
    console.error("EmailJS SDK not loaded. Check your HTML script tag.");
  }
})();


/* ============================================================
   MAIN PORTFOLIO JAVASCRIPT
   ============================================================ */

(function () {

  const reduce = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const root = document.documentElement;

  let onTheme = function () { };


  /* ============================================================
     1. THEME MANAGEMENT
     ============================================================ */

  function setTheme(theme) {

    root.setAttribute('data-theme', theme);

    localStorage.setItem('theme', theme);

    const themeIcon = document.querySelector('#th use');

    if (themeIcon) {
      themeIcon.setAttribute(
        'href',
        theme === 'dark' ? '#moon' : '#sun'
      );
    }

    onTheme(theme);
  }


  // Load saved theme or system preference

  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {

    setTheme(savedTheme);

  } else {

    setTheme(
      window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
    );

  }


  // Theme toggle button

  const themeBtn = document.getElementById('th');

  if (themeBtn) {

    themeBtn.addEventListener('click', function () {

      const current = root.getAttribute('data-theme');

      setTheme(current === 'dark' ? 'light' : 'dark');

    });

  }


  /* ============================================================
     2. ACTIVE NAVIGATION LINK (SCROLL SPY)
     ============================================================ */

  const links = Array.from(
    document.querySelectorAll('nav a[href^="#"]')
  );

  if ('IntersectionObserver' in window) {

    const io = new IntersectionObserver(function (entries) {

      entries.forEach(function (entry) {

        if (entry.isIntersecting) {

          links.forEach(function (link) {

            link.classList.toggle(
              'on',
              link.getAttribute('href') ===
              '#' + entry.target.id
            );

          });

        }

      });

    }, {
      rootMargin: '-45% 0px -50% 0px'
    });


    document.querySelectorAll('section[id]').forEach(function (section) {

      io.observe(section);

    });

  }


  /* ============================================================
     3. 3D TILT EFFECT ON CARDS AND AVATAR
     ============================================================ */

  function addTilt(element, maxRotateX, maxRotateY) {

    if (reduce || !element) return;

    element.addEventListener('pointermove', function (e) {

      if (e.pointerType === 'touch') return;

      const rect = element.getBoundingClientRect();

      const x = (e.clientX - rect.left) / rect.width - 0.5;

      const y = (e.clientY - rect.top) / rect.height - 0.5;

      element.style.transform =
        `rotateX(${-y * maxRotateX}deg) ` +
        `rotateY(${x * maxRotateY}deg) translateZ(8px)`;

    });


    element.addEventListener('pointerleave', function () {

      element.style.transform = '';

    });

  }


  document.querySelectorAll('.tilt').forEach(function (element) {

    addTilt(element, 9, 11);

  });


  addTilt(
    document.getElementById('ring'),
    16,
    20
  );


  /* ============================================================
     4. CONTACT FORM - EMAILJS
     ============================================================ */

  const contactForm = document.getElementById('cf');

  const statusBox = document.getElementById('form-status');


  // Display form status

  function showStatus(message, type) {

    if (!statusBox) return;

    statusBox.textContent = message;

    statusBox.className = 'form-status ' + type;

    statusBox.style.display = 'flex';

  }


  // Hide form status

  function hideStatus() {

    if (!statusBox) return;

    statusBox.style.display = 'none';

  }


  if (contactForm) {

    contactForm.addEventListener('submit', function (e) {

      e.preventDefault();


      // Get form elements

      const nameInput = document.getElementById('n');

      const emailInput = document.getElementById('e');

      const subjectInput = document.getElementById('s');

      const msgInput = document.getElementById('m');

      const submitBtn = contactForm.querySelector(
        'button[type="submit"]'
      );


      // Check required elements

      if (
        !nameInput ||
        !emailInput ||
        !subjectInput ||
        !msgInput ||
        !submitBtn
      ) {

        showStatus(
          'Contact form elements are missing. Please check your HTML.',
          'error'
        );

        return;

      }


      // Get user input

      const name = nameInput.value.trim();

      const email = emailInput.value.trim();

      const subject = subjectInput.value.trim();

      const message = msgInput.value.trim();


      // Validate empty fields

      if (!name || !email || !subject || !message) {

        showStatus(
          'Please fill in all fields before sending.',
          'error'
        );

        return;

      }


      // Validate email format

      if (!emailInput.checkValidity()) {

        showStatus(
          'Please enter a valid email address.',
          'error'
        );

        emailInput.focus();

        return;

      }


      // Check EmailJS configuration

      const isConfigured = (

        typeof emailjs !== 'undefined' &&

        EMAILJS_CONFIG.publicKey.trim() !== '' &&

        EMAILJS_CONFIG.serviceId.trim() !== '' &&

        EMAILJS_CONFIG.templateId.trim() !== ''

      );


      if (!isConfigured) {

        showStatus(
          'EmailJS is not configured. Please try again later.',
          'error'
        );

        console.error(
          'EmailJS configuration or SDK is missing.'
        );

        return;

      }


      // Button loading state

      const originalBtnHTML = submitBtn.innerHTML;

      submitBtn.disabled = true;

      submitBtn.innerHTML =
        '<span class="spinner"></span> Sending...';

      hideStatus();


      // IMPORTANT:
      // These parameter names match your EmailJS template.

      const templateParams = {

        name: name,

        email: email,

        title: subject,

        time: new Date().toLocaleString(),

        message: message

      };


      console.log(
        'Sending contact form through EmailJS...'
      );


      // Send email

      emailjs.send(

        EMAILJS_CONFIG.serviceId,

        EMAILJS_CONFIG.templateId,

        templateParams

      )

        .then(function (response) {

          console.log(
            'EmailJS Success:',
            response.status,
            response.text
          );


          showStatus(
            'Thank you! Your message has been sent successfully.',
            'success'
          );


          // Clear form after successful submission

          contactForm.reset();

        })


        .catch(function (error) {

          console.error(
            '========== EMAILJS ERROR =========='
          );

          console.error(
            'Status:',
            error.status
          );

          console.error(
            'Error message:',
            error.text
          );

          console.error(
            'Full error:',
            error
          );

          console.error(
            '==================================='
          );


          // Show actual error instead of silently
          // opening the visitor's email application.

          const errorMessage =
            error.text ||
            'Unable to send your message. Please try again later.';


          showStatus(
            'Message could not be sent: ' + errorMessage,
            'error'
          );

        })


        .finally(function () {

          // Restore button

          submitBtn.disabled = false;

          submitBtn.innerHTML = originalBtnHTML;

        });

    });

  }


  /* ============================================================
     5. THREE.JS NEURAL NETWORK BACKGROUND
     ============================================================ */

  const canvas = document.getElementById('bg');


  // Check Three.js availability

  if (!window.THREE || !canvas) {

    console.warn(
      'Three.js or background canvas not found.'
    );

    return;

  }


  let R;

  try {

    R = new THREE.WebGLRenderer({

      canvas: canvas,

      alpha: true,

      antialias: true

    });

  } catch (err) {

    console.warn(
      'WebGL not supported:',
      err
    );

    return;

  }


  // Renderer configuration

  R.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );


  // Scene

  const S = new THREE.Scene();


  // Camera

  const C = new THREE.PerspectiveCamera(
    50,
    1,
    0.1,
    100
  );

  C.position.z = 9;


  // Main group

  const G = new THREE.Group();

  S.add(G);


  // Neural network layers

  const layers = [4, 6, 6, 3];

  const nodes = [];


  // Materials

  const outM = new THREE.MeshBasicMaterial();

  const inM = new THREE.MeshBasicMaterial();


  // Sphere geometry

  const sg = new THREE.SphereGeometry(
    0.14,
    16,
    16
  );


  // Create neural network nodes

  layers.forEach(function (n, li) {

    const arr = [];

    for (let i = 0; i < n; i++) {

      const m = new THREE.Mesh(
        sg,
        li === 3 ? outM : inM
      );

      m.position.set(

        (li - 1.5) * 2.3,

        (i - (n - 1) / 2) * 1.05,

        (Math.random() - 0.5) * 2.4

      );

      G.add(m);

      arr.push(m);

    }

    nodes.push(arr);

  });


  // Create connections between layers

  const pts = [];

  const edges = [];


  for (let l = 0; l < 3; l++) {

    nodes[l].forEach(function (a) {

      nodes[l + 1].forEach(function (b) {

        pts.push(

          a.position.x,
          a.position.y,
          a.position.z,

          b.position.x,
          b.position.y,
          b.position.z

        );

        edges.push([
          a.position,
          b.position
        ]);

      });

    });

  }


  // Connection geometry

  const lg = new THREE.BufferGeometry();

  lg.setAttribute(

    'position',

    new THREE.Float32BufferAttribute(pts, 3)

  );


  const lineM = new THREE.LineBasicMaterial({

    transparent: true,

    opacity: 0.35

  });


  G.add(
    new THREE.LineSegments(lg, lineM)
  );


  // Animated particles

  const N = 50;

  const pg = new THREE.BufferGeometry();

  const pp = new Float32Array(N * 3);

  const st = [];

  const pM = new THREE.PointsMaterial({

    size: 0.16

  });


  for (let i = 0; i < N; i++) {

    st.push({

      e: edges[
        (Math.random() * edges.length) | 0
      ],

      t: Math.random(),

      v: 0.004 + Math.random() * 0.006

    });

  }


  pg.setAttribute(

    'position',

    new THREE.BufferAttribute(pp, 3)

  );


  G.add(
    new THREE.Points(pg, pM)
  );


  /* ============================================================
     THEME COLORS
     ============================================================ */

  onTheme = function (theme) {

    const d = theme === 'dark';

    inM.color.set(
      d ? 0xe5e5e5 : 0x262626
    );

    outM.color.set(
      d ? 0x22c55e : 0x16a34a
    );

    lineM.color.set(
      d ? 0x9a9a9a : 0x555555
    );

    pM.color.set(
      d ? 0x22c55e : 0x16a34a
    );


    if (reduce) {

      frame();

    }

  };


  onTheme(
    root.getAttribute('data-theme')
  );


  /* ============================================================
     RESPONSIVE RESIZE
     ============================================================ */

  function handleResize() {

    R.setSize(
      window.innerWidth,
      window.innerHeight,
      false
    );

    C.aspect =
      window.innerWidth / window.innerHeight;

    C.updateProjectionMatrix();


    G.scale.setScalar(

      window.innerWidth < 760 ? 0.6 : 1

    );

  }


  handleResize();


  window.addEventListener('resize', function () {

    handleResize();

    if (reduce) {

      frame();

    }

  });


  /* ============================================================
     MOUSE MOVEMENT
     ============================================================ */

  let mx = 0;

  let my = 0;

  let prog = 0;


  window.addEventListener('pointermove', function (e) {

    mx = e.clientX / window.innerWidth - 0.5;

    my = e.clientY / window.innerHeight - 0.5;

  });


  /* ============================================================
     SCROLL ANIMATION
     ============================================================ */

  function onScroll() {

    const h =
      document.documentElement.scrollHeight -
      window.innerHeight;

    prog = h > 0
      ? window.scrollY / h
      : 0;

  }


  window.addEventListener('scroll', function () {

    onScroll();

    if (reduce) {

      frame();

    }

  }, {
    passive: true
  });


  onScroll();


  /* ============================================================
     ANIMATION FRAME
     ============================================================ */

  function frame() {


    // Update particle positions

    for (let k = 0; k < N; k++) {

      const p = st[k];

      if (!reduce) {

        p.t += p.v;

      }


      if (p.t > 1) {

        p.t = 0;

        p.e = edges[
          (Math.random() * edges.length) | 0
        ];

      }


      // Interpolate particle position

      pp[k * 3] =

        p.e[0].x +
        (p.e[1].x - p.e[0].x) * p.t;


      pp[k * 3 + 1] =

        p.e[0].y +
        (p.e[1].y - p.e[0].y) * p.t;


      pp[k * 3 + 2] =

        p.e[0].z +
        (p.e[1].z - p.e[0].z) * p.t;

    }


    pg.attributes.position.needsUpdate = true;


    // Scroll-based movement

    const wide = window.innerWidth >= 760;


    const tx = wide
      ? 2.4 * Math.cos(prog * Math.PI * 4)
      : 0;


    const ty = wide
      ? 0
      : 2 * Math.cos(prog * Math.PI * 4);


    // Smooth group movement

    G.position.x +=
      (tx - G.position.x) * 0.05;


    G.position.y +=
      (ty - G.position.y) * 0.05;


    // Smooth rotation

    G.rotation.y += (

      (mx * 1.1 + prog * Math.PI * 3) -
      G.rotation.y

    ) * 0.05;


    G.rotation.x += (

      (my * 0.6) -
      G.rotation.x

    ) * 0.05;


    // Render scene

    R.render(S, C);


    // Continue animation

    if (!reduce) {

      requestAnimationFrame(frame);

    }

  }


  // Start animation

  frame();


})();
