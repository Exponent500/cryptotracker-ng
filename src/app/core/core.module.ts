import { NgModule } from '@angular/core';

import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from '../app-routing.module';
import { CoinsService } from '../coins/coins.service';
import { CryptoCompareDataService } from '../shared/cryptocompare/cryptocompare-data.service';
import { FooterComponent } from './footer/footer.component';

@NgModule({
    declarations: [
        HomeComponent,
        HeaderComponent,
        FooterComponent
    ],
    imports: [AppRoutingModule],
    exports: [
        HeaderComponent,
        FooterComponent,
        AppRoutingModule
    ],
    providers: [
        CoinsService,
        CryptoCompareDataService
    ]
})
export class CoreModule {}
