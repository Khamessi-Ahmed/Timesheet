import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManNotificationComponent } from './man-notification.component';

describe('ManNotificationComponent', () => {
  let component: ManNotificationComponent;
  let fixture: ComponentFixture<ManNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
