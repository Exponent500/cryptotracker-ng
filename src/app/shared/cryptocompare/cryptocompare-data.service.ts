import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { TopCoinsByTotalVolumeResponse, FullCoinTradingDataResponse } from './interfaces';

const BASE_URL = 'https://min-api.cryptocompare.com/data/';
const TOP_COINS_BY_TOTAL_VOLUME_URL = `${BASE_URL}top/totalvol`;
const FULL_DATA_FOR_COINS_URL = `${BASE_URL}pricemultifull`;

@Injectable()
export class CryptoCompareDataService {
    constructor(private httpClient: HttpClient) {}

    /**
     * Fetches coin data for the numberOfCoins provided, sorted by volume and priced in the currencySymbol provided.
     */
    getTopCoinsByTotalVolume(currencySymbol: string, numberOfCoins: number): Observable<TopCoinsByTotalVolumeResponse> {
        // params are hard-coded for now. Eventually would want to re-evaulate which would be configurable by UI
        const params = new HttpParams().set('tsym', currencySymbol).set('limit', numberOfCoins.toString());
        return this.httpClient.get<TopCoinsByTotalVolumeResponse>(TOP_COINS_BY_TOTAL_VOLUME_URL, { params: params });
    }

    getFullCoinTradingData(currencies: string[]): Observable<FullCoinTradingDataResponse> {
        const fromCurrencySymbols = currencies.join(',');
        const params = new HttpParams().set('fsyms', fromCurrencySymbols).set('tsyms', 'USD');
        return this.httpClient.get<FullCoinTradingDataResponse>(FULL_DATA_FOR_COINS_URL, { params: params });
    }
}
