import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerFriendRequestsComponent } from './player-friend-requests.component';

describe('PlayerFriendRequestsComponent', () => {
  let component: PlayerFriendRequestsComponent;
  let fixture: ComponentFixture<PlayerFriendRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerFriendRequestsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerFriendRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
