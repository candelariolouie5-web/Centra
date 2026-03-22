import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role === "doctor") {
    redirect("/doctors/dashboard");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  const user = session.user;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center mb-4">
          {user.image && (
            <Image
              src={user.image}
              alt="Profile Picture"
              width={100}
              height={100}
              className="rounded-full mr-4"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">{user.name || "No name"}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
