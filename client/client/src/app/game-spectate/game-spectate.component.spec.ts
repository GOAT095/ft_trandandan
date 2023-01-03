import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSpectateComponent } from './game-spectate.component';

describe('GameSpectateComponent', () => {
  let component: GameSpectateComponent;
  let fixture: ComponentFixture<GameSpectateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameSpectateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameSpectateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
