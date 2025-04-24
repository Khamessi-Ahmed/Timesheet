import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManLayoutComponent } from './man-layout.component';

describe('ManLayoutComponent', () => {
  let component: ManLayoutComponent;
  let fixture: ComponentFixture<ManLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
