import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, of, Subscription } from 'rxjs';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { mockLeaveForm, mockMatDialogModal } from '../../shared/services.mock';

import { CreateOpportunityGuard } from './create-opportunity.guard';

describe('CreateOpportunityGuard', () => {
  let guard: CreateOpportunityGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialog,
          useValue: mockMatDialogModal
        }
      ]
    });
    guard = TestBed.inject(CreateOpportunityGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('Confirm if user want to leave', () => {
    let subscription: Subscription;

    beforeEach(() => {
      subscription = new Subscription();
    });

    afterEach(() => {
      subscription.unsubscribe();
    });

    it('Should deactivate after user confirmation', (done) => {
      mockLeaveForm.canLeave.mockReturnValue(false);
      mockMatDialogModal.open.mockReturnValue({
        afterClosed: () => of(true)
      } as MatDialogRef<ConfirmModalComponent>);

      subscription.add(
        (guard.canDeactivate(mockLeaveForm) as Observable<boolean>).subscribe((confirmed) => {
          expect(confirmed).toBeTruthy();
          done();
        }, done.fail)
      );
    });
  });

  describe('Leaving', () => {
    it('Should be able to leave', () => {
      mockLeaveForm.canLeave.mockReturnValue(true);
      const canDeactivate = guard.canDeactivate(mockLeaveForm);
      expect(canDeactivate).toBe(true);
    });

    it('Should confirm with the user if they would like to leave', () => {
      mockLeaveForm.canLeave.mockReturnValue(false);
      jest.spyOn(guard, 'confirmLeave').mockReturnValue(of(true));
      guard.canDeactivate(mockLeaveForm);
      expect(guard.confirmLeave).toHaveBeenCalled();
    });
  });
});
