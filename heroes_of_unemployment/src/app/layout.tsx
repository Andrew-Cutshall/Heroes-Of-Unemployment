import "H_o_R/styles/globals.css";

import { TRPCReactProvider } from "H_o_R/trpc/react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { auth } from "H_o_R/server/auth";
import { NavBar } from "./_components/nav-bar";

export const metadata: Metadata = {
	title: "Heroes of Unemployment",
	description: "Browse CS internship listings and track your applications",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await auth();

	return (
		<html className={`${geist.variable}`} lang="en">
			<body className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
				<TRPCReactProvider>
					<NavBar session={session} />
					{children}
				</TRPCReactProvider>
			</body>
		</html>
	);
}
