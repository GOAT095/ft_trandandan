import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultComponent } from './default/default.component';
import { MainComponent } from './main/main.component';
import { TwoFactorCheckComponent } from './two-factor-check/two-factor-check.component';
import { PlayerFriendRequestsComponent } from './player-friend-requests/player-friend-requests.component';
import { PlayerFriendsComponent } from './player-friends/player-friends.component';
import { PlayerInfoComponent } from './player-info/player-info.component';
import { PlayerMatchHistoryComponent } from './player-match-history/player-match-history.component';

const routes: Routes = [
  { path: '2fa-step', component: TwoFactorCheckComponent},
  { path: 'default', component: MainComponent},
  { path: '', component: DefaultComponent},
  { path: 'friends/search', component: PlayerFriendsComponent},
  { path: 'friends/requests', component: PlayerFriendRequestsComponent},
  { path: 'profile', component: PlayerInfoComponent},
  { path: 'history', component: PlayerMatchHistoryComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

