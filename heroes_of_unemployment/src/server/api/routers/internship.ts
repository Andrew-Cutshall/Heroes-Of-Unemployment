import {
	createTRPCRouter,
	publicProcedure,
} from "H_o_R/server/api/trpc";
import {
	type Internship,
	parseInternships,
} from "H_o_R/server/api/lib/parse-internships";

const SOURCES = [
	{
		url: "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md",
		name: "SimplifyJobs",
	},
	{
		url: "https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/main/README.md",
		name: "vanshb03",
	},
];

let cache: { data: Internship[]; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function fetchAndParse(): Promise<Internship[]> {
	if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
		return cache.data;
	}

	const results = await Promise.allSettled(
		SOURCES.map(async (source) => {
			const res = await fetch(source.url);
			if (!res.ok) return [];
			const text = await res.text();
			return parseInternships(text, source.name);
		}),
	);

	const allInternships: Internship[] = [];
	const seen = new Set<string>();

	for (const result of results) {
		if (result.status === "fulfilled") {
			for (const internship of result.value) {
				const key = `${internship.company}:${internship.role}`.toLowerCase();
				if (!seen.has(key)) {
					seen.add(key);
					allInternships.push(internship);
				}
			}
		}
	}

	cache = { data: allInternships, timestamp: Date.now() };
	return allInternships;
}

export const internshipRouter = createTRPCRouter({
	getAll: publicProcedure.query(async () => {
		return fetchAndParse();
	}),
});
