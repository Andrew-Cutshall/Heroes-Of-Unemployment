export interface ParsedInternship {
	company: string;
	role: string;
	location: string;
	applicationUrl: string;
	datePosted: string;
	source: string;
	isClosed: boolean;
}

export function parseDaysAgo(datePosted: string): number {
	const trimmed = datePosted.trim().toLowerCase();
	const match = trimmed.match(/^(\d+)\s*(d|mo|w)/);
	if (!match) return 9999;
	const num = parseInt(match[1]!, 10);
	const unit = match[2];
	if (unit === "d") return num;
	if (unit === "w") return num * 7;
	if (unit === "mo") return num * 30;
	return 9999;
}

export const XP_PER_APPLICATION = 10;

export function calculateLevel(xp: number): number {
	return Math.floor(xp / 100) + 1;
}

export function extractText(html: string): string {
	return html
		.replace(/<br\s*\/?>/gi, ", ")
		.replace(/<[^>]+>/g, "")
		.trim();
}

export function extractHref(html: string): string {
	const match = html.match(/href="([^"]+)"/);
	return match?.[1] ?? "";
}

function parseMarkdownTable(
	markdown: string,
	source: string,
): ParsedInternship[] {
	const lines = markdown.split("\n");
	const internships: ParsedInternship[] = [];
	let inTable = false;
	let lastCompany = "";

	for (const line of lines) {
		const trimmed = line.trim();

		if (trimmed.match(/^\|[\s\-:|]+\|$/)) {
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

		const companyCell = cells[0] ?? "";
		const roleCell = cells[1] ?? "";
		const locationCell = cells[2] ?? "";
		const linkCell = cells[3] ?? "";
		const dateCell = cells[4] ?? "";

		let company: string;
		if (companyCell.includes("\u21b3") || companyCell.trim() === "") {
			company = lastCompany;
		} else {
			company = extractText(companyCell);
			lastCompany = company;
		}

		if (!company) continue;

		const role = extractText(roleCell);
		const location = extractText(locationCell);
		const datePosted = extractText(dateCell);

		let applicationUrl = extractHref(linkCell);
		if (!applicationUrl) {
			applicationUrl = extractHref(trimmed);
		}

		const isClosed =
			linkCell.toLowerCase().includes("closed") && !applicationUrl;

		internships.push({
			company,
			role,
			location,
			applicationUrl,
			datePosted,
			source,
			isClosed,
		});
	}

	return internships;
}

function parseHtmlTable(
	html: string,
	source: string,
): ParsedInternship[] {
	const internships: ParsedInternship[] = [];
	let lastCompany = "";

	const rowRegex = /<tr>([\s\S]*?)<\/tr>/g;
	let rowMatch: RegExpExecArray | null;

	while ((rowMatch = rowRegex.exec(html)) !== null) {
		const rowContent = rowMatch[1] ?? "";
		const cellRegex = /<td>([\s\S]*?)<\/td>/g;
		const cells: string[] = [];
		let cellMatch: RegExpExecArray | null;

		while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
			cells.push(cellMatch[1]?.trim() ?? "");
		}

		if (cells.length < 4) continue;

		const companyCell = cells[0] ?? "";
		const roleCell = cells[1] ?? "";
		const locationCell = cells[2] ?? "";
		const linkCell = cells[3] ?? "";
		const dateCell = cells[4] ?? "";

		let company: string;
		if (companyCell.includes("\u21b3") || extractText(companyCell) === "\u21b3") {
			company = lastCompany;
		} else {
			company = extractText(companyCell);
			lastCompany = company;
		}

		if (!company) continue;

		const role = extractText(roleCell);
		const location = extractText(locationCell);
		const datePosted = extractText(dateCell);

		let applicationUrl = extractHref(linkCell);
		if (!applicationUrl) {
			applicationUrl = extractHref(rowContent);
		}

		const isClosed =
			linkCell.toLowerCase().includes("\ud83d\udd12") && !applicationUrl;

		internships.push({
			company,
			role,
			location,
			applicationUrl,
			datePosted,
			source,
			isClosed,
		});
	}

	return internships;
}

export function parseInternships(
	content: string,
	source: string,
): ParsedInternship[] {
	if (content.includes("<tr>") && content.includes("<td>")) {
		return parseHtmlTable(content, source);
	}
	return parseMarkdownTable(content, source);
}
