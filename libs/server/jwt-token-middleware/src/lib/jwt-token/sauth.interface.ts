export interface ISauth {
  application: string; // ""
  at_hash: string; // "Ri2iuL-OZvY5GJvjsOMddg"
  aud: string; // "atlas-delfiexploration.slbclient.com"
  company: string; // ""
  country: string; // ""
  desid: string; // "jallen20@slb.desid.delfi.slb.com"
  email: string; // "jallen20@slb.com"
  exp: number; // 1563299843
  hd: string; // "slb.com"
  iat: number; // 1563213443
  idp: string; // "o365"
  iss: string; // "sauth-preview.slb.com"
  jobtitle: string; // ""
  nonce: string; // "yBxsWWSClLjeRz8dzX1U1eVd7ys9Yfb7VaMYu27L"
  sub: string; // "jallen20@slb.com"
  subid: string; // "yBxsWWSClLjeRz8dzX1U1eVd7ys9Yfb7VaMYu27L"
  given_name: string;
  family_name: string;
  name: string;
  ver: string;
  userid: string; // "jallen20@slb.com"
}

export interface IOpenIdConfigurationResponse {
  data: { jwks_uri: string };
}

export interface IJwtTokenCertResponse {
  data: { keys: IJwtPublicKey[] };
}

interface IJwtPublicKey {
  kid: string;
  alg: string;
  kty: string;
  n: string;
  e: string;
}
