import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { CoinsService } from './coins/coins.service';
import { CryptoCompareDataService } from './shared/cryptocompare/cryptocompare-data.service';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [CoinsService, CryptoCompareDataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
