import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobeLoaderComponent } from './globe-loader.component';

describe('GlobeLoaderComponent', () => {
  let component: GlobeLoaderComponent;
  let fixture: ComponentFixture<GlobeLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobeLoaderComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobeLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
