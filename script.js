// Transiciona el fondo del body de negro (100%) a blanco (100%)
// a medida que se hace scroll por toda la página.
(function () {
  var ticking = false;
  var bgLayer = document.querySelector(".page-bg");
  var whiteSection = document.getElementById("servicios");
  // La sección "contacto" ya no existe: ahora el negro final llega con el footer
  var blackSection =
    document.getElementById("contacto-footer") ||
    document.getElementById("contacto");

  // Negro -> rampa a blanco hasta llegar a "servicios" -> blanco fijo
  // mientras dura esa sección -> rampa de vuelta a negro hasta llegar
  // al footer -> negro fijo de ahí en adelante.
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

// Ajusta el mail gigante del footer al ancho exacto disponible
(function () {
  function ajustarMailGigante() {
    var caja = document.querySelector(".footer__mail-gigante");
    if (!caja) return;
    var texto = caja.querySelector("span");
    if (!texto) return;
    caja.style.fontSize = "100px";
    var ancho = texto.getBoundingClientRect().width;
    if (!ancho) return;
    caja.style.fontSize = (100 * caja.clientWidth / ancho) + "px";
  }

  window.addEventListener("resize", ajustarMailGigante);
  window.addEventListener("load", ajustarMailGigante);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(ajustarMailGigante);
  }
  ajustarMailGigante();
})();

// Animación del espectro (sección de texto): avanza con el scroll
(function () {
  var filas = document.querySelectorAll(".espectro__fila");
  if (!filas.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    Array.prototype.forEach.call(filas, function (f) {
      f.style.setProperty("--p", 1);
    });
    return;
  }

  function clamp(n) {
    return Math.min(1, Math.max(0, n));
  }

  var pendiente = false;

  function actualizar() {
    var vh = window.innerHeight;
    var inicio = vh * 0.92; // empieza a animarse al entrar por abajo
    var fin = vh * 0.5;     // queda completa al llegar a la mitad
    Array.prototype.forEach.call(filas, function (fila) {
      var top = fila.getBoundingClientRect().top;
      fila.style.setProperty(
        "--p",
        clamp((inicio - top) / (inicio - fin)).toFixed(3)
      );
    });
    pendiente = false;
  }

  function alScrollear() {
    if (!pendiente) {
      pendiente = true;
      window.requestAnimationFrame(actualizar);
    }
  }

  window.addEventListener("scroll", alScrollear, { passive: true });
  window.addEventListener("resize", alScrollear);
  actualizar();
})();