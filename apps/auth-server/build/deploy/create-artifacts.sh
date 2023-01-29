#!/bin/bash

# Exit as soon as a command fails
set -e

# Go to source directory
cd $BUILD_REPOSITORY_LOCALPATH

echo "Environment"
echo "  Project = $GCLOUD_PROJECT"
echo "  Build definition = $BUILD_DEFINITIONNAME"
echo "  Source branch = $BUILD_SOURCEBRANCHNAME"
echo "  Build number = $BUILD_BUILDNUMBER"

# Apply deployment templates
export IN_DIR="$BUILD_REPOSITORY_LOCALPATH/apps/auth-server/build/deploy"
export OUT_DIR="$BUILD_REPOSITORY_LOCALPATH/buildartifacts/auth-server"
mkdir -p $OUT_DIR
echo "Create Kubernetes files in $OUT_DIR"
gomplate -f $IN_DIR/deployment.yaml -o $OUT_DIR/deployment.yaml
gomplate -f $IN_DIR/service.yaml -o $OUT_DIR/service.yaml
gomplate -f $IN_DIR/secrets.yaml -o $OUT_DIR/secrets.yaml
if [ -f $IN_DIR/ingress.yaml ]
then
    gomplate -f $IN_DIR/ingress.yaml -o $OUT_DIR/ingress.yaml
fi

echo "Create deploy.sh script in $OUT_DIR"
gomplate -f $IN_DIR/deploy.sh -o $OUT_DIR/deploy.sh
chmod a+x $OUT_DIR/deploy.sh

cp $IN_DIR/swagger.yaml $OUT_DIR

if [ "$BUILD_SOURCEBRANCHNAME" = "master" -o "$BUILD_FORCE_DEPLOY" = "true" ]
then
    # npmrc required in docker image being built for npm install to use vsts package manager
    cp /root/.npmrc ./npmrc-dockerbuild

    gcloud auth configure-docker
    gcloud config list account --format "value(core.account)"
    gcloud auth list
    gcloud config set core/account azure-devops-build-agent@gaia-devops.iam.gserviceaccount.com
    gcloud config list account --format "value(core.account)"

    # Create Docker image
    echo Build docker and publish
    DOCKER_IMAGE=gcr.io/$GCLOUD_PROJECT/$BUILD_DEFINITIONNAME:$BUILD_SOURCEBRANCHNAME-$BUILD_BUILDNUMBER
    echo "Create Docker image: $DOCKER_IMAGE"
    docker build -f $BUILD_REPOSITORY_LOCALPATH/apps/auth-server/build/dist.Dockerfile -t $DOCKER_IMAGE .

    # Push the docker image
    echo "Push image $DOCKER_IMAGE"
    docker push $DOCKER_IMAGE

    # remove local copy of .npmrc
    rm ./npmrc-dockerbuild
fi


