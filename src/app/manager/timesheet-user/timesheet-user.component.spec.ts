import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetUserComponent } from './timesheet-user.component';

describe('TimesheetUserComponent', () => {
  let component: TimesheetUserComponent;
  let fixture: ComponentFixture<TimesheetUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
