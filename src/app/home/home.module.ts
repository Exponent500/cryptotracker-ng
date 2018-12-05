import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { CoinsByTotalVolumeResolverForHomePage } from './home-resolver.service';
import { MatProgressSpinnerModule } from '@angular/material';

@NgModule({
    declarations: [HomeComponent],
    imports: [
        SharedModule,
        MatProgressSpinnerModule
    ],
    exports: [HomeComponent],
    providers: [CoinsByTotalVolumeResolverForHomePage]
})
export class HomeModule {}
