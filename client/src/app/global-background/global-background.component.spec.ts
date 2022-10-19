import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalBackgroundComponent } from './global-background.component';

describe('GlobalBackgroundComponent', () => {
  let component: GlobalBackgroundComponent;
  let fixture: ComponentFixture<GlobalBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalBackgroundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
