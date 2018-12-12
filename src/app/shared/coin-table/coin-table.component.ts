import { Component, Input } from '@angular/core';
import { CoinDataWithSocketData } from 'src/app/shared/cryptocompare/interfaces';

@Component({
    selector: 'app-coin-table',
    templateUrl: './coin-table.component.html',
    styleUrls: ['./coin-table.component.scss']
})
export class CoinTableComponent {
    @Input() coinData: CoinDataWithSocketData[];
    @Input() page: number = 0;
}
