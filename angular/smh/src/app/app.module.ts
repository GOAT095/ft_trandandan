import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    FormsModule,
    DialogModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [
    UserInfoComponent,
    DefaultComponent,
    MainComponent,
    ActionButtonComponent,
    PlayerFriendsComponent,
    PlayerInfoShortComponent
  ]
})
export class AppModule { }
