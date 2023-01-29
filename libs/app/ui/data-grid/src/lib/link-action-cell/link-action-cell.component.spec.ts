import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkActionCellComponent } from './link-action-cell.component';

describe('LinkActionCellComponent', () => {
  let component: LinkActionCellComponent;
  let fixture: ComponentFixture<LinkActionCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkActionCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkActionCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
