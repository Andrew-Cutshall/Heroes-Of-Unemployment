import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";

async function main() {
	const email = process.env.ADMIN_EMAIL ?? process.argv[2];
	const password = process.env.ADMIN_PASSWORD ?? process.argv[3];
	const name = process.env.ADMIN_NAME ?? process.argv[4] ?? "Admin";

	if (!email || !password) {
		console.error(
			"Usage: npm run seed:admin -- <email> <password> [name]\n" +
				"Or set ADMIN_EMAIL and ADMIN_PASSWORD env vars.",
		);
		process.exit(1);
	}

	const db = new PrismaClient();
	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await db.user.upsert({
		where: { email },
		update: { password: hashedPassword, isAdmin: true, name },
		create: { email, password: hashedPassword, isAdmin: true, name },
	});

	console.log(`Admin user ready: ${user.email} (id=${user.id})`);
	await db.$disconnect();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
