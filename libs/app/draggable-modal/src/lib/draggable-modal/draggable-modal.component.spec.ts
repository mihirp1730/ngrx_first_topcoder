import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';

import { DraggableModalComponent } from './draggable-modal.component';

describe('DraggableModalComponent', () => {
  let component: DraggableModalComponent;
  let fixture: ComponentFixture<DraggableModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      declarations: [DraggableModalComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DraggableModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit', () => {
    const spy = jest.spyOn(component.closeModal, 'emit').mockImplementation();
    component.closeModalHandler();
    expect(spy).toHaveBeenCalled();
  });
});
