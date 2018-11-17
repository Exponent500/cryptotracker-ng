import { NgModule } from '@angular/core';

import { CoinsComponent } from './coins.component';
import { CoinsRoutingModule } from './coins-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [CoinsComponent],
    imports: [
        CoinsRoutingModule,
        SharedModule
    ]
})
export class CoinsModule {}
