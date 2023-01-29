import { createFeatureSelector, createSelector } from '@ngrx/store';

import { State } from '../communication.state';
import { communicationFeatureKey } from '../reducers/communication.reducer';

export const selectFeature = createFeatureSelector<State>(communicationFeatureKey);

export const selectChats = createSelector(selectFeature, (state) => state.chats);

export const selectLoggedInUserDetails = createSelector(selectFeature, (state) => state.loggedInUserDetails);

export const selectActiveChat = createSelector(selectFeature, (state) => state.activeChat);

export const selectParticipants = createSelector(selectActiveChat, (activeChatState) => activeChatState.participants);

export const selectMessages = createSelector(selectActiveChat, (activeChatState) => activeChatState.messages);

export const selectActiveChatId = createSelector(selectActiveChat, (activeChatState) => activeChatState.chatId);

export const deduceCurrentUserAddingParticipantsToActiveChat = createSelector(
  selectLoggedInUserDetails,
  selectActiveChatId,
  (loggedInUserDetails, chatId) => {
    const addedBy = loggedInUserDetails?.email ?? null;
    return { addedBy, chatId };
  }
);

export const selectMetadata = createSelector(selectFeature, (state) => state.metadata);

export const deduceChats = createSelector(selectChats, selectLoggedInUserDetails, selectMetadata, (chats, { email }, metadata) => {
  if (chats === null || metadata === null) return null;
  return chats.filter((item) => {
    // Search by user email id and opportunityId
    if (item.createdBy === email && item.metadata?.opportunityId === metadata.opportunityId) {
      return true;
    } else {
      return false;
    }
  });
});

export const selectVendorContactDetails = createSelector(selectFeature, (state) => state.vendorContactDetails);
export const selectLoadingChats = createSelector(selectFeature, (state) => state.loadingChats);
export const selectIsLoadingWhileGettingMessages = createSelector(selectFeature, (state) => state.isLoadingWhileGettingMessages);
