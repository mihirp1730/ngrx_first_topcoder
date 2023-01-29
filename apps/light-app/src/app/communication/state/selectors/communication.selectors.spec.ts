import { AuthUser } from '@apollo/api/interfaces';
import { v4 as uuid } from 'uuid';

import * as communicationSelectors from './communication.selectors';

describe('state selectors', () => {
  describe('select chats', () => {
    it('should select selectChats from the provided state', () => {
      const state: Array<any> = [
        {
          id: 1,
          title: 'test'
        }
      ];
      const selection = communicationSelectors.selectChats.projector({ chats: state });
      expect(selection[0].id).toBe(1);
    });
  });

  it('should select loggedInUser from the provided state', () => {
    const state: any = {
      name: 'Test'
    } as AuthUser;
    const selection = communicationSelectors.selectLoggedInUserDetails.projector({ loggedInUserDetails: state });
    expect(selection.name).toEqual('Test');
  });

  describe('select active chat', () => {
    it('should select selectActiveChats from the provided state', () => {
      const state: any = {};
      const selection = communicationSelectors.selectActiveChat.projector({ activeChat: state });
      expect(selection).toEqual({});
    });

    it('should select selectParticipants from the provided state', () => {
      const selection = communicationSelectors.selectParticipants.projector({ participants: [] });
      expect(selection).toEqual([]);
    });

    it('should return null if no recepients found from the provided state', () => {
      const selection = communicationSelectors.selectParticipants.projector({ participants: null });
      expect(selection).toEqual(null);
    });

    it('should select selectMessages from the provided state', () => {
      const selection = communicationSelectors.selectMessages.projector({ messages: [] });
      expect(selection.length).toBe(0);
    });

    it('should select selectActiveChatId from the provided state', () => {
      const chatId = 'chat_id_1';
      const selection = communicationSelectors.selectActiveChatId.projector({ chatId });
      expect(selection).toEqual(chatId);
    });
  });

  describe('deduceCurrentUserAddingParticipantsToActiveChat', () => {
    it('should return the email address of the user', () => {
      const selectLoggedInUserDetails = { email: uuid() };
      const selectActiveChatId = uuid();
      const selection = communicationSelectors.deduceCurrentUserAddingParticipantsToActiveChat.projector(
        selectLoggedInUserDetails,
        selectActiveChatId
      );
      expect(selection).toEqual({
        addedBy: selectLoggedInUserDetails.email,
        chatId: selectActiveChatId
      });
    });

    it('should return with null if no user details', () => {
      const selectLoggedInUserDetails = undefined;
      const selectActiveChatId = uuid();
      const selection = communicationSelectors.deduceCurrentUserAddingParticipantsToActiveChat.projector(
        selectLoggedInUserDetails,
        selectActiveChatId
      );
      expect(selection).toEqual({
        addedBy: null,
        chatId: selectActiveChatId
      });
    });
  });

  describe('select metadata', () => {
    it('should select metadata from the provided state', () => {
      const state: any = {};
      const selection = communicationSelectors.selectMetadata.projector({ metadata: state });
      expect(selection).toEqual({});
    });
  });

  describe('deduceChats', () => {
    it('should filter chat thread on emailid from the provided state', () => {
      const userDetails = { email: 'test@slb.com' };
      const state = [
        {
          id: 1,
          title: 'test',
          createdBy: userDetails.email
        },
        {
          id: 2,
          title: 'test 2',
          createdBy: 'test1@slb.com'
        }
      ];
      const metadata = {};
      const selection = communicationSelectors.deduceChats.projector(state, userDetails, metadata);
      expect(selection[0]).toBe(state[0]);
    });

    it('should not filter any chat thread from the provided state', () => {
      const userDetails = { email: 'test@slb.com' };
      const state = [
        {
          id: 1,
          title: 'test',
          createdBy: userDetails.email,
          metadata: {
            opportunityId: '1234'
          }
        },
        {
          id: 2,
          title: 'test 2',
          createdBy: 'test1@slb.com'
        }
      ];
      const metadata = { opportunityId: '123', opportunityName: 'test' };
      const selection = communicationSelectors.deduceChats.projector(state, userDetails, metadata);
      expect(selection.length).toBe(0);
    });
    it('should filter chat thread on opportunityId from the provided state', () => {
      const userDetails = { email: 'test@slb.com' };
      const state = [
        {
          id: 1,
          title: 'test',
          createdBy: userDetails.email,
          metadata: {
            opportunityId: '123'
          }
        },
        {
          id: 2,
          title: 'test 2',
          createdBy: 'test1@slb.com'
        }
      ];
      const metadata = { opportunityId: '123', opportunityName: 'test' };
      const selection = communicationSelectors.deduceChats.projector(state, userDetails, metadata);
      expect(selection[0]).toBe(state[0]);
    });
  });

  describe('select vendor contact details', () => {
    it('should select selectVendorContactDetails from the provided state', () => {
      const vendorContactDetails: Array<any> = [
        {
          emailId: 'test@slb.com',
          displayName: 'Test Data Vendor'
        }
      ];
      const selection = communicationSelectors.selectVendorContactDetails.projector({ vendorContactDetails });
      expect(selection).toBe(vendorContactDetails);
    });
  });

  describe('select loadingChats', () => {
    it('should select loadingChats from the provided state', () => {
      const selection = communicationSelectors.selectLoadingChats.projector({ loadingChats: false });
      expect(selection).toBeFalsy();
    });
  });

  describe('select isLoadingWhileGettingMessages', () => {
    it('should select isLoadingWhileGettingMessages from the provided state', () => {
      const selection = communicationSelectors.selectIsLoadingWhileGettingMessages.projector({ isLoadingWhileGettingMessages: false });
      expect(selection).toBeFalsy();
    });
  });
});
