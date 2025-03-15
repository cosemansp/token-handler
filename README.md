# Euricom.TokenHandler

### Server Endpoints

```bash
# proxy to the configured API service
/api -> proxy

# login - begins the authentication process
/auth/login
/auth/login?returnUrl=/logged-in

# signs out of the appropriate auth schemas to both delete the BFF's session
# cookie and to sign out from the remote identity provider.
/auth/logout
/auth/logout?returnUrl=/logged-out&clientOnly

# refresh the access token using the refresh token
/auth/refresh
```

See also https://docs.duendesoftware.com/bff/v2/session/management endpoints

### Tools & Requirements

- Runtime: Bun
- Package Manager: Bun
- Language: TypeScript
- Linting: oxlint
- Formatting: prettier
- Spelling: cspell
- API Contract: TypeSpec
- Database: CosmosDB (only when needed)
- Hosting: docker

### Core Libraries

- Web Framework: [Hono](https://hono.dev/)
- Logging: [Pino](https://github.com/pinojs/pino) with integration to OpenTelemetry
- Typesafe Env variables: [@t3-oss/env-core](https://www.npmjs.com/package/@t3-oss/env-core)
- Asserts: [tiny-invariant](https://www.npmjs.com/package/tiny-invariant)
- Validation: [zod](https://zod.dev/)
- Open API to code: [kobb](https://kubb.dev/)

### Resources

**Training & Info:**

OAuth2 (Training)

- https://github.com/Euricom/training-workshop-security/tree/main/web-security/slides/oauth2-oidc
- https://www.youtube.com/watch?v=ZuQoN2x8T6k
  https://www.youtube.com/watch?v=OpFN6gmct8c

OAuth2 Authorization Code Flow (theory and flow with code snippets)

- https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow
- https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/add-login-auth-code-flow

Token Handler (zij bieden ook veel info over het token handler pattern)

- https://curity.io/product/token-handler/
- https://curity.io/blog/token-handler-the-single-page-applications-new-bff/

**Sample code:**

- [Contract first](https://github.com/Euricom/training-workshop-security/tree/main/api-security/demos/javascript/api-todo-contract-first)

- [Security Headers](https://github.com/Euricom/training-workshop-security/blob/main/api-security/demos/javascript/api-headers/middleware.js)

- [Security BFF Sample](https://github.com/Euricom/training-workshop-security/tree/main/api-security/demos/javascript/bff)

## Microsoft Entra ID Setup

This project uses Microsoft Entra ID (formerly Azure AD) for authentication. Follow these steps to set up your application:

1. **Register a new application in Entra ID**:

   - Sign in to the [Azure Portal](https://portal.azure.com)
   - Navigate to "Microsoft Entra ID" > "App registrations" > "New registration"
   - Enter a name for your application
   - Select the supported account types (single tenant, multi-tenant, etc.)
   - Set the redirect URI to `https://your-subdomain.euri.com/auth/callback`
   - Click "Register"

2. **Configure authentication**:

   - In your registered app, go to "Authentication"
   - Ensure "Access tokens" and "ID tokens" are checked under "Implicit grant and hybrid flows"
   - Under "Advanced settings", set "Logout URL" to your application's logout URL

3. **Create a client secret**:

   - Go to "Certificates & secrets" > "Client secrets" > "New client secret"
   - Add a description and select an expiration period
   - Copy the generated secret value (you'll only see it once)

4. **Configure API permissions**:

   - Go to "API permissions" > "Add a permission"
   - Select "Microsoft Graph" > "Delegated permissions"
   - Add the permissions your application needs (e.g., User.Read, etc.)
   - Click "Add permissions"
   - Grant admin consent if required

5. **Configure your environment variables**:
   - Copy `.env.example` to `.env`
   - Update the following values:
     - `ENTRA_CLIENT_ID`: Your application (client) ID
     - `ENTRA_CLIENT_SECRET`: The client secret you created
     - `ENTRA_TENANT_ID`: Your tenant ID or use "common" for multi-tenant
     - `ENTRA_REDIRECT_URI`: Your application's callback URL


## Temporary deploy steps

```
az login --use-device-code
az acr login --name euriusermgtregistry
docker build -t euriusermgtregistry.azurecr.io/euri-token:dev .
docker push euriusermgtregistry.azurecr.io/euri-token:dev
az containerapp update --name ca-euri-token --resource-group rg-euri-tokens-dev-we
```
