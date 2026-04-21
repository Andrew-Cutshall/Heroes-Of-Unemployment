import { PrismaClient } from "../generated/prisma";
import { BADGE_DEFINITIONS } from "../src/server/lib/badges";

async function main() {
	const db = new PrismaClient();
	for (const def of BADGE_DEFINITIONS) {
		await db.badge.upsert({
			where: { code: def.code },
			create: def,
			update: {
				name: def.name,
				description: def.description,
				emoji: def.emoji,
				xpReward: def.xpReward,
				tier: def.tier,
			},
		});
	}
	console.log(`Seeded ${BADGE_DEFINITIONS.length} badges.`);
	await db.$disconnect();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
