import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { SummaryCardService } from '@apollo/app/ui/summary-card-buttons';
import { of } from 'rxjs';

import { LogViewerButtonComponent } from './log-viewer-button.component';

const mockSummaryCardService = {
  recordsSummaryCards$: of({
    'test-id': {
      wellborelogs: {
        hasWellboreLog: false
      }
    }
  })
};

describe('LogViewerButtonComponent', () => {
  let component: LogViewerButtonComponent;
  let fixture: ComponentFixture<LogViewerButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogViewerButtonComponent],
      providers: [
        {
          provide: SummaryCardService,
          useValue: mockSummaryCardService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogViewerButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handleClick', () => {
    it('should emit an event', () => {
      component.isDisabled = false;
      component.result = {
        recordId: 'test-id',
        name: 'Test'
      } as any;

      const spy = jest.spyOn(component.buttonClick, 'emit');
      component.handleClick();
      expect(spy).toHaveBeenCalled();
    });

    it('should not emit an event', () => {
      component.isDisabled = true;

      const spy = jest.spyOn(component.buttonClick, 'emit');
      component.handleClick();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should disable the button from result list', () => {
      component.results = {
        recordsTotal: 45,
        entityType: 'Well Log'
      };

      component.ngOnChanges();

      expect(component.isDisabled).toBe(true);
      expect(component.tooltip).toEqual('45 selected items. The limit is 40.');
    });

    it('should disable the button from detail card', () => {
      component.result = {
        type: 'Well Log',
        recordId: 'test-id'
      } as any;

      component.ngOnChanges();

      expect(component.isDisabled).toBe(true);
    });

    it('should return if displayButton is false', () => {
      component.result = {
        type: 'Basin'
      } as any;

      component.ngOnChanges();

      expect(component.displayButton).toBe(false);
    });
  });
});
