import { createFeatureSelector, createSelector } from '@ngrx/store';

import { State } from '../communication.state';
import { communicationFeatureKey } from '../reducers/communication.reducer';

export const selectFeature = createFeatureSelector< State>(communicationFeatureKey);

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

