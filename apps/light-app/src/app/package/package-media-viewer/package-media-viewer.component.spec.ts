import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageMediaViewerComponent } from './package-media-viewer.component';

describe('PackageMediaViewerComponent', () => {
  let component: PackageMediaViewerComponent;
  let fixture: ComponentFixture<PackageMediaViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackageMediaViewerComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageMediaViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.packageMedia = [
      {
        signedUrl: 'signedUrl1',
        caption: 'caption1'
      },
      {
        signedUrl: 'signedUrl2',
        caption: 'caption2'
      }
    ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set placeholder image', () => {
    component.packageMedia = [];
    expect(component.mediaDetails.length).toBe(1);
  });
});
