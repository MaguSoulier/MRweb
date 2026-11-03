// Modo demo: imita la parte de Supabase que usa la app, guardando todo en localStorage.
// Se activa solo mientras config.js tenga los valores de ejemplo. No hace falta tocarlo.
function createMockClient() {
  const KEY = "mr_tareas_demo_v3";
  const SESSION_KEY = "mr_tareas_demo_session";
  const uid = () => crypto.randomUUID();
  const listeners = [];

  // Sin datos de ejemplo: un único usuario (el de la sesión) y nada más
  function seed() {
    return { profiles: [{ id: "u1", name: "Yo", email: "yo@demo.com" }], projects: [], tasks: [] };
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
  const signIn = async ({ email, options }) => {
    db.profiles[0].email = email || "yo@demo.com"; // tú eres siempre el primer usuario de la demo
    const nick = options && options.data && options.data.nickname;
    if (nick) db.profiles[0].name = nick;
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
