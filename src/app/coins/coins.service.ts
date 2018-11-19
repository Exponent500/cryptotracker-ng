import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { CryptoCompareDataService } from '../shared/cryptocompare/cryptocompare-data.service';
import { CoinData, SocketData, CCCSocketDataModified, TopCoinsByTotalVolumeResponse } from '../shared/cryptocompare/interfaces';
import { CryptocompareSocketService } from '../shared/cryptocompare/cryptocompare-socket.service';

@Injectable()
export class CoinsService {
    coinsDataToDisplay: CoinData[] = [];
    constructor(private cryptoCompareDataService: CryptoCompareDataService,
                private cryptocompareSocketService: CryptocompareSocketService) {}

    /**
     * Gets coin data in a format that a consumer can display on the view.
     */
    getCoinData(): Observable<CoinData[]> {
        return this.getTopCoinsByTotalVolume()
            .pipe(
                mergeMap( response => {
                    const topCoinsByTotalVolumeData = response.Data;
                    const cryptocompareSubscriptionsToAdd = topCoinsByTotalVolumeData.map( item => item.ConversionInfo.SubsNeeded[0]);
                    this.addSocketSubscriptions(cryptocompareSubscriptionsToAdd);
                    return this.subscribeToSocket()
                        .pipe(
                            map(socketData => this.addSocketDataToCoinData(socketData, topCoinsByTotalVolumeData))
                        );
                })
            );
    }

    /**
     * Gets cryptocompare's "TopCoinsByTotalVolume" data.
     */
    getTopCoinsByTotalVolume(): Observable<TopCoinsByTotalVolumeResponse> {
        return this.cryptoCompareDataService.getTopCoinsByTotalVolume();
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
        return this.cryptocompareSocketService.onNewMessage();
    }

    // Unsubscribes from the cryptocompare socket.
    unSubscribeFromSocket() {
        this.cryptocompareSocketService.unSubscribe();
    }

    /**
     * Takes cryptocompare socket data and adds it to coin data.
     */
    private addSocketDataToCoinData(socketData: CCCSocketDataModified, coinData: CoinData[]) {
        console.log(socketData);
        const keys = Object.keys(socketData);
        keys.forEach( key => {
            const index = coinData.findIndex( datum => {
                return (key === (datum.ConversionInfo.CurrencyFrom + datum.ConversionInfo.CurrencyTo));
            });
            if (index !== -1) {
                const socketDatum: SocketData = {
                    price: socketData[key].PRICE,
                    volume: socketData[key].VOLUME24HOURTO,
                    mcap: socketData[key].PRICE * coinData[index].ConversionInfo.Supply,
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