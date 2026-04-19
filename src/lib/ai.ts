export type MatchRecommendation = {
  userId: string;
  teammateScore: number;
  projectScore: number;
  mentorScore: number;
  reasoning: string[];
};

export function scoreMatch(skills: string[], projectSkills: string[]) {
  const matched = projectSkills.filter((skill) => skills.includes(skill));
  return projectSkills.length === 0 ? 0 : Math.round((matched.length / projectSkills.length) * 100);
}

export function generateMatchRecommendation(input: {
  userId: string;
  skills: string[];
  projectSkills: string[];
  interests: string[];
}): MatchRecommendation {
  const projectScore = scoreMatch(input.skills, input.projectSkills);
  const teammateScore = Math.min(100, projectScore + 12);
  const mentorScore = Math.max(35, 100 - projectScore / 2);

  return {
    userId: input.userId,
    teammateScore,
    projectScore,
    mentorScore,
    reasoning: [
      `Matched ${input.skills.filter((skill) => input.projectSkills.includes(skill)).join(", ") || "core profile"}`,
      `Aligned interests: ${input.interests.join(", ") || "cross-functional collaboration"}`,
      "Optimized for team balance, delivery speed, and mentor fit"
    ]
  };
}
