import { GridApi, GridReadyEvent } from '@ag-grid-community/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGridComponent } from './data-grid.component';

describe('DataGridComponent', () => {
  let component: DataGridComponent;
  let fixture: ComponentFixture<DataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataGridComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test to fulfill the code coverage
  it('should populate the rows in ag-grid', () => {
    component.gridOptions.onGridReady({
      api: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        setRowData: () => {}
      } as unknown as GridApi
    } as GridReadyEvent);
  });

  it('should populate the rows in ag-grid on change of items', () => {
    component.gridOptions.api = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        setRowData: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        showNoRowsOverlay: () => {}
      } as unknown as GridApi;
    const setRowDataSpy = jest.spyOn(component.gridOptions.api, 'setRowData');
    const showNoRowsOverlaySpy = jest.spyOn(component.gridOptions.api, 'showNoRowsOverlay');

    const data = [{
      "subscriptionRequestId": "12",
      "dataPackageId": "123",
      "dataPackageName": "",
      "comment": "test comment",
      "requestedBy": "abc@xyz.com",
      "vendorId": "1",
      "requestStatus": "Pending"
    }];
    component.items = data;
    const simpleChange: any = {
      items: {
        currentValue: data
      }
    };
    component.ngOnChanges(simpleChange);
    expect(setRowDataSpy).toHaveBeenCalled();

    simpleChange.items.currentValue = [];
    fixture.detectChanges();
    component.ngOnChanges(simpleChange);
    expect(showNoRowsOverlaySpy).toHaveBeenCalled();

    fixture.detectChanges();
    simpleChange.items = null;
    component.ngOnChanges(simpleChange);

  });
});
