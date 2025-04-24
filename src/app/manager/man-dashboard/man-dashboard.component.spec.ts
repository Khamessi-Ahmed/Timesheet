import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManDashboardComponent } from './man-dashboard.component';

describe('ManDashboardComponent', () => {
  let component: ManDashboardComponent;
  let fixture: ComponentFixture<ManDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
