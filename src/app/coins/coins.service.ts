import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { CryptoCompareDataService } from '../shared/cryptocompare/cryptocompare-data.service';
import { CoinData, SocketData, CCCSocketDataModified, TopCoinsByTotalVolumeResponse } from '../shared/cryptocompare/interfaces';
import { CryptocompareSocketService } from '../shared/cryptocompare/cryptocompare-socket.service';
import { CCC } from '../shared/cryptocompare/cryptocompare-socket.utilities';

@Injectable()
export class CoinsService {
    coinsDataToDisplay: CoinData[] = [];
    isStreaming = false;
    constructor(private cryptoCompareDataService: CryptoCompareDataService,
                private cryptocompareSocketService: CryptocompareSocketService) {}

    /**
     * Gets coin data in a format that a consumer can display on the view.
     */
    getRealTimeCoinData(topCoinsByTotalVolumeData: any): Observable<CoinData[]> {
        const cryptocompareSubscriptionsToAdd = [];
        topCoinsByTotalVolumeData.forEach( item => {
            cryptocompareSubscriptionsToAdd.push(item.ConversionInfo.SubsNeeded[0]);
            cryptocompareSubscriptionsToAdd.push(`11~${item.ConversionInfo.CurrencyFrom}`);
        });
        this.addSocketSubscriptions(cryptocompareSubscriptionsToAdd);
        return this.subscribeToSocket()
            .pipe(
                map(socketData => this.addSocketDataToCoinData(socketData, topCoinsByTotalVolumeData))
            );
    }

    /**
     * Gets cryptocompare's "TopCoinsByTotalVolume" data.
     */
    getTopCoinsByTotalVolume(currency: string, numberOfCoins: number): Observable<TopCoinsByTotalVolumeResponse> {
        return this.cryptoCompareDataService.getTopCoinsByTotalVolume(currency, numberOfCoins);
    }

    /**
     * Adds crypto compare socket subscriptions of interest.
     */
    addSocketSubscriptions(subscriptions: string[]) {
        this.cryptocompareSocketService.addSubscriptions(subscriptions);
    }

    /**
     * Subscribes to cryptocompare's socket.io server.
     * You should make sure you add subscriptions of interest before subscribing, otherwise no data will be emitted.
     */
    subscribeToSocket(): Observable<CCCSocketDataModified> {
        this.isStreaming = true;
        return this.cryptocompareSocketService.onNewMessage();
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
     * Takes cryptocompare socket data and adds it to coin data.
     */
    private addSocketDataToCoinData(socketData: CCCSocketDataModified, coinData: CoinData[]) {
        console.log(socketData);
        const keys = Object.keys(socketData);
        keys.forEach( key => {
            const tsym = CCC.STATIC.CURRENCY.getSymbol(socketData[key].TOSYMBOL);
            const price = socketData[key].PRICE;
            const index = coinData.findIndex( datum => {
                return (key === (datum.ConversionInfo.CurrencyFrom + datum.ConversionInfo.CurrencyTo));
            });
            if (index !== -1) {
                const socketDatum: SocketData = {
                    price: price,
                    volume: socketData[key].FULLVOLUMETO ?
                            socketData[key].FULLVOLUMETO :
                            CCC.convertValueToDisplay(tsym, socketData[key].FULLVOLUMEFROM * price, 'short'),
                    mcap: CCC.convertValueToDisplay(tsym, price * coinData[index].ConversionInfo.Supply, 'short'),
                    changePercent: socketData[key].CHANGE24HOURPCT,
                    flags: socketData[key].FLAGS
            };
            coinData[index].SocketData = socketDatum;
            this.coinsDataToDisplay = coinData;
            console.log(this.coinsDataToDisplay);
            }
        });
        return this.coinsDataToDisplay;
    }
}
