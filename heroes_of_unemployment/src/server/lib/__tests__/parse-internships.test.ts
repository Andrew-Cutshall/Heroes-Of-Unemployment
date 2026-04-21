import { describe, it, expect } from "vitest";
import {
	parseInternships,
	extractText,
	extractHref,
	parseDaysAgo,
} from "../parse-internships";

describe("extractText", () => {
	it("strips HTML tags", () => {
		expect(extractText('<a href="https://example.com">Google</a>')).toBe("Google");
	});

	it("returns plain text unchanged", () => {
		expect(extractText("Hello World")).toBe("Hello World");
	});

	it("trims whitespace", () => {
		expect(extractText("  spaced  ")).toBe("spaced");
	});
});

describe("extractHref", () => {
	it("extracts href from anchor tag", () => {
		expect(extractHref('<a href="https://apply.com/job">Apply</a>')).toBe(
			"https://apply.com/job",
		);
	});

	it("returns empty string when no href", () => {
		expect(extractHref("No link here")).toBe("");
	});
});

describe("parseInternships", () => {
	it("parses a simple markdown table", () => {
		const md = `
| Company | Role | Location | Link | Date |
| --- | --- | --- | --- | --- |
| Google | SWE Intern | Mountain View, CA | <a href="https://google.com/apply">Apply</a> | Jan 15 |
| Meta | Data Science Intern | Menlo Park, CA | <a href="https://meta.com/apply">Apply</a> | Jan 20 |
`;
		const result = parseInternships(md, "TestSource");
		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({
			company: "Google",
			role: "SWE Intern",
			location: "Mountain View, CA",
			applicationUrl: "https://google.com/apply",
			datePosted: "Jan 15",
			source: "TestSource",
			isClosed: false,
		});
		expect(result[1]?.company).toBe("Meta");
	});

	it("handles carry-forward with ↳", () => {
		const md = `
| Company | Role | Location | Link | Date |
| --- | --- | --- | --- | --- |
| Google | SWE Intern | Mountain View, CA | <a href="https://google.com/swe">Apply</a> | Jan 15 |
| ↳ | PM Intern | Mountain View, CA | <a href="https://google.com/pm">Apply</a> | Jan 15 |
`;
		const result = parseInternships(md, "Test");
		expect(result).toHaveLength(2);
		expect(result[0]?.company).toBe("Google");
		expect(result[1]?.company).toBe("Google");
		expect(result[1]?.role).toBe("PM Intern");
	});

	it("detects closed listings", () => {
		const md = `
| Company | Role | Location | Link | Date |
| --- | --- | --- | --- | --- |
| Stripe | SWE Intern | SF, CA | Closed | Feb 1 |
`;
		const result = parseInternships(md, "Test");
		expect(result).toHaveLength(1);
		expect(result[0]?.isClosed).toBe(true);
		expect(result[0]?.applicationUrl).toBe("");
	});

	it("skips rows with fewer than 4 cells", () => {
		const md = `
| Company | Role | Location | Link | Date |
| --- | --- | --- | --- | --- |
| Google | SWE | SF |
`;
		const result = parseInternships(md, "Test");
		expect(result).toHaveLength(0);
	});

	it("returns empty array for empty markdown", () => {
		expect(parseInternships("", "Test")).toEqual([]);
	});

	it("returns empty array for markdown with no table", () => {
		expect(parseInternships("# Just a heading\nSome text", "Test")).toEqual([]);
	});

	it("parses HTML table format (SimplifyJobs)", () => {
		const html = `
<tr>
<td><strong><a href="https://example.com">Google</a></strong></td>
<td>SWE Intern</td>
<td>Mountain View, CA</td>
<td><a href="https://google.com/apply">Apply</a></td>
<td>1d</td>
</tr>
<tr>
<td>↳</td>
<td>PM Intern</td>
<td>NYC, NY</td>
<td><a href="https://google.com/pm">Apply</a></td>
<td>1d</td>
</tr>
`;
		const result = parseInternships(html, "SimplifyJobs");
		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({
			company: "Google",
			role: "SWE Intern",
			location: "Mountain View, CA",
			applicationUrl: "https://google.com/apply",
			source: "SimplifyJobs",
		});
		expect(result[1]?.company).toBe("Google");
		expect(result[1]?.role).toBe("PM Intern");
	});
});

describe("parseDaysAgo", () => {
	it("parses days", () => {
		expect(parseDaysAgo("0d")).toBe(0);
		expect(parseDaysAgo("5d")).toBe(5);
		expect(parseDaysAgo("14d")).toBe(14);
	});

	it("parses weeks", () => {
		expect(parseDaysAgo("1w")).toBe(7);
		expect(parseDaysAgo("2w")).toBe(14);
	});

	it("parses months", () => {
		expect(parseDaysAgo("1mo")).toBe(30);
		expect(parseDaysAgo("3mo")).toBe(90);
	});

	it("returns 9999 for unknown formats", () => {
		expect(parseDaysAgo("")).toBe(9999);
		expect(parseDaysAgo("yesterday")).toBe(9999);
	});
});

