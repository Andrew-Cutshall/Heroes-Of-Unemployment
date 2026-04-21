import Link from "next/link";

interface EmptyStateProps {
	emoji: string;
	title: string;
	flavor: string;
	cta?: { href: string; label: string };
}

export function EmptyState({ emoji, title, flavor, cta }: EmptyStateProps) {
	return (
		<div className="rpg-panel rpg-panel-ornate p-10 text-center">
			<div className="text-6xl rpg-float">{emoji}</div>
			<h3 className="rpg-heading mt-4 text-xl">{title}</h3>
			<p className="rpg-display mt-2 text-sm text-[#d9c9a6]">{flavor}</p>
			{cta && (
				<Link
					href={cta.href}
					className="rpg-button rpg-button-primary mt-5 inline-block rounded-sm px-6 py-2 text-sm"
				>
					{cta.label}
				</Link>
			)}
		</div>
	);
}
