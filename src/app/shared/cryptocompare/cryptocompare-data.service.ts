import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { TopCoinsByTotalVolumeResponse } from './interfaces';

const BASE_URL = 'https://min-api.cryptocompare.com/data/';
const TOP_COINS_BY_TOTAL_VOLUME_URL = `${BASE_URL}top/totalvol`;

@Injectable()
export class CryptoCompareDataService {
    coinToCurrency = '';
    constructor(private httpClient: HttpClient) {}

    /**
     * Fetches top coins sorted by total volume, sorted by volume and priced in the currencySymbol provided.
     * @param currencySymbol - the conversion currency of interest
     * @param numberOfCoins - number of coins to get data for
     * @param page - page of results
     */
    getTopCoinsByTotalVolume(conversionCurrency: string, numberOfCoins: number, page: number): Observable<TopCoinsByTotalVolumeResponse> {
        this.coinToCurrency = conversionCurrency;
        const params = new HttpParams().set('tsym', conversionCurrency).set('limit', numberOfCoins.toString()).set('page', page.toString());
        return this.httpClient.get<TopCoinsByTotalVolumeResponse>(TOP_COINS_BY_TOTAL_VOLUME_URL, { params: params });
    }
}
