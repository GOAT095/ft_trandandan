import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GlobalBackgroundComponent } from './global-background/global-background.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { DefaultComponent } from './default/default.component';
import { MainComponent } from './main/main.component';
import { PlayerInfoComponent } from './player-info/player-info.component';
import { PlayerSettingsComponent } from './player-settings/player-settings.component';

@NgModule({
  declarations: [
    GlobalBackgroundComponent,
    UserInfoComponent,
    AppComponent,
    DefaultComponent,
    MainComponent,
    PlayerInfoComponent,
    PlayerSettingsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [
    UserInfoComponent,
    DefaultComponent,
    MainComponent,
    PlayerInfoComponent,
    PlayerSettingsComponent
  ]
})
export class AppModule { }
