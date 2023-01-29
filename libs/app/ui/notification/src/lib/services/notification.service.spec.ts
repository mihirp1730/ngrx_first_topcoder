import { TestBed } from '@angular/core/testing';
import { MessageService } from '@slb-dls/angular-material/notification';

import { NotificationService } from './notification.service';

const mockMessageService = {
  add: jest.fn(),
  clear: jest.fn()
};

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService
        }
      ]
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('send message', () => {
    it('should send a success message', () => {
      service.send({
        severity: 'Success',
        title: 'test',
        message: 'success message'
      });
      expect(mockMessageService.add).toHaveBeenCalled();
    });

    it('should send an error message', () => {
      service.send({
        severity: 'Error',
        title: 'test',
        message: 'error message'
      });
      expect(mockMessageService.add).toHaveBeenCalled();
    });

    it('should send an warning message', () => {
      service.send({
        severity: 'Warning',
        title: 'test',
        message: 'warning message'
      });
      expect(mockMessageService.add).toHaveBeenCalled();
    });

    it('should send an info message by default', () => {
      service.send({
        severity: null,
        title: 'test',
        message: 'info message'
      });
      expect(mockMessageService.add).toHaveBeenCalled();
    });
  });

  describe('clear message', () => {
    it('should clear message', () => {
      service.close();
      expect(mockMessageService.clear).toHaveBeenCalled();
    });
  });
});
