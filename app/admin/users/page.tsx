import { getServerSession } from "next-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/lib/auth";
import { listUsersAdmin } from "@/lib/data/admin";
import RoleSelect from "@/components/admin/RoleSelect";

export default async function AdminUsers() {
  const session = await getServerSession(authOptions);
  const selfId = (session?.user as { id?: string } | undefined)?.id;
  const users = await listUsersAdmin();

  return (
    <Card className="p-6">
      <div className="text-sm font-bold text-white mb-4">کاربران ({users.length.toLocaleString("fa-IR")})</div>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{u.name ?? "—"}</div>
              <div className="text-[11px] text-white/40 font-jakarta" dir="ltr">{u.email}</div>
              <div className="text-[11px] text-white/30 mt-1">{u._count.orders.toLocaleString("fa-IR")} سفارش</div>
            </div>
            {u.role === "ADMIN" && <Badge variant="gold">مدیر</Badge>}
            <RoleSelect id={u.id} role={u.role} isSelf={u.id === selfId} />
          </div>
        ))}
      </div>
    </Card>
  );
}
