import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const MAX_NAME_LENGTH = 40;
const MAX_MESSAGE_LENGTH = 500;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const { data, error } = await supabase
    .from("guestbook")
    .select("id, name, message, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Guestbook GET error:", error);

    return NextResponse.json(
      { error: "无法读取留言" },
      { status: 500 }
    );
  }

  return NextResponse.json({ notes: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = cleanText(body?.name);
    const message = cleanText(body?.message);

    if (!name || !message) {
      return NextResponse.json(
        { error: "姓名和留言不能为空" },
        { status: 400 }
      );
    }

    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `姓名不能超过 ${MAX_NAME_LENGTH} 个字符` },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `留言不能超过 ${MAX_MESSAGE_LENGTH} 个字符` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("guestbook")
      .insert({
        name,
        message,
        status: "published",
      })
      .select("id, name, message, created_at")
      .single();

    if (error) {
      console.error("Guestbook POST error:", error);

      return NextResponse.json(
        { error: "留言保存失败" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { note: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Guestbook request error:", error);

    return NextResponse.json(
      { error: "请求格式错误" },
      { status: 400 }
    );
  }
}
