import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { DialogModule } from '@angular/cdk/dialog';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GlobalBackgroundComponent } from './global-background/global-background.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { DefaultComponent } from './default/default.component';
import { MainComponent } from './main/main.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActionButtonComponent, PromptDialogComponent } from './action-button/action-button.component';

@NgModule({
  declarations: [
    GlobalBackgroundComponent,
    UserInfoComponent,
    AppComponent,
    DefaultComponent,
    MainComponent,
    ActionButtonComponent,
    PromptDialogComponent,
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
    ActionButtonComponent
  ]
})
export class AppModule { }
