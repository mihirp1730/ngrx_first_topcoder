# This `proto` folder

This folder includes the TypeScript output of the following protobuf file:

```
libs/server/data-packages/vendor/src/assets/proto/data-package-resource.proto
```

The TypeScript output includes definitions generated from the `data-package-resource.proto` file.

With the `.gitignore` file, we do not check the output into source control.

The TypeScript output will be generated when needed, for development purposes:
- local development
- testing
- linting
- build pipelines targeting production images
- etc. 

The generation of the output and the TypeScript definitions occurs:

1. After npm installs via the `/package-postinstall.js` script.
2. Running the `build-proto` target of the `server-data-packages-vendor` Nx project.

## "Cannot find module ..." error

If, even after the post-install script, you encounter an error such as ` Cannot find module ... or its corresponding type declarations.` then try running the project's target manually:

```
npm run nx -- run server-data-packages-vendor:build-proto
```
