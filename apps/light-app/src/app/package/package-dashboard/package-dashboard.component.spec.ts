import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PackageDashboardComponent } from './package-dashboard.component';
import { PackageService } from '../services/package.service';
import { mockPackageService } from '../../shared/services.mock';

describe('PackageDashboardComponent', () => {
  let component: PackageDashboardComponent;
  let fixture: ComponentFixture<PackageDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackageDashboardComponent],
      providers: [
        {
          provide: PackageService,
          useValue: mockPackageService
        }
      ],
      imports: [ScrollingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onPackageSearch', () => {
    it('should called datasoruce queryBy', () => {
      const spy = jest.spyOn(component.dataSource, 'queryBy').mockImplementation();
      component.onPackageSearch('test-term');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onFilterChange', () => {
    it('should called datasoruce queryBy', () => {
      const spy = jest.spyOn(component.dataSource, 'queryBy').mockImplementation();
      component.onFilterChange({ value: ' test' });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onSort', () => {
    it('should called datasoruce queryBy', () => {
      const spy = jest.spyOn(component.dataSource, 'sortBy').mockImplementation();
      component.onSort({ field: ' test', order: 'asc' });
      expect(spy).toHaveBeenCalled();
    });
  });
});
