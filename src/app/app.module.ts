import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { CoinsService } from './coins/coins.service';
import { CryptoCompareDataService } from './core/cryptocompare/cryptocompare-data.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule
  ],
  providers: [CoinsService, CryptoCompareDataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
