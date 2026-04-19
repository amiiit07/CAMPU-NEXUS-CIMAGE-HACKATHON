const base = "http://localhost:3000";
const creds = {
  super: { email: "superadmin@campusnexus.dev", password: "Campus@2026" },
  s1: { email: "amit.cimage@campusnexus.dev", password: "Campus@2026" },
  s2: { email: "vivek.cimage@campusnexus.dev", password: "Campus@2026" }
};

async function login(credentials) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(credentials)
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  return {
    ok: res.ok,
    status: res.status,
    cookie: (res.headers.get("set-cookie") || "").split(";")[0],
    json,
    raw: text
  };
}

async function jfetch(path, options = {}) {
  const res = await fetch(`${base}${path}`, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json, raw: text };
}

function row(name, pass, detail) {
  return { name, pass: Boolean(pass), detail };
}

async function run() {
  const checks = [];

  const superLogin = await login(creds.super);
  checks.push(row("login super admin", superLogin.ok, `status=${superLogin.status}`));
  if (!superLogin.ok) {
    throw new Error(`Super admin login failed: ${superLogin.raw}`);
  }

  const beforeProjects = await jfetch("/api/projects", {
    headers: { cookie: superLogin.cookie }
  });
  const beforeList = Array.isArray(beforeProjects.json)
    ? beforeProjects.json
    : Array.isArray(beforeProjects.json?.data?.projects)
      ? beforeProjects.json.data.projects
      : [];

  const title = `Smoke ${Date.now()}`;
  const created = await jfetch("/api/projects", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: superLogin.cookie
    },
    body: JSON.stringify({
      title,
      summary: "Smoke add validation-safe summary",
      type: "project"
    })
  });
  checks.push(row("project add", created.ok, `status=${created.status}`));
  const createdProject = created.json?._id ? created.json : created.json?.data?.project;
  if (!created.ok || !createdProject?._id) {
    throw new Error(`Project create failed: ${created.raw}`);
  }

  const projectId = createdProject._id;
  const updated = await jfetch(`/api/projects/${projectId}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      cookie: superLogin.cookie
    },
    body: JSON.stringify({
      summary: `Smoke updated ${Date.now()}`,
      stage: "sprint"
    })
  });
  checks.push(row("project update", updated.ok, `status=${updated.status}`));

  const deleted = await jfetch(`/api/projects/${projectId}`, {
    method: "DELETE",
    headers: { cookie: superLogin.cookie }
  });
  checks.push(row("project delete", deleted.ok, `status=${deleted.status}`));

  const afterProjects = await jfetch("/api/projects", {
    headers: { cookie: superLogin.cookie }
  });

  const afterList = Array.isArray(afterProjects.json)
    ? afterProjects.json
    : Array.isArray(afterProjects.json?.data?.projects)
      ? afterProjects.json.data.projects
      : [];
  const beforeCount = beforeList.length;
  const afterCount = afterList.length;
  checks.push(row("project count restored", beforeCount === afterCount, `${beforeCount} -> ${afterCount}`));

  const s1 = await login(creds.s1);
  const s2 = await login(creds.s2);
  checks.push(row("login student 1", s1.ok, `status=${s1.status}`));
  checks.push(row("login student 2", s2.ok, `status=${s2.status}`));
  if (!s1.ok || !s2.ok) {
    throw new Error("Student login failed");
  }

  const r1 = await jfetch("/api/chat/rooms", { headers: { cookie: s1.cookie } });
  const r2 = await jfetch("/api/chat/rooms", { headers: { cookie: s2.cookie } });

  const rooms1 = r1.json?.data?.items ?? r1.json?.rooms ?? [];
  const rooms2 = r2.json?.data?.items ?? r2.json?.rooms ?? [];
  checks.push(row("rooms load student 1", r1.ok, `rooms=${rooms1.length}`));
  checks.push(row("rooms load student 2", r2.ok, `rooms=${rooms2.length}`));

  const community1 = rooms1.find((room) => String(room.title || "").includes("Community Room"));
  const community2 = rooms2.find((room) => String(room.title || "").includes("Community Room"));
  checks.push(row("community room visible both", Boolean(community1) && Boolean(community2), `s1=${Boolean(community1)} s2=${Boolean(community2)}`));

  if (!community1?._id) {
    throw new Error("Community room missing for student 1");
  }

  const roomId = community1._id;
  const message = `RT smoke ${Date.now()}`;

  const sent = await jfetch("/api/chat/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: s1.cookie
    },
    body: JSON.stringify({ roomId, text: message })
  });
  checks.push(row("chat send", sent.ok, `status=${sent.status}`));

  const history = await jfetch(`/api/chat/${roomId}`, {
    headers: { cookie: s2.cookie }
  });
  const historyItems = history.json?.data?.items ?? history.json?.messages ?? [];
  const latest = historyItems.at(-1)?.text;
  checks.push(row("chat history fetch", history.ok, `status=${history.status}`));
  checks.push(row("chat realtime visible to recipient", latest === message, `latest=${latest || "none"}`));

  const failed = checks.filter((c) => !c.pass);
  console.log(JSON.stringify({ ok: failed.length === 0, checks, failedCount: failed.length }, null, 2));
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(JSON.stringify({ ok: false, fatal: String(error?.message || error) }, null, 2));
  process.exitCode = 1;
});
