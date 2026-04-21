export function escapeCsvField(value: unknown): string {
	if (value === null || value === undefined) return "";
	const str = String(value);
	if (/[",\n\r]/.test(str)) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export function toCsv<T extends Record<string, unknown>>(
	rows: T[],
	columns: { header: string; key: keyof T | ((row: T) => unknown) }[],
): string {
	const lines: string[] = [];
	lines.push(columns.map((c) => escapeCsvField(c.header)).join(","));
	for (const row of rows) {
		lines.push(
			columns
				.map((c) =>
					escapeCsvField(
						typeof c.key === "function" ? c.key(row) : row[c.key],
					),
				)
				.join(","),
		);
	}
	return lines.join("\n");
}
