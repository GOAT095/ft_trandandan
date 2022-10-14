import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientXsrfModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CdkMenuModule } from '@angular/cdk/menu';

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
    CdkMenuModule
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
    TwoFactorCheckComponent
  ]
})
export class AppModule { }
