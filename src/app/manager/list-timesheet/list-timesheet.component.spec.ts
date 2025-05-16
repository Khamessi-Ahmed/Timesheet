import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTimesheetComponent } from './list-timesheet.component';

describe('ListTimesheetComponent', () => {
  let component: ListTimesheetComponent;
  let fixture: ComponentFixture<ListTimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTimesheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
