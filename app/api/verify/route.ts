export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  searchParams.set("code", "123");
  return Response.redirect(
    `${
      process.env.NEXTAUTH_URL
    }/api/auth/callback/steam?${searchParams.toString()}`
  );
}

export async function POST(req: Request): Promise<Response> {
  return Response.json({ token: "123" });
}
