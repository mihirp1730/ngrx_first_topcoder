#!/bin/bash

set -e

# Release name to lowercase
RELEASENAME="${RELEASE_RELEASENAME,,}"
echo "- RELEASE_NAME = $RELEASENAME"
echo "##vso[task.setvariable variable=RELEASE_NAME]$RELEASENAME" 

# Release description
echo "- RELEASE_DESCRIPTION = ${RELEASE_RELEASEDESCRIPTION}"
echo "##vso[task.setvariable variable=RELEASE_DESCRIPTION]${RELEASE_RELEASEDESCRIPTION}" 

if [ -n "$CLUSTERPATH" ]
then
   # $CLUSTERPATH is specified if url route to cluster has a path
   # set to path without leading or training slash, e.g. cluster1 or cluster1/path1
   
   if [ "$PRIVATE_DEPLOY" = "true" ]
   then
      DEPLOYMENTID=-$RELEASENAME
      APPPATH_NOLEADSLASH=${CLUSTERPATH}/$RELEASENAME
   else
      APPPATH_NOLEADSLASH=${CLUSTERPATH}
   fi
else
   if [ "$PRIVATE_DEPLOY" = "true" ]
   then
      DEPLOYMENTID=-$RELEASENAME
      APPPATH_NOLEADSLASH=$RELEASENAME
   fi
fi

if [ -n "$APPPATH_NOLEADSLASH" ]
then
   APPPATH=/$APPPATH_NOLEADSLASH
fi

echo "Deployment vars:"
if [ -n "$DEPLOYMENTID" ]
then
   echo "- Deployment Id = $DEPLOYMENTID"
   echo "##vso[task.setvariable variable=DEPLOYMENTID]$DEPLOYMENTID" 
fi

if [ -n "$APPPATH" ]
then
   echo "- Application path = $APPPATH"
   echo "##vso[task.setvariable variable=APPPATH_NOLEADSLASH]$APPPATH_NOLEADSLASH" 
   echo "##vso[task.setvariable variable=APPPATH]$APPPATH" 
fi

if [ "$PRIVATE_DEPLOY" = "true" ]
then
   # REQUESTED_FOR label for private builds. Replace space with . as labels don't allow spaces
   REQUESTED_FOR=${RELEASE_REQUESTEDFOR// /.}
   echo "- REQUESTED_FOR = $REQUESTED_FOR"
   echo "##vso[task.setvariable variable=REQUESTED_FOR]$REQUESTED_FOR" 
fi


