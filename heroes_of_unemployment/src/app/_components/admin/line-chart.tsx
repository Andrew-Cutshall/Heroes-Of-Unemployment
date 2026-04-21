interface LineChartProps<T extends Record<string, string | number>> {
	title: string;
	data: T[];
	xKey: keyof T;
	yKey: keyof T;
	color?: string;
	height?: number;
}

export function LineChart<T extends Record<string, string | number>>({
	title,
	data,
	xKey,
	yKey,
	color = "#60a5fa",
	height = 220,
}: LineChartProps<T>) {
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
	const stepX = data.length > 1 ? 100 / (data.length - 1) : 100;

	const points = data
		.map((d, i) => {
			const v = Number(d[yKey]);
			const y = height - 20 - (v / max) * (height - 30);
			return `${i * stepX},${y}`;
		})
		.join(" ");

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
				<polyline
					fill="none"
					stroke={color}
					strokeWidth={1}
					points={points}
					vectorEffect="non-scaling-stroke"
				/>
				{data.map((d, i) => {
					const v = Number(d[yKey]);
					const y = height - 20 - (v / max) * (height - 30);
					return (
						<circle
							key={String(d[xKey]) + i}
							cx={i * stepX}
							cy={y}
							r={0.8}
							fill={color}
						>
							<title>{`${String(d[xKey])}: ${v}`}</title>
						</circle>
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
