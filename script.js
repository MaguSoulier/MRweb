// Transiciona el fondo del body de negro (100%) a blanco (100%)
// a medida que se hace scroll por toda la página.
(function () {
  var ticking = false;
  var bgLayer = document.querySelector(".page-bg");
  var whiteSection = document.getElementById("servicios");
  var blackSection = document.getElementById("contacto");

  // Negro -> rampa a blanco hasta llegar a "servicios" -> blanco fijo
  // mientras dura esa sección -> rampa de vuelta a negro hasta llegar
  // a "contacto" -> negro fijo de ahí en adelante.
  function shadeForScroll(y, maxScroll) {
    if (!whiteSection || maxScroll <= 0) {
      return 0;
    }

    var whiteRect = whiteSection.getBoundingClientRect();
    var whiteTop = whiteRect.top + y;
    var whiteBottom = whiteTop + whiteSection.offsetHeight;

    if (y <= whiteTop) {
      var tUp = whiteTop > 0 ? Math.min(Math.max(y / whiteTop, 0), 1) : 1;
      return Math.round(tUp * 255);
    }

    if (y <= whiteBottom) {
      return 255;
    }

    var blackStart = maxScroll;
    if (blackSection) {
      var blackRect = blackSection.getBoundingClientRect();
      var candidate = blackRect.top + y;
      if (candidate > whiteBottom) {
        blackStart = candidate;
      }
    }

    if (y >= blackStart) {
      return 0;
    }

    var remaining = blackStart - whiteBottom;
    var tDown = remaining > 0
      ? Math.min(Math.max((y - whiteBottom) / remaining, 0), 1)
      : 1;
    return Math.round((1 - tDown) * 255);
  }

  function setBackground() {
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var shade = shadeForScroll(window.scrollY, maxScroll);
    var opposite = 255 - shade;
    var bg = "rgb(" + shade + ", " + shade + ", " + shade + ")";
    var fg = "rgb(" + opposite + ", " + opposite + ", " + opposite + ")";
    if (bgLayer) {
      bgLayer.style.backgroundColor = bg;
    }
    document.documentElement.style.setProperty("--page-bg", bg);
    document.documentElement.style.setProperty("--page-fg", fg);
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        setBackground();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", setBackground);
  setBackground();
})();

// Marca como activo el link del header__nav cuya sección está
// cruzando el centro de la pantalla.
(function () {
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".header__nav a[href^='#']")
  );
  if (!links.length || !("IntersectionObserver" in window)) return;

  var sections = [];
  links.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section && sections.indexOf(section) === -1) {
      sections.push(section);
    }
  });

  function setActive(id) {
    links.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();
