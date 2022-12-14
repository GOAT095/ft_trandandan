import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientXsrfModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CdkMenuModule } from '@angular/cdk/menu';
import {CdkListboxModule} from '@angular/cdk/listbox'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GlobalBackgroundComponent } from './global-background/global-background.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { DefaultComponent } from './default/default.component';
import { MainComponent } from './main/main.component';
import { ActionButtonComponent, PromptDialogComponent } from './action-button/action-button.component';
import { PlayerInfoComponent } from './player-info/player-info.component';
import { 
  PlayerSettingsComponent,
  TwoFactorActionButtonComponent,
  TwoFactorDialogPromptComponent
} from './player-settings/player-settings.component';
import { PlayerFriendRequestsComponent } from './player-friend-requests/player-friend-requests.component';
import { PlayerFriendsComponent } from './player-friends/player-friends.component';
import { PlayerInfoShortComponent } from './player-info-short/player-info-short.component';
import { LogoutButtonComponent } from './logout-button/logout-button.component';
import { TwoFactorCheckComponent } from './two-factor-check/two-factor-check.component';
import { MainNewDialogComponent } from './main-new-dialog/main-new-dialog.component';
import { MainOfflineDialogComponent } from './main-offline-dialog/main-offline-dialog.component';
import { PongGameComponent } from './pong-game/pong-game.component';
import { GameHelpDialogComponent } from './game-help-dialog/game-help-dialog.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { RoomSearchComponent, RoomPasswordPromptComponent } from './room-search/room-search.component';
import { NewRoomComponent } from './new-room/new-room.component';
import { RoomListComponent } from './room-list/room-list.component';
import { FriendsListComponent } from './friends-list/friends-list.component';
import { RoomSettingsComponent } from './room-settings/room-settings.component';
import { OauthDialogComponent } from './oauth-dialog/oauth-dialog.component';
import { PlayerMatchHistoryComponent } from './player-match-history/player-match-history.component';
import { GameSpectateComponent } from './game-spectate/game-spectate.component';
import { SwiperModule } from 'swiper/angular';
import { GameInviteComponent } from './game-invite/game-invite.component';
import { PongGameComponentV2 } from './pong-game/pong-game-v2.component';

import { CommonModule } from '@angular/common';
//import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    GlobalBackgroundComponent,
    UserInfoComponent,
    AppComponent,
    DefaultComponent,
    MainComponent,
    ActionButtonComponent,
    PromptDialogComponent,
    PlayerInfoComponent,
    TwoFactorActionButtonComponent,
    TwoFactorDialogPromptComponent,
    PlayerSettingsComponent,
    PlayerFriendRequestsComponent,
    PlayerFriendsComponent,
    PlayerInfoShortComponent,
    LogoutButtonComponent,
    TwoFactorCheckComponent,
    MainNewDialogComponent,
    MainOfflineDialogComponent,
    PongGameComponent,
    GameHelpDialogComponent,
    RoomSearchComponent,
    NewRoomComponent,
    RoomListComponent,
    FriendsListComponent,
    RoomPasswordPromptComponent,
    RoomSettingsComponent,
    OauthDialogComponent,
    PlayerMatchHistoryComponent,
    GameSpectateComponent,
    GameInviteComponent,
    PongGameComponentV2
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'auth-cookie',
    }),
    AppRoutingModule,
    NoopAnimationsModule,
    FormsModule,
    DialogModule,
    CdkMenuModule,
    CdkListboxModule,
    OverlayModule,
    SwiperModule,
    CommonModule,
    BrowserAnimationsModule,
    //ToastrModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [
    UserInfoComponent,
    DefaultComponent,
    MainComponent,
    ActionButtonComponent,
    PlayerFriendsComponent,
    PlayerInfoShortComponent,
    LogoutButtonComponent,
    TwoFactorCheckComponent,
  ]
})
export class AppModule { }
