import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ScrollViewComponent } from './scroll-view.component';

describe('ScrollViewComponent', () => {
  let component: ScrollViewComponent;
  let fixture: ComponentFixture<ScrollViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScrollViewComponent],
      imports: [ScrollingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return index', () => {
    expect(component.trackBy(1)).toEqual(1);
  });
});
