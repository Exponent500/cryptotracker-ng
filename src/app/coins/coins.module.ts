import { NgModule } from '@angular/core';

import { CoinsComponent } from './coins.component';
import { CoinsRoutingModule } from './coins-routing.module';
import { SharedModule } from '../shared/shared.module';
import { CoinsByTotalVolumeResolver } from '../coins/coins-resolver.service';
import { MatProgressSpinnerModule } from '@angular/material';
import { CoinTableComponent } from './coin-table/coin-table.component';


@NgModule({
    declarations: [
        CoinsComponent,
        CoinTableComponent
    ],
    imports: [
        CoinsRoutingModule,
        SharedModule,
        MatProgressSpinnerModule
    ],
    providers: [CoinsByTotalVolumeResolver]
})
export class CoinsModule {}
