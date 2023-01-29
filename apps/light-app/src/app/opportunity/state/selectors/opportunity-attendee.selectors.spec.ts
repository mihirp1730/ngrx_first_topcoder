import { IOpportunitiesDetails } from '@apollo/app/services/opportunity-attendee';

import * as opportunityAttendeeSelectors from './opportunity-attendee.selectors';

describe('state selectors', () => {
  describe('selectOpportunities', () => {
    it('should select selectOpportunities from the provided state', () => {
      const state: IOpportunitiesDetails[] = [
        {
          opportunityId: 'idTest',
          opportunityName: 'test 1',
          opportunityType: 'Public' as any
        }
      ] as any;
      const selection = opportunityAttendeeSelectors.selectOpportunities.projector({ opportunities: state });
      expect(selection[0].opportunityName).toBe('test 1');
    });
  });
  describe('selectOpportunityById', () => {
    it('should select a single selectOpportunity from provided Id', () => {
      const opportunityId = 'testId';
      const state: IOpportunitiesDetails[] = [
        {
          opportunityId: opportunityId,
          opportunityName: 'test 1',
          opportunityType: 'Public' as any
        },
        {
          opportunityId: 'someOtherId',
          opportunityName: 'test 2',
          opportunityType: 'Public' as any
        }
      ] as any;
      const selection = opportunityAttendeeSelectors.selectOpportunityById({ opportunityId }).projector([...state]);
      expect(selection).toBe(state[0]);
    });
  });
  describe('select VDR Details By Id', () => {
    it('should select a vdr details by the given id', () => {
      const opportunityId = 'testId';
      const state = {
        opportunityId: 'testId',
        opportunityName: 'oppo-name-1',
        opportunityType: 'Public' as any,
        opportunityStatus: 'Pending',
        countries: [],
        opportunityProfile: {},
        confidentialOpportunityProfile: {},
        dataVendorId: 'vendor-id-1',
        vendorProfile: {},
        opportunityVDR: {
          opportunityVDRId: 'vdr-id',
          accountName: 'account-name',
          departmentName: 'dept-name',
          vdrLink: 'http:test-lnk',
          hasAccess: true
        },
        requests: [],
        subscriptions: []
      };
      const selection = opportunityAttendeeSelectors.selectOpportunityVDR({ opportunityId }).projector(state);
      expect(selection).toBe(state.opportunityVDR);
    });
  });
  describe('select VDR Request By Id', () => {
    it('should select a single request by the given id', () => {
      const opportunityId = 'testId';
      const state = {
        opportunityId: 'testId',
        opportunityName: 'oppo-name-1',
        opportunityType: 'Public' as any,
        opportunityStatus: 'Pending',
        countries: [],
        opportunityProfile: {},
        confidentialOpportunityProfile: {},
        dataVendorId: 'vendor-id-1',
        vendorProfile: {},
        requests: [
          {
            accessLevels: ['CONFIDENTIAL_INFORMATION', 'VDR'],
            opportunityId: 'testId',
            opportunityName: 'oppo-name-1',
            requestStatus: 'Pending',
            requestedOn: '2022-05-06T05:15:42.384Z',
            subscriptionRequestId: 'subs-id-1',
            vendorId: 'vendor-id-1'
          }
        ]
      };
      const selection = opportunityAttendeeSelectors.selectOpportunityVDRRequests({ opportunityId }).projector(state);
      expect(selection[0]).toBe(state.requests[0]);
    });
  });
  describe('select VDR Subscription By Id', () => {
    it('should select a single subscription by the given id', () => {
      const opportunityId = 'testId2';
      const state = {
        opportunityId: 'testId2',
        opportunityName: 'oppo-name-2',
        opportunityType: 'Public' as any,
        opportunityStatus: 'Pending',
        countries: [],
        opportunityProfile: {},
        confidentialOpportunityProfile: {},
        dataVendorId: 'vendor-id-1',
        vendorProfile: {},
        requests: [],
        subscriptions: [
          {
            accessDetails: [{ startDate: '2022-05-03T18:30Z', endDate: '2022-05-05T18:30Z', accessLevel: 'VDR', accessStatus: 'Approved' }],
            approvedBy: 'approver-2',
            approvedOn: '5/2/22, 11:12 AM',
            opportunityId: 'testId2',
            opportunityName: 'oppo-name-2',
            subscriptionId: 'subs-id-2',
            subscriptionRequestId: null,
            vendorId: 'vendor-id-2'
          }
        ]
      };
      const selection = opportunityAttendeeSelectors.selectOpportunityVDRSubscription({ opportunityId }).projector(state);
      expect(selection[0]).toBe(state.subscriptions[0]);
    });
  });
  describe('select Confidential Info Request Details By Id', () => {
    it('should select a Confidential Info details by the given id', () => {
      const opportunityId = 'testIdR1';
      const state = {
        opportunityId: 'testIdR1',
        opportunityName: 'oppo-name-R1',
        opportunityType: 'Public' as any,
        opportunityStatus: 'Pending',
        countries: [],
        opportunityProfile: {},
        confidentialOpportunityProfile: {},
        dataVendorId: 'vendor-id-1',
        vendorProfile: {},
        opportunityVDR: {
          opportunityVDRId: 'vdr-id',
          accountName: 'account-name',
          departmentName: 'dept-name',
          vdrLink: 'http:test-lnk',
          hasAccess: true
        },
        requests: [
          {
            subscriptionRequestId: 'sub-request-id',
            opportunityId: 'testIdR1',
            opportunityName: 'oppo-name-R1',
            requestedOn: '',
            requestStatus: 'Pending',
            accessLevels: ['CONFIDENTIAL_INFORMATION'],
            vendorId: '',
            vendorProfile: '',
            opportunityStatus: ''
          }
        ],
        subscriptions: []
      };
      const selection = opportunityAttendeeSelectors.selectOpportunityCIRequest({ opportunityId }).projector(state);
      expect(selection).toEqual(state.requests);
    });
  });

  describe('select Confidential Info Subscription Details By Id', () => {
    it('should select a Confidential Info details by the given id', () => {
      const opportunityId = 'testIdS1';
      const state = {
        opportunityId: 'testIdS1',
        opportunityName: 'oppo-name-S1',
        opportunityType: 'Public' as any,
        opportunityStatus: 'Pending',
        countries: [],
        opportunityProfile: {},
        confidentialOpportunityProfile: {},
        dataVendorId: 'vendor-id-1',
        vendorProfile: {},
        opportunityVDR: {
          opportunityVDRId: 'vdr-id',
          accountName: 'account-name',
          departmentName: 'dept-name',
          vdrLink: 'http:test-lnk',
          hasAccess: true
        },
        requests: [],
        subscriptions: [
          {
            vendorId: 'vendor-id-1',
            subscriptionId: 'sub-id-1',
            subscriptionRequestId: 'sub-req-id-1',
            opportunityId: 'testIdS1',
            opportunityName: 'oppo-name-S1',
            requestedOn: '',
            status: '',
            approvedBy: 'test',
            approvedOn: '',
            accessDetails: [
              {
                accessLevel: 'CONFIDENTIAL_INFORMATION',
                status: 'Approved'
              }
            ],
            vendorProfile: '',
            opportunityStatus: ''
          }
        ]
      };
      const selection = opportunityAttendeeSelectors.selectOpportunityCISubscription({ opportunityId }).projector(state);
      expect(selection).toEqual(state.subscriptions);
    });
  });

  describe('selectShowRequestLoader', () => {
    it('should select show request loader from provided state', () => {
      const state = {
        showRequestLoader: true
      };
      const selection = opportunityAttendeeSelectors.selectShowRequestLoader.projector(state);
      expect(selection).toBeTruthy();
    });
  });

  describe('selectShowSubscriptionLoader', () => {
    it('should select show subscription loader from provided state', () => {
      const state = {
        showSubscriptionLoader: true
      };
      const selection = opportunityAttendeeSelectors.selectShowSubscriptionLoader.projector(state);
      expect(selection).toBeTruthy();
    });
  });
});
