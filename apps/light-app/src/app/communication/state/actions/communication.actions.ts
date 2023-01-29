import { AuthUser } from '@apollo/api/interfaces';
import { IChatMessagePayload, IChatThreadMessage, IParticipant, IParticipantDetail } from '@apollo/app/services/communication';
import { IVendorContactDetails } from '@apollo/app/vendor';
import { createAction, props } from '@ngrx/store';

import { IMetadata } from '../communication.state';

export const loadChats = createAction('[Communication] Load Chats', props<{ email: string }>());

export const loadChatsSuccess = createAction('[Communication] Load Chats Success', props<{ chats: Array<any> }>());

export const loadChatsFail = createAction('[Communication] Load Chats Fail', props<{ errorMessage: string }>());

export const createChat = createAction('[Communication] Create Chat');

export const createChatSuccess = createAction(
  '[Communication] Create Chat Success',
  props<{ chatId: string; topic: string; participants: Array<{ emailId: string; displayName: string }> }>()
);

export const createChatFail = createAction('[Communication] Create Chat Fail', props<{ errorMessage: string }>());

export const openChat = createAction('[Communication] Open Chat', props<{ chatId: string; isModular?: boolean }>());

export const openChatSuccess = createAction(
  '[Communication] Open Chat Success',
  props<{ chatId: string; messages: Array<IChatThreadMessage>; isModular?: boolean }>()
);

export const openChatFail = createAction('[Communication] Open Chat Fail', props<{ errorMessage: string }>());

export const connectWebSocket = createAction('[Communication] Connect Web Socket');

export const sendMessage = createAction('[Communication] Send Message', props<{ payload: IChatMessagePayload }>());

export const sendMessageSuccess = createAction(
  '[Communication] Send Message Success',
  props<{ payload: IChatMessagePayload; currentTime: Date }>()
);

export const loadLoggedInUserDetails = createAction('[Communication] Load Logged In User Details');

export const loadLoggedInUserDetailsSuccess = createAction(
  '[Communication] Load Logged In User Details Success',
  props<{ user: AuthUser }>()
);

export const loadLoggedInUserDetailsFail = createAction(
  '[Communication] Load Logged In User Details Fail',
  props<{ errorMessage: string }>()
);

export const addParticipants = createAction('[Communication] Add Participants', props<{ participants: IParticipant[] }>());

export const addParticipantsSuccess = createAction('[Communication] Add Participants Success', props<{ participants: IParticipant[] }>());

export const addParticipantsFail = createAction('[Communication] Add Participants Fail', props<{ errorMessage: string }>());

export const getParticipants = createAction('[Communication] Get Participants');

export const getParticipantsSuccess = createAction(
  '[Communication] Get Participants Success',
  props<{ participants: IParticipantDetail[] }>()
);

export const getParticipantsFail = createAction('[Communication] Get Participants Fail', props<{ errorMessage: string }>());

export const setMetadata = createAction('[Communication] Set Metadata', props<{ metadata: IMetadata }>());

export const loadVendorContactDetails = createAction('[Communication] Load Vendor Contact Details');

export const loadVendorContactDetailsSuccess = createAction(
  '[Communication] Load Vendor Contact Details Success',
  props<{ vendorContactDetails: IVendorContactDetails[] }>()
);

export const loadVendorContactDetailsFail = createAction(
  '[Communication] Load Vendor Contact Details Fail',
  props<{ errorMessage: string }>()
);

export const updateStatus = createAction('[Communication] Update Status', props<{ chatId: string; messages: IChatThreadMessage[] }>());

export const updateStatusFail = createAction('[Communication] Update Status Fail', props<{ errorMessage: string }>());

export const updateCount = createAction('[Communication] Update Count', props<{ chatId: string }>());

export const updateCountSuccess = createAction('[Communication] Update Count Success', props<{ chatId: string }>());
export const noReadReceipts = createAction('[Communication] No Read Receipts');
export const newUnreadMessage = createAction(
  '[Communication] New Unread Message',
  props<{ payload: IChatMessagePayload; currentTime: Date }>()
);

export const newUnreadMessageSuccess = createAction(
  '[Communication] New Unread Message Success',
  props<{ payload: IChatMessagePayload; currentTime: Date }>()
);
