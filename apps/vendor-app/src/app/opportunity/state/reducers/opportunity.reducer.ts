import * as opportunityActions from '../actions/opportunity.actions';

import { IOpportunityState, initialState } from '../opportunity.state';
import { createReducer, on } from '@ngrx/store';

export const opportunityFeatureKey = 'opportunity';

const _opportunityReducer = createReducer(
  initialState,
  on(opportunityActions.createOpportunity, (state): IOpportunityState => {
    return {
      ...state,
      opportunity: null,
      isLoadingWhileCreating: true,
      isOpportunitySaved: false,
      savedOpportunityTimeStamp: null
    };
  }),
  on(opportunityActions.createIsDetailsValidChanged, (state, { isDetailsValid }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          isDetailsValid
        }
      }
    };
  }),
  on(opportunityActions.createIsOpenInfoValidChanged, (state, { isOpenInfoValid }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          isOpenInfoValid
        }
      }
    };
  }),
  on(opportunityActions.createIsAdditionalServicesInfoValidChanged, (state, { isAdditionalServicesInfoValid }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          isAdditionalServicesInfoValid
        }
      }
    };
  }),
  on(opportunityActions.updateAdditionalServicesChanged, (state, { opportunityVDR }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          opportunityVDR: {
            ...state.creation.details.opportunityVDR,
            ...opportunityVDR
          }
        },
        draftOpportunity: {
          ...state.creation.draftOpportunity,
          opportunityVDR: {
            ...state.creation.draftOpportunity?.opportunityVDR,
            ...opportunityVDR
          }
        }
      }
    };
  }),
  on(opportunityActions.additionalServicesChangedSuccess, (state, { opportunityVDR }): IOpportunityState => {
    return {
      ...state,
      isOpportunityReadyToPublish: true,
      isLoadingWhileCreating: false,
      isOpportunitySaved: true,
      savedOpportunityTimeStamp: new Date().toISOString(),
      opportunity: {
        ...state.opportunity,
        opportunityVDR: {
          ...state.opportunity.opportunityVDR,
          ...opportunityVDR
        }
      }
    };
  }),
  on(opportunityActions.createIsConfidentialInfoValidChanged, (state, { isConfidentialInfoValid }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          isConfidentialInfoValid
        }
      }
    };
  }),
  on(opportunityActions.createOpportunityNameChanged, (state, { opportunityName }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          opportunityName
        },
        draftOpportunity: {
          ...state.creation.draftOpportunity,
          opportunityName
        }
      }
    };
  }),
  on(opportunityActions.createOpportunityTypeChanged, (state, { opportunityType }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          opportunityType
        },
        draftOpportunity: {
          ...state.creation.draftOpportunity,
          opportunityType
        }
      }
    };
  }),
  on(opportunityActions.updateOpportunityProfileChanged, (state, { profile }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          profile: {
            ...state.creation.details.profile,
            ...profile
          }
        },
        draftOpportunity: {
          ...state.creation.draftOpportunity,
          opportunityProfile: {
            ...state.creation.draftOpportunity?.opportunityProfile,
            ...profile,
            media: profile?.media
              ? [
                  ...profile.media.map((element) => {
                    const { profileImage, ...media } = element;
                    return media;
                  })
                ]
              : []
          }
        }
      }
    };
  }),
  on(
    opportunityActions.createOpportunitySuccess,
    opportunityActions.saveOpportunitySuccess,
    opportunityActions.saveOpportunityKeyDetailsSuccess,
    (state, { opportunity }): IOpportunityState => {
      return {
        ...state,
        opportunity
      };
    }
  ),
  on(opportunityActions.createOpportunityFail, (state): IOpportunityState => {
    return {
      ...state,
      opportunity: null,
      isLoadingWhileCreating: false,
      isOpportunitySaved: false
    };
  }),
  on(
    opportunityActions.saveOpportunityProfileSuccess,
    opportunityActions.saveOpportunityProfileStepInEdit,
    (state, { profile }): IOpportunityState => {
      return {
        ...state,
        isOpportunitySaved: true,
        savedOpportunityTimeStamp: new Date().toISOString(),
        opportunity: {
          ...state.opportunity,
          opportunityProfile: {
            ...state.opportunity.opportunityProfile,
            ...profile,
            media: profile?.media
              ? [
                  ...profile.media.map((element) => {
                    const { profileImage, ...media } = element;
                    return media;
                  })
                ]
              : []
          }
        }
      };
    }
  ),
  on(
    opportunityActions.saveOpportunityProfileFail,
    opportunityActions.saveOpportunityConfidentialProfileFail,
    opportunityActions.saveOpportunityFail,
    (state): IOpportunityState => {
      return {
        ...state,
        isLoadingWhileCreating: false,
        isOpportunitySaved: false
      };
    }
  ),
  on(opportunityActions.resetOpportunitySaveStatus, (): IOpportunityState => {
    return {
      ...initialState
    };
  }),
  on(opportunityActions.updateOpportunityConfidentialInfoChanged, (state, { confidentialProfile }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          confidentialProfile: {
            ...state.creation.details.confidentialProfile,
            ...confidentialProfile
          }
        },
        draftOpportunity: {
          ...state.creation.draftOpportunity,
          confidentialOpportunityProfile: {
            ...state.creation.draftOpportunity?.confidentialOpportunityProfile,
            ...confidentialProfile,
            media: confidentialProfile?.media
              ? [
                  ...confidentialProfile.media.map((element) => {
                    const { profileImage, ...media } = element;
                    return media;
                  })
                ]
              : []
          }
        }
      }
    };
  }),
  on(
    opportunityActions.saveOpportunityConfidentialProfileSuccess,
    opportunityActions.saveOpportunityConfidentialProfileSuccessEditFlow,
    (state, { confidentialProfile }): IOpportunityState => {
      return {
        ...state,
        isLoadingWhileCreating: true,
        isOpportunitySaved: true,
        savedOpportunityTimeStamp: new Date().toISOString(),
        opportunity: {
          ...state.opportunity,
          confidentialOpportunityProfile: {
            ...state.opportunity.confidentialOpportunityProfile,
            ...confidentialProfile,
            media: confidentialProfile?.media
              ? [
                  ...confidentialProfile.media.map((element) => {
                    const { profileImage, ...media } = element;
                    return media;
                  })
                ]
              : []
          }
        }
      };
    }
  ),
  on(
    opportunityActions.addMapRepresentation,
    (state, { mapRepresentation: { mapRepresentationId, type, fileId, fileName } }): IOpportunityState => {
      return {
        ...state,
        assetShapeDetails: [
          ...state.assetShapeDetails,
          {
            mapRepresentationId,
            type,
            fileId,
            fileName
          }
        ],
        creation: {
          ...state.creation,
          details: {
            ...state.creation.details,
            isAssetShapeValid: state.assetShapeDetails.some((item) => item.type === 'Opportunity') || type === 'Opportunity'
          }
        }
      };
    }
  ),
  on(opportunityActions.replaceMapRepresentations, (state, { mapRepresentations }): IOpportunityState => {
    return {
      ...state,
      assetShapeDetails: mapRepresentations,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          isAssetShapeValid: mapRepresentations.some((item) => item.type === 'Opportunity')
        }
      }
    };
  }),
  on(opportunityActions.deleteMapRepresentation, opportunityActions.deleteMapRepresentationFail, (state): IOpportunityState => {
    return {
      ...state,
      isAssetShapeDeleted: false
    };
  }),
  on(opportunityActions.deleteMapRepresentationSuccess, (state, { mapRepresentationId }): IOpportunityState => {
    const assetShapeDetails = state.assetShapeDetails.filter((item) => item.mapRepresentationId !== mapRepresentationId);
    return {
      ...state,
      isAssetShapeDeleted: true,
      assetShapeDetails,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          isAssetShapeValid: assetShapeDetails.some((item) => item.type === 'Opportunity')
        }
      }
    };
  }),
  on(opportunityActions.resetMapRepresentation, (state): IOpportunityState => {
    return {
      ...state,
      assetShapeDetails: [],
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          isAssetShapeValid: false
        }
      }
    };
  }),
  on(opportunityActions.publishOpportunity, (state): IOpportunityState => {
    return {
      ...state,
      isLoadingWhileCreating: true,
      isOpportunityPublished: false
    };
  }),
  on(opportunityActions.publishOpportunitySuccess, (state): IOpportunityState => {
    return {
      ...state,
      isLoadingWhileCreating: false,
      isOpportunityPublished: true
    };
  }),
  on(opportunityActions.publishOpportunityFail, (state): IOpportunityState => {
    return {
      ...state,
      isLoadingWhileCreating: false,
      isOpportunityPublished: false
    };
  }),
  on(opportunityActions.createIsAssetShapeValidChanged, (state, { isAssetShapeValid }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          isAssetShapeValid
        }
      }
    };
  }),
  on(opportunityActions.getOpportunitySuccess, (state, { opportunity }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        draftOpportunity: opportunity
      },
      opportunity,
      isOpportunitySaved: true
    };
  }),
  on(opportunityActions.editOpportunity, (state): IOpportunityState => {
    return {
      ...state,
      isLoadingWhileCreating: true,
      isOpportunityReadyToPublish: false
    };
  }),
  on(opportunityActions.editOpportunityFail, (state): IOpportunityState => {
    return {
      ...state,
      isLoadingWhileCreating: false
    };
  }),
  on(opportunityActions.getOpportunityRequestList, opportunityActions.getOpportunitySubscriptions, (state): IOpportunityState => {
    return {
      ...state,
      showLoader: true
    };
  }),
  on(opportunityActions.getOpportunityRequestListSuccess, (state, { opportunityRequests }): IOpportunityState => {
    let pending = [];
    let approved = [];
    let rejected = [];
    opportunityRequests.forEach((item) => {
      let opportunity;
      let _item;
      switch (item.status) {
        case 'Pending':
          pending = [...pending, item];
          break;
        case 'Approved':
          approved = [...approved, item];
          break;
        case 'Rejected':
          rejected = [...rejected, item];
          break;
      }
    });
    return {
      ...state,
      pendingRequests: [...pending],
      approvedRequests: [...approved],
      rejectedRequests: [...rejected],
      showLoader: false
    };
  }),
  on(opportunityActions.updateOpportunityDetails, (state, { opportunityDetails }): IOpportunityState => {
    return {
      ...state,
      creation: {
        ...state.creation,
        details: {
          ...state.creation.details,
          opportunityDetails: {
            ...state.creation.details.opportunityDetails,
            ...opportunityDetails
          }
        },
        draftOpportunity: {
          ...state.creation.draftOpportunity,
          ...opportunityDetails
        }
      }
    };
  }),
  on(opportunityActions.getOpportunitySubscriptionsSuccess, (state, { opportunitySubscriptions }): IOpportunityState => {
    return {
      ...state,
      opportunitySubscriptions,
      showLoader: false
    };
  }),
  on(opportunityActions.getOpportunitySubscriptionsFail, opportunityActions.rejectOpportunityRequestFail, (state): IOpportunityState => {
    return {
      ...state,
      showLoader: false
    };
  }),
  on(opportunityActions.createOpportunitySubscription, (state): IOpportunityState => {
    return {
      ...state,
      opportunitySubscriptionIds: [],
      isLoadingWhileCreatingSubscription: true
    };
  }),
  on(opportunityActions.createOpportunitySubscriptionSuccess, (state, { opportunitySubscriptionIds }): IOpportunityState => {
    return {
      ...state,
      opportunitySubscriptionIds,
      isLoadingWhileCreatingSubscription: false
    };
  }),
  on(opportunityActions.createOpportunitySubscriptionFail, (state): IOpportunityState => {
    return {
      ...state,
      opportunitySubscriptionIds: [],
      isLoadingWhileCreatingSubscription: false
    };
  }),
  on(opportunityActions.rejectOpportunityRequest, (state): IOpportunityState => {
    return {
      ...state,
      showLoader: true,
      isOpportunityRequestRejected: false
    };
  }),
  on(opportunityActions.rejectOpportunityRequestSuccess, (state, { subscriptionRequestId }): IOpportunityState => {
    let requestIndex;
    const request = state.pendingRequests.filter((pendingRequest, index) => {
      if (pendingRequest.subscriptionRequestId === subscriptionRequestId) {
        requestIndex = index;
        return pendingRequest;
      }
    });
    return {
      ...state,
      pendingRequests: [...state.pendingRequests.slice(0, requestIndex), ...state.pendingRequests.slice(requestIndex + 1)],
      rejectedRequests: [...request, ...state.rejectedRequests],
      isOpportunityRequestRejected: true,
      showLoader: false
    };
  }),
  on(opportunityActions.updateOpportunitySubscription, (state): IOpportunityState => {
    return {
      ...state,
      opportunitySubscriptionIds: [],
      isLoadingWhileCreatingSubscription: true,
      isSubscriptionUpdated: false
    };
  }),
  on(opportunityActions.updateOpportunitySubscriptionSuccess, (state, { opportunitySubscriptionId }): IOpportunityState => {
    return {
      ...state,
      opportunitySubscriptionIds: [opportunitySubscriptionId],
      isSubscriptionUpdated: true,
      isLoadingWhileCreatingSubscription: false
    };
  }),
  on(opportunityActions.updateOpportunitySubscriptionFail, (state): IOpportunityState => {
    return {
      ...state,
      isLoadingWhileCreatingSubscription: false
    };
  }),
  on(opportunityActions.getOpportunitiesSuccess, (state, { opportunities }): IOpportunityState => {
    const sortedOpportunities = [...opportunities].sort((firstValue, secondValue) =>
      firstValue.opportunityName.toLowerCase() > secondValue.opportunityName.toLowerCase() ? 1 : -1
    );
    return {
      ...state,
      publicPublishedOpportunities: sortedOpportunities
    };
  }),
  on(opportunityActions.removeSubscriptionId, (state): IOpportunityState => {
    return {
      ...state,
      opportunitySubscriptionIds: null
    };
  }),
  on(opportunityActions.addHiddenLayer, (state, { layerName }): IOpportunityState => {
    let typeToCheck;
    if (layerName === 'Seismic 2D Line') {
      typeToCheck = 'Seismic2dSurvey';
    }
    return {
      ...state,
      hiddenLayers: [...state.hiddenLayers, layerName],
      hiddenMRs: [
        ...state.hiddenMRs,
        ...state.assetShapeDetails.filter(
          (mr) =>
            (mr.type.toLowerCase() === layerName.split(' ').join('').toLowerCase() || mr.type === typeToCheck) &&
            state.hiddenMRs.findIndex((hiddenMr) => hiddenMr.mapRepresentationId === mr.mapRepresentationId) === -1
        )
      ],
      assetShapeDetails: state.assetShapeDetails
        .map((opp) => ({ ...opp }))
        .map((e) => {
          if (e.type.toLowerCase() === layerName.split(' ').join('').toLowerCase() || e.type === typeToCheck) {
            e.hidden = true;
          }
          return e;
        }),
      isGlobalVisible: state.assetShapeDetails
        .map((opp) => ({ ...opp }))
        .map((e) => {
          if (e.type.toLowerCase() === layerName.split(' ').join('').toLowerCase() || e.type === typeToCheck) {
            e.hidden = true;
          }
          return e;
        })
        .filter((mr) => mr.hidden === undefined || mr.hidden === false).length
        ? true
        : false
    };
  }),
  on(opportunityActions.removeHiddenLayer, (state, { layerName }): IOpportunityState => {
    let typeToCheck;
    if (layerName === 'Seismic 2D Line') {
      typeToCheck = 'Seismic2dSurvey';
    }
    return {
      ...state,
      hiddenLayers: state.hiddenLayers.filter((layer) => layer !== layerName),
      hiddenMRs: [
        ...state.hiddenMRs.filter((mr) => mr.type.toLowerCase() !== layerName.split(' ').join('').toLowerCase() && mr.type !== typeToCheck)
      ],
      assetShapeDetails: state.assetShapeDetails
        .map((opp) => ({ ...opp }))
        .map((e) => {
          if (e.type.toLowerCase() === layerName.split(' ').join('').toLowerCase() || e.type === typeToCheck) {
            e.hidden = false;
          }
          return e;
        }),
      isGlobalVisible: true
    };
  }),
  on(opportunityActions.addHiddenMR, (state, { mapRepresentation }): IOpportunityState => {
    return {
      ...state,
      assetShapeDetails: state.assetShapeDetails
        .map((opp) => ({ ...opp }))
        .map((e) => {
          if (e.mapRepresentationId === mapRepresentation.mapRepresentationId) {
            e.hidden = true;
          }
          return e;
        }),
      hiddenMRs: [...state.hiddenMRs, { ...mapRepresentation, hidden: true }],
      isGlobalVisible: state.assetShapeDetails.filter(
        (mr) => mr.hidden === false && mr.mapRepresentationId !== mapRepresentation.mapRepresentationId
      ).length
        ? true
        : false
    };
  }),
  on(opportunityActions.removeHiddenMR, (state, { mapRepresentation }): IOpportunityState => {
    let typeToCheck;
    if (mapRepresentation.type === 'Seismic2dSurvey') {
      typeToCheck = 'Seismic 2D Line';
    }
    return {
      ...state,
      hiddenLayers: state.hiddenLayers.filter(
        (layer) => layer.split(' ').join('').toLowerCase() !== mapRepresentation.type.toLowerCase() && layer !== typeToCheck
      ),
      assetShapeDetails: state.assetShapeDetails
        .map((opp) => ({ ...opp }))
        .map((e) => {
          if (e.mapRepresentationId === mapRepresentation.mapRepresentationId) {
            e.hidden = false;
          }
          return e;
        }),
      hiddenMRs: [...state.hiddenMRs.filter((mr) => mr.mapRepresentationId !== mapRepresentation.mapRepresentationId)],
      isGlobalVisible: true
    };
  }),
  on(opportunityActions.showAllLayers, (state): IOpportunityState => {
    return {
      ...state,
      hiddenLayers: [],
      hiddenMRs: [],
      isGlobalVisible: true,
      assetShapeDetails: state.assetShapeDetails
        .map((opp) => ({ ...opp }))
        .map((e) => {
          e.hidden = false;
          return e;
        })
    };
  }),
  on(opportunityActions.hideAllLayers, (state): IOpportunityState => {
    const typesMapping = {
      Seismic3dSurvey: 'Seismic 3D Survey',
      Seismic2dSurvey: 'Seismic 2D Line'
    };
    return {
      ...state,
      isGlobalVisible: false,
      hiddenLayers: state.assetShapeDetails
        .map((opp) => ({ ...opp }))
        .map((e) => {
          e.hidden = true;
          return typesMapping[e.type] || e.type;
        }),
      hiddenMRs: state.assetShapeDetails
        .map((opp) => ({ ...opp }))
        .map((e) => {
          e.hidden = true;
          return e;
        }),
      assetShapeDetails: state.assetShapeDetails
        .map((opp) => ({ ...opp }))
        .map((e) => {
          e.hidden = true;
          return e;
        })
    };
  })
);

export function opportunityReducer(state, action) {
  return _opportunityReducer(state, action);
}
