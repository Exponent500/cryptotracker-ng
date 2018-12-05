import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { CoinsByTotalVolumeResolverForHomePage } from './home-resolver.service';

@NgModule({
    declarations: [HomeComponent],
    imports: [SharedModule],
    exports: [HomeComponent],
    providers: [CoinsByTotalVolumeResolverForHomePage]
})
export class HomeModule {}
