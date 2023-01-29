import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTooltipModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      declarations: [
        MenuComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;

    component.options = [
      {
        id: "test",
        name: "test",
        link: "test",
        tooltip: "test"
      },
      {
        id: "test2",
        name: "test2",
        link: "test2",
        tooltip: "test2"
      }
    ];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should handle input for Users', () => {
      component.user.name = 'John Doe';
      component.user.isGuest = false;
      component.ngOnInit();
      expect(component.initials).toBe('JD');
    });

    it('should handle input for guest user', () => {
      component.user.name = 'Guest';
      component.user.isGuest = true;
      component.ngOnInit();
      expect(component.initials).toBe('G');
    });
    
    it('should handle missing name', () => {
      component.user.name = null;
      component.ngOnInit();
      expect(component.initials).toBe('');
    });

    it('should emit redirection event', () => {
      const spy = jest.spyOn(component.authRedirection, 'emit');
      component.authRedirect();
      expect(spy).toHaveBeenCalled();
    })
  });
});
