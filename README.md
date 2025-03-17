# Steam Auth Provider for Auth.js 🚀🔥  

This guide walks you through **adding Steam authentication** to **Auth.js (NextAuth.js v5)**. Since Auth.js now runs **on the edge**, we need a browser-compatible approach, avoiding Node.js-specific packages like `crypto`.  

Heavily inspired by [next-auth-steam](https://github.com/Nekonyx/next-auth-steam) (Steam authentication provider for NextAuth.js)

## 📂 Folder Structure  

Below is the recommended structure for integrating Steam authentication:  

```
your-project/
├── providers/
│   ├── steam.ts          # Steam authentication provider
├── types/
│   ├── auth.d.ts         # TypeScript definitions for Steam user data
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── verify/
│   │   │   │   ├── route.ts  # Dummy token route for Steam authentication
├── auth.ts               # Auth.js configuration
```

## 📦 Requirements  

Before you start, install the required package:  

```
pnpm install openid
```

Since this is just a **tutorial**, there is no `package.json` provided—you'll need to add the files manually into your existing Auth.js setup.  

## 🛠️ Setup  

1. **Set Up Environment Variables**  
   - Create a `.env` file and add:  

```
NEXTAUTH_URL=https://mywebsite.com
NEXTAUTH_STEAM_SECRET=<your-steam-api-key>
```

2. **Create the Steam Provider**  
   - Add a file called `steam.ts` inside the `providers/` directory.  
   - This file will handle the Steam OpenID authentication flow.  

3. **Update Your Auth Configuration**  
   - Modify your `auth.ts` file to use the Steam provider.  
   - Ensure `callbackUrl` matches the verification route in the next step.  

4. **Create a Dummy Token Route**  
   - Steam’s OpenID system does **not** provide an OAuth token.  
   - To work around this, create a verification route at `app/api/auth/verify/route.ts`.  

5. **Define TypeScript Types**  
   - To ensure type safety, add `types/auth.d.ts`.  
   - This extends Auth.js types with Steam profile data.  

## 🎯 Notes  

- **Steam does not provide an access token**, so we create a dummy-token endpoint.  
- The `/api/auth/verify/` route can be renamed, but it **must** match `callbackUrl` in `auth.ts`.  
- Since this is a tutorial, **you must integrate these files into your existing Auth.js setup**.  

## 🚀 Get Started  

- Add the necessary files to your project.  
- Install dependencies with `pnpm install openid`.  
- Set up your `.env` file.  
- Configure Auth.js to use Steam.  
- Deploy your app and enjoy Steam authentication! 🎮  
