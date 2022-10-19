import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerFriendsComponent } from './player-friends.component';

describe('PlayerFriendsComponent', () => {
  let component: PlayerFriendsComponent;
  let fixture: ComponentFixture<PlayerFriendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerFriendsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerFriendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
