import { auth } from "H_o_R/server/auth";
import { InternshipFeed } from "H_o_R/app/_components/internship-feed";

export default async function Home() {
	const session = await auth();
	return (
		<div className="space-y-8">
			<section className="rpg-panel rpg-panel-ornate overflow-hidden px-8 py-10 text-center">
				<div className="pointer-events-none absolute inset-0 opacity-30">
					<div className="absolute left-10 top-6 text-4xl rpg-float">⚔️</div>
					<div
						className="absolute right-12 top-10 text-4xl rpg-float"
						style={{ animationDelay: "1.5s" }}
					>
						🛡️
					</div>
					<div
						className="absolute bottom-6 left-1/4 text-3xl rpg-float"
						style={{ animationDelay: "0.8s" }}
					>
						📜
					</div>
					<div
						className="absolute bottom-8 right-1/4 text-3xl rpg-float"
						style={{ animationDelay: "2s" }}
					>
						✨
					</div>
				</div>
				<h1 className="rpg-heading relative text-4xl sm:text-5xl">
					⚜ Heroes of Unemployment ⚜
				</h1>
				<p className="rpg-display mx-auto mt-3 max-w-2xl text-base text-[#d9c9a6]">
					The grimoire of internships, binding offerings from the great tech
					realms. Claim each quest, earn experience, and ascend through the
					ranks.
				</p>
				<div className="rpg-divider my-6 mx-auto max-w-md" />
				<p className="rpg-pixel text-[10px] text-[#f4c430]">
					{session?.user
						? `✦ WELCOME BACK, BRAVE ADVENTURER ✦`
						: `✦ AN UNSWORN WANDERER APPROACHES ✦`}
				</p>
			</section>
			<InternshipFeed isLoggedIn={!!session?.user} />
		</div>
	);
}
