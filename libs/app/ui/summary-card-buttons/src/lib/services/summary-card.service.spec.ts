import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { v4 as uuid } from 'uuid';

import { DISCOVERY_API_URL, SUMMARY_CARD_DEBOUNCE_FACTORY, SummaryCardService } from './summary-card.service';

describe('SummaryCardService', () => {
  let mockHttpClient: HttpTestingController;
  let service: SummaryCardService;
  let mockDebounceExecute: boolean;

  beforeEach(() => {
    mockDebounceExecute = true;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: DISCOVERY_API_URL,
          useValue: 'DISCOVERY_API_URL'
        },
        {
          provide: SUMMARY_CARD_DEBOUNCE_FACTORY,
          useValue: (cb: () => void) => () => {
            if (mockDebounceExecute) {
              cb();
            }
          }
        },
        SummaryCardService
      ]
    });
    mockHttpClient = TestBed.inject(HttpTestingController);
    service = TestBed.inject(SummaryCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('lookupRecordSummaryCard', () => {
    it('should be able to call', () => {
      const recordId = uuid();
      service.lookupRecordSummaryCard(recordId);
      expect(service).toBeTruthy();
    });
    it('should make an http call', (done) => {
      const recordId = uuid() + ':';
      const response = {
        results: [
          {
            recordId,
            wellborelogs: {
              hasWellboreLog: false,
              count: 0
            },
            documents: {}
          }
        ]
      };
      service.lookupRecordSummaryCard(recordId);
      mockHttpClient.expectOne('DISCOVERY_API_URL/summary-cards').flush(response);
      service.recordsSummaryCards$.subscribe((recordsSummaryCards) => {
        expect(recordsSummaryCards[recordId]).not.toBeUndefined();
        done();
      });
    });
    it('should not make a http call if looking up', () => {
      mockDebounceExecute = false;
      const recordId = uuid();
      service.lookupRecordSummaryCard(recordId);
      mockDebounceExecute = true;
      service.lookupRecordSummaryCard(recordId);
      mockHttpClient.expectNone('WELLBORELOG_API_URL/summary-cards');
    });
    it('should not make a http call if cached', (done) => {
      const recordId = uuid();
      const response = {
        results: [
          {
            recordId: recordId,
            wellborelogs: {
              hasWellboreLog: false,
              count: 0
            },
            documents: {}
          }
        ]
      };
      service.lookupRecordSummaryCard(recordId);
      mockHttpClient.expectOne('DISCOVERY_API_URL/summary-cards').flush(response);
      service.recordsSummaryCards$.subscribe((recordsSummaryCards) => {
        expect(recordsSummaryCards[recordId]).not.toBeUndefined();
        service.lookupRecordSummaryCard(recordId);
        mockHttpClient.expectNone('DISCOVERY_API_URL/summary-cards');
        done();
      });
    });
  });

  describe('forgetLookupOfRecordSummaryCard', () => {
    it('should be able to call', () => {
      const recordId = uuid();
      service.forgetLookupOfRecordSummaryCard(recordId);
      expect(service).toBeTruthy();
    });
  });
});
