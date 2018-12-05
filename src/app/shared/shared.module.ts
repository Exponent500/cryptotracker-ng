import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinTableComponent } from './coin-table/coin-table.component';

@NgModule({
    declarations: [CoinTableComponent],
    imports: [CommonModule],
    exports: [CommonModule, CoinTableComponent]
})
export class SharedModule {}
