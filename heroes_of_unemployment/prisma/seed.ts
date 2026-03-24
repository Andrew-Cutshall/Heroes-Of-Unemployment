import { PrismaClient } from "../generated/prisma";
import { parseInternships, parseDaysAgo } from "../src/server/lib/parse-internships";

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

async function main() {
	const db = new PrismaClient();

	for (const source of SOURCES) {
		console.log(`Fetching ${source.name}...`);
		const res = await fetch(source.url);
		if (!res.ok) {
			console.error(`Failed to fetch ${source.name}: ${res.status}`);
			continue;
		}
		const markdown = await res.text();
		const internships = parseInternships(markdown, source.name);
		console.log(
			`Parsed ${internships.length} internships from ${source.name}`,
		);

		for (const intern of internships) {
			const daysAgo = parseDaysAgo(intern.datePosted);
			await db.internship.upsert({
				where: {
					company_role_source: {
						company: intern.company,
						role: intern.role,
						source: intern.source,
					},
				},
				create: { ...intern, daysAgo },
				update: {
					location: intern.location,
					applicationUrl: intern.applicationUrl,
					datePosted: intern.datePosted,
					daysAgo,
					isClosed: intern.isClosed,
				},
			});
		}
	}

	console.log("Seed complete.");
	await db.$disconnect();
}

main().catch(console.error);
