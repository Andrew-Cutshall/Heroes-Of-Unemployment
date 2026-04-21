import { auth } from "H_o_R/server/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "../_components/login-form";

export const metadata = {
	title: "Sign In - Heroes of Unemployment",
	description: "Sign in to your Heroes of Unemployment account",
};

export default async function LoginPage() {
	const session = await auth();

	if (session?.user) {
		redirect("/");
	}

	return (
		<div className="flex min-h-screen items-center justify-center py-12 px-4">
			<LoginForm />
		</div>
	);
}
