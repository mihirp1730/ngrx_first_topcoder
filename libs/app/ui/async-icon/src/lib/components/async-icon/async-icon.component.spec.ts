import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';

import { AsyncIconComponent } from './async-icon.component';

describe('AsyncIconComponent', () => {
  let component: AsyncIconComponent;
  let fixture: ComponentFixture<AsyncIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatProgressSpinnerModule,
        MatBadgeModule
      ],
      declarations: [
        AsyncIconComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsyncIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onIconClick', () => {
    it('should emit iconClick event', () => {
      const iconClickSpy = jest.spyOn(component.iconClick, 'emit').mockImplementation();
      const mockEvent = {
        stopPropagation: jest.fn()
      };
      component.onIconClick(mockEvent as any);
      expect(mockEvent.stopPropagation).toBeCalled();
      expect(iconClickSpy).toBeCalled();
    });
  })

});
