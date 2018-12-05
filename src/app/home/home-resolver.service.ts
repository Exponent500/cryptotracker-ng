import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs';

import { TopCoinsByTotalVolumeResponse } from '../shared/cryptocompare/interfaces';
import { CryptoCompareDataService } from '../shared/cryptocompare/cryptocompare-data.service';

@Injectable()
export class CoinsByTotalVolumeResolverForHomePage implements Resolve<TopCoinsByTotalVolumeResponse> {
    numberOfCoins = 10;
    page = 1;
    coinToCurrency = 'USD';

    constructor(private cryptoCompareDataService: CryptoCompareDataService) {}
     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TopCoinsByTotalVolumeResponse> {
        console.log('in resolver');
        return this.cryptoCompareDataService.getTopCoinsByTotalVolume(this.coinToCurrency, this.numberOfCoins, this.page);
    }
}
