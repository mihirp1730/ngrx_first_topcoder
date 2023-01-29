import { IOpportunity, IOpportunityRequest, IOppSubscription, OpportunityType } from '@apollo/app/services/opportunity';
import { v4 as uuid } from 'uuid';

import * as opportunityActions from '../actions/opportunity.actions';
import { initialState } from '../opportunity.state';
import { opportunityReducer } from './opportunity.reducer';

describe('OpportunityReducer', () => {
  describe('createIsDetailsValidChanged', () => {
    it('should return isDetailsValid as true', () => {
      const action = opportunityActions.createIsDetailsValidChanged({ isDetailsValid: true });
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.isDetailsValid).toBeTruthy();
    });
  });
  describe('createIsOpenInfoValidChanged', () => {
    it('should return isOpenInfoValid as true', () => {
      const action = opportunityActions.createIsOpenInfoValidChanged({ isOpenInfoValid: true });
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.isOpenInfoValid).toBeTruthy();
    });
  });
  describe('createIsConfidentialInfoValidChanged', () => {
    it('should return isConfidentialInfoValid as true', () => {
      const action = opportunityActions.createIsConfidentialInfoValidChanged({ isConfidentialInfoValid: true });
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.isConfidentialInfoValid).toBeTruthy();
    });
  });
  describe('createOpportunityNameChanged', () => {
    it('should return opportunityName as test', () => {
      const action = opportunityActions.createOpportunityNameChanged({ opportunityName: 'test' });
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.opportunityName).toBe('test');
    });
  });
  describe('createOpportunityTypeChanged', () => {
    it('should return opportunityName as test', () => {
      const action = opportunityActions.createOpportunityTypeChanged({ opportunityType: 'Public' as any });
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.opportunityType).toBe('Public');
    });
  });

  describe('additionalServicesChanged', () => {
    it('should return additionalServices as true', () => {
      const action = opportunityActions.createIsAdditionalServicesInfoValidChanged({ isAdditionalServicesInfoValid: true });
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.isAdditionalServicesInfoValid).toBeTruthy();
    });
  });
  describe('updateAdditionalServicesChanged', () => {
    it('should return accountName as "test account name"', () => {
      const accountName = 'test account name';
      const details = {
        opportunityVDR: {
          accountName: accountName
        }
      };
      const action = opportunityActions.updateAdditionalServicesChanged(details as any);
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.opportunityVDR.accountName).toBe(accountName);
    });
  });

  describe('updateOpportunityProfileChanged', () => {
    it('should return opportunityName as test', () => {
      const description = 'test 1';
      const details = {
        profile: {
          overview: description,
          media: [
            {
              fileId: 'FL-test',
              fileName: 'load-test.jpg',
              fileType: 'image/jpeg',
              caption: '',
              profileImage: true
            }
          ],
          documents: []
        }
      };
      const action = opportunityActions.updateOpportunityProfileChanged(details as any);
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.profile.overview).toBe(description);
    });
  });

  describe('updateOpportunityConfidentialInfoChanged', () => {
    it('should return opportunityName as test', () => {
      const description = 'testing';
      const details = {
        confidentialProfile: {
          overview: description,
          media: [
            {
              fileId: 'FL-test',
              fileName: 'load-test.jpg',
              fileType: 'image/jpeg',
              caption: '',
              profileImage: true
            }
          ],
          documents: []
        }
      };
      const action = opportunityActions.updateOpportunityConfidentialInfoChanged(details as any);
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.confidentialProfile.overview).toBe(description);
    });
  });

  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = { type: 'Unknown' };
      const state = opportunityReducer(initialState, action);
      expect(state).toBe(initialState);
    });
  });
  describe('createOpportunity', () => {
    it('should return isLoadingWhileCreating as true', () => {
      const action = opportunityActions.createOpportunity();
      const newState = opportunityReducer(initialState, action);
      expect(newState.isLoadingWhileCreating).toBeTruthy();
    });
  });
  describe('createOpportunitySuccess', () => {
    it('should return isOpportunitySaved as true', () => {
      const opportunity: IOpportunity = {
        opportunityId: uuid(),
        opportunityName: 'test',
        opportunityType: 'Public' as any
      };
      const action = opportunityActions.createOpportunitySuccess({ opportunity });
      const newState = opportunityReducer(initialState, action);
      expect(newState.opportunity.opportunityName).toBe('test');
    });
  });
  describe('createOpportunityFail', () => {
    it('should return opportunity as null', () => {
      const action = opportunityActions.createOpportunityFail({ errorMessage: null });
      const newState = opportunityReducer(initialState, action);
      expect(newState.opportunity).toBe(null);
    });
  });

  describe('saveOpportunitySuccess', () => {
    it('should return saveOpportunitySuccess as true', () => {
      const opportunity: IOpportunity = {
        opportunityId: uuid(),
        opportunityName: 'test',
        opportunityType: 'Public' as any,
        countries: ['country']
      };
      const action = opportunityActions.saveOpportunitySuccess({ opportunity });
      const newState = opportunityReducer(initialState, action);
      expect(newState.opportunity.opportunityName).toBe('test');
    });
  });

  describe('saveOpportunityFail', () => {
    it('should return opportunity as null', () => {
      const action = opportunityActions.saveOpportunityFail({ errorMessage: null });
      const newState = opportunityReducer(initialState, action);
      expect(newState.opportunity).toBe(null);
    });
  });

  describe('saveOpportunityProfileFail', () => {
    it('should return opportunity as null', () => {
      const action = opportunityActions.saveOpportunityProfileFail({ errorMessage: null });
      const newState = opportunityReducer(initialState, action);
      expect(newState.opportunity).toBe(null);
    });
  });
  describe('saveOpportunityConfidentialProfileFail', () => {
    it('should return opportunity as null', () => {
      const action = opportunityActions.saveOpportunityConfidentialProfileFail({ errorMessage: null });
      const newState = opportunityReducer(initialState, action);
      expect(newState.opportunity).toBe(null);
    });
  });
  describe('resetOpportunitySaveStatus', () => {
    it('should return isOpportunitySaved as false', () => {
      const action = opportunityActions.resetOpportunitySaveStatus();
      const newState = opportunityReducer(initialState, action);
      expect(newState.isOpportunitySaved).toBeFalsy();
      expect(newState.creation.details.opportunityType).toBeFalsy();
    });
  });


  describe('publishOpportunity', () => {
    it('should return isLoadingWhileCreating as true', () => {
      const action = opportunityActions.publishOpportunity();
      const newState = opportunityReducer(initialState, action);
      expect(newState.isLoadingWhileCreating).toBeTruthy();
    });
  });
  describe('publishOpportunitySuccess', () => {
    it('should return isOpportunityPublished as true', () => {
      const opportunityId = uuid();
      const action = opportunityActions.publishOpportunitySuccess({ opportunityId });
      const newState = opportunityReducer(initialState, action);
      expect(newState.isOpportunityPublished).toBeTruthy();
    });
  });
  describe('publishOpportunityFail', () => {
    it('should return isOpportunityPublished as false', () => {
      const action = opportunityActions.publishOpportunityFail({ errorMessage: null });
      const newState = opportunityReducer(initialState, action);
      expect(newState.isOpportunityPublished).toBeFalsy();
    });
  });

  describe('addMapRepresentation', () => {
    it('should update mapRepresentation details on addMapRepresentation', () => {
      const assetShapeDetails = {
        type: 'Opportunity',
        fileName: 'test-file',
        fileId: 'test-id',
        mapRepresentationId: uuid()
      };
      const action = opportunityActions.addMapRepresentation({mapRepresentation: assetShapeDetails});
      const newState = opportunityReducer(initialState, action);
      expect(newState.assetShapeDetails[0].mapRepresentationId).toBe(assetShapeDetails.mapRepresentationId);
    });

    it('should isAssetShapeValid be true if assetShapeDetails are not null', () => {
      const assetShapeDetails = {
        type: 'Opportunity',
        fileName: 'test-file',
        fileId: 'test-id',
        mapRepresentationId: uuid()
      };
      const action = opportunityActions.addMapRepresentation({mapRepresentation: assetShapeDetails});
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.isAssetShapeValid).toBeTruthy();
    });

    it('should isAssetShapeValid be false if assetShapeDetails are empty', () => {
      const assetShapeDetails = []
      const action = opportunityActions.resetMapRepresentation();
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.isAssetShapeValid).toBeFalsy();
    });
  });

  describe('editOpportunity', () => {
    it('should return isLoadingWhileCreating as true', () => {
      const action = opportunityActions.editOpportunity();
      const newState = opportunityReducer(initialState, action);
      expect(newState.isLoadingWhileCreating).toBeTruthy();
    });
  });
  describe('editOpportunityFail', () => {
    it('should return isLoadingWhileCreating as false', () => {
      const action = opportunityActions.editOpportunityFail({ errorMessage: null });
      const newState = opportunityReducer(initialState, action);
      expect(newState.isLoadingWhileCreating).toBeFalsy();
    });
  });
  describe('getOpportunitySuccess', () => {
    it('should return Opportunity with value', () => {
      const opportunity: IOpportunity = {
        opportunityId: uuid(),
        opportunityName: 'test',
        opportunityType: 'Public' as any,
        countries: ['country'],
        confidentialOpportunityProfile: {
          overview: '<p>test</p>',
          media: [],
          documents: []
        },
        opportunityProfile: {
          overview: '<p>test</p>',
          media: [
            {
              fileId: 'FL-2S2-6jm8527r348l-490450819678',
              fileName: 'load-test.jpg',
              fileType: 'image/jpeg',
              caption: '',
              profileImage: true
            }
          ],
          documents: []
        }
      };
      const action = opportunityActions.getOpportunitySuccess({ opportunity });
      const newState = opportunityReducer(initialState, action);
      expect(newState.opportunity).toBe(opportunity);
      expect(newState.isOpportunitySaved).toBeTruthy();
    });
  });

  describe('getOpportunityRequestListSuccess', () => {
    it('should return Opportunity Request List', () => {
      const opportunityRequests: IOpportunityRequest[] = [{
        opportunityName: 'test',
        opportunityId: 'test123',
        status: 'Pending',
        firstName: 'firstname',
        lastName: 'lastname',
        requestedOn: '05-06-2019',
        requestedBy: 'test@abc.com',
        comment: 'test',
        requestedFor: ['test@abc.com'],
        accessLevels: ['VDR'],
        vendorId: 'test123',
        companyName: 'test'
      },
      {
        opportunityName: 'test',
        opportunityId: 'test123',
        status: 'Approved',
        firstName: 'firstname',
        lastName: 'lastname',
        requestedOn: '05-06-2019',
        requestedBy: 'test@abc.com',
        comment: 'test',
        requestedFor: ['test@abc.com'],
        accessLevels: ['VDR'],
        vendorId: 'test123',
        companyName: 'test'
      },
      {
        opportunityName: 'test',
        opportunityId: 'test123',
        status: 'Rejected',
        firstName: 'firstname',
        lastName: 'lastname',
        requestedOn: '05-06-2019',
        requestedBy: 'test@abc.com',
        comment: 'test',
        requestedFor: ['test@abc.com'],
        accessLevels: ['VDR'],
        vendorId: 'test123',
        companyName: 'test'
      }];
      const action = opportunityActions.getOpportunityRequestListSuccess({ opportunityRequests });
      const newState = opportunityReducer(initialState, action);
      expect(newState.pendingRequests.length).toBe(1);
    });
  });

  describe('updateOpportunityDetails', () => {
    it('should return opportunityName as test', () => {
      const opportunityName = 'test 1';
      const details = {
        opportunityDetails: {
          opportunityName
        }
      };
      const action = opportunityActions.updateOpportunityDetails(details as any);
      const newState = opportunityReducer(initialState, action);
      expect(newState.creation.details.opportunityDetails.opportunityName).toBe(opportunityName);
    });
  });

  describe('getOpportunitySubscriptionListSuccess', () => {
    it('should return isOpportunityPublished as true', () => {
      const opportunitySubscriptions: IOppSubscription[] = [
        {
          opportunityId: "test 1",
          attendeeId: "user 1",
          opportunityName: "opp_name_1",
          opportunitySubscriptionId: "subs_id",
          opportunitySubscriptionRequestId: "subs_req_id",
          firstName: "First name",
          lastName: "Last name",
          companyName: "Test",
          accessDetails: [
            {
              accessLevel: 'confidential_information',
              startDate:"",
              endDate: ""
            }
          ]
        }
      ];
      const action = opportunityActions.getOpportunitySubscriptionsSuccess({ opportunitySubscriptions });
      const newState = opportunityReducer(initialState, action);
      expect(newState.opportunitySubscriptions).toBe(opportunitySubscriptions);
    });
  });

  describe('getOpportunitySubscriptions', () => {
    it('should return show loader as true', () => {
      const action = opportunityActions.getOpportunitySubscriptions();
      const newState = opportunityReducer(initialState, action);
      expect(newState.showLoader).toBeTruthy();
    });
  });

  describe('getOpportunitySubscriptionsFail', () => {
    it('should return show loader as false', () => {
      const action = opportunityActions.getOpportunitySubscriptionsFail({ errorMessage: 'Something went wrong!'});
      const newState = opportunityReducer(initialState, action);
      expect(newState.showLoader).toBeFalsy();
    });
  });

  describe('createOpportunitySubscription', () => {
    it('should return show loader as true', () => {
      const action = opportunityActions.createOpportunitySubscription({} as any);
      const newState = opportunityReducer(initialState, action);
      expect(newState.isLoadingWhileCreatingSubscription).toBeTruthy();
    });
  });

  describe('createOpportunitySubscriptionSuccess', () => {
    it('should return show loader as true', () => {
      const opportunitySubscriptionIds = [uuid()];
      const subscriptionRequestId = uuid();
      const action = opportunityActions.createOpportunitySubscriptionSuccess({ opportunitySubscriptionIds });
      const newState = opportunityReducer(initialState, action);
      expect(newState.opportunitySubscriptionIds).toEqual(opportunitySubscriptionIds);
    });
  });

  describe('createOpportunitySubscriptionFail', () => {
    it('should return show loader as false', () => {
      const action = opportunityActions.createOpportunitySubscriptionFail({} as any);
      const newState = opportunityReducer(initialState, action);
      expect(newState.isLoadingWhileCreatingSubscription).toBeFalsy();
    });
  });

  describe('rejectOpportunityRequest', () => {
    it('should return show loader as true', () => {
      const action = opportunityActions.rejectOpportunityRequest({} as any);
      const newState = opportunityReducer(initialState, action);
      expect(newState.showLoader).toBeTruthy();
    });
  });

  describe('rejectOpportunityRequestSuccess', () => {
    it('should return isOpportunityRequestRejected as true', () => {
      const subscriptionRequestId = uuid();
      const action = opportunityActions.rejectOpportunityRequestSuccess({ subscriptionRequestId });
      const newState = opportunityReducer(initialState, action);
      expect(newState.isOpportunityRequestRejected).toBeTruthy();
    });
  });

  describe('rejectOpportunityRequestFail', () => {
    it('should return showLoader as false', () => {
      const action = opportunityActions.rejectOpportunityRequestFail({} as any);
      const newState = opportunityReducer(initialState, action);
      expect(newState.showLoader).toBeFalsy();
    });
  });

  describe('updateOpportunitySubscription', () => {
    it('should return show loader as true', () => {
      const action = opportunityActions.updateOpportunitySubscription({} as any);
      const newState = opportunityReducer(initialState, action);
      expect(newState.isLoadingWhileCreatingSubscription).toBeTruthy();
    });
  });
  describe('updateOpportunitySubscriptionSuccess', () => {
    it('should return show loader as true', () => {
      const opportunitySubscriptionId = uuid();
      const action = opportunityActions.updateOpportunitySubscriptionSuccess({ opportunitySubscriptionId });
      const newState = opportunityReducer(initialState, action);
      expect(newState.opportunitySubscriptionIds).toContain(opportunitySubscriptionId);
    });
  });

  describe('updateOpportunitySubscriptionFail', () => {
    it('should return show loader as false', () => {
      const action = opportunityActions.updateOpportunitySubscriptionFail({} as any);
      const newState = opportunityReducer(initialState, action);
      expect(newState.isLoadingWhileCreatingSubscription).toBeFalsy();
    });
  });

  describe('getOpportunitiesSuccess', () => {
    it('should return publish public opportunities as true', () => {
      const opportunities: IOpportunity[] = [{
        opportunityId: uuid(),
        opportunityName: 'Atest',
        opportunityType: 'Public' as any,
      },
      {
        opportunityId: uuid(),
        opportunityName: 'test',
        opportunityType: 'Public' as any,
      }];
      const action = opportunityActions.getOpportunitiesSuccess({opportunities} as any);
      const newState = opportunityReducer(initialState, action);      
      expect(newState.publicPublishedOpportunities).toStrictEqual(opportunities);
    });
  });

  it('should remove subscription id from state', () => {
    const action = opportunityActions.removeSubscriptionId();
    const newState = opportunityReducer(initialState, action);
    expect(newState.opportunitySubscriptionIds).toBe(null);
  })

  describe('update hidden layers', () => {
    it('should add hidden layers', () => {
      initialState.hiddenMRs = [{
        type: 'Opportunity',
        fileName: 'poly1.zip',
        fileId: 'FL-2S2-luoh020e1mo1-992996316364',
        mapRepresentationId: 'MR-VD7-384772581054',
        hidden: false
      }];
      initialState.assetShapeDetails = [{
        type: 'Opportunity',
        fileName: 'test-file',
        fileId: 'test-id',
        mapRepresentationId: 'MR-VD7-384772581054',
      }];
      const action = opportunityActions.addHiddenLayer({layerName: "Well"});
      const newState = opportunityReducer(initialState, action);
      expect(newState.hiddenLayers).toEqual(["Well"]);
    });

    it('should remove hidden layers', () => {
      initialState.hiddenMRs = [{
        type: 'Opportunity',
        fileName: 'poly1.zip',
        fileId: 'FL-2S2-luoh020e1mo1-992996316364',
        mapRepresentationId: 'MR-VD7-384772581054',
        hidden: false
      }];
      initialState.assetShapeDetails = [{
        type: 'Opportunity',
        fileName: 'test-file',
        fileId: 'test-id',
        mapRepresentationId: 'MR-VD7-384772581054',
      }];
      initialState.hiddenLayers = ["Well"];
           const action = opportunityActions.removeHiddenLayer({layerName: "Well"});
      const newState = opportunityReducer(initialState, action);
      expect(newState.hiddenLayers).toEqual([]);
    });
  });

  describe('update hidden MRs', () => {
    it('should add hidden MR', () => {
      initialState.assetShapeDetails = [{
        type: 'Opportunity',
        fileName: 'test-file',
        fileId: 'test-id',
        mapRepresentationId: 'MR-VD7-384772581054',
      }];
      const action = opportunityActions.addHiddenMR({
        mapRepresentation: {
          type: 'Opportunity',
          fileName: 'poly1.zip',
          fileId: 'FL-2S2-luoh020e1mo1-992996316364',
          mapRepresentationId: 'MR-VD7-384772581054',
          hidden: false
        }
      });
      initialState.hiddenMRs = [];
      const newState = opportunityReducer(initialState, action);
      expect(newState.hiddenMRs).toEqual([{
        type: 'Opportunity',
        fileName: 'poly1.zip',
        fileId: 'FL-2S2-luoh020e1mo1-992996316364',
        mapRepresentationId: 'MR-VD7-384772581054',
        hidden: true
      }]);
    });

    it('should remove hidden MR', () => {
      initialState.assetShapeDetails = [{
        type: 'Opportunity',
        fileName: 'test-file',
        fileId: 'test-id',
        mapRepresentationId: 'MR-VD7-384772581054',
      }];
      initialState.hiddenMRs = [{
        type: 'Opportunity',
        fileName: 'poly1.zip',
        fileId: 'FL-2S2-luoh020e1mo1-992996316364',
        mapRepresentationId: 'MR-VD7-384772581054',
        hidden: false
      }];
      const action = opportunityActions.removeHiddenMR({
        mapRepresentation: {
          type: 'Opportunity',
          fileName: 'poly1.zip',
          fileId: 'FL-2S2-luoh020e1mo1-992996316364',
          mapRepresentationId: 'MR-VD7-384772581054',
          hidden: false
        }
      });
      const newState = opportunityReducer(initialState, action);
      expect(newState.hiddenMRs).toEqual([]);
    });
  });
});
