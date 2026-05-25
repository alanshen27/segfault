export const DIFFICULTY = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

export const DIFFICULTIES: readonly Difficulty[] = [
  DIFFICULTY.EASY,
  DIFFICULTY.MEDIUM,
  DIFFICULTY.HARD,
];

export const APPROVAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ApprovalStatus =
  (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS];

export const SUBMISSION_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  WRONG_ANSWER: "WRONG_ANSWER",
  RUNTIME_ERROR: "RUNTIME_ERROR",
  TIME_LIMIT: "TIME_LIMIT",
} as const;

export type SubmissionStatus =
  (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS];

export const USER_ROLE = {
  USER: "USER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export interface QuestionSummary {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  author: { name: string };
  bank: { id: string; name: string } | null;
  solved?: boolean;
}

export interface QuestionDetail extends QuestionSummary {
  content: string;
  constraints: string | null;
  sampleInput: string | null;
  sampleOutput: string | null;
  timeLimit: number;
  memoryLimit: number;
  testCaseCount?: number;
}

export interface TestCaseRunResult {
  index: number;
  label: string;
  passed: boolean;
  status: string;
  time?: string;
  memory?: number;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  expected?: string;
  actual?: string;
}

export interface RunTestsResponse {
  results: TestCaseRunResult[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
  solved?: boolean;
  submissionStatus?: SubmissionStatus;
}

export interface BankSummary {
  id: string;
  name: string;
  description: string;
  _count: { questions: number };
  createdBy: { name: string };
}

export interface ApprovalDetail {
  id: string;
  status: ApprovalStatus;
  feedback: string | null;
  createdAt: string;
  question: {
    id: string;
    title: string;
    content: string;
    difficulty: Difficulty;
    topic: string;
    author: { name: string; email: string };
  };
  submittedBy: { name: string; email: string };
}

export interface CodeRunResult {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  status?: { id: number; description: string };
  time?: string;
  memory?: number;
  token?: string;
}

export interface Language {
  value: string;
  label: string;
}

export const LANGUAGES: readonly Language[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
] as const;

export const BOILERPLATES: Record<string, string> = {
  python: `def solve():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    solve()`,
  javascript: `function solve() {\n    // Your code here\n}\n\nsolve();`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  java: `class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
  rust: `fn main() {\n    // Your code here\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n    fmt.Println("Hello")\n}`,
};

export const LANGUAGE_MAP: Record<string, string> = {
  python: "python",
  python3: "python",
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  cpp: "cpp",
  c: "c",
  java: "java",
  rust: "rust",
  go: "go",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  EASY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export interface ForumTagSummary {
  id?: string;
  slug: string;
  name: string;
  color: string;
  subredditId?: string;
  subreddit?: { id: string; name: string; slug: string };
  createdAt?: string;
  createdBy?: { name: string } | null;
  _count?: { posts: number };
}

/** @deprecated use ForumTagSummary from API */
export const FORUM_TAG = {
  GENERAL: "GENERAL",
  QUESTION: "QUESTION",
  EDITORIAL: "EDITORIAL",
  META: "META",
} as const;

export type ForumTagSlug = (typeof FORUM_TAG)[keyof typeof FORUM_TAG];

/** @deprecated tags are loaded from /api/forum/tags */
export const FORUM_TAGS: readonly ForumTagSlug[] = [
  FORUM_TAG.GENERAL,
  FORUM_TAG.QUESTION,
  FORUM_TAG.EDITORIAL,
  FORUM_TAG.META,
];

/** @deprecated use tag.color from API */
export const FORUM_TAG_COLORS: Record<string, string> = {
  GENERAL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  QUESTION: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  EDITORIAL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  META: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
};

export interface SubredditSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  color: string;
  createdAt: string;
  createdById?: string;
  _count: { posts: number };
  createdBy: { name: string; avatarUrl?: string | null };
}

export interface BuilderProfileData {
  bio?: string | null;
  skills: string[];
  interests: string[];
  timezone?: string | null;
  school?: string | null;
  openTo: string[];
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  supabaseId: string;
  builderProfile?: BuilderProfileData | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  solvedCount?: number;
}

export interface ForumPostAttachment {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ForumPostSummary {
  id: string;
  title: string;
  content: string;
  tag: ForumTagSummary | null;
  createdAt: string;
  author: { id: string; name: string; avatarUrl?: string | null };
  subreddit?: { id: string; name: string; slug: string; color: string; iconUrl?: string | null } | null;
  attachments?: ForumPostAttachment[];
  _count: { comments: number; votes: number };
  voteScore: number;
  userVote?: number | null;
}

export interface ForumPostDetail extends ForumPostSummary {
  comments: ForumCommentData[];
}

export interface ForumCommentData {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl?: string | null };
  parentId: string | null;
  voteScore: number;
  userVote?: number | null;
  replies?: ForumCommentData[];
}

// --- MVP Pivot Types ---

export const PROJECT_STATUS = {
  IDEA: "Idea",
  BUILDING: "Building",
  SHIPPED: "Shipped",
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  PROJECT_STATUS.IDEA,
  PROJECT_STATUS.BUILDING,
  PROJECT_STATUS.SHIPPED,
];

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  Idea: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Building: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Shipped: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export const PROJECT_TAGS = [
  "AI", "Robotics", "Web", "Hackathon", "EdTech", "ML",
  "Mobile", "DevTools", "Games", "Fintech", "Health", "Open Source",
] as const;

export type ProjectTag = (typeof PROJECT_TAGS)[number];

export const LOOKING_FOR_ROLES = [
  "Frontend", "Backend", "ML", "Design", "Research", "Pitching", "Testing",
] as const;

export type LookingForRole = (typeof LOOKING_FOR_ROLES)[number];

export const BUILDER_SKILLS = [
  "React", "Next.js", "TypeScript", "Python", "Rust", "Go", "Java",
  "C++", "Swift", "Kotlin", "Flutter", "Node.js", "Django", "Rails",
  "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS",
  "GCP", "Figma", "TailwindCSS", "GraphQL", "REST", "ML/AI",
] as const;

export const BUILDER_INTERESTS = [
  "AI", "Robotics", "Web", "Mobile", "DevTools", "Games",
  "Fintech", "Health", "EdTech", "Open Source", "Research", "Hardware",
] as const;

export const OPEN_TO_OPTIONS = [
  "Hackathons", "Startups", "Research", "Open Source",
] as const;

export type OpenToOption = (typeof OPEN_TO_OPTIONS)[number];

export interface ProjectSummary {
  id: string;
  title: string;
  tagline: string;
  description?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  tags: string[];
  status: string;
  lookingFor: string[];
  author: { id: string; name: string; avatarUrl?: string | null };
  createdAt: string;
  voteScore?: number;
  userVote?: number | null;
  _count?: { comments: number; votes: number };
}

export interface ProjectAttachment {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ProjectDetail extends ProjectSummary {
  attachments: ProjectAttachment[];
  comments: ForumCommentData[];
  buildLogs: BuildLogEntry[];
}

export interface BuilderProfileSummary {
  id: string;
  bio?: string | null;
  skills: string[];
  interests: string[];
  timezone?: string | null;
  school?: string | null;
  openTo: string[];
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  user: { id: string; name: string; avatarUrl?: string | null };
}

export interface BuildLogEntry {
  id: string;
  content: string;
  author: { id: string; name: string; avatarUrl?: string | null };
  project?: { id: string; title: string } | null;
  createdAt: string;
}

export const SITE_STATS = {
  builders: "30+",
  sessions: "weekly build sessions",
  teams: "hackathon teams",
  shipped: "projects shipped",
} as const;
