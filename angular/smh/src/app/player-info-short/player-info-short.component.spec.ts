import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerInfoShortComponent } from './player-info-short.component';

describe('PlayerInfoShortComponent', () => {
  let component: PlayerInfoShortComponent;
  let fixture: ComponentFixture<PlayerInfoShortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerInfoShortComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerInfoShortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
