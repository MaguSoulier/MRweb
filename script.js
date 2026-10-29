// Transiciona el fondo de negro a blanco y de vuelta, con cambios rápidos
(function () {
  var ticking = false;
  var bgLayer = document.querySelector(".page-bg");
  var whiteSection = document.getElementById("servicios");

  // Transición corta: ocurre en media pantalla de scroll
  function shadeForScroll(y) {
    if (!whiteSection) return 0;

    var vh = window.innerHeight;
    var top = whiteSection.getBoundingClientRect().top + y;
    var bottom = top + whiteSection.offsetHeight;

    var upStart = top - vh * 0.9;      // empieza a aclararse
    var upEnd = top - vh * 0.4;        // ya es blanco total
    var downStart = bottom - vh * 0.6; // empieza a oscurecerse
    var downEnd = bottom - vh * 0.1;   // ya es negro total

    function t(a, b) {
      return Math.min(Math.max((y - a) / (b - a), 0), 1);
    }

    if (y <= upEnd) return Math.round(t(upStart, upEnd) * 255);
    if (y <= downStart) return 255;
    return Math.round((1 - t(downStart, downEnd)) * 255);
  }

  function setBackground() {
    var shade = shadeForScroll(window.scrollY);
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