import { auth } from "H_o_R/server/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "../_components/register-form";

export const metadata = {
	title: "Register - Heroes of Unemployment",
	description: "Create a new Heroes of Unemployment account",
};

export default async function RegisterPage() {
	const session = await auth();

	if (session?.user) {
		redirect("/");
	}

	return (
		<div className="flex min-h-screen items-center justify-center py-12 px-4">
			<RegisterForm />
		</div>
	);
}
