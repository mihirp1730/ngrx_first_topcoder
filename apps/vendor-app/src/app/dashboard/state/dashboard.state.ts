export interface State {
  filters: {
    status: Array<string | number>;
    regions: Array<string | number>;
    dataType: Array<string | number>;
  };
}

export const initialState: State = {
  filters: {
    status: [],
    regions: [],
    dataType: []
  }
};
