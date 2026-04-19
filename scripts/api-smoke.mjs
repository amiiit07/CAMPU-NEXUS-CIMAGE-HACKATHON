const base = "http://localhost:3000";

class Client {
  constructor(tenantId = "cimage") {
    this.jar = new Map();
    this.tenantId = tenantId;
  }

  cookieHeader() {
    return Array.from(this.jar.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
  }

  async req(path, { method = "GET", body } = {}) {
    const headers = { "content-type": "application/json", "x-tenant-id": this.tenantId };
    const cookie = this.cookieHeader();
    if (cookie) {
      headers.cookie = cookie;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(base + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        redirect: "manual",
        signal: controller.signal
      });

      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        const [pair] = setCookie.split(";");
        const splitIndex = pair.indexOf("=");
        this.jar.set(pair.slice(0, splitIndex), pair.slice(splitIndex + 1));
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      return { status: response.status, data };
    } catch (error) {
      return { status: "ERR", data: error instanceof Error ? error.message : "unknown" };
    } finally {
      clearTimeout(timer);
    }
  }
}

const out = {};
const admin = new Client("cimage");
const student = new Client("cimage");

out.health = await admin.req("/api/health");
out.loginAdmin = await admin.req("/api/auth/login", {
  method: "POST",
  body: { email: "superadmin@campusnexus.dev", password: "Campus@2026" }
});

if (out.loginAdmin.status !== 200) {
  out.registerAdmin = await admin.req("/api/auth/register", {
    method: "POST",
    body: {
      email: "superadmin@campusnexus.dev",
      password: "Campus@2026",
      name: "Super Admin",
      role: "super_admin"
    }
  });

  out.loginAdmin = await admin.req("/api/auth/login", {
    method: "POST",
    body: { email: "superadmin@campusnexus.dev", password: "Campus@2026" }
  });
}

out.seed = await admin.req("/api/seed", { method: "POST" });
out.loginAdminAfterSeed = await admin.req("/api/auth/login", {
  method: "POST",
  body: { email: "superadmin@campusnexus.dev", password: "Campus@2026" }
});
out.loginStudent = await student.req("/api/auth/login", {
  method: "POST",
  body: { email: "amit.cimage@campusnexus.dev", password: "Campus@2026" }
});

if (out.loginStudent.status !== 200) {
  out.registerStudent = await student.req("/api/auth/register", {
    method: "POST",
    body: {
      email: "amit.cimage@campusnexus.dev",
      password: "Campus@2026",
      name: "Demo Student",
      role: "student"
    }
  });

  out.loginStudent = await student.req("/api/auth/login", {
    method: "POST",
    body: { email: "amit.cimage@campusnexus.dev", password: "Campus@2026" }
  });
}
out.project = await admin.req("/api/projects", {
  method: "POST",
  body: {
    title: "Reliability Sprint",
    summary: "Production hardening project",
    type: "project",
    stage: "team_forming",
    requiredSkills: ["Next.js", "Testing"],
    budget: 0,
    timeline: "5 days"
  }
});

const projectId = out.project.data?.data?.project?._id;
out.rooms = await student.req("/api/chat/rooms");
const roomId = out.rooms.data?.data?.items?.[0]?._id;
const studentId = out.loginStudent.data?.data?.user?.id;
const adminId = out.loginAdminAfterSeed.data?.data?.user?.id ?? out.loginAdmin.data?.data?.user?.id;

if (projectId) {
  out.apply = await student.req(`/api/projects/${projectId}/apply`, { method: "POST" });
  out.accept = await admin.req(`/api/projects/${projectId}/accept`, {
    method: "POST",
    body: { userId: studentId }
  });
} else {
  out.apply = { status: "SKIP", data: "No projectId" };
  out.accept = { status: "SKIP", data: "No projectId" };
}

if (roomId) {
  out.chatSend = await student.req("/api/chat/send", {
    method: "POST",
    body: { roomId, text: "Ready for demo day.", attachments: [] }
  });
  out.chatGet = await student.req(`/api/chat/${roomId}`);
} else {
  out.chatSend = { status: "SKIP", data: "No roomId" };
  out.chatGet = { status: "SKIP", data: "No roomId" };
}

out.notifications = await student.req("/api/notifications");
out.rating = await student.req("/api/ratings", {
  method: "POST",
  body: { subjectId: adminId, score: 5, category: "collaboration" }
});

console.log(
  JSON.stringify(
    {
      status: {
        health: out.health.status,
        loginAdmin: out.loginAdmin.status,
        seed: out.seed.status,
        loginAdminAfterSeed: out.loginAdminAfterSeed.status,
        loginStudent: out.loginStudent.status,
        project: out.project.status,
        rooms: out.rooms.status,
        apply: out.apply.status,
        accept: out.accept.status,
        chatSend: out.chatSend.status,
        chatGet: out.chatGet.status,
        notifications: out.notifications.status,
        rating: out.rating.status
      },
      ids: {
        tenantId: out.seed.data?.tenantId ?? null,
        projectId: projectId ?? null,
        roomId: roomId ?? null
      }
    },
    null,
    2
  )
);
