import * as dashboardSelectors from './dashboard.selectors';

describe('state selectors', () => {
  it('should select filters', () => {
    const state = {
      filters: {
        status: [],
        regions: [],
        dataType: []
      }
    };
    const selection = dashboardSelectors.selectFilters.projector(state);
    expect(selection).toBe(state.filters);
  });
});
