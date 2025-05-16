import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboaodGlobalComponent } from './dashboaod-global.component';

describe('DashboaodGlobalComponent', () => {
  let component: DashboaodGlobalComponent;
  let fixture: ComponentFixture<DashboaodGlobalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboaodGlobalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboaodGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
