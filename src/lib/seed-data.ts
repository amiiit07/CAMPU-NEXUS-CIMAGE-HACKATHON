export const seedTenants = [
  { slug: "alpha-tech", name: "Alpha Tech University", brandColor: "#22d3ee", subdomain: "alpha", isolationMode: "shared" },
  { slug: "northstar", name: "Northstar Institute", brandColor: "#60a5fa", subdomain: "northstar", isolationMode: "isolated" }
];

export const seedUsers = [
  { email: "admin@campusnexus.dev", name: "Aarav Shah", role: "super_admin" },
  { email: "college.admin@campusnexus.dev", name: "Ritika Verma", role: "college_admin" },
  { email: "college.admin2@campusnexus.dev", name: "Karan Mehta", role: "college_admin" },
  { email: "faculty@alpha.edu", name: "Dr. Meera Iyer", role: "faculty" },
  { email: "student@alpha.edu", name: "Nina Patel", role: "student" }
];

export const seedProjects = [
  {
    title: "AI Mentor Mesh",
    summary: "Match students with mentors across campuses using skill vectors and availability signals.",
    type: "startup",
    stage: "team_forming",
    requiredSkills: ["Next.js", "ML", "Product Design"],
    budget: 25000,
    timeline: "6 weeks"
  },
  {
    title: "Federated Research Vault",
    summary: "Cross-college research rooms with private tenant isolation and collaboration controls.",
    type: "research",
    stage: "proposal",
    requiredSkills: ["Security", "MongoDB", "Collaboration"],
    budget: 12000,
    timeline: "8 weeks"
  }
];
