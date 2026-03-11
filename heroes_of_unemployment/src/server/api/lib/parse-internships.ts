export interface Internship {
	id: string;
	company: string;
	role: string;
	location: string;
	applicationUrl: string;
	datePosted: string;
	source: string;
	badges: string[];
}

function extractText(html: string): string {
	return html.replace(/<[^>]+>/g, "").trim();
}

function extractHref(html: string): string {
	const match = html.match(/href="([^"]+)"/);
	return match?.[1] ?? "";
}

function generateId(source: string, company: string, role: string): string {
	return Buffer.from(`${source}:${company}:${role}`).toString("base64");
}

function extractBadges(cell: string): string[] {
	const badges: string[] = [];
	const imgMatches = cell.matchAll(/<img[^>]*alt="([^"]*)"[^>]*>/g);
	for (const m of imgMatches) {
		if (m[1]) badges.push(m[1]);
	}
	return badges;
}

export function parseInternships(
	markdown: string,
	source: string,
): Internship[] {
	const lines = markdown.split("\n");
	const internships: Internship[] = [];
	let inTable = false;
	let lastCompany = "";

	for (const line of lines) {
		const trimmed = line.trim();

		if (trimmed.match(/^\|[\s-:|]+\|$/)) {
			inTable = true;
			continue;
		}

		if (
			inTable &&
			trimmed.startsWith("|") &&
			(trimmed.toLowerCase().includes("company") ||
				trimmed.toLowerCase().includes("name"))
		) {
			continue;
		}

		if (!inTable || !trimmed.startsWith("|")) {
			if (inTable && !trimmed.startsWith("|") && trimmed !== "") {
				inTable = false;
			}
			continue;
		}

		const cells = trimmed
			.split("|")
			.slice(1, -1)
			.map((c) => c.trim());

		if (cells.length < 4) continue;

		let company: string;
		let role: string;
		let location: string;
		let datePosted: string;
		let applicationUrl: string;
		const badges: string[] = [];

		const companyCell = cells[0] ?? "";
		const roleCell = cells[1] ?? "";
		const locationCell = cells[2] ?? "";
		const linkCell = cells[3] ?? "";
		const dateCell = cells[4] ?? "";

		badges.push(...extractBadges(companyCell));

		if (companyCell.includes("↳") || companyCell.trim() === "") {
			company = lastCompany;
		} else {
			company = extractText(companyCell);
			lastCompany = company;
		}

		if (!company) continue;

		role = extractText(roleCell);
		location = extractText(locationCell);
		datePosted = extractText(dateCell);

		applicationUrl = extractHref(linkCell);
		if (!applicationUrl) {
			applicationUrl = extractHref(trimmed);
		}

		if (
			linkCell.toLowerCase().includes("closed") &&
			!applicationUrl
		) {
			applicationUrl = "";
		}

		const id = generateId(source, company, role);

		internships.push({
			id,
			company,
			role,
			location,
			applicationUrl,
			datePosted,
			source,
			badges,
		});
	}

	return internships;
}
