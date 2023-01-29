#!/bin/bash

if [ -n "$1" ]
then
   export APP_KEY=$1
fi

if [ -n "$2" ]
then
   export SPLITIO_KEY=$2
fi

if [ -n "$3" ]
then
   export SPLITIO_NODEJS_KEY=$3
fi

{{$definitionName := getenv "BUILD_DEFINITIONNAME" -}}
{{$sourceBranchName := getenv "BUILD_SOURCEBRANCHNAME" -}}
{{$buildNumber := getenv "BUILD_BUILDNUMBER" -}}

set -e

BUILD_DEFINITIONNAME={{$definitionName}}
BUILD_SOURCEBRANCHNAME={{$sourceBranchName}}
BUILD_BUILDNUMBER={{$buildNumber}}
SCRIPT_DIR=$(dirname $0)

echo "Deployment parameters:"
echo "- Build definition = $BUILD_DEFINITIONNAME"
echo "- Build source branch = $BUILD_SOURCEBRANCHNAME"
echo "- Build number = $BUILD_BUILDNUMBER"
if [ -n "$DEPLOYMENTID" ]
then
   echo "- Deployment Id = $DEPLOYMENTID"
fi
if [ -n "$APPPATH" ]
then
   echo "- Application path = $APPPATH"
fi
if [ -n "$REQUESTED_FOR" ]
then
   echo "- Requested for = $REQUESTED_FOR"
fi
echo "- Directory = $SCRIPT_DIR"
echo "- Zone = $CLOUDSDK_COMPUTE_ZONE"
echo "- Project = $GCLOUD_PROJECT"
echo "- Cluster = $CONTAINER_CLUSTER"

# Replace env variables with deployment specific settings
envsubst < $SCRIPT_DIR/deployment.yaml > $SCRIPT_DIR/deployment.tmp
mv $SCRIPT_DIR/deployment.tmp $SCRIPT_DIR/deployment.yaml
envsubst < $SCRIPT_DIR/service.yaml > $SCRIPT_DIR/service.tmp
mv $SCRIPT_DIR/service.tmp $SCRIPT_DIR/service.yaml
envsubst < $SCRIPT_DIR/secrets.yaml > $SCRIPT_DIR/secrets.tmp
mv $SCRIPT_DIR/secrets.tmp $SCRIPT_DIR/secrets.yaml
if [ -f $SCRIPT_DIR/ingress.yaml ]
then
   envsubst < $SCRIPT_DIR/ingress.yaml > $SCRIPT_DIR/ingress.tmp
   mv $SCRIPT_DIR/ingress.tmp $SCRIPT_DIR/ingress.yaml
fi

envsubst '${DEPLOYMENTID} ${GCLOUD_PROJECT} ${AUTH_ISSUER} ${AUTH_JWK_URI} ${AUTH_CLIENT_ID} ${CONTAINER_CLUSTER}' < $SCRIPT_DIR/swagger.yaml > $SCRIPT_DIR/swagger.tmp
mv $SCRIPT_DIR/swagger.tmp $SCRIPT_DIR/swagger.yaml
gcloud endpoints services deploy --project=$GCLOUD_PROJECT $SCRIPT_DIR/swagger.yaml

# Get Kubernetes credentials
echo "Get Kubernetes credentials for $CONTAINER_CLUSTER in project $GCLOUD_PROJECT and zone $CLOUDSDK_COMPUTE_ZONE"
gcloud container clusters get-credentials $CONTAINER_CLUSTER --project=$GCLOUD_PROJECT --zone=$CLOUDSDK_COMPUTE_ZONE

kubectl delete --namespace=$KUBE_NAMESPACE -f $SCRIPT_DIR/secrets.yaml --ignore-not-found
kubectl create --namespace=$KUBE_NAMESPACE -f $SCRIPT_DIR/secrets.yaml
kubectl apply --namespace=$KUBE_NAMESPACE -f $SCRIPT_DIR/service.yaml
kubectl apply --namespace=$KUBE_NAMESPACE -f $SCRIPT_DIR/deployment.yaml
if [ -f $SCRIPT_DIR/ingress.yaml ]
then
   kubectl apply --namespace=$KUBE_NAMESPACE -f $SCRIPT_DIR/ingress.yaml
fi

echo "Retagging container image after deployment"
CURRENT_TAG=$BUILD_SOURCEBRANCHNAME-$BUILD_BUILDNUMBER
echo $CURRENT_TAG
gcloud container images add-tag gcr.io/gaia-devops/$BUILD_DEFINITIONNAME:$CURRENT_TAG gcr.io/gaia-devops/$BUILD_DEFINITIONNAME:$ENVIRONMENT --quiet
