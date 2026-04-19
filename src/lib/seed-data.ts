export const DEMO_PASSWORD = "Campus@2026";

export type SeedTenant = {
  slug: string;
  name: string;
  brandColor: string;
  subdomain: string;
  isolationMode: "shared" | "isolated" | "schema";
  subscriptionPlan: "free" | "pro" | "enterprise";
  contactEmail: string;
};

export type SeedUser = {
  tenantSlug: string;
  email: string;
  name: string;
  role: "super_admin" | "college_admin" | "student";
};

export type SeedProject = {
  tenantSlug: string;
  ownerEmail: string;
  title: string;
  summary: string;
  type: "project" | "startup" | "research" | "internship" | "hackathon";
  stage: "idea" | "proposal" | "team_forming" | "sprint" | "demo_day" | "completed" | "rated";
  requiredSkills: string[];
  budget: number;
  timeline: string;
  successPrediction: number;
};

export const legacyTenantSlugs = ["campus-demo", "campus-nexus", "alpha-tech", "northstar"];

export const legacyDemoEmails = [
  "admin@campusnexus.dev",
  "college.admin@campusnexus.dev",
  "college.admin2@campusnexus.dev",
  "faculty@alpha.edu",
  "student@alpha.edu"
];

export const seedTenants: SeedTenant[] = [
  {
    slug: "cimage",
    name: "CIMAGE",
    brandColor: "#22d3ee",
    subdomain: "cimage",
    isolationMode: "shared",
    subscriptionPlan: "enterprise",
    contactEmail: "admin.cimage@campusnexus.dev"
  },
  {
    slug: "bia-patna",
    name: "BIA PATNA",
    brandColor: "#38bdf8",
    subdomain: "bia",
    isolationMode: "shared",
    subscriptionPlan: "pro",
    contactEmail: "admin.bia@campusnexus.dev"
  },
  {
    slug: "aia-patna",
    name: "AIA PATNA",
    brandColor: "#2dd4bf",
    subdomain: "aia",
    isolationMode: "shared",
    subscriptionPlan: "pro",
    contactEmail: "admin.aia@campusnexus.dev"
  },
  {
    slug: "iit-patna",
    name: "IIT PATNA",
    brandColor: "#60a5fa",
    subdomain: "iitpatna",
    isolationMode: "isolated",
    subscriptionPlan: "enterprise",
    contactEmail: "admin.iit@campusnexus.dev"
  },
  {
    slug: "ibm",
    name: "IBM",
    brandColor: "#818cf8",
    subdomain: "ibm",
    isolationMode: "shared",
    subscriptionPlan: "enterprise",
    contactEmail: "admin.ibm@campusnexus.dev"
  }
];

export const seedUsers: SeedUser[] = [
  { tenantSlug: "cimage", email: "superadmin@campusnexus.dev", name: "Platform Super Admin", role: "super_admin" },

  { tenantSlug: "cimage", email: "admin.cimage@campusnexus.dev", name: "CIMAGE Admin", role: "college_admin" },
  { tenantSlug: "bia-patna", email: "admin.bia@campusnexus.dev", name: "BIA Patna Admin", role: "college_admin" },
  { tenantSlug: "aia-patna", email: "admin.aia@campusnexus.dev", name: "AIA Patna Admin", role: "college_admin" },
  { tenantSlug: "iit-patna", email: "admin.iit@campusnexus.dev", name: "IIT Patna Admin", role: "college_admin" },
  { tenantSlug: "ibm", email: "admin.ibm@campusnexus.dev", name: "IBM Admin", role: "college_admin" },

  { tenantSlug: "cimage", email: "amit.cimage@campusnexus.dev", name: "Amit Kumar", role: "student" },
  { tenantSlug: "cimage", email: "vivek.cimage@campusnexus.dev", name: "Vivek Raj", role: "student" },

  { tenantSlug: "bia-patna", email: "akshay.bia@campusnexus.dev", name: "Akshay Singh", role: "student" },
  { tenantSlug: "bia-patna", email: "rahul.bia@campusnexus.dev", name: "Rahul Kumar", role: "student" },

  { tenantSlug: "aia-patna", email: "suraj.aia@campusnexus.dev", name: "Suraj Raj", role: "student" },
  { tenantSlug: "aia-patna", email: "amit.aia@campusnexus.dev", name: "Amit Patel", role: "student" },

  { tenantSlug: "iit-patna", email: "vivek.iit@campusnexus.dev", name: "Vivek Anand", role: "student" },
  { tenantSlug: "iit-patna", email: "akshay.iit@campusnexus.dev", name: "Akshay Raj", role: "student" },

  { tenantSlug: "ibm", email: "rahul.ibm@campusnexus.dev", name: "Rahul Verma", role: "student" },
  { tenantSlug: "ibm", email: "suraj.ibm@campusnexus.dev", name: "Suraj Kumar", role: "student" }
];

