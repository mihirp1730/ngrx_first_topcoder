# apollo

Asset Transaction:

| Environment | URL  |
| :---------- | :--- |
| `evd`       | https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com |
| `evq`       | https://evq.gaia-osdu.gaiaops.cloud.slb-ds.com |

Corporate Discovery:

| Environment | URL  |
| :---------- | :--- |
| `evd`       | https://discovery.gaia-osdu.gaiaops.cloud.slb-ds.com |

## CI/CD Releases:

Find all in [Azure DevOps](https://dev.azure.com/slb-swt/delfi-exploration/_release?_a=releases&view=mine&definitionId=54).

| Release Stage       | Status Badge |
| :------------------ | :----------- |
| `OSDU EVD`          | ![Release stage](https://vsrm.dev.azure.com/slb-swt/_apis/public/Release/badge/d5d65afc-aafc-4c80-8969-299ae1944357/15/26) |
| `OSDU EVQ`          | ![Release stage](https://vsrm.dev.azure.com/slb-swt/_apis/public/Release/badge/d5d65afc-aafc-4c80-8969-299ae1944357/15/27) |
| `OSDU PROD`         | ![Release stage](https://vsrm.dev.azure.com/slb-swt/_apis/public/Release/badge/d5d65afc-aafc-4c80-8969-299ae1944357/15/28) |
| `OSDU PRIVATE`      | ![Release stage](https://vsrm.dev.azure.com/slb-swt/_apis/public/Release/badge/d5d65afc-aafc-4c80-8969-299ae1944357/15/29) |
| `OSDU Discovery`    | ![Release stage](https://vsrm.dev.azure.com/slb-swt/_apis/public/Release/badge/d5d65afc-aafc-4c80-8969-299ae1944357/15/57) |

## CI/CD Builds:

Find all in [Azure DevOps](https://dev.azure.com/slb-swt/delfi-exploration/_build?definitionScope=%5Cgaia-light).

| Application        | Status Badge |
| :----------------- | :----------- |
| `auth-server`      | [![Build status](https://dev.azure.com/slb-swt/gaia/_apis/build/status/Gaia-OSDU/Services/light-auth-server?branchName=master)](https://dev.azure.com/slb-swt/gaia/_build/latest?definitionId=14897) |
| `content-server`   | [![Build status](https://dev.azure.com/slb-swt/gaia/_apis/build/status/Gaia-OSDU/Services/light-content-server?branchName=master)](https://dev.azure.com/slb-swt/gaia/_build/latest?definitionId=14899) |
| `discovery-app`    | [![Build status](https://dev.azure.com/slb-swt/gaia/_apis/build/status/Gaia-OSDU/Services/discovery-app?branchName=master)](https://dev.azure.com/slb-swt/gaia/_build/latest?definitionId=15097) |
| `gateway-server`   | [![Build status](https://dev.azure.com/slb-swt/gaia/_apis/build/status/Gaia-OSDU/Services/light-gateway-server?branchName=master)](https://dev.azure.com/slb-swt/gaia/_build/latest?definitionId=14900) |
| `light-app`        | [![Build status](https://dev.azure.com/slb-swt/gaia/_apis/build/status/Gaia-OSDU/Services/light-app?branchName=master)](https://dev.azure.com/slb-swt/gaia/_build/latest?definitionId=14895) |
| `light-vendor-app` | [![Build status](https://dev.azure.com/slb-swt/gaia/_apis/build/status/Gaia-OSDU/Services/light-vendor-app?branchName=master)](https://dev.azure.com/slb-swt/gaia/_build/latest?definitionId=14905) |
| `metadata-server`  | [![Build status](https://dev.azure.com/slb-swt/gaia/_apis/build/status/Gaia-OSDU/Services/light-metadata-server?branchName=master)](https://dev.azure.com/slb-swt/gaia/_build/latest?definitionId=14901) |
| `session-server`   | [![Build status](https://dev.azure.com/slb-swt/gaia/_apis/build/status/Gaia-OSDU/Services/light-session-server?branchName=master)](https://dev.azure.com/slb-swt/gaia/_build/latest?definitionId=14903) |

## Local Development

### Run locally

1. Clone repository.
2. Be sure to [connect to the Azure DevOps NPM artifact feed](https://dev.azure.com/slb-swt/delfi-exploration/_packaging?_a=connect&feed=) for any private package installation.
3. Run `npm install` within the cloned folder.
4. Add following system environment variables. 

    | Variable Name | Value  |
    | :---------- | :--- |
    | APP_KEY       | HKMujMbvHDNcjFcGM6ARJ3CIhWOjWxMF |
    | AUTH_PROXY_CCM_APP_KEY | HKMujMbvHDNcjFcGM6ARJ3CIhWOjWxMF |
    | AUTH_PROXY_CLIENT_SECRET <td rowspan="2"> Please contact PM/PA/Tech Lead to get secret values.</td>|
    | AUTH_PROXY_GUEST_CLIENT_SECRET |
    | TOKEN_EXCHANGE_AUDIENCES |openid f20de67f27364e0495c412ce1409c09f 963f2cc6915e479fa0fcb73ec2ec90e7 de-sauth-v2-scope-service-datalake.slbservice.com|
  
5. Run `npm run start` to run the application (and its services) locally.
6. Visit `https://localhost:4200` in your browser.

### Generating `/apps`

A frontend application project should be generated with a `-app` suffix:

```
npm run nx -- generate @nrwl/angular:application \
  --name=my-frontend-app \
  --style=scss \
  --e2eTestRunner=none \
  --standaloneConfig \
  --no-interactive
```

A backend server project should be generated with a `-server` suffix.

```
npm run nx -- generate @nrwl/nest:application \
  --name=my-backend-server \
  --standaloneConfig \
  --no-interactive
```

### Generating `/libs`

A new library can be organized into one of three categories or folders:

1. `libs/api` ([Azure DevOps folder](https://dev.azure.com/slb-swt/delfi-exploration/_git/apollo?path=%2Flibs%2Fapi)) anything shared between frontend and backend projects or in other libraries.

```
npm run nx -- generate @nrwl/workspace:library \
  --name=example-data-classes \
  --directory=api \
  --strict \
  --standaloneConfig \
  --no-interactive
```

2. `libs/app` ([Azure DevOps folder](https://dev.azure.com/slb-swt/delfi-exploration/_git/apollo?path=%2Flibs%2Fapp)) anything used by frontend (Angular) projects.

```
npm run nx -- generate @nrwl/angular:library \
  --name=example-card-list \
  --directory=app \
  --standaloneConfig \
  --no-interactive
```

3. `libs/server` ([Azure DevOps folder](https://dev.azure.com/slb-swt/delfi-exploration/_git/apollo?path=%2Flibs%2Fserver)) anything used by backend (NestJS) projects.

```
npm run nx -- generate @nrwl/nest:library \
  --name=example-middleware \
  --directory=server \
  --standaloneConfig \
  --no-interactive
```
