import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { ApproveActionCellComponent } from './approve-action-cell.component';

const mockMatDialogModal = {
  open: jest.fn()
};
describe('ApproveActionCellComponent', () => {
  let component: ApproveActionCellComponent;
  let fixture: ComponentFixture<ApproveActionCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveActionCellComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: MatDialog,
          useValue: mockMatDialogModal
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveActionCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should agInit', () => {
    const params = {} as any;
    const spy = jest.spyOn(component, 'refresh').mockImplementation();
    component.agInit(params);
    expect(spy).toHaveBeenCalled();
  });

  it('should refresh', () => {
    const result = component.refresh();
    expect(result).toBeTruthy();
  });

  it('should show comments dialog', (done) => {
    component.values = {
      dataPackageName: "pkg_name",
      requesterName: "Requester Name",
      requestedBy: "Requested By",
      comment: ""
    }
    jest.spyOn(component.dialog, 'open').mockImplementation((component, config) => {
      expect(component).toBeTruthy();
      expect(config.data).toEqual({
        options: {
          title: 'Comments',
          label: 'From: Requester Name',
          content: 'No Comments'
        }
      });
      done();
      return {} as any;
    })
    component.onCommentsAction();
  });
});
