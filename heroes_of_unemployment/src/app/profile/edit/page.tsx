import { auth } from "H_o_R/server/auth";
import { redirect } from "next/navigation";
import { api } from "H_o_R/trpc/server";
import { ProfileForm } from "../../_components/profile-form";

export const metadata = {
	title: "Edit Profile - Heroes of Unemployment",
	description: "Edit your Heroes of Unemployment profile",
};

export default async function EditProfilePage() {
	const session = await auth();

	// Redirect if not logged in
	if (!session?.user?.id) {
		redirect("/login");
	}

	const userProfile = await api.user.getProfile();

	return (
		<div className="flex justify-center py-8">
			<div className="w-full max-w-2xl">
				<ProfileForm initialData={userProfile} />
			</div>
		</div>
	);
}
