import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManProjectComponent } from './man-project.component';

describe('ManProjectComponent', () => {
  let component: ManProjectComponent;
  let fixture: ComponentFixture<ManProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
