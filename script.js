// Fondo: negro (arriba del todo) a blanco (final de la página) según el scroll;
// el texto cambia de blanco a negro para mantener el contraste.
const raiz = document.documentElement;

function actualizarFondo() {
  const max = raiz.scrollHeight - window.innerHeight;
  const progreso = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
  raiz.style.setProperty('--scroll', progreso.toFixed(4));
  raiz.style.setProperty('--texto', progreso < 0.46 ? '#fff' : '#000');
}

window.addEventListener('scroll', actualizarFondo, { passive: true });
window.addEventListener('resize', actualizarFondo);
actualizarFondo();
