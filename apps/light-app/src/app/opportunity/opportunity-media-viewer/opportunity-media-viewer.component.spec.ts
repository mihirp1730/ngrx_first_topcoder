import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { OpportunityMediaViewerComponent } from './opportunity-media-viewer.component';

describe('OpportunityMediaViewerComponent', () => {
  let component: OpportunityMediaViewerComponent;
  let fixture: ComponentFixture<OpportunityMediaViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityMediaViewerComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityMediaViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.opportunityMedia = [
      {
        fileId: 'test1',
        fileName: 'test file1',
        fileType: 'jpeg',
        signedUrl: 'signedUrl1',
        caption: 'caption1'
      },
      {
        fileId: 'test2',
        fileName: 'test file2',
        fileType: 'jpeg',
        caption: 'caption2',
        signedUrl: 'signedUrl2'
      }
    ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set placeholder image', () => {
    component.opportunityMedia = [];
    expect(component.mediaDetails.length).toBe(1);
  });
});
