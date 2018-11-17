import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoinsComponent } from './coins.component';
import { CoinsRoutingModule } from './coins-routing.module';

@NgModule({
    declarations: [CoinsComponent],
    imports: [
        CoinsRoutingModule,
        CommonModule
    ]
})
export class CoinsModule {}
