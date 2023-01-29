import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { RejectedActionCellComponent } from './rejected-action-cell.component';

describe('RejectedActionCellComponent', () => {
  let component: RejectedActionCellComponent;
  let fixture: ComponentFixture<RejectedActionCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectedActionCellComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectedActionCellComponent);
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
    const params = {} as any;
    component.refresh(params);
    expect(component.refresh).toBeTruthy();
  });
});
