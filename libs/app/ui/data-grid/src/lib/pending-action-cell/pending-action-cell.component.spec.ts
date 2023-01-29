/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataPackagesService } from '@apollo/app/services/data-packages';
import { of } from 'rxjs';

import { PendingActionCellComponent } from './pending-action-cell.component';

const mockRouter = {
  navigateByUrl: jest.fn()
};

const mockDataPackagesService = {
  getAssociateDeliverables: jest.fn().mockReturnValue(of([]))
};

describe('PendingActionCellComponent', () => {
  let component: PendingActionCellComponent;
  let fixture: ComponentFixture<PendingActionCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => {
              return {
                componentInstance: {
                  yesClickEvent: of({})
                }
              }
            }
          }
        },
        {
          provide: DataPackagesService,
          useValue: mockDataPackagesService
        }
      ],
      declarations: [PendingActionCellComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingActionCellComponent);
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

  it('should navigate to package create', () => {
    component.values = {} as any;
    mockDataPackagesService.getAssociateDeliverables.mockReturnValueOnce(of([{ recordId: '', dataType: '' }]));
    component.onApproveAction();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('vendor/package/subscription/create', { state: component.values });
  });

  it('should open modal if no deliverable files associated', () => {
    component.values = {} as any;
    mockDataPackagesService.getAssociateDeliverables.mockReturnValueOnce(of([]));
    const spy = jest.spyOn(component.dialog, 'open').mockImplementation();
    component.onApproveAction();
    expect(spy).toHaveBeenCalled();
  });

  it('should refresh', () => {
    const params = {} as any;
    component.refresh(params);
    expect(component.refresh).toBeTruthy();
  });

  it('should onCommentsAction', () => {
    const spy = jest.spyOn(component.dialog, 'open').mockImplementation();
    component.onCommentsAction();
    expect(spy).toHaveBeenCalled();
  });

  it('should navigate to package edit mode if no deliverables associated', () => {
    component.values = {} as any;
    component.values.dataPackageId = 'testId';
    const url = `vendor/package/edit/${component.values.dataPackageId}`;
    mockDataPackagesService.getAssociateDeliverables.mockReturnValueOnce(of([]));
    const navigateByUrl = mockRouter.navigateByUrl.mockReturnValueOnce(of(url));
    component.onApproveAction();
    expect(navigateByUrl).toHaveBeenCalledWith('vendor/package/edit/testId');
  });
});
