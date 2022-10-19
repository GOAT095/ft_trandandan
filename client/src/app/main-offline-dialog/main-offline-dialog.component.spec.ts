import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainOfflineDialogComponent } from './main-offline-dialog.component';

describe('MainOfflineDialogComponent', () => {
  let component: MainOfflineDialogComponent;
  let fixture: ComponentFixture<MainOfflineDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainOfflineDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainOfflineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
