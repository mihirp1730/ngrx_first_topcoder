import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { OpportunityContainerComponent } from './opportunity-container.component';
import { QuillModule } from 'ngx-quill';

describe('OpportunityContainerComponent', () => {
  let component: OpportunityContainerComponent;
  let fixture: ComponentFixture<OpportunityContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, QuillModule],
      declarations: [OpportunityContainerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
