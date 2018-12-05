import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs';

import { TopCoinsByTotalVolumeResponse } from '../shared/cryptocompare/interfaces';
import { CryptoCompareDataService } from '../shared/cryptocompare/cryptocompare-data.service';

@Injectable()
export class CoinsByTotalVolumeResolver implements Resolve<TopCoinsByTotalVolumeResponse> {
    numberOfCoins = 100;

    constructor(private cryptoCompareDataService: CryptoCompareDataService) {}
     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TopCoinsByTotalVolumeResponse> {
        const coinToCurrency = route.params.coinToCurrency;
        const page = route.params.page;
        console.log('in resolver');
        return this.cryptoCompareDataService.getTopCoinsByTotalVolume(coinToCurrency, this.numberOfCoins);
    }
}
