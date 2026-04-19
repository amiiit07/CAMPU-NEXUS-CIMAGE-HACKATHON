import mongoose, { Schema, type Model } from "mongoose";

const tenantSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    logoUrl: String,
    brandColor: String,
    subdomain: String,
    isolationMode: { type: String, enum: ["shared", "isolated", "schema"], default: "shared" },
    status: { type: String, enum: ["active", "paused", "trial", "suspended"], default: "active" },
    subscriptionPlan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    contactEmail: String
  },
  { timestamps: true }
);

const userSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    email: { type: String, required: true, index: true },
    name: { type: String, required: true },
    avatarUrl: String,
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["super_admin", "college_admin", "faculty", "student", "startup"], default: "student" },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", index: true },
    isVerified: { type: Boolean, default: false },
    authProvider: String,
    status: { type: String, enum: ["active", "suspended", "pending"], default: "active" },
    lastLoginAt: Date,
    failedLoginCount: { type: Number, default: 0 },
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false }
  },
  { timestamps: true }
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

const profileSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    photoUrl: String,
    headline: String,
    bio: String,
    skills: [String],
    certificates: [String],
    achievements: [String],
    portfolioLinks: [String],
    socialLinks: [String],
    githubHandle: String,
    resumeUrl: String,
    badges: [String],
    availability: { type: String, default: "open" },
    reputationScore: { type: Number, default: 72 },
    collaborationScore: { type: Number, default: 78 }
  },
  { timestamps: true }
);

const skillSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    name: { type: String, required: true },
    category: String,
    trendingScore: { type: Number, default: 50 }
  },
  { timestamps: true }
);

skillSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const departmentSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    headUserId: { type: Schema.Types.ObjectId, ref: "User" },
    description: String,
    status: { type: String, enum: ["active", "archived"], default: "active" }
  },
  { timestamps: true }
);

departmentSchema.index({ tenantId: 1, code: 1 }, { unique: true });

const projectSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    title: { type: String, required: true },
    summary: String,
    type: { type: String, enum: ["project", "startup", "research", "internship", "hackathon"], default: "project" },
    stage: { type: String, enum: ["idea", "proposal", "team_forming", "sprint", "demo_day", "completed", "rated"], default: "idea" },
    requiredSkills: [String],
    budget: Number,
    timeline: String,
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    successPrediction: { type: Number, default: 68 }
  },
  { timestamps: true }
);

projectSchema.index({ tenantId: 1, stage: 1, createdAt: -1 });
projectSchema.index({ tenantId: 1, ownerId: 1, createdAt: -1 });

const teamSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true, required: true },
    name: String,
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    chemistryScore: { type: Number, default: 75 }
  },
  { timestamps: true }
);

const applicationSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    status: { type: String, enum: ["applied", "accepted", "rejected", "waitlisted"], default: "applied" }
  },
  { timestamps: true }
);

applicationSchema.index({ tenantId: 1, projectId: 1, userId: 1 }, { unique: true });

const taskSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    creatorId: { type: Schema.Types.ObjectId, ref: "User" },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    title: String,
    description: String,
    status: { type: String, enum: ["todo", "doing", "blocked", "done"], default: "todo" },
    dueDate: Date
  },
  { timestamps: true }
);

const roomSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    title: String,
    type: { type: String, enum: ["dm", "group", "voice", "project"], default: "project" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    participantIds: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

roomSchema.index({ tenantId: 1, participantIds: 1, updatedAt: -1 });
roomSchema.index({ tenantId: 1, creatorId: 1, createdAt: -1 });

const messageSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", index: true, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    text: String,
    attachments: [String],
    editedAt: Date
  },
  { timestamps: true }
);

messageSchema.index({ tenantId: 1, roomId: 1, createdAt: -1 });

const ratingSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    raterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: Number,
    category: String
  },
  { timestamps: true }
);

ratingSchema.index({ tenantId: 1, raterId: 1, subjectId: 1, category: 1 }, { unique: true });

const reviewSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    text: String,
    sentimentScore: Number
  },
  { timestamps: true }
);

const notificationSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    title: String,
    body: String,
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.index({ tenantId: 1, userId: 1, read: 1, createdAt: -1 });

const auditLogSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    action: String,
    resourceType: String,
    resourceId: String,
    ipAddress: String,
    deviceId: String,
    riskScore: Number
  },
  { timestamps: true }
);

const reportSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: "User" },
    targetType: String,
    targetId: String,
    reason: String,
    reviewedById: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["open", "reviewing", "resolved"], default: "open" }
  },
  { timestamps: true }
);

const eventSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    title: { type: String, required: true },
    description: String,
    eventType: { type: String, enum: ["hackathon", "announcement", "workshop", "internal"], default: "internal" },
    startAt: Date,
    endAt: Date,
    location: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" }
  },
  { timestamps: true }
);

const recommendationSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    teammateScore: Number,
    projectScore: Number,
    mentorScore: Number,
    reasoning: [String]
  },
  { timestamps: true }
);

recommendationSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

function getModel<T>(name: string, schema: Schema) {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema);
}

export const Tenant = getModel("Tenant", tenantSchema);
export const User = getModel("User", userSchema);
export const Profile = getModel("Profile", profileSchema);
export const Skill = getModel("Skill", skillSchema);
export const Department = getModel("Department", departmentSchema);
export const Project = getModel("Project", projectSchema);
export const Team = getModel("Team", teamSchema);
export const Application = getModel("Application", applicationSchema);
export const Task = getModel("Task", taskSchema);
export const Room = getModel("Room", roomSchema);
export const Message = getModel("Message", messageSchema);
export const Rating = getModel("Rating", ratingSchema);
export const Review = getModel("Review", reviewSchema);
export const Notification = getModel("Notification", notificationSchema);
export const AuditLog = getModel("AuditLog", auditLogSchema);
export const Report = getModel("Report", reportSchema);
export const Event = getModel("Event", eventSchema);
export const Recommendation = getModel("Recommendation", recommendationSchema);
