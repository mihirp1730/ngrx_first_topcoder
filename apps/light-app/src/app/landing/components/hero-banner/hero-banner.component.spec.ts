import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ENABLE_GUEST_LOGIN, HeroBannerComponent } from './hero-banner.component';

describe('HeroBannerComponent', () => {
  let component: HeroBannerComponent;
  let fixture: ComponentFixture<HeroBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeroBannerComponent],
      providers: [
        {
          provide: ENABLE_GUEST_LOGIN,
          useValue: 'true'
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit loginClick', () => {
    const spyEmit = jest.spyOn(component.loginClick, 'emit');
    component.goToLogin();
    expect(spyEmit).toHaveBeenCalled();
  });

  it('should emit scrollClick', () => {
    const spyEmit = jest.spyOn(component.scrollClick, 'emit');
    component.goToInfo();
    expect(spyEmit).toHaveBeenCalled();
  });

  it('should emit openMapClick', () => {
    const spyEmit = jest.spyOn(component.openMapClick, 'emit');
    component.goToOpenMap();
    expect(spyEmit).toHaveBeenCalled();
  });
});
