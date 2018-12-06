import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CryptoCompareDataService } from '../shared/cryptocompare/cryptocompare-data.service';
import {
    CoinData,
    SocketData,
    CCCSocketDataModified,
    CoinDataWithSocketData } from '../shared/cryptocompare/interfaces';
import { CryptocompareSocketService } from '../shared/cryptocompare/cryptocompare-socket.service';
import { CCC } from '../shared/cryptocompare/cryptocompare-socket.utilities';

@Injectable()
export class CoinsService {
    coinsDataToDisplay: CoinDataWithSocketData[] = [];
    isStreaming = false;
    constructor(private cryptoCompareDataService: CryptoCompareDataService,
                private cryptocompareSocketService: CryptocompareSocketService) {}

    /**
     * Gets real-time coin data in a format that a consumer can display on the view.
     * @param topCoinsByTotalVolume - coin data sorted by total volume
     */
    getRealTimeCoinData(topCoinsByTotalVolume: CoinData[]): Observable<CoinDataWithSocketData[]> {
        const cryptocompareSubscriptionsToAdd: string[] = this.generateCCSocketSubscriptions(topCoinsByTotalVolume);
        this.addCCSocketSubscriptions(cryptocompareSubscriptionsToAdd);
        return this.subscribeToCCSocket()
            .pipe(
                map(socketData => this.addCCSocketDataToCoinData(socketData, topCoinsByTotalVolume))
            );
    }

    // Unsubscribes from the cryptocompare socket.
    stopStream() {
        this.isStreaming = false;
        this.cryptocompareSocketService.unSubscribe();
    }

    // Restarts a stream that was stopped.
    restartStream() {
        this.isStreaming = true;
        this.cryptocompareSocketService.reSubscribe();
    }

    /**
     * Adds crypto compare socket subscriptions of interest to the crypto compare socket service.
     * @param subscriptions - subscriptions to add
     */
    private addCCSocketSubscriptions(subscriptions: string[]) {
        this.cryptocompareSocketService.addSubscriptions(subscriptions);
    }

    /**
     * Subscribes to cryptocompare's socket.io server.
     * You should make sure you add subscriptions of interest before subscribing, otherwise no data will be emitted.
     */
    private subscribeToCCSocket(): Observable<CCCSocketDataModified> {
        this.isStreaming = true;
        return this.cryptocompareSocketService.onNewMessage();
    }

    /**
     * Generates cryptocompare socket subscriptions of interest based on the provided topCoinsByTotalVolume data.
     * @param topCoinsByTotalVolume - coin data sorted by total volume
     */
    private generateCCSocketSubscriptions(topCoinsByTotalVolume: CoinData[]): string[] {
        const cryptocompareSubscriptionsToAdd = [];
        topCoinsByTotalVolume.forEach( item => {
            const currencyFrom: string = item.ConversionInfo.CurrencyFrom;
            const currencyTo: string = item.ConversionInfo.CurrencyTo;
            const market: string = item.ConversionInfo.Market;
            const subscriptionBase: string = item.ConversionInfo.SubBase;
            const subsNeeded: string[] = item.ConversionInfo.SubsNeeded;
            const AGGsubscriptionToAdd = `${subscriptionBase}${market}~${currencyFrom}~${currencyTo}`;
            const totalVolumeSubscriptionToAdd = `11~${currencyFrom}`;

            if (item.ConversionInfo.Conversion === 'multiply') {
                cryptocompareSubscriptionsToAdd.push(...subsNeeded);
            } else {
                cryptocompareSubscriptionsToAdd.push(AGGsubscriptionToAdd);
            }
            cryptocompareSubscriptionsToAdd.push(totalVolumeSubscriptionToAdd);
        });
        return cryptocompareSubscriptionsToAdd;
    }

    /**
     * Takes cryptocompare socket data and adds it to the appropriate key within the master coin data.
     * @param socketData -socketData to add.
     * @param coinData -master coin data to add socket data to.
     */
    private addCCSocketDataToCoinData(socketData: CCCSocketDataModified, coinData: CoinData[]): CoinDataWithSocketData[] {
        const keys = Object.keys(socketData);
        const tsym = CCC.STATIC.CURRENCY.getSymbol(this.cryptoCompareDataService.conversionCurrency);
        keys.forEach( key => {
            const price = socketData[key].PRICE;
            const index = coinData.findIndex( datum => {
                return (key === (datum.ConversionInfo.CurrencyFrom + datum.ConversionInfo.CurrencyTo));
            });
            if (index !== -1) {
                const coinSupply = coinData[index].ConversionInfo.Supply;
                const socketDatum: SocketData = {
                    price: price ? CCC.convertValueToDisplay(tsym, price) : '-',
                    volume: socketData[key].FULLVOLUMETO ?
                            socketData[key].FULLVOLUMETO :
                            CCC.convertValueToDisplay(tsym, socketData[key].FULLVOLUMEFROM * price, 'short'),
                    mcap: coinSupply ? CCC.convertValueToDisplay(tsym, price * coinSupply, 'short') : '-',
                    changePercent: socketData[key].CHANGE24HOURPCT,
                    flags: socketData[key].FLAGS
                };
                this.coinsDataToDisplay[index].SocketData = socketDatum;
            }
        });
        return this.coinsDataToDisplay;
    }
}
