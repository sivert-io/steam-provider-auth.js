import NextAuth from "next-auth";
import { SteamProvider } from "./providers/steam";

export const { auth, handlers, signIn, signOut } = NextAuth((req) => ({
  providers: [
    SteamProvider(req as any, {
      clientSecret: process.env.NEXTAUTH_STEAM_SECRET!,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/verify`, // This is the route that will be called after the user logs in, to provide a dummy-token
    }),
  ],
  callbacks: {
    // Forward all steam profile data to the client
    async jwt({ token, account, profile }) {
      if (account?.provider === "steam" && profile) {
        token.profile = profile;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...(token.profile as any),
        },
      };
    },
  },
}));