export const seedProjects: SeedProject[] = [
  {
    tenantSlug: "cimage",
    ownerEmail: "admin.cimage@campusnexus.dev",
    title: "CIMAGE Smart Campus ERP",
    summary: "Build a modern campus ERP for admissions, fees, attendance, and parent communication with a polished multi-role dashboard.",
    type: "project",
    stage: "team_forming",
    requiredSkills: ["Next.js", "MongoDB", "UI/UX"],
    budget: 45000,
    timeline: "8 weeks",
    successPrediction: 91
  },
  {
    tenantSlug: "cimage",
    ownerEmail: "amit.cimage@campusnexus.dev",
    title: "CIMAGE Placement Tracker",
    summary: "Create a student placement workflow with recruiter updates, resume insights, and interview pipeline visibility.",
    type: "startup",
    stage: "proposal",
    requiredSkills: ["React", "Node.js", "Analytics"],
    budget: 30000,
    timeline: "6 weeks",
    successPrediction: 86
  },
  {
    tenantSlug: "bia-patna",
    ownerEmail: "admin.bia@campusnexus.dev",
    title: "BIA Startup Incubation Portal",
    summary: "Launch an incubation portal for idea intake, mentor matchmaking, grant tracking, and founder collaboration.",
    type: "startup",
    stage: "team_forming",
    requiredSkills: ["Product Design", "Next.js", "Branding"],
    budget: 52000,
    timeline: "10 weeks",
    successPrediction: 90
  },
  {
    tenantSlug: "bia-patna",
    ownerEmail: "akshay.bia@campusnexus.dev",
    title: "BIA Alumni Connect",
    summary: "A collaboration platform for alumni engagement, fundraising, internships, and college mentorship circles.",
    type: "project",
    stage: "sprint",
    requiredSkills: ["Community", "MERN", "Email Automation"],
    budget: 25000,
    timeline: "5 weeks",
    successPrediction: 84
  },
  {
    tenantSlug: "aia-patna",
    ownerEmail: "admin.aia@campusnexus.dev",
    title: "AIA Research Collaboration Hub",
    summary: "Enable faculty-student research publication tracking, lab coordination, and cross-college knowledge exchange.",
    type: "research",
    stage: "proposal",
    requiredSkills: ["Research", "Security", "MongoDB"],
    budget: 40000,
    timeline: "9 weeks",
    successPrediction: 88
  },
  {
    tenantSlug: "aia-patna",
    ownerEmail: "suraj.aia@campusnexus.dev",
    title: "AIA Event and Workshop Manager",
    summary: "A live event operations platform for technical workshops, registrations, certificates, and sponsor engagement.",
    type: "hackathon",
    stage: "demo_day",
    requiredSkills: ["Frontend", "Forms", "Automation"],
    budget: 18000,
    timeline: "4 weeks",
    successPrediction: 82
  },
  {
    tenantSlug: "iit-patna",
    ownerEmail: "admin.iit@campusnexus.dev",
    title: "IIT Patna Innovation Grid",
    summary: "Create a deep-tech collaboration system for labs, startups, mentors, patent ideas, and funding opportunities.",
    type: "research",
    stage: "team_forming",
    requiredSkills: ["AI", "Systems Design", "Data"],
    budget: 65000,
    timeline: "12 weeks",
    successPrediction: 94
  },
  {
    tenantSlug: "iit-patna",
    ownerEmail: "vivek.iit@campusnexus.dev",
    title: "IIT Patna Internship Exchange",
    summary: "A structured portal for internship sharing, recruiter relationships, company pipelines, and student application quality.",
    type: "internship",
    stage: "sprint",
    requiredSkills: ["Backend", "Search", "Dashboards"],
    budget: 35000,
    timeline: "7 weeks",
    successPrediction: 87
  },
  {
    tenantSlug: "ibm",
    ownerEmail: "admin.ibm@campusnexus.dev",
    title: "IBM Enterprise Skill Radar",
    summary: "Map student skills against enterprise roles and generate upskilling pathways for project and job readiness.",
    type: "project",
    stage: "team_forming",
    requiredSkills: ["AI", "Skill Graphs", "TypeScript"],
    budget: 58000,
    timeline: "8 weeks",
    successPrediction: 92
  },
  {
    tenantSlug: "ibm",
    ownerEmail: "rahul.ibm@campusnexus.dev",
    title: "IBM Collaborative Demo Studio",
    summary: "Design a polished demo environment with rooms, notifications, project boards, and multi-tenant analytics for judges.",
    type: "hackathon",
    stage: "demo_day",
    requiredSkills: ["UI/UX", "Realtime", "Presentation"],
    budget: 22000,
    timeline: "3 weeks",
    successPrediction: 89
  }
];
