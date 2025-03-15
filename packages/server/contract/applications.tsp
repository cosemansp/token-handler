import "@typespec/http";
import "./common.tsp";

using TypeSpec.Http;

namespace TokenHandlerService;

model AppConfig {
  @doc("Friendly name of the application config, eg; 'dev'")
  displayName: string;

  @doc("Client ID of the application")
  clientId: string;

  @doc("Scopes of the application; openid, profile, email, offline_access, ...")
  scopes: string[];

  @doc("The DNS on which the application is hosted")
  domain: string;

  @doc("The redirect URL of the application")
  redirectUrl: string;

  @doc("The backend URL of the application")
  backendUrl?: string;
}

model AppRole {
  @doc("The name of the role")
  name: string;

  @doc("The description of the role")
  description: string;
}

model Application {
  @doc("Object ID")
  @visibility(Lifecycle.Query)
  @visibility(Lifecycle.Read)
  id: string;

  @doc("Name of the application to display in the UI")
  displayName: string;

  @doc("The roles that are available for this application")
  roles: AppRole[];

  @doc("Description of the application")
  description?: string;

  @doc("Shortcut to be used in role assignment `tsz:admin`")
  slug: string;

  @doc("The date & time the application was created")
  @visibility(Lifecycle.Query)
  @visibility(Lifecycle.Read)
  createdOn: string;

  @doc("The date & time the application last updated")
  @visibility(Lifecycle.Query)
  @visibility(Lifecycle.Read)
  updatedOn: string;

  @doc("The configuration of the application, used by the TokenHandler")
  config: AppConfig[];
}

model ClientSecret {
  @visibility(Lifecycle.Query)
  @visibility(Lifecycle.Read)
  id: string;

  @doc("The secret name")
  description: string;

  @doc("The secret value, masked when read")
  value: string;

  @doc("The date & time the secret is expiring")
  @visibility(Lifecycle.Query)
  @visibility(Lifecycle.Read)
  expiresAt: plainDate;
}

@route("/api/applications")
@tag("Applications")
interface Applications {
  @doc("List all applications")
  @get
  list(): Application[] | NotAuthorizedError | Error;

  @doc("Get an application by ID")
  @get
  get(@path id: string): Application | NotAuthorizedError | NotFoundError | Error;

  @doc("Update an application")
  @put
  update(@path id: string, @body app: Application):
    | Application
    | NotAuthorizedError
    | BadRequestError
    | NotFoundError
    | Error;

  @doc("create an new application")
  @post
  create(@body app: Application): Application | NotAuthorizedError | BadRequestError | Error;

  @doc("removed an application")
  @delete
  delete(@path id: string): Application | NotAuthorizedError | NotFoundError | Error;
}

@route("/api/applications/{id}/secrets")
@tag("Client Secrets")
interface Secrets {
  @doc("List all client secrets for an application, secrets are masked")
  @get
  list(@path id: string): ClientSecret[] | NotAuthorizedError | Error;

  @doc("Create a new client secret for an application, returns the full secret value once")
  @post
  create(@path id: string, @body app: ClientSecret): ClientSecret | NotAuthorizedError | BadRequestError | Error;

  @doc("Delete a client secret for an application")
  @delete
  delete(@path id: string, @path secretId: string): ClientSecret | NotAuthorizedError | NotFoundError | Error;
}
