import "@typespec/http";

import "./applications.tsp";

using TypeSpec.Http;

@useAuth(
  OAuth2Auth<[
    {
      type: OAuth2FlowType.authorizationCode,
      authorizationUrl: "https://login.microsoftonline.com/0b53d2c1-bc55-4ab3-a161-927d289257f2/oauth2/v2.0/authorize",
      tokenUrl: "https://login.microsoftonline.com/0b53d2c1-bc55-4ab3-a161-927d289257f2/oauth2/v2.0/token",
      scopes: [],
    }
  ]>
)
@server("http://localhost:3000", "Local")
@service({
  title: "Euricom Token Handler API",
  description: "API for the Euricom Token Handler",
  contact: {
    name: "Euricom",
    url: "https://euricom.nl",
    email: "info@euricom.nl",
  },
})
namespace TokenHandlerService {

}
