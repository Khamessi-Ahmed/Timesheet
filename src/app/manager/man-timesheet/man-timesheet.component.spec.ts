import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManTimesheetComponent } from './man-timesheet.component';

describe('ManTimesheetComponent', () => {
  let component: ManTimesheetComponent;
  let fixture: ComponentFixture<ManTimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManTimesheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
