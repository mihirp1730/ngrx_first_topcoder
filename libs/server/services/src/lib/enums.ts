// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Enums {
  // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Atlas {
  // eslint-disable-next-line @typescript-eslint/no-namespace
      export namespace Component {
        export enum State {
          Hidden = '[Atlas Component State] Hidden',
          Max = '[Atlas Component State] Max',
          Min = '[Atlas Component State] Min'
        }
        export enum Type {
          Module = '[Atlas Component Type] Module',
          WebComponent = '[Atlas Component Type] WebComponent'
        }
      }
    }
  // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Legacy {
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
    }
  }
  