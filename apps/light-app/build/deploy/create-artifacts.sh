#!/bin/bash

# Exit as soon as a command fails:
set -e

# Use the target app directory:
export APP_DIR="$BUILD_REPOSITORY_LOCALPATH/apps/light-app"
export BUILD_ARTIFACTS_DIR="$BUILD_REPOSITORY_LOCALPATH/buildartifacts/light-app"
export BUILD_DIR="$APP_DIR/build"
export DIST_DIR="$BUILD_REPOSITORY_LOCALPATH/dist/apps/light-app"
export DEPLOY_DIR="$APP_DIR/build/deploy"

# Go to source directory:
cd $BUILD_REPOSITORY_LOCALPATH

echo "Environment"
echo "  Project = $GCLOUD_PROJECT"
echo "  Compute zone = $CLOUDSDK_COMPUTE_ZONE"
echo "  Container cluster = $CONTAINER_CLUSTER"
echo "  Build definition = $BUILD_DEFINITIONNAME"
echo "  Source branch = $BUILD_SOURCEBRANCHNAME"
echo "  Build number = $BUILD_BUILDNUMBER"

# Apply deployment templates:
echo "Create Kubernetes files in $BUILD_ARTIFACTS_DIR"
mkdir -p $BUILD_ARTIFACTS_DIR
gomplate -f $DEPLOY_DIR/deployment.yaml -o $BUILD_ARTIFACTS_DIR/deployment.yaml
gomplate -f $DEPLOY_DIR/service.yaml -o $BUILD_ARTIFACTS_DIR/service.yaml
gomplate -f $DEPLOY_DIR/ingress.yaml -o $BUILD_ARTIFACTS_DIR/ingress.yaml
gomplate -f $DEPLOY_DIR/configmap-environments.yaml -o $BUILD_ARTIFACTS_DIR/configmap-environments.yaml
gomplate -f $DEPLOY_DIR/configmap-nginx-config.yaml -o $BUILD_ARTIFACTS_DIR/configmap-nginx-config.yaml

echo "Copy environment.json to $BUILD_ARTIFACTS_DIR"
cp $APP_DIR/src/environments/environment.json $BUILD_ARTIFACTS_DIR

echo "Copy nginx to $BUILD_ARTIFACTS_DIR"
cp $BUILD_DIR/nginx.common.conf $BUILD_ARTIFACTS_DIR
cp $BUILD_DIR/nginx.default.conf $BUILD_ARTIFACTS_DIR

echo "Create deploy.sh script in $BUILD_ARTIFACTS_DIR"
gomplate -f $DEPLOY_DIR/deploy.sh -o $BUILD_ARTIFACTS_DIR/deploy.sh
chmod a+x $BUILD_ARTIFACTS_DIR/deploy.sh

echo "Create set-deploy-vars.sh script in $BUILD_ARTIFACTS_DIR"
cp $DEPLOY_DIR/set-deploy-vars.sh $BUILD_ARTIFACTS_DIR
chmod a+x $BUILD_ARTIFACTS_DIR/set-deploy-vars.sh

if [ "$BUILD_SOURCEBRANCHNAME" = "master" -o "$BUILD_FORCE_DEPLOY" = "true" ]
then
    gcloud auth configure-docker
    gcloud config list account --format "value(core.account)"
    gcloud auth list
    gcloud config set core/account azure-devops-build-agent@gaia-devops.iam.gserviceaccount.com
    gcloud config list account --format "value(core.account)"

    # Create Docker image
    echo Build docker and publish
    DOCKER_IMAGE=gcr.io/$GCLOUD_PROJECT/$BUILD_DEFINITIONNAME:$BUILD_SOURCEBRANCHNAME-$BUILD_BUILDNUMBER
    echo "Create Docker image: $DOCKER_IMAGE"
    docker build -f $BUILD_DIR/dist.Dockerfile -t $DOCKER_IMAGE .

    # Push the docker image
    echo "Push image $DOCKER_IMAGE"
    docker push $DOCKER_IMAGE
fi

