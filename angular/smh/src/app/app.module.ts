import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GlobalBackgroundComponent } from './global-background/global-background.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { DefaultComponent } from './default/default.component';
import { MainComponent } from './main/main.component';

@NgModule({
  declarations: [
    GlobalBackgroundComponent,
    UserInfoComponent,
    AppComponent,
    DefaultComponent,
    MainComponent,
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
    MainComponent
  ]
})
export class AppModule { }
