import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs';

import { TopCoinsByTotalVolumeResponse } from '../shared/cryptocompare/interfaces';
import { CryptoCompareDataService } from '../shared/cryptocompare/cryptocompare-data.service';

@Injectable()
export class CoinsByTotalVolumeResolverForHomePage implements Resolve<TopCoinsByTotalVolumeResponse> {
    numberOfCoins = 10;
    page = 0;
    conversionCurrency = 'USD';

    constructor(private cryptoCompareDataService: CryptoCompareDataService) {}
     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TopCoinsByTotalVolumeResponse> {
        return this.cryptoCompareDataService.getTopCoinsByTotalVolume(this.conversionCurrency, this.numberOfCoins, this.page);
    }
}
