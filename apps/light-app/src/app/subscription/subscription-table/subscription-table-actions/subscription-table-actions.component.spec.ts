import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { mockContentDownloaderService } from '../../../shared/services.mock';
import { ContentDownloaderService } from '../../services/content-downloader.service';
import { SubscriptionTableActionsComponent } from './subscription-table-actions.component';

describe('SubscriptionTableActionsComponent', () => {
  let component: SubscriptionTableActionsComponent;
  let fixture: ComponentFixture<SubscriptionTableActionsComponent>;
  let downloaderService: ContentDownloaderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubscriptionTableActionsComponent],
      providers: [
        {
          provide: ContentDownloaderService,
          useValue: mockContentDownloaderService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionTableActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    downloaderService = TestBed.inject(ContentDownloaderService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set status to uppercase', () => {
    component.subscriptionStatus = 'active';
    component.ngOnInit();
    expect(component.subscriptionStatus).toMatch(/^[A-Z]*$/);
  });

  it('should download files and update when downloading is complete', async () => {
    const evt = { stopPropagation: jest.fn() };
    const subscriptionId = 'test-id';

    component.subscriptionId = subscriptionId;
    const downloadPromise = component.download(evt);
    await downloadPromise;

    expect(evt.stopPropagation).toHaveBeenCalled();
    expect(downloaderService.download).toHaveBeenCalledWith(subscriptionId);
  });
});
