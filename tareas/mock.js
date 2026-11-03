// Modo demo: imita la parte de Supabase que usa la app, guardando todo en localStorage.
// Se activa solo mientras config.js tenga los valores de ejemplo. No hace falta tocarlo.
function createMockClient() {
  const KEY = "mr_tareas_demo_v2";
  const SESSION_KEY = "mr_tareas_demo_session";
  const uid = () => crypto.randomUUID();
  const listeners = [];

  function seed() {
    const pad = (n) => String(n).padStart(2, "0");
    const day = (offset) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };
    const profiles = ["Magu", "Mai", "Iván", "Iari", "Memi"].map((name, i) => ({
      id: "u" + (i + 1), name, email: name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + "@demo.com",
    }));
    const projects = ["Minotauro", "Hilacha", "El Galpón", "Interno"].map((name, i) => ({
      id: uid(), name, position: (i + 1) * 1000, created_at: new Date().toISOString(), // el primero es el más relevante
    }));
    const [mino, galpon, hilacha, interno] = projects.map((p) => p.id);
    const task = (project_id, title, assignees, due, status, priority) => ({
      id: uid(), project_id, title, description: "", assignees, due_date: day(due), status, priority,
      created_at: new Date().toISOString(),
    });
    return {
      profiles, projects,
      tasks: [
        task(mino, "Tarea de ejemplo 1", ["u1", "u2", "u3", "u4"], 7, "doing", 1),
        task(hilacha, "Tarea de ejemplo 2", ["u1", "u3"], 7, "doing", 1),
        task(interno, "Tarea de ejemplo 3", ["u1", "u4", "u5"], 7, "doing", 1),
        task(hilacha, "Tarea de ejemplo 4", ["u1"], 7, "doing", 1),
        task(mino, "Reunión con el cliente", ["u2"], 2, "todo", 2),
        task(galpon, "Maquetar planos", ["u1", "u3"], 4, "doing", 2),
        task(galpon, "Presupuesto", ["u2", "u5"], -3, "done", 3),
        task(galpon, "Revisar permisos", ["u4"], -2, "todo", 1),
        task(hilacha, "Entrega de muestras", ["u3", "u2"], -1, "todo", 1),
        task(interno, "Ordenar archivo", ["u4", "u5", "u2"], -5, "done", 4),
      ],
    };
  }

  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; }
  if (!db) db = seed();
  const save = () => localStorage.setItem(KEY, JSON.stringify(db));

  const DEFAULTS = {
    projects: {},
    tasks: { description: "", assignees: [], due_date: null, status: "todo", priority: 2 },
  };

  function cascade() {
    const projects = new Set(db.projects.map((p) => p.id));
    db.tasks = db.tasks.filter((t) => projects.has(t.project_id));
  }

  function from(table) {
    let op = "select", payload = null, filter = null, order = null, returning = false;
    const exec = () => {
      const rows = db[table];
      if (op === "insert") {
        const made = [].concat(payload).map((r) => ({
          ...DEFAULTS[table], id: uid(), created_at: new Date().toISOString(), ...r,
        }));
        rows.push(...made);
        save();
        return { data: returning ? structuredClone(made) : null, error: null };
      }
      const match = (r) => !filter || r[filter[0]] === filter[1];
      if (op === "update") {
        rows.filter(match).forEach((r) => Object.assign(r, payload));
        save();
        return { data: null, error: null };
      }
      if (op === "delete") {
        db[table] = rows.filter((r) => !match(r));
        cascade();
        save();
        return { data: null, error: null };
      }
      const out = rows.filter(match);
      if (order) out.sort((a, b) => (a[order] > b[order] ? 1 : a[order] < b[order] ? -1 : 0));
      return { data: structuredClone(out), error: null };
    };
    const q = {
      select() { if (op !== "select") returning = true; return q; },
      insert(p) { op = "insert"; payload = p; return q; },
      update(p) { op = "update"; payload = p; return q; },
      delete() { op = "delete"; return q; },
      eq(col, val) { filter = [col, val]; return q; },
      order(col) { order = col; return q; },
      then(resolve, reject) { return Promise.resolve().then(exec).then(resolve, reject); },
    };
    return q;
  }

  const getSession = () => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  };
  const setSession = (session) => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
    listeners.forEach((cb) => cb(session ? "SIGNED_IN" : "SIGNED_OUT", session));
  };
  const signIn = async ({ email }) => {
    db.profiles[0].email = email || "magu@demo.com"; // tú eres siempre el primer usuario de la demo
    save();
    setSession({ user: { id: "u1", email: db.profiles[0].email } });
    return { error: null };
  };

  return {
    isMock: true,
    from,
    auth: {
      getSession: async () => ({ data: { session: getSession() } }),
      onAuthStateChange(cb) {
        listeners.push(cb);
        setTimeout(() => cb("INITIAL_SESSION", getSession()), 0);
        return { data: { subscription: { unsubscribe() {} } } };
      },
      signInWithPassword: signIn,
      signUp: signIn,
      signOut: async () => { setSession(null); return { error: null }; },
    },
    channel() { const c = { on: () => c, subscribe: () => c }; return c; },
    removeChannel() {},
  };
}
