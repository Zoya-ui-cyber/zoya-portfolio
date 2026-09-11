"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Note = {
  id: number;
  name: string;
  message: string;
  created_at: string;
  status: string;
};

type Props = {
  userEmail: string;
  initialNotes: Note[];
};

export default function AdminGuestbook({
  userEmail,
  initialNotes,
}: Props) {
  const router = useRouter();

  const [notes, setNotes] = useState(initialNotes);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function deleteNote(id: number) {
    const confirmed = window.confirm(
      "确定要删除这条留言吗？删除后无法恢复。"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    const supabase = createClient();

    const { error } = await supabase
      .from("guestbook")
      .delete()
      .eq("id", id);

    if (error) {
      window.alert("删除失败，请稍后再试。");
      setDeletingId(null);
      return;
    }

    setNotes((current) =>
      current.filter((note) => note.id !== id)
    );

    setDeletingId(null);
    router.refresh();
  }

  async function logout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px 80px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "0.14em",
                marginBottom: "12px",
              }}
            >
              BENEATH THE TREE
            </p>

            <h1
              style={{
                fontSize: "36px",
                fontWeight: 500,
                margin: 0,
              }}
            >
              留言管理
            </h1>

            <p
              style={{
                marginTop: "12px",
                opacity: 0.65,
              }}
            >
              {userEmail}
            </p>
          </div>

          <button
            onClick={logout}
            style={{
              padding: "10px 14px",
              border: "1px solid currentColor",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            退出登录
          </button>
        </header>

        <div
          style={{
            borderTop: "1px solid currentColor",
          }}
        >
          {notes.length === 0 ? (
            <p
              style={{
                padding: "32px 0",
                opacity: 0.6,
              }}
            >
              暂时没有留言。
            </p>
          ) : (
            notes.map((note) => (
              <article
                key={note.id}
                style={{
                  padding: "24px 0",
                  borderBottom: "1px solid currentColor",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "24px",
                }}
              >
                <div>
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    {note.name}
                  </strong>

                  <p
                    style={{
                      margin: "0 0 10px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {note.message}
                  </p>

                  <time
                    dateTime={note.created_at}
                    style={{
                      fontSize: "12px",
                      opacity: 0.55,
                    }}
                  >
                    {new Date(note.created_at).toLocaleString(
                      "zh-CN"
                    )}
                  </time>
                </div>

                <button
                  onClick={() => deleteNote(note.id)}
                  disabled={deletingId === note.id}
                  style={{
                    alignSelf: "start",
                    padding: "8px 12px",
                    border: "1px solid currentColor",
                    background: "transparent",
                    cursor:
                      deletingId === note.id
                        ? "default"
                        : "pointer",
                  }}
                >
                  {deletingId === note.id
                    ? "删除中…"
                    : "删除"}
                </button>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}