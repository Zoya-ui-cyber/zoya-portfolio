import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminGuestbook from "./AdminGuestbook";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: notes, error } = await supabase
    .from("guestbook")
    .select("id, name, message, created_at, status")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error("无法读取留言。");
  }

  return (
    <AdminGuestbook
      userEmail={user.email ?? ""}
      initialNotes={notes ?? []}
    />
  );
}