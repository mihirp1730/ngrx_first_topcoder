import {ISauth} from '@apollo/server/jwt-token-middleware';

import {Enums} from './enums';
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Interfaces {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Api {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Logging {
      export interface PostErrorRequest {
        payload: Atlas.Error.ClientLogged;
      }
      export interface PostErrorResponse {
        error: string;
      }
      export interface PostPerformanceRequest {
        payload: Atlas.Performance.ClientLogged;
      }
      export interface PostPerformanceResponse {
        error: string;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Session {
      export interface GetSessionRequest {
        id: string;
      }
      export interface GetSessionResponse {
        error: string;
        session: Atlas.Session.UserSession;
      }
      export interface GetSessionsResponse {
        error: string;
        ids: string[];
      }
      export interface DeleteSessionRequest {
        id: string;
      }
      export interface DeleteSessionResponse {
        error: string;
      }
      export interface PostSessionComponentStateRequest {
        componentId: string;
        sessionId: string;
        state: Enums.Atlas.Component.State;
        subid: string;
      }
      export interface PostSessionComponentStateResponse {
        error: string;
      }
      export interface PostSessionComponentInstanceDataRequest {
        id: string;
      }
      export interface PostSessionComponentInstanceDataResponse {
        error: string;
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Atlas {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Component {
      export interface SessionComponent {
        id: string;
        instanceData: string;
        name: string;
        session: string;
        state: Enums.Atlas.Component.State;
        type: Enums.Atlas.Component.Type;
        types: {
          [Enums.Atlas.Component.Type.Module]?: {
            path: string;
          };
          [Enums.Atlas.Component.Type.WebComponent]?: {
            path: string;
            tagName: string;
          };
        };
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Error {
      export interface ClientLogged {
        message: string;
        stack: string;
        timestamp: number;
        user: ISauth;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Performance {
      export interface ClientLogged {
        indicator: string;
        latency: number;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Session {
      export interface UserSession {
        components: Component.SessionComponent[];
        id: string;
        name: string;
        user: string;
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Legacy {
    export interface IChangeSessionComponentCollectionRequest {
      sessionComponentRequests: IChangeSessionComponentRequest[];
      sessionLayoutKey: string;
    }
    export interface IChangeSessionComponentInstanceDataRequest {
      instanceData: any;
      sessionComponentKey: string;
      sessionLayoutKey: string;
    }
    export interface IChangeSessionComponentRequest {
      sessionComponentKey: string;
      sessionLayoutKey: string;
      state: Enums.Legacy.EComponentState;
      layerIndex: number;
    }
    export interface IComponent {
      componentKey: string;
      name: string;
      path: string;
      tagname: string;
      type: Enums.Legacy.EComponentType;
    }
    export interface IResponseMessage {
      error: string;
      messageStatus: Enums.Legacy.EMessageStatus
    }
    export interface ISessionComponent {
      sessionComponentKey: string;
      sessionLayoutKey: string;
      component: IComponent;
      state: Enums.Legacy.EComponentState;
      layerIndex: number;
    }
    export interface ISessionComponentInstance extends ISessionComponent {
      instanceData: string;
    }
    export interface ISessionComponentResponseMessage extends IResponseMessage {
      sessionComponent: ISessionComponent;
    }
    export interface ISessionLayout {
      components: ISessionComponentInstance[];
      sessionLayoutKey: string;
      systemLayoutKey: string;
      user: string;
    }
    export interface ISessionLayoutResponseMessage extends IResponseMessage {
      sessionLayout: ISessionLayout;
    }
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Adapters {

      //
      // This method helps support our legacy definition of an Atlas component.
      // It converts a new Atlas component to a legacy definition.
      //
      export function NewUserSessionComponentToSessionComponentInstance(
        sessionComponent: Atlas.Component.SessionComponent
      ): ISessionComponentInstance {
        //
        // Migrate the new state to the old, legacy state.
        //
        const state = NewComponentStateToLegacyComponentState(sessionComponent.state);
        //
        // Migrate the new type and path to the old, legacy tagname, type and path.
        //
        let type = null;
        let path = null;
        switch (sessionComponent.type) {
          case Enums.Atlas.Component.Type.Module: {
            type = Enums.Legacy.EComponentType.MODULE;
            path = sessionComponent.types[Enums.Atlas.Component.Type.Module].path;
            break;
          }
          case Enums.Atlas.Component.Type.WebComponent: {
            path = sessionComponent.types[Enums.Atlas.Component.Type.WebComponent].path;
            type = Enums.Legacy.EComponentType.WEBCOMPONENT;
            break;
          }
        }
        //
        // Migrate the new type and path to the old, legacy tagname, type and path.
        //
        let tagname = null;
        switch (sessionComponent.name) {
          case 'Map Wrapper Component': {
            tagname = 'map-wrapper-component';
            break;
          }
          case '2D Viz Wrapper Component': {
            tagname = 'twodviz-wrapper-component';
            break;
          }
          case '3D Viz Wrapper Component': {
            tagname = 'threedviz-wrapper-component';
            break;
          }
        }
        //
        // Return a legacy component definition.
        //
        return {
          state,
          instanceData: sessionComponent.instanceData || '{}',
          sessionComponentKey: sessionComponent.id,
          sessionLayoutKey: sessionComponent.session,
          component: {
            path,
            tagname,
            type,
            componentKey: sessionComponent.id,
            name: sessionComponent.name
          },
          layerIndex: 0
        };
      }

      export function NewComponentStateToLegacyComponentState(
        newState: Enums.Atlas.Component.State
      ): Enums.Legacy.EComponentState {
        switch (newState) {
          case Enums.Atlas.Component.State.Hidden: {
            return Enums.Legacy.EComponentState.HIDDEN;
          }
          case Enums.Atlas.Component.State.Max: {
            return Enums.Legacy.EComponentState.MAX;
          }
          case Enums.Atlas.Component.State.Min: {
            return Enums.Legacy.EComponentState.MIN;
          }
        }
        return null;
      }

      export function LegacyComponentStateToNewComponentState(
        legacyState: Enums.Legacy.EComponentState
      ): Enums.Atlas.Component.State {
        switch (legacyState) {
          case Enums.Legacy.EComponentState.HIDDEN: {
            return Enums.Atlas.Component.State.Hidden;
          }
          case Enums.Legacy.EComponentState.MAX: {
            return Enums.Atlas.Component.State.Max;
          }
          case Enums.Legacy.EComponentState.MIN: {
            return Enums.Atlas.Component.State.Min;
          }
        }
        return null;
      }
    }
  }
}
