#!/bin/bash

# Exit as soon as a command fails (add -v for debugging script)
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 14.21.1

# For any debugging purposes, show the developer the build agent's versions
echo "Node / NPM versions:"
node -v
npm -v

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

if [ "$BUILD_SOURCEBRANCH" = "refs/heads/master" ] # If we're "master", then compare latest master to previous master
then

  #
  # Get the last master commit before the merge:
  #
  base=$(git rev-parse --short HEAD~1 | tail -1)
  head=HEAD

else # Otherwise we're building a specific branch, then compare the latest feature branch to it's branched master

  #
  # Discard any possible changes made by the earlier npm install command
  # and use a branch (because we're detached) for nx to compare with.
  #
#  git checkout -- package-lock.json
#  git checkout -b diff-to-master-$BUILD_BUILDID

  #
  # Get the last master commit before the merge:
  #
  base=$(git merge-base origin/master HEAD)
  head=HEAD

fi

echo "Base commit: $base"
echo "Head commit: $head"

# NOTE: We should be able to remove the affected lint
# NOTE: ... once a larger agent pool is introduced and
# NOTE: ... we can fork affected builds and fail the
# NOTE: ... parent build after any forked builds.
# NOTE: ... We want to prevent built and deployed forked
# NOTE: ... affected builds.
#
# Run affected lint
#
npm run nx -- affected:lint \
  --skip-nx-cache \
  --parallel \
  --base=$base \
  --head=$head

# NOTE: We should be able to remove the affected test
# NOTE: ... once a larger agent pool is introduced and
# NOTE: ... we can fork affected builds and fail the
# NOTE: ... parent build after any forked builds.
# NOTE: ... We want to prevent built and deployed forked
# NOTE: ... affected builds.
#
# Run affected test
#
npm run nx -- affected:test \
  --skip-nx-cache \
  --parallel \
  --base=$base \
  --head=$head

#
# Keep a reference of the affected applications:
#
echo "affected:apps"
npm run nx -- affected:apps --base=${base} --head=${head} --plain
affectedApps=$(npm run nx -- affected:apps --base=${base} --head=${head} --plain | tail -1)

#
#  Keep a reference of the affected libraries:
#
echo "affected:libs"
npm run nx -- affected:libs --base=${base} --head=${head} --plain
affectedLibs=$(npm run nx -- affected:libs --base=${base} --head=${head} --plain | tail -1)

#
# Set environment variables of the affected apps.
#
for affectedApp in ${affectedApps[@]};
do
  # Make upper-case the lower-cased app name.
  affectedApp=${affectedApp^^}
  # Replace all the dashes in the uppercased name to underscores.
  affectedApp=$(echo "$affectedApp" | tr - _)
  # Print out the command for the build pipeline.
  echo "vso[task.setvariable variable=AFFECTED_${affectedApp};isSecret=false;isOutput=true;]true";
  echo "##vso[task.setvariable variable=AFFECTED_${affectedApp};isSecret=false;isOutput=true;]true";
  echo "##vso[task.setvariable variable=AFFECTED_APPS;isSecret=false;isOutput=true;]true";
  echo "##vso[task.setvariable variable=AFFECTED_PROJECTS;isSecret=false;isOutput=true;]true";
done

#
# Set environment variables of the affected libs.
#
for affectedLib in ${affectedLibs[@]};
do
  # Make upper-case the lower-cased lib name.
  affectedLib=${affectedLib^^}
  # Replace all the dashes in the uppercased name to underscores.
  affectedLib=$(echo "$affectedLib" | tr - _)
  # Print out the command for the build pipeline.
  echo "vso[task.setvariable variable=AFFECTED_${affectedLib};isSecret=false;isOutput=true;]true";
  echo "##vso[task.setvariable variable=AFFECTED_${affectedLib};isSecret=false;isOutput=true;]true";
  echo "##vso[task.setvariable variable=AFFECTED_LIBS;isSecret=false;isOutput=true;]true";
  echo "##vso[task.setvariable variable=AFFECTED_PROJECTS;isSecret=false;isOutput=true;]true";
done
