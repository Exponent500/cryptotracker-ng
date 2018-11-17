import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CryptoCompareDataService } from '../core/cryptocompare/cryptocompare-data.service';
import { CoinData } from '../core/cryptocompare/interfaces';

@Injectable()
export class CoinsService {
    constructor(private cryptoCompareDataService: CryptoCompareDataService) {}

    /**
     * Gets top coins by total volume and extracts out just the Data portion.
     */
    getCoinData(): Observable<CoinData[]> {
        return this.cryptoCompareDataService.getTopCoinsByTotalVolume()
            .pipe(
                map(response => response.Data)
            );
    }
}
