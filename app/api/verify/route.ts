import { NextRequest } from "next/server";

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  searchParams.set("code", "123");
  return Response.redirect(
    `${
      process.env.NEXTAUTH_URL
    }/api/auth/callback/steam?${searchParams.toString()}`
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return Response.json({ token: "123" });
}
