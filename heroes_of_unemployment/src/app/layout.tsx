import "H_o_R/styles/globals.css";

import { TRPCReactProvider } from "H_o_R/trpc/react";
import type { Metadata } from "next";
import { Geist, MedievalSharp, Press_Start_2P } from "next/font/google";
import { auth } from "H_o_R/server/auth";
import { NavBar } from "./_components/nav-bar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
	title: "Heroes of Unemployment",
	description: "A gamified internship quest for weary adventurers",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

const medieval = MedievalSharp({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-medieval",
});

const pixel = Press_Start_2P({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-pixel-game",
});

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await auth();

	return (
		<html
			className={`${geist.variable} ${medieval.variable} ${pixel.variable}`}
			lang="en"
			suppressHydrationWarning
		>
			<body suppressHydrationWarning>
				<TRPCReactProvider>
					<NavBar session={session} />
					<main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
					<Toaster richColors position="top-right" theme="dark" />
				</TRPCReactProvider>
			</body>
		</html>
	);
}
