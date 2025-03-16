export type ApplicationConfig = {
  domain: string;
  provider: ProviderConfig[] | ProviderConfig;
};

export type ProviderConfig = {
  name: string;
  clientId: string;
  clientSecret: string;
  redirectURI: string;
  scopes: string[];
};
