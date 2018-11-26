import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoinsComponent } from './coins.component';
import { CoinsByTotalVolumeResolver } from './coins-resolver.service';

const coinsRoutes: Routes = [
    { path: '', component: CoinsComponent, resolve: { coinsByTotalVolume: CoinsByTotalVolumeResolver } }
];

@NgModule({
    imports: [RouterModule.forChild(coinsRoutes)],
    exports: [RouterModule]
})
export class CoinsRoutingModule {}
