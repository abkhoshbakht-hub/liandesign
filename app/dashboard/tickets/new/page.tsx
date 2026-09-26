import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NewTicketForm from "@/components/tickets/NewTicketForm";

export default async function NewTicketPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/tickets/new");

  const user = session.user as { name?: string | null; email?: string };

  return (
    <NewTicketForm
      userName={user.name ?? null}
      userEmail={user.email ?? "ناشناس"}
    />
  );
}
