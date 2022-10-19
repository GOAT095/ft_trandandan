import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHelpDialogComponent } from './game-help-dialog.component';

describe('GameHelpDialogComponent', () => {
  let component: GameHelpDialogComponent;
  let fixture: ComponentFixture<GameHelpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameHelpDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameHelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
