import { SteamProfile } from "@/providers/steam";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: SteamProfile;
  }

  interface User extends SteamProfile {}

  interface AdapterUser extends SteamProfile {}
}
