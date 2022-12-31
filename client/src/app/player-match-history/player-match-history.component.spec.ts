import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerMatchHistoryComponent } from './player-match-history.component';

describe('PlayerMatchHistoryComponent', () => {
  let component: PlayerMatchHistoryComponent;
  let fixture: ComponentFixture<PlayerMatchHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerMatchHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerMatchHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
