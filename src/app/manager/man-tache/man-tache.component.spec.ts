import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManTacheComponent } from './man-tache.component';

describe('ManTacheComponent', () => {
  let component: ManTacheComponent;
  let fixture: ComponentFixture<ManTacheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManTacheComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManTacheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
