import { NgModule } from '@angular/core';

import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from '../app-routing.module';
import { CoinsService } from '../coins/coins.service';
import { CryptoCompareDataService } from '../shared/cryptocompare/cryptocompare-data.service';

@NgModule({
    declarations: [
        HomeComponent,
        HeaderComponent
    ],
    imports: [AppRoutingModule],
    exports: [
        HeaderComponent,
        AppRoutingModule
    ],
    providers: [
        CoinsService,
        CryptoCompareDataService
    ]
})
export class CoreModule {}
