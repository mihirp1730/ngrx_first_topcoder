// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace IEngineSession {
  export enum EComponentState {
    MIN = 0,
    MAX = 1,
    HIDDEN = 2
  }

  export enum EComponentType {
    WEBCOMPONENT = 0,
    MODULE = 1
  }

  export enum EMessageStatus {
    UNKNOWN = 0,
    ERROR = 1,
    WARNING = 2,
    SUCCESS = 3
  }

  export interface IChangeSessionComponentRequest {
    readonly sessionComponentKey: string;
    readonly sessionLayoutKey: string;
    readonly state: EComponentState;
    readonly layerIndex: number;
  }

  export interface IChangeSessionComponentInstanceDataRequest {
    readonly instanceData: any;
    readonly sessionComponentKey: string;
    readonly sessionLayoutKey: string;
  }

  export interface IComponent {
    readonly componentKey: string;
    readonly name: string;
    readonly path: string;
    readonly tagname: string;
    readonly type: EComponentType;
  }

  export interface IComponentInstanceData {
    readonly sessionComponentKey: string;
    readonly data: any;
  }

  export interface IResponseMessage {
    readonly error: string;
    readonly messageStatus: EMessageStatus;
  }

  export interface ISessionComponentResponseMessage extends IResponseMessage {
    readonly sessionComponent: ISessionComponent;
  }

  export interface ISessionComponent {
    readonly sessionComponentKey: string;
    readonly sessionLayoutKey: string;
    readonly component: IComponent;
    readonly layerIndex: number;
    state: EComponentState;
  }

  export interface ISessionComponentInstance extends ISessionComponent {
    readonly instanceData: string;
    initialPosition?: number;
  }

  /**
   * Has information related to components as ISessionComponentsInstance[]
   */
  export interface ISessionLayout {
    readonly components: ISessionComponentInstance[];
    readonly sessionLayoutKey: string;
    readonly systemLayoutKey: string;
    readonly user: string;
  }

  /**
   * Response from the backend engine server with the sessionLayout: ISessionLayout information
   */
  export interface ISessionLayoutResponseMessage extends IResponseMessage {
    readonly sessionLayout: ISessionLayout;
  }
}
