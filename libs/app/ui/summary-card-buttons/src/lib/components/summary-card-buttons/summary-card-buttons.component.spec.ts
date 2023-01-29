import { SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { sample } from 'lodash';
import { firstValueFrom, of, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { AppUiAsyncIconModule } from '@apollo/app/ui/async-icon';

import { SummaryButtonEventType } from '../../enums/event-type.enum';
import { SummaryCardService } from '../../services/summary-card.service';
import { BUTTON_DISPLAY_CONFIG, SummaryCardButtonsComponent } from './summary-card-buttons.component';

class MockSummaryCardService {
  forgetLookupOfRecordSummaryCard = jest.fn();
  lookupRecordSummaryCard = jest.fn();
  recordsSummaryCards$ = new Subject();
}

const mockSummaryCards = [
  {
    recordId: uuid(),
    hasWellboreLog: true,
    numberOfWellLogs: 1,
    documents: {
      hasDocuments: false,
      count: 0
    }
  },
  {
    recordId: uuid(),
    hasWellboreLog: false,
    numberOfWellLogs: 0,
    documents: {
      hasDocuments: true,
      count: 2
    }
  }
]

describe('SummaryCardButtonsComponent', () => {
  let component: SummaryCardButtonsComponent;
  let fixture: ComponentFixture<SummaryCardButtonsComponent>;
  let mockSummaryCardService: MockSummaryCardService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppUiAsyncIconModule
      ],
      declarations: [
        SummaryCardButtonsComponent
      ],
      providers: [
        {
          provide: SummaryCardService,
          useClass: MockSummaryCardService
        },
        {
          provide: BUTTON_DISPLAY_CONFIG,
          useValue: {
            DOCUMENT: true,
            'WELL LOG': ['Well Log'],
            'SEISMIC 2D': ['Seismic 2D Line']
          }
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryCardButtonsComponent);
    mockSummaryCardService = TestBed.inject(SummaryCardService) as unknown as MockSummaryCardService;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('summaryCard$', () => {
    it('should return a valid value', (done) => {
      const mockRecordId = uuid();
      const mockRecordsSummaryCard = sample(mockSummaryCards);
      const mockSimpleChanges = { recordId: { currentValue: mockRecordId } };
      component.summaryCard$
        .pipe(take(1))
        .subscribe((summaryCard) => {
          expect(summaryCard).toBe(mockRecordsSummaryCard);
          done();
        });
      component.ngOnChanges(mockSimpleChanges as unknown as SimpleChanges);
      mockSummaryCardService.recordsSummaryCards$.next({ [mockRecordId]: mockRecordsSummaryCard });
    });
  });

  describe('showLoader$', () => {
    it('should return a true value', (done) => {
      const mockRecordId = uuid();
      const mockSimpleChanges = { recordId: { currentValue: mockRecordId } };
      component.showLoader$
        .pipe(take(1))
        .subscribe((showLoader) => {
          expect(showLoader).toBe(true);
          done();
        });
      component.ngOnChanges(mockSimpleChanges as unknown as SimpleChanges);
      mockSummaryCardService.recordsSummaryCards$.next({});
    });
    it('should return a false value', (done) => {
      const mockRecordId = uuid();
      const mockRecordsSummaryCard = sample(mockSummaryCards);
      const mockSimpleChanges = { recordId: { currentValue: mockRecordId } };
      component.showLoader$
        .pipe(take(1))
        .subscribe((showLoader) => {
          expect(showLoader).toBe(false);
          done();
        });
      component.ngOnChanges(mockSimpleChanges as unknown as SimpleChanges);
      mockSummaryCardService.recordsSummaryCards$.next({ [mockRecordId]: mockRecordsSummaryCard });
    });
  });

  describe('ngOnChanges', () => {
    it('should handle empty changes', () => {
      component.ngOnChanges(undefined as unknown as SimpleChanges);
      component.ngOnChanges({});
      component.ngOnChanges({ recordId: false } as unknown as SimpleChanges);
      expect(component).toBeTruthy();
    });
    it('should call forgetLookupOfRecordSummaryCard with previous values', () => {
      const mockRecordId = uuid();
      const mockSimpleChanges = { recordId: { previousValue: mockRecordId }};
      component.ngOnChanges(mockSimpleChanges as unknown as SimpleChanges);
      expect(mockSummaryCardService.forgetLookupOfRecordSummaryCard).toHaveBeenCalledWith(mockRecordId);
    });
    it('should call lookupRecordSummaryCard with current values', () => {
      const mockRecordId = uuid();
      const mockSimpleChanges = { recordId: { currentValue: mockRecordId }};
      component.ngOnChanges(mockSimpleChanges as unknown as SimpleChanges);
      expect(mockSummaryCardService.lookupRecordSummaryCard).toHaveBeenCalledWith(mockRecordId);
    });
  });

  describe('onDocumentClick', () => {
    it('should emit buttonClick', () => {
      component.recordId = uuid();
      const buttonClickSpy = jest.spyOn(component.buttonClick, 'emit');
      const payload = {
        recordId: component.recordId,
        eventType: SummaryButtonEventType.DOCUMENT
      };
      component.onDocumentClick();
      expect(buttonClickSpy).toBeCalledWith(payload);
    });
  });

  describe('onWellLogClick', () => {
    it('should emit buttonClick', () => {
      component.recordId = uuid();
      const buttonClickSpy = jest.spyOn(component.buttonClick, 'emit');
      const payload = {
        recordId: component.recordId,
        eventType: SummaryButtonEventType.WELL_LOG
      };
      component.onWellLogClick();
      expect(buttonClickSpy).toBeCalledWith(payload);
    });
  });

  describe('on2dViewerClick', () => {
    it('should emit buttonClick', () => {
      component.recordId = uuid();
      const buttonClickSpy = jest.spyOn(component.buttonClick, 'emit');
      const payload = {
        recordId: component.recordId,
        eventType: SummaryButtonEventType.SEISMIC_2D
      };
      component.on2dViewerClick();
      expect(buttonClickSpy).toBeCalledWith(payload);
    });
  });

  describe('getButtonsVisibility', () => {
    it('should return true when availabe for every type', () => {
      expect(component.getButtonsVisibility(SummaryButtonEventType.DOCUMENT)).toBeTruthy();
    });

    it('should return true when availabe for a specific type', () => {
      component.recordType = 'Well Log';
      expect(component.getButtonsVisibility(SummaryButtonEventType.WELL_LOG)).toBeTruthy();
    });

    it('should return true when availabe for a specific type', () => {
      component.recordType = 'Seismic 2D Line';
      expect(component.getButtonsVisibility(SummaryButtonEventType.SEISMIC_2D)).toBeTruthy();
    });

    it('should return false when not availabe for a specific type', () => {
      component.recordType = 'Field';
      expect(component.getButtonsVisibility(SummaryButtonEventType.WELL_LOG)).toBeFalsy();
    });
  });

  describe('summaryButtonEventType', () => {
    it('should return enum access', () => {
      expect(component.summaryButtonEventType).toEqual(SummaryButtonEventType);
    });
  });

  describe('documentsButtonTitle$', () => {
    it('should return title for one document', async () => {
      component.summaryCard$ = of({
        documents: {
          count: 1
        }
      } as any);
      const documentsButtonTitle = await firstValueFrom(component.documentsButtonTitle$);
      expect(documentsButtonTitle).toEqual('Open document');
    });

    it('should return title for multiple documents', async () => {
      component.summaryCard$ = of({
        documents: {
          count: 2
        }
      } as any);
      const documentsButtonTitle = await firstValueFrom(component.documentsButtonTitle$);
      expect(documentsButtonTitle).toEqual('2 documents available in the details card');
    });

  });

});
