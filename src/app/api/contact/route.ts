import { allowRequest, db } from "@/lib/store";
import { readBody, trustedOrigin } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!trustedOrigin(request))
    return Response.json(
      { error: "Nguồn yêu cầu không hợp lệ." },
      { status: 403 },
    );
  if (
    !allowRequest(
      `contact:${request.headers.get("x-forwarded-for")?.split(",")[0] || "local"}`,
      4,
    )
  )
    return Response.json(
      { error: "Vui lòng chờ một phút trước khi gửi thêm lời nhắn." },
      { status: 429 },
    );
  try {
    const body = (await readBody(request)) as Record<string, unknown>;
    const string = (key: string, max: number) => {
      const value = body[key];
      if (typeof value !== "string" || value.trim().length > max)
        throw new Error();
      return value.trim();
    };
    const name = string("name", 100),
      email = string("email", 254),
      phone = string("phone", 20),
      message = string("message", 2000);
    if (
      name.length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      message.length < 5 ||
      (phone && !/^(0|\+84)[0-9]{9}$/.test(phone))
    )
      throw new Error();
    try {
      db()
        .prepare(
          "INSERT INTO contact_messages(name,email,phone,message,createdAt) VALUES (?,?,?,?,?)",
        )
        .run(name, email, phone, message, new Date().toISOString());
    } catch {
      return Response.json(
        { error: "Chưa thể lưu lời nhắn. Vui lòng thử lại sau." },
        { status: 503 },
      );
    }
    return Response.json(
      { message: "Đã lưu lời nhắn của bạn. Cảm ơn bạn đã chia sẻ với Heros." },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "Vui lòng kiểm tra lại tên, email, số điện thoại và lời nhắn." },
      { status: 400 },
    );
  }
}
