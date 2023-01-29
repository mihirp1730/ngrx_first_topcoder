import { IOpportunity } from '@apollo/app/services/opportunity';
import { v4 as uuid } from 'uuid';

import * as opportunitySelectors from './opportunity.selectors';

describe('state selectors', () => {
  describe('selectCreation', () => {
    it('should select creationDetails', () => {
      const state = {
        creation: {
          details: {
            isDetailsValid: true,
            opportunityName: 'test',
            opportunityType: 'Public' as any
          }
        }
      };
      const selection = opportunitySelectors.selectCreation.projector(state);
      expect(selection.details).toBe(state.creation.details);
    });
  });

  describe('selectCreationDetails', () => {
    it('should select creation details from the provided state', () => {
      const state = {
        details: {
          isDetailsValid: true,
          opportunityName: 'test',
          opportunityType: 'Public' as any
        }
      };
      const selection = opportunitySelectors.selectCreationDetails.projector(state);
      expect(selection.isDetailsValid).toBeTruthy();
    });
  });

  describe('selectCreationIsDetailsValid', () => {
    it('should select IsDetailsValid from provided state', () => {
      const state = {
        isDetailsValid: true
      };
      const selection = opportunitySelectors.selectCreationIsDetailsValid.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe(' selectCreationIsOpenInfoValid', () => {
    it('should select IsOpenInfoValid from provided state', () => {
      const state = {
        isOpenInfoValid: true
      };
      const selection = opportunitySelectors.selectCreationIsOpenInfoValid.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe(' selectCreationIsConfidentialInfoValid', () => {
    it('should select IsConfidentialInfoValid from provided state', () => {
      const state = {
        isConfidentialInfoValid: true
      };
      const selection = opportunitySelectors.selectCreationIsConfidentialInfoValid.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('selectCreationDetailsProfile', () => {
    it('should select creation details profile from the provided state', () => {
      const description = 'test';
      const state = {
        isDetailsValid: true,
        opportunityName: 'test',
        opportunityType: 'Public' as any,
        profile: {
          overview: description
        }
      };
      const selection = opportunitySelectors.selectCreationDetailsProfile.projector(state);
      expect(selection.overview).toBe(description);
    });
  });
  describe('selectCreationDetailsConfidentialProfile', () => {
    it('should select creation details confidential profile from the provided state', () => {
      const description = 'testing';
      const state = {
        isValid: true,
        opportunityName: 'test',
        opportunityType: 'Public' as any,
        confidentialProfile: {
          overview: description
        }
      };
      const selection = opportunitySelectors.selectCreationDetailsConfidentialProfile.projector(state);
      expect(selection.overview).toBe(description);
    });
  });
  describe('selectIsLoadingWhileCreating', () => {
    it('should select isLoadingWhileCreating from the provided state', () => {
      const state = { isLoadingWhileCreating: true };
      const selection = opportunitySelectors.selectIsLoadingWhileCreating.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('selectIsLoadingWhileCreating', () => {
    it('should select isLoadingWhileCreating from the provided state', () => {
      const state = { isLoadingWhileCreating: true };
      const selection = opportunitySelectors.selectIsLoadingWhileCreating.projector(state);
      expect(selection).toBeTruthy();
    });
  });
  describe('selectIsOpportunitySaved', () => {
    it('should select isOpportunitySaved from the provided state', () => {
      const state = { isOpportunitySaved: true };
      const selection = opportunitySelectors.selectIsOpportunitySaved.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('selectSavedOpportunityTimeStamp', () => {
    it('should select savedOpportunityTimeStamp from the provided state', () => {
      const state = { savedOpportunityTimeStamp: true };
      const selection = opportunitySelectors.selectSavedOpportunityTimeStamp.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('lastModifiedTimeStamp', () => {
    it('should select lastModifiedTimeStamp from the saved opportunity', () => {
      const state = { opportunity: { lastModifiedDate: '2022-08-30T11:09:10.339Z' } };
      const selection = opportunitySelectors.lastModifiedTimeStamp.projector(state);
      expect(selection).toBe('2022-08-30T11:09:10.339Z');
    });
  });
  describe('selectOpportunity', () => {
    it('should select created opportunity from the provided state', () => {
      const state: IOpportunity = {
        opportunityId: uuid(),
        opportunityName: 'test',
        opportunityType: 'Public' as any
      };
      const selection = opportunitySelectors.selectOpportunity.projector({ opportunity: state });
      expect(selection.opportunityName).toBe('test');
    });
  });
  describe('selectCreatedOpportunityId', () => {
    it('should select created opportunity Id from the provided state', () => {
      const opportunityId = uuid();
      const state: IOpportunity = {
        opportunityId,
        opportunityName: 'test',
        opportunityType: 'Public' as any
      };
      const selection = opportunitySelectors.selectCreatedOpportunityId.projector({ opportunity: state });
      expect(selection).toBe(opportunityId);
    });
  });

  describe('selectCreationIsAssetShapeValid', () => {
    it('should select asset shape validity from the provided state', () => {
      const details = {
        isAssetShapeValid: true
      };
      const selection = opportunitySelectors.selectCreationIsAssetShapeValid.projector(details);
      expect(selection).toBe(true);
    });
  });

  describe('selectCreationIsAssetShapeValid', () => {
    it('should select if opportunity is published from the provided state', () => {
      const opportunity = {
        isOpportunityPublished: true
      };
      const selection = opportunitySelectors.selectIsOpportunityPublished.projector(opportunity);
      expect(selection).toBe(true);
    });
  });

  describe('selectMapRepresentationIds', () => {
    it('should select map representation details from the provided state', () => {
      const assetShapeDetails = [
        {
          type: 'Opportunity',
          fileName: 'test-file',
          fileId: 'test-id',
          mapRepresentationId: uuid()
        }
      ];
      const state = {
        assetShapeDetails: assetShapeDetails
      };
      const selection = opportunitySelectors.selectMapRepresentationDetails.projector(state);
      expect(selection).toEqual(expect.objectContaining(assetShapeDetails));
    });
    it('should deduce map representation ids from the provided state', () => {
      const assetShapeDetails = [
        {
          type: 'Opportunity',
          fileName: 'test-file1',
          fileId: 'test-id1',
          mapRepresentationId: uuid()
        },
        {
          type: 'Opportunity',
          fileName: 'test-file2',
          fileId: 'test-id2',
          mapRepresentationId: uuid()
        }
      ];
      const state = {
        assetShapeDetails: assetShapeDetails
      };
      const selection = opportunitySelectors.deduceMapRepresentationIds.projector(state);
      expect(selection).toHaveLength(2);
    });
  });

  describe('selectPendingOpportunityRequests', () => {
    it('should select Pending Request List provided state', () => {
      const state = {
        pendingRequests: [
          {
            opportunityName: 'test'
          }
        ]
      };
      const selection = opportunitySelectors.selectPendingOpportunityRequests.projector(state);
      expect(selection.length).toBe(1);
    });
  });

  describe('selectApprovedOpportunityRequests', () => {
    it('should select Approved Request List from provided state', () => {
      const state = {
        approvedRequests: [
          {
            opportunityName: 'test'
          }
        ]
      };
      const selection = opportunitySelectors.selectApprovedOpportunityRequests.projector(state);
      expect(selection.length).toBe(1);
    });
  });

  describe('selectRejectedOpportunityRequests', () => {
    it('should select Rejected Request List from provided state', () => {
      const state = {
        rejectedRequests: [
          {
            opportunityName: 'test'
          }
        ]
      };
      const selection = opportunitySelectors.selectRejectedOpportunityRequests.projector(state);
      expect(selection.length).toBe(1);
    });
  });

  describe('selectOpportunityDetails', () => {
    it('should select opportunity details from the provided state', () => {
      const opportunityName = 'test1';
      const state = {
        isDetailsValid: true,
        opportunityName: 'test',
        opportunityType: 'Public' as any,
        opportunityDetails: {
          opportunityName
        }
      };
      const selection = opportunitySelectors.selectOpportunityDetails.projector(state);
      expect(selection.opportunityName).toBe(opportunityName);
    });
  });

  describe('selectOpportunitySubscriptions', () => {
    it('should select opportunity subscriptions from provided state', () => {
      const state = {
        opportunitySubscriptions: [
          {
            opportunityId: 'test 1',
            username: 'user 1',
            opportunityName: 'opp_name_1',
            accessDetails: [
              {
                accessLevel: 'confidential_information'
              },
              {
                accessLevel: 'xyz'
              }
            ]
          }
        ]
      };
      const selection = opportunitySelectors.selectOpportunitySubscriptions.projector(state);
      expect(selection.length).toBe(1);
    });
  });
  describe('selectShowLoader', () => {
    it('should select show loader from provided state', () => {
      const state = {
        showLoader: true
      };
      const selection = opportunitySelectors.selectShowLoader.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('selectOpportunitySubscriptionId', () => {
    it('should select opportunity subscription id from provided state', () => {
      const id = ['test_123'];
      const state = {
        opportunitySubscriptionIds: id
      };
      const selection = opportunitySelectors.selectOpportunitySubscriptionId.projector(state);
      expect(selection).toEqual(id);
    });
  });

  describe('selectIsLoadingWhileCreatingSubscription', () => {
    it('should select is Loading While Creating Subscription from provided state', () => {
      const state = { isLoadingWhileCreatingSubscription: true };
      const selection = opportunitySelectors.selectIsLoadingWhileCreatingSubscription.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('selectIsSubscriptionUpdated', () => {
    it('should select isSubscriptionUpdated from provided state', () => {
      const state = { isSubscriptionUpdated: true };
      const selection = opportunitySelectors.selectIsSubscriptionUpdated.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('selectPublicPublishedOpportunities', () => {
    it('should select selectPublicPublishedOpportunities from provided state', () => {
      const opportunityId = uuid();
      const state: IOpportunity[] = [
        {
          opportunityId,
          opportunityName: 'test',
          opportunityType: 'Public' as any
        }
      ];
      const selection = opportunitySelectors.selectPublicPublishedOpportunities.projector({ publicPublishedOpportunities: state });
      expect(selection.length).toBe(1);
    });
  });

  describe('select profile media', () => {
    it('should select profile media without profile image from provided state', () => {
      const state = {
        opportunity: {
          opportunityProfile: {
            overview: '<p>testfsdfsd</p>',
            media: [
              {
                fileId: 'FL-2S2-7qmtm5hxgjbl-848572273842',
                fileName: 'load-test.jpg',
                fileType: 'image/jpeg',
                caption: '',
                profileImage: true
              }
            ]
          }
        }
      };
      const selection = opportunitySelectors.selectProfileMedia.projector(state);
      expect(selection).toEqual([
        {
          fileId: 'FL-2S2-7qmtm5hxgjbl-848572273842',
          fileName: 'load-test.jpg',
          fileType: 'image/jpeg',
          caption: ''
        }
      ]);
    });
  });

  describe('select confidential profile media', () => {
    it('should select confidential profile media without profile image from provided state', () => {
      const state = {
        opportunity: {
          confidentialOpportunityProfile: {
            overview: '<p>testfsdfsd</p>',
            media: [
              {
                fileId: 'FL-2S2-7qmtm5hxgjbl-848572273842',
                fileName: 'load-test.jpg',
                fileType: 'image/jpeg',
                caption: '',
                profileImage: true
              }
            ]
          }
        }
      };
      const selection = opportunitySelectors.selectConfidentialProfileMedia.projector(state);
      expect(selection).toEqual([
        {
          fileId: 'FL-2S2-7qmtm5hxgjbl-848572273842',
          fileName: 'load-test.jpg',
          fileType: 'image/jpeg',
          caption: ''
        }
      ]);
    });
  });

  describe('deduceIsOpportunityChanged', () => {
    it('should if opprtunity updated after save provided state', () => {
      const state = {
        opportunity: {
          ccusAttributes: {
            expectedSequestration: 0,
            costOfCarbonAbated: 0,
            certifier: 'test',
            lastValidatedOrVerified: ''
          },
          opportunityProfile: {
            overview: '<p>testfsdfsd</p>',
            media: [
              {
                fileId: 'FL-2S2-7qmtm5hxgjbl-848572273842',
                fileName: 'load-test.jpg',
                fileType: 'image/jpeg',
                caption: ''
              }
            ]
          },
          confidentialOpportunityProfile: {
            overview: '<p>testfsdfsd</p>',
            media: [
              {
                fileId: 'FL-2S2-7qmtm5hxgjbl-848572273842',
                fileName: 'load-test.jpg',
                fileType: 'image/jpeg',
                caption: ''
              }
            ]
          }
        },
        creation: {
          draftOpportunity: {
            ccusAttributes: null,
            expectedSequestration: 0,
            costOfCarbonAbated: 0,
            certifier: 'test',
            lastValidatedOrVerified: '',
            opportunityProfile: {
              overview: '<p>testfsdfsd</p>',
              media: [
                {
                  fileId: 'FL-2S2-7qmtm5hxgjbl-848572273842',
                  fileName: 'load-test.jpg',
                  fileType: 'image/jpeg',
                  caption: ''
                }
              ]
            },
            confidentialOpportunityProfile: {
              overview: '<p>testfsdfsd</p>',
              media: [
                {
                  fileId: 'FL-2S2-7qmtm5hxgjbl-848572273842',
                  fileName: 'load-test.jpg',
                  fileType: 'image/jpeg',
                  caption: ''
                }
              ]
            }
          }
        }
      };
      const selection = opportunitySelectors.deduceIsOpportunityChanged.projector(
        state.creation.draftOpportunity,
        state.opportunity,
        state.opportunity.opportunityProfile.media,
        state.opportunity.confidentialOpportunityProfile.media
      );
      expect(selection).toBeFalsy();
    });
  });

  describe('deduceIsOpportunityChanged with less attributes', () => {
    it('should return opportunity canged after save as true', () => {
      const state = {
        opportunity: {
          ccusAttributes: {},
          opportunityProfile: {
            overview: '<p>testfsdfsd</p>',
            media: []
          },
          confidentialOpportunityProfile: {
            overview: '<p>testfsdfsd</p>',
            media: [
              {
                fileId: 'FL-2S2-7qmtm5hxgjbl-848572273842',
                fileName: 'load-test.jpg',
                fileType: 'image/jpeg',
                caption: ''
              }
            ]
          }
        },
        creation: {
          draftOpportunity: {
            certifier: 'test',
            lastValidatedOrVerified: '',
            opportunityProfile: {
              overview: null,
              media: [
                {
                  fileId: 'FL-2S2-7qmtm5hxgjbl-848572273842',
                  fileName: 'load-test.jpg',
                  fileType: 'image/jpeg',
                  caption: ''
                }
              ]
            },
            confidentialOpportunityProfile: {
              overview: '<p>testfsdfsd</p>',
              media: [
                {
                  fileId: 'FL-2S2-7qmtm5hxgjbl-848572273842',
                  fileName: 'load-test.jpg',
                  fileType: 'image/jpeg',
                  caption: ''
                }
              ]
            }
          }
        }
      };
      const selection = opportunitySelectors.deduceIsOpportunityChanged.projector(
        state.creation.draftOpportunity,
        state.opportunity,
        state.opportunity.opportunityProfile.media,
        state.opportunity.confidentialOpportunityProfile.media
      );
      expect(selection).toBeTruthy();
    });
  });
  describe('selectHiddenLayers', () => {
    it('should select hidden layers from provided state', () => {
      const state = [
        {
          hiddenLayers : ["Well"]
        }
      ];
      const selection = opportunitySelectors.selectHiddenLayers.projector({ hiddenLayers: state });
      expect(selection.length).toBe(1);
    });
  });

  describe('selectHiddenMrs', () => {
    it('should select hidden MRs from provided state', () => {
      const state = [
        {
          hiddenMRs : [{
            type: 'Opportunity',
            fileName: 'poly1.zip',
            fileId: 'FL-2S2-luoh020e1mo1-992996316364',
            mapRepresentationId: 'MR-VD7-384772581054',
            hidden: false
          }]
        }
      ];
      const selection = opportunitySelectors.selectHiddenMRs.projector({ hiddenMRs: state });
      expect(selection.length).toBe(1);
    });
  });
});
