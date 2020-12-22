import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { Routes, RouterModule} from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BrokersComponent } from './brokers/brokers.component';
import { SharesComponent } from './shares/shares.component';
import { SettingsComponent } from './settings/settings.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { InputComponent } from './input/input.component';
import { ModalComponent } from './modal/modal.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



const appRoutes: Routes = [
  { path: '',         component: HomeComponent },
  { path: 'brokers',  component: BrokersComponent },
  { path: 'shares',   component: SharesComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**',       component: NotFoundComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BrokersComponent,
    SharesComponent,
    SettingsComponent,
    NotFoundComponent,
    InputComponent,
    ModalComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,

    FontAwesomeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
