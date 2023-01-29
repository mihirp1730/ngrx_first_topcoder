import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { RichTextViewerComponent } from './rich-text-viewer.component';

describe('RichTextViewerComponent', () => {
  let component: RichTextViewerComponent;
  let fixture: ComponentFixture<RichTextViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RichTextViewerComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: DomSanitizer,
          useValue: {
            sanitize: jest.fn(),
            SecurityContext: jest.fn().mockReturnValue('current-value')
          }
        },
        {
          provide: ChangeDetectorRef,
          useValue: {
            detectChanges: jest.fn()
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RichTextViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ngonchange', () => {
    component.content = { currentValue: 'Some old Value' } as any;
    const change: any = {
      content: {
        currentValue: 'The New Value'
      }
    };
    component.ngOnChanges(change);
  });
});
