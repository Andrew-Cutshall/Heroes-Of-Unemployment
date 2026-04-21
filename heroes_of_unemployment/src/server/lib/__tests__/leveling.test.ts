import { describe, it, expect } from "vitest";
import {
	xpForLevel,
	levelForXp,
	xpProgressInLevel,
	xpToNextLevel,
	tierForLevel,
	streakBonus,
} from "../leveling";

describe("xpForLevel", () => {
	it("returns 0 at level 1", () => {
		expect(xpForLevel(1)).toBe(0);
	});

	it("returns 100 at level 2", () => {
		expect(xpForLevel(2)).toBe(100);
	});

	it("grows quadratically", () => {
		expect(xpForLevel(3)).toBe(300);
		expect(xpForLevel(10)).toBe(4500);
		expect(xpForLevel(20)).toBe(19000);
	});
});

describe("levelForXp", () => {
	it("returns 1 for 0 xp", () => {
		expect(levelForXp(0)).toBe(1);
	});

	it("round-trips for sample levels", () => {
		for (const n of [2, 5, 10, 20, 30]) {
			expect(levelForXp(xpForLevel(n))).toBe(n);
		}
	});

	it("stays at current level just below threshold", () => {
		expect(levelForXp(xpForLevel(5) - 1)).toBe(4);
	});
});

describe("xpProgressInLevel", () => {
	it("reports 0% at level start", () => {
		const p = xpProgressInLevel(xpForLevel(3));
		expect(p.current).toBe(0);
		expect(p.pct).toBe(0);
	});

	it("reports near 100% just before next level", () => {
		const p = xpProgressInLevel(xpForLevel(3) + (xpForLevel(4) - xpForLevel(3)) - 1);
		expect(p.pct).toBeGreaterThan(99);
	});

	it("current plus xpToNextLevel equals needed", () => {
		const xp = 250;
		const p = xpProgressInLevel(xp);
		expect(p.current + xpToNextLevel(xp)).toBe(p.needed);
	});
});

describe("tierForLevel", () => {
	it("assigns tiers by boundaries", () => {
		expect(tierForLevel(1).tier).toBe("Rookie");
		expect(tierForLevel(4).tier).toBe("Rookie");
		expect(tierForLevel(5).tier).toBe("Squire");
		expect(tierForLevel(9).tier).toBe("Squire");
		expect(tierForLevel(10).tier).toBe("Knight");
		expect(tierForLevel(19).tier).toBe("Knight");
		expect(tierForLevel(20).tier).toBe("Hero");
		expect(tierForLevel(29).tier).toBe("Hero");
		expect(tierForLevel(30).tier).toBe("Legend");
		expect(tierForLevel(100).tier).toBe("Legend");
	});
});

describe("streakBonus", () => {
	it("saturates at 7-day cap", () => {
		expect(streakBonus(7)).toBe(35);
		expect(streakBonus(50)).toBe(35);
	});

	it("scales linearly below cap", () => {
		expect(streakBonus(0)).toBe(0);
		expect(streakBonus(3)).toBe(15);
	});

	it("treats negative input as zero", () => {
		expect(streakBonus(-5)).toBe(0);
	});
});
