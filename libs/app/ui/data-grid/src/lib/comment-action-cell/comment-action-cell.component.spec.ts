import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentActionCellComponent } from './comment-action-cell.component';

describe('CommentActionCellComponent', () => {
  let component: CommentActionCellComponent;
  let fixture: ComponentFixture<CommentActionCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentActionCellComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentActionCellComponent);
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
