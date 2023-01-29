import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchBarComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call searchInfo', () => {
    const spy = jest.spyOn(component.searchInfo,'emit');
    component.onShowSearchInfo('term');
    expect(spy).toHaveBeenCalled();
  });

  it('should call clearInfo', () => {
    const spy = jest.spyOn(component.clearInfo,'emit');
    component.onHideSearchInfo();
    expect(spy).toHaveBeenCalled();
  });

  it('should call showLayers', () => {
    const spy = jest.spyOn(component.showLayers,'emit');
    component.onShowlayerInfo();
    expect(spy).toHaveBeenCalled();
  });

  it('should call toggleMenu', () => {
    const spy = jest.spyOn(component.toggleMenu,'emit');
    component.onToggleMenu();
    expect(spy).toHaveBeenCalled();
  });
});
