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
        const conversionCurrency = route.params.conversionCurrency;
        const page = route.params.page - 1;
        return this.cryptoCompareDataService.getTopCoinsByTotalVolume(conversionCurrency, this.numberOfCoins, page);
    }
}
