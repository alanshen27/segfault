import "dotenv/config"

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);

const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { supabaseId: "seed-admin" },
    update: {},
    create: {
      supabaseId: "seed-admin",
      email: "admin@segfault.dev",
      name: "Admin",
      role: "ADMIN",
    },
  });

  const bank = await prisma.questionBank.create({
    data: {
      name: "Classic Problems",
      description: "Classic competitive programming problems across topics",
      createdById: admin.id,
    },
  });

  const questions = [
    {
      title: "Two Sum",
      difficulty: "EASY",
      topic: "Arrays",
      constraints:
        "$$2 \\leq n \\leq 10^4$$\n$$-10^9 \\leq nums[i] \\leq 10^9$$\n$$-10^9 \\leq target \\leq 10^9$$",
      sampleInput: "nums = [2,7,11,15], target = 9",
      sampleOutput: "[0,1]",
      content: `## Problem Statement

Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

### Example 1

\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

### Example 2

\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

### Example 3

\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

## Constraints

- $$2 \\leq n \\leq 10^4$$
- $$-10^9 \\leq nums[i] \\leq 10^9$$
- $$-10^9 \\leq target \\leq 10^9$$

## Follow-up

Can you come up with an algorithm that is less than \`O(n^2)\` time complexity?
`,
    },
    {
      title: "Maximum Subarray",
      difficulty: "EASY",
      topic: "Dynamic Programming",
      constraints:
        "$$1 \\leq n \\leq 10^5$$\n$$-10^4 \\leq nums[i] \\leq 10^4$$",
      sampleInput: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
      sampleOutput: "6",
      content: `## Problem Statement

Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

### Example 1

\`\`\`
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
\`\`\`

### Example 2

\`\`\`
Input: nums = [1]
Output: 1
\`\`\`

### Example 3

\`\`\`
Input: nums = [5,4,-1,7,8]
Output: 23
\`\`\`

## Constraints

- $$1 \\leq n \\leq 10^5$$
- $$-10^4 \\leq nums[i] \\leq 10^4$$

## Algorithm: Kadane's Algorithm

The optimal solution uses **Kadane's Algorithm** which runs in $O(n)$ time.

Let \`dp[i]\` be the maximum subarray sum ending at index \`i\`. Then:

$$dp[i] = \\max(nums[i], dp[i-1] + nums[i])$$

The answer is $\\max_{0 \\leq i < n} dp[i]$.
`,
    },
    {
      title: "Longest Increasing Subsequence",
      difficulty: "MEDIUM",
      topic: "Dynamic Programming",
      constraints:
        "$$1 \\leq n \\leq 2500$$\n$$-10^4 \\leq nums[i] \\leq 10^4$$",
      sampleInput: "nums = [10,9,2,5,3,7,101,18]",
      sampleOutput: "4",
      content: `## Problem Statement

Given an integer array \`nums\`, return the length of the longest **strictly increasing subsequence**.

### Example 1

\`\`\`
Input: nums = [10,9,2,5,3,7,101,18]
Output: 4
Explanation: The longest increasing subsequence is [2,3,7,101].
\`\`\`

### Example 2

\`\`\`
Input: nums = [0,1,0,3,2,3]
Output: 4
\`\`\`

### Example 3

\`\`\`
Input: nums = [7,7,7,7,7,7,7]
Output: 1
\`\`\`

## Constraints

- $$1 \\leq n \\leq 2500$$
- $$-10^4 \\leq nums[i] \\leq 10^4$$

## Solutions

### Approach 1: DP $O(n^2)$

Define \`dp[i]\` = length of LIS ending at index \`i\`.

$$dp[i] = \\max_{0 \\leq j < i, nums[j] < nums[i]} (dp[j] + 1)$$

### Approach 2: Patience Sorting $O(n \\log n)$

Maintain a \`tails\` array where \`tails[k]\` = smallest tail of all increasing subsequences of length \`k+1\`.
`,
    },
    {
      title: "Binary Tree Level Order Traversal",
      difficulty: "MEDIUM",
      topic: "Trees",
      constraints:
        "The number of nodes in the tree is in the range \`[0, 2000]\`.\n$$-1000 \\leq Node.val \\leq 1000$$",
      sampleInput: "root = [3,9,20,null,null,15,7]",
      sampleOutput: "[[3],[9,20],[15,7]]",
      content: `## Problem Statement

Given the \`root\` of a binary tree, return the **level order traversal** of its nodes' values (i.e., from left to right, level by level).

### Example 1

\`\`\`
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]
\`\`\`

### Example 2

\`\`\`
Input: root = [1]
Output: [[1]]
\`\`\`

## Approach: BFS with Queue

Use a queue to perform breadth-first search:

1. Enqueue the root node
2. While queue is not empty:
   - Record the current level size \`s\`
   - Dequeue \`s\` nodes and collect their values
   - Enqueue all children (left then right)

Time Complexity: $O(n)$ where $n$ is the number of nodes.
Space Complexity: $O(n)$ for the queue.
`,
    },
    {
      title: "Merge K Sorted Lists",
      difficulty: "HARD",
      topic: "Heaps",
      constraints:
        "$$k = lists.length$$\n$$0 \\leq k \\leq 10^4$$\n$$0 \\leq lists[i].length \\leq 500$$",
      sampleInput: "lists = [[1,4,5],[1,3,4],[2,6]]",
      sampleOutput: "[1,1,2,3,4,4,5,6]",
      content: `## Problem Statement

You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

### Example 1

\`\`\`
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6
\`\`\`

## Approach: Min-Heap (Priority Queue)

Use a min-heap of size \`k\` to always extract the smallest head:

1. Push the head of each non-empty list into the min-heap
2. While heap is not empty:
   - Pop the smallest node
   - Append it to result
   - Push the next node from the same list

Time Complexity: $O(N \\log k)$ where $N$ is total nodes.
Space Complexity: $O(k)$ for the heap.
`,
    },
    {
      title: "Graph Valid Tree",
      difficulty: "MEDIUM",
      topic: "Graphs",
      constraints:
        "$$1 \\leq n \\leq 2000$$\n$$0 \\leq edges.length \\leq 5000$$\n\`edges[i].length == 2\`",
      sampleInput: "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]",
      sampleOutput: "true",
      content: `## Problem Statement

Given \`n\` nodes labeled from \`0\` to \`n - 1\` and a list of undirected edges (each edge is a pair of nodes), write a function to check whether these edges make up a valid tree.

### Example 1

\`\`\`
Input: n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]
Output: true
\`\`\`

### Example 2

\`\`\`
Input: n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]
Output: false
\`\`\`

## Conditions for a Valid Tree

A graph is a valid tree if and only if:
1. It is **fully connected** (all nodes reachable)
2. It has **no cycles**

Equivalently: a connected graph with exactly $n - 1$ edges.

## Approach: Union-Find (DSU)

1. If \`edges.length != n - 1\`, return \`false\`
2. Initialize DSU with \`n\` nodes
3. For each edge \`(u, v)\`:
   - If \`find(u) == find(v)\`, cycle detected → \`false\`
   - Otherwise \`union(u, v)\`
4. Return \`true\`
`,
    },
    {
      title: "Median of Two Sorted Arrays",
      difficulty: "HARD",
      topic: "Binary Search",
      constraints:
        "$$nums1.length == m$$\n$$nums2.length == n$$\n$$0 \\leq m \\leq 1000$$\n$$0 \\leq n \\leq 1000$$\n$$1 \\leq m + n \\leq 2000$$",
      sampleInput: "nums1 = [1,3], nums2 = [2]",
      sampleOutput: "2.00000",
      content: `## Problem Statement

Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return **the median** of the two sorted arrays.

The overall run time complexity should be $O(\\log (m+n))$.

### Example 1

\`\`\`
Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.
\`\`\`

### Example 2

\`\`\`
Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.50000
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.
\`\`\`

## Approach: Binary Search on the Smaller Array

The key insight: instead of merging, we can **binary search** the partition point.

Let \`A\` be the smaller array. Binary search for partition index \`i\` in \`A\`:

$$j = \\frac{m + n + 1}{2} - i$$

Check conditions:
- $$A[i-1] \\leq B[j]$$
- $$B[j-1] \\leq A[i]$$

Time Complexity: $O(\\log \\min(m, n))$
`,
    },
    {
      title: "Trapping Rain Water",
      difficulty: "HARD",
      topic: "Two Pointers",
      constraints:
        "$$n = height.length$$\n$$1 \\leq n \\leq 2 \\times 10^4$$\n$$0 \\leq height[i] \\leq 10^5$$",
      sampleInput: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
      sampleOutput: "6",
      content: `## Problem Statement

Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

### Example 1

\`\`\`
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The elevation map (black section) can trap 6 units of water (blue section).
\`\`\`

## Approach: Two Pointers

Let \`left\` and \`right\` be pointers at the ends. Maintain \`leftMax\` and \`rightMax\`:

- If \`height[left] < height[right]\`:
  - If \`height[left] >= leftMax\`: update \`leftMax\`
  - Else: add \`leftMax - height[left]\` to water
  - Move \`left\` right
- Else:
  - Symmetric for \`right\`

The formula for water at index \`i\`:

$$water[i] = \\min(leftMax[i], rightMax[i]) - height[i]$$

Time Complexity: $O(n)$
Space Complexity: $O(1)$
`,
    },
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: {
        ...q,
        authorId: admin.id,
        bankId: bank.id,
        approved: true,
      },
    });
  }

  console.log(`Seeded ${questions.length} questions into "${bank.name}" bank.`);

  // --- MVP Pivot seed data ---

  const builders = [
    {
      supabaseId: "seed-builder-1",
      email: "maya@segfault.dev",
      name: "Maya Chen",
    },
    {
      supabaseId: "seed-builder-2",
      email: "liam@segfault.dev",
      name: "Liam Rodriguez",
    },
    {
      supabaseId: "seed-builder-3",
      email: "aisha@segfault.dev",
      name: "Aisha Patel",
    },
  ];

  const users = [];
  for (const b of builders) {
    const u = await prisma.user.upsert({
      where: { supabaseId: b.supabaseId },
      update: {},
      create: b,
    });
    users.push(u);
  }

  // Builder profiles
  await prisma.builderProfile.upsert({
    where: { userId: users[0].id },
    update: {},
    create: {
      userId: users[0].id,
      bio: "CS sophomore obsessed with developer tools and making things that just work.",
      skills: ["React", "Next.js", "TypeScript", "TailwindCSS", "Figma"],
      interests: ["DevTools", "Web", "Open Source"],
      timezone: "PST",
      school: "Stanford",
      openTo: ["Hackathons", "Startups", "Open Source"],
      githubUrl: "https://github.com/mayachen",
      websiteUrl: "https://maya.dev",
    },
  });

  await prisma.builderProfile.upsert({
    where: { userId: users[1].id },
    update: {},
    create: {
      userId: users[1].id,
      bio: "ML researcher building AI tools for education. Previously interned at DeepMind.",
      skills: ["Python", "ML/AI", "PostgreSQL", "Docker", "AWS"],
      interests: ["AI", "EdTech", "Research"],
      timezone: "EST",
      school: "MIT",
      openTo: ["Research", "Startups"],
      githubUrl: "https://github.com/liamrod",
      linkedinUrl: "https://linkedin.com/in/liamrod",
    },
  });

  await prisma.builderProfile.upsert({
    where: { userId: users[2].id },
    update: {},
    create: {
      userId: users[2].id,
      bio: "Full-stack engineer who loves building weird side projects at 2am.",
      skills: ["TypeScript", "Rust", "Go", "React", "Node.js", "Redis"],
      interests: ["Games", "Hardware", "Open Source"],
      timezone: "GMT",
      school: "Imperial College",
      openTo: ["Hackathons", "Open Source"],
      githubUrl: "https://github.com/aishap",
    },
  });

  // Projects
  const project1 = await prisma.project.create({
    data: {
      title: "Nomad",
      tagline: "student social + academic planner",
      description:
        "A mobile-first app that combines social features with an academic planner. Students can share their schedules, find study groups, and coordinate campus activities.",
      githubUrl: "https://github.com/example/nomad",
      demoUrl: "https://nomad.app",
      tags: ["Mobile", "EdTech", "Web"],
      status: "Building",
      lookingFor: ["Frontend", "Design"],
      authorId: users[0].id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: "LabRat",
      tagline: "AI-powered research paper summarizer",
      description:
        "Upload a research paper and get structured summaries, key findings, and related work suggestions powered by fine-tuned language models.",
      githubUrl: "https://github.com/example/labrat",
      tags: ["AI", "ML", "EdTech"],
      status: "Shipped",
      lookingFor: ["ML", "Research"],
      authorId: users[1].id,
    },
  });

  await prisma.project.create({
    data: {
      title: "Pixelcraft",
      tagline: "collaborative pixel art editor in the browser",
      description:
        "Real-time collaborative pixel art with WebSocket sync and export to GIF/PNG. Built for game jams and creative coding sessions.",
      githubUrl: "https://github.com/example/pixelcraft",
      demoUrl: "https://pixelcraft.dev",
      tags: ["Games", "Web", "Open Source"],
      status: "Idea",
      lookingFor: ["Frontend", "Backend", "Design"],
      authorId: users[2].id,
    },
  });

  // Build logs
  await prisma.buildLog.createMany({
    data: [
      {
        content: "shipped auth today, using supabase + prisma. surprisingly painless",
        authorId: users[0].id,
        projectId: project1.id,
      },
      {
        content: "spent 4h fixing prisma connection pooling on vercel. serverless is pain",
        authorId: users[0].id,
        projectId: project1.id,
      },
      {
        content: "fine-tuned llama 3 on arxiv abstracts. results are surprisingly good",
        authorId: users[1].id,
        projectId: project2.id,
      },
      {
        content: "training transformer exploded at epoch 47. need to debug gradient scaling",
        authorId: users[1].id,
        projectId: project2.id,
      },
      {
        content: "prototyping websocket sync for the pixel editor. crdt vs ot decisions...",
        authorId: users[2].id,
      },
      {
        content: "built a tiny rust CLI to batch-convert sprites to gif. 10x faster than python version",
        authorId: users[2].id,
      },
    ],
  });

  console.log("Seeded MVP pivot data: 3 builders, 3 projects, 6 build logs.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
