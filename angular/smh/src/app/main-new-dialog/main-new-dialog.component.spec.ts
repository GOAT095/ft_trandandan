import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainNewDialogComponent } from './main-new-dialog.component';

describe('MainNewDialogComponent', () => {
  let component: MainNewDialogComponent;
  let fixture: ComponentFixture<MainNewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainNewDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainNewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
