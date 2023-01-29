#!/bin/bash

# Exit as soon as a command fails (add -v for debugging stricpt)
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 14.21.1

# Go to source directory, if provided:
if [[ -z "${BUILD_REPOSITORY_LOCALPATH}" ]]; then
  echo "No BUILD_REPOSITORY_LOCALPATH provided - nothing new to change to."
else
  cd $BUILD_REPOSITORY_LOCALPATH
fi

# Install dependencies and tools:
if [ ! -e /root/.npmrc ]
then
  # If no .npmrc exists, copy existing to home directory
  ln -s /root/npmrc/.npmrc /root/.npmrc
fi

# Perform a clean install, based off of the `package-lock.json` file:
echo "Install NPM packages"
npm ci --unsafe-perm \
  || { echo '##vso[task.logissue type=error] npm ci failed'; exit 1; }

echo "Run lint"
npm run nx -- run metadata-server:lint \
  || { echo '##vso[task.logissue type=error]Lint failed'; exit 1; }

echo "Run test"
npm run nx -- run metadata-server:test \
  || { echo '##vso[task.logissue type=error]Test failed'; exit 1; }

echo "Cleanup LCOV file"
# Change paths in lcov.info to be relative and not absolute
CDIR="SF:$(pwd)/"
sed -i "s|$CDIR|SF:|g" coverage/apps/metadata-server/lcov.info

echo "Run build"
npm run nx -- run metadata-server:build:production \
  || { echo '##vso[task.logissue type=error]Production build failed'; exit 1; }

echo "Creating artifacts"
bash apps/metadata-server/build/deploy/create-artifacts.sh

