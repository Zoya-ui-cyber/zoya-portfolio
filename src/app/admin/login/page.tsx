"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("邮箱或密码错误。");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.14em",
            marginBottom: "12px",
          }}
        >
          ADMINISTRATION
        </p>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: 500,
            marginBottom: "32px",
          }}
        >
          管理员登录
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          <label>
            <span
              style={{
                display: "block",
                marginBottom: "8px",
              }}
            >
              邮箱
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid currentColor",
                background: "transparent",
              }}
            />
          </label>

          <label>
            <span
              style={{
                display: "block",
                marginBottom: "8px",
              }}
            >
              密码
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid currentColor",
                background: "transparent",
              }}
            />
          </label>

          {error && (
            <p
              style={{
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "13px 16px",
              border: "1px solid currentColor",
              background: "transparent",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "登录中…" : "登录"}
          </button>
        </form>
      </section>
    </main>
  );
}