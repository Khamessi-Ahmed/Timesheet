import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpNotificationComponent } from './emp-notification.component';

describe('EmpNotificationComponent', () => {
  let component: EmpNotificationComponent;
  let fixture: ComponentFixture<EmpNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
