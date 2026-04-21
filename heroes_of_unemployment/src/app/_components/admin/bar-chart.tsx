interface BarChartProps<T extends Record<string, string | number>> {
	title: string;
	data: T[];
	xKey: keyof T;
	yKey: keyof T;
	color?: string;
	height?: number;
}

export function BarChart<T extends Record<string, string | number>>({
	title,
	data,
	xKey,
	yKey,
	color = "#a855f7",
	height = 220,
}: BarChartProps<T>) {
	if (data.length === 0) {
		return (
			<div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
				<h3 className="mb-4 text-sm font-bold text-white">{title}</h3>
				<p className="text-sm text-gray-400">No data.</p>
			</div>
		);
	}

	const values = data.map((d) => Number(d[yKey]));
	const max = Math.max(1, ...values);
	const barW = 100 / data.length;

	return (
		<div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
			<h3 className="mb-4 text-sm font-bold text-white">{title}</h3>
			<svg
				viewBox={`0 0 100 ${height}`}
				preserveAspectRatio="none"
				className="h-[220px] w-full"
				role="img"
				aria-label={title}
			>
				{data.map((d, i) => {
					const v = Number(d[yKey]);
					const h = (v / max) * (height - 30);
					const y = height - 20 - h;
					return (
						<g key={String(d[xKey]) + i}>
							<rect
								x={i * barW + barW * 0.15}
								y={y}
								width={barW * 0.7}
								height={h}
								fill={color}
								opacity={0.85}
							/>
							<title>{`${String(d[xKey])}: ${v}`}</title>
						</g>
					);
				})}
			</svg>
			<div className="mt-2 flex justify-between text-[10px] text-gray-500">
				<span>{String(data[0]?.[xKey] ?? "")}</span>
				<span>{String(data[data.length - 1]?.[xKey] ?? "")}</span>
			</div>
			<p className="mt-1 text-xs text-gray-400">Max: {max.toLocaleString()}</p>
		</div>
	);
}
