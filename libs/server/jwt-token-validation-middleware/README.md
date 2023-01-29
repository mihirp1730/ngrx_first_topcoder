# server-jwt-token-validation-middleware

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test server-jwt-token-validation-middleware` to execute the unit tests via [Jest](https://jestjs.io).

## Usage examples

### Enforcing audiences

Use middleware while enforcing audiences. Per [Audience enforcement by API providers/publishers](https://teams.microsoft.com/l/message/19:d04c4898e2d04660a4fc3a3a578f97a7@thread.skype/1623106010880?tenantId=41ff26dc-250f-4b13-8981-739be8610c21&groupId=ed27e6cc-a002-4f71-9a42-b88fe4205855&parentMessageId=1623106010880&teamName=Technology%20%7C%20Digital%20%7C%20DELFI%20Foundation&channelName=General&createdTime=1623106010880) Teams post. 

```
JwtTokenValidationMiddleware({
  production: environment.production,
  verifyOptions: {
    audience: process.env.AUTH_CLIENT_ID
  }
}),
```

### Pass in any underlying dependency options

- "JSON Web Key Sets" options via [the `jwks-rsa` package](https://www.npmjs.com/package/jwks-rsa)
- verification options via [the `jsonwebtoken` package](https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)

```
JwtTokenValidationMiddleware({
  production: environment.production,
  jwksClientOptions: {
    cache: true
  },
  verifyOptions: {
    audience: process.env.AUTH_CLIENT_ID
  }
}),
```
