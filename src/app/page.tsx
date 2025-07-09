import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Landing() {
  const { userId, orgId } = await auth();

  if (userId && orgId) {
    redirect("/workspace");
  }

  if (userId && !orgId) {
    redirect("/org");
  }

  return (
    <div>
      <p>Hello, new user</p>
    </div>
  );
}
