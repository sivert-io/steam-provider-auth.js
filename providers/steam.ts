import { NextApiRequest } from "next";
import { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import { NextRequest } from "next/server";
import { RelyingParty } from "openid";

export enum CommunityVisibilityState {
  Private = 1,
  Public = 3,
}

export enum PersonaState {
  Offline = 0,
  Online = 1,
  Busy = 2,
  Away = 3,
  Snooze = 4,
  LookingToTrade = 5,
  LookingToPlay = 6,
}

export interface SteamProfile extends Record<string, any> {
  steamid: string;
  communityvisibilitystate: CommunityVisibilityState;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: PersonaState;
  primaryclanid: string;
  timecreated: number;
  personastateflags: number;
  commentpermission: boolean;
}

export interface SteamProviderOptions
  extends Partial<OAuthUserConfig<SteamProfile>> {
  callbackUrl: string | URL;
  clientSecret: string;
}

export const PROVIDER_ID = "steam";
export const AUTHORIZATION_URL = "https://steamcommunity.com/openid/login";

export function SteamProvider(
  req: Request | NextRequest | NextApiRequest,
  options: SteamProviderOptions
): OAuthConfig<SteamProfile> {
  if (!options.clientSecret) {
    throw new Error(
      "Missing `clientSecret` parameter. Get one at https://steamcommunity.com/dev/apikey"
    );
  }

  const callbackUrl = new URL(options.callbackUrl);
  const realm = callbackUrl.origin;

  return {
    clientId: PROVIDER_ID,
    clientSecret: options.clientSecret,
    id: PROVIDER_ID,
    name: PROVIDER_ID,
    type: "oauth",
    style: {
      bg: "#000",
      text: "#fff",
    },
    checks: ["none"],
    authorization: {
      url: AUTHORIZATION_URL,
      params: {
        "openid.mode": "checkid_setup",
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id":
          "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.return_to": callbackUrl.toString(),
        "openid.realm": realm,
      },
    },
    token: {
      url: callbackUrl.toString(),
      async conform() {
        if (!req.url) {
          throw new Error("No URL found in request object");
        }

        const identifier = await verifyAssertion(
          req,
          realm,
          callbackUrl.toString()
        );

        if (!identifier) {
          throw new Error("Authentication failed: Unable to verify Steam ID");
        }

        return Response.json({
          access_token: crypto.randomUUID(),
          steamId: identifier,
          token_type: "Bearer",
        });
      },
    },
    userinfo: {
      url: callbackUrl.toString(),
      async request(ctx: any) {
        const url = new URL(
          "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002"
        );

        url.searchParams.set("key", ctx.provider.clientSecret as string);
        url.searchParams.set("steamids", ctx.tokens.steamId as string);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch Steam profile");
        }

        const data = await response.json();
        return data.response.players[0] ?? null;
      },
    },
    profile(profile: SteamProfile) {
      return profile;
    },
  };
}

async function verifyAssertion(
  req: Request | NextRequest | NextApiRequest,
  realm: string,
  returnTo: string
): Promise<string | null> {
  const IDENTIFIER_PATTERN =
    /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/;
  const OPENID_CHECK = {
    ns: "http://specs.openid.net/auth/2.0",
    claimed_id: "https://steamcommunity.com/openid/id/",
    identity: "https://steamcommunity.com/openid/id/",
  };

  const url = new URL(req.url!, "https://example.com");
  const query = Object.fromEntries(url.searchParams.entries());

  if (
    query["openid.op_endpoint"] !== AUTHORIZATION_URL ||
    query["openid.ns"] !== OPENID_CHECK.ns ||
    !query["openid.claimed_id"]?.startsWith(OPENID_CHECK.claimed_id) ||
    !query["openid.identity"]?.startsWith(OPENID_CHECK.identity)
  ) {
    return null;
  }

  const relyingParty = new RelyingParty(returnTo, realm, true, false, []);

  try {
    const assertion = await new Promise<{
      authenticated: boolean;
      claimedIdentifier?: string;
    }>((resolve, reject) => {
      relyingParty.verifyAssertion(req, (error, result) => {
        if (error) reject(error);
        resolve(result!);
      });
    });

    if (!assertion.authenticated || !assertion.claimedIdentifier) {
      return null;
    }

    const match = assertion.claimedIdentifier.match(IDENTIFIER_PATTERN);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error verifying OpenID assertion:", error);
    return null;
  }
}
