import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CoinsByTotalVolumeResolverForHomePage } from './home/home-resolver.service';

const appRoutes: Routes = [
    { path: '', component: HomeComponent, resolve: { coinsByTotalVolume: CoinsByTotalVolumeResolverForHomePage } },
    { path: 'coins', loadChildren: './coins/coins.module#CoinsModule' }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
