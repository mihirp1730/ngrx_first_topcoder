export interface INotificationOptions {
  severity: 'Success' | 'Error' | 'Warning' | 'Info';
  title: string;
  message: string;
  target?: 'modal' | 'toast' | 'banner';
  closable?: boolean;
  sticky?: boolean;
}

export interface IModalButton {
  class: string;
  onClick: any;
  text: string;
}

export interface IBaseModalOptions {
  title: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
}

export interface IModalInput {
  name: string;
  type: string;
  value?: any;
  isRequired: boolean;
}

export interface IModalOptions extends IBaseModalOptions {
  content?: string;
  customData?: {
    chatModalData?: ICustomChatModalData;
  };
  disableConfirm?: boolean;
  label?: string;
  modalType?: 'regular' | 'chat';
  subContent?: string;
  subtitle?: string;
}

export interface IInputModalOptions extends IBaseModalOptions {
  modalInputs: IModalInput[];
}

export interface ICustomChatModalData {
  companyName?: string;
  hint?: string;
  opportunity?: string;
  placeholder?: string;
}
