import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { authenticateRequestDb } from "@/lib/middleware/auth";

const MAX_BYTES = 3 * 1024 * 1024; // 3MB

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequestDb(request);
    if (!auth) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "파일이 너무 큽니다. (최대 3MB)" }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const orig = "name" in file && typeof (file as any).name === "string" ? (file as File).name : "upload";
    const ext = path.extname(orig).slice(0, 8) || ".bin";
    const safeExt = /^\.[a-zA-Z0-9]+$/.test(ext) ? ext : ".bin";
    const name = `${randomUUID()}${safeExt}`;
    const dir = path.join(process.cwd(), "public", "uploads", "feed");
    await mkdir(dir, { recursive: true });
    const full = path.join(dir, name);
    await writeFile(full, buf);
    const url = `/uploads/feed/${name}`;
    return NextResponse.json({ url });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
