import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

import { CCC } from './cryptocompare-socket.utilities';
import { CCCSocketDataModified } from './interfaces';
import { CryptoCompareDataService } from '../cryptocompare/cryptocompare-data.service';

@Injectable()
export class CryptocompareSocketService {
    private socket: SocketIOClient.Socket;
    private socketSubscriptions: string [] = [];
    private currentPrice = {};
    private BTCPriceInConversionCurrency: number;
    private ETHPriceInConversionCurrency: number;

    constructor(private cryptocompareDataService: CryptoCompareDataService) {
        this.socket = io('https://streamer.cryptocompare.com/');
    }

    /**
     * Add socket subscriptions of interest.
     */
    addSubscriptions(subscriptions: string[]) {
        this.socketSubscriptions = subscriptions;
        this.socket.emit('SubAdd', { subs: subscriptions });
    }

    /**
     * Emits socket messages pertaining to the socket subscriptions that the user is currently subscribed to.
     */
    onNewMessage(): Observable<CCCSocketDataModified> {
        return Observable.create(observer => {
            this.socket.on('m', (message: string) => {
                const messageType = message.substring(0, message.indexOf('~'));

                if (messageType === CCC.STATIC.TYPE.CURRENTAGG) {
                    observer.next(this.mapCURRENTAGGToCCCSocketModified(message));
                } else if (messageType === CCC.STATIC.TYPE.FULLVOLUME) {
                    this.addFullVolumeDataToCurrentPriceData(message);
                }
            });
        });
    }

    /**
     * Un-subscribes from all socket subscriptions that are currently being subscribed to.
     */
    unSubscribe() {
        this.socket.emit('SubRemove', { subs: this.socketSubscriptions });
    }

    /**
     * Re-subscribes to all existing subscriptions.
     */
    reSubscribe() {
        this.socket.emit('SubAdd', { subs: this.socketSubscriptions });
    }


    private addFullVolumeDataToCurrentPriceData = (message: string) => {
        const volData = CCC.FULLVOLUME.unpack(message);
        const from = volData['SYMBOL'];
        const to = this.cryptocompareDataService.coinToCurrency;
        const tsym = CCC.STATIC.CURRENCY.getSymbol(to);
        const pair = from + to;

        if (!this.currentPrice.hasOwnProperty(pair)) {
            this.currentPrice[pair] = {};
        }

        this.currentPrice[pair]['FULLVOLUMEFROM'] = parseFloat(volData['FULLVOLUME']);

        if (pair === 'BTCBTC') {
            this.currentPrice[pair]['FULLVOLUMETO'] = CCC.convertValueToDisplay(tsym, this.currentPrice[pair]['FULLVOLUMEFROM'], 'short');
            return;
        }

        if (this.currentPrice[pair]['PRICE']) {
            const fullVolumeTo = ( (this.currentPrice[pair]['FULLVOLUMEFROM'] - this.currentPrice[pair]['VOLUME24HOUR']) *
                this.currentPrice[pair]['PRICE'] ) + this.currentPrice[pair]['VOLUME24HOURTO'];
            this.currentPrice[pair]['FULLVOLUMETO'] = CCC.convertValueToDisplay(tsym, fullVolumeTo, 'short');
        }
    }

    /**
     * Convert cryptocompare CURRENTAGG subscription socket data to a dictionary with a shape of CCCSocketDataModified.
     */
    private mapCURRENTAGGToCCCSocketModified(message: string): CCCSocketDataModified {
        const unPackedData = CCC.CURRENT.unpack(message);
        const from: string = unPackedData['FROMSYMBOL'];
        let to: string = unPackedData['TOSYMBOL'];
        const price: number = unPackedData['PRICE'];
        let tsym: string = CCC.STATIC.CURRENCY.getSymbol(to);
        let pair = from + to;

        if (pair === 'BTC' + this.cryptocompareDataService.coinToCurrency) {
            this.BTCPriceInConversionCurrency = unPackedData.PRICE;
        } else if (pair === 'ETH' + this.cryptocompareDataService.coinToCurrency) {
            this.ETHPriceInConversionCurrency = unPackedData.PRICE;
        }

        if (!this.currentPrice.hasOwnProperty(pair)) {
            this.currentPrice[pair] = {};
        }

        // if socketData's TOSYMBOL property does not equal the currencyToSymbol property within the
        // cryptocompareDataService, then this is an indication that the coin in question does not have a direct
        // pair with the currencyToSymbol property, and will need to multiply it's values by the values within the BTC to
        // currencyToSymbol pair.
        if (to !== this.cryptocompareDataService.coinToCurrency) {
            tsym = CCC.STATIC.CURRENCY.getSymbol(to);
            pair = from + this.cryptocompareDataService.coinToCurrency;
            for (const key in unPackedData) {
                this.currentPrice[pair][key] = unPackedData[key];
            }

            if (to === from) {
                this.currentPrice[pair]['PRICE'] = 1;
                this.currentPrice[pair]['OPEN24HOUR'] = 1;
            }
            
            let conversionCurrency;

            if (to === 'BTC') {
                conversionCurrency = this.BTCPriceInConversionCurrency;
            } else if (to === 'ETH') {
                conversionCurrency = this.ETHPriceInConversionCurrency;
            }

            this.currentPrice[pair]['CHANGE24HOUR'] =
                CCC.convertValueToDisplay(tsym, (this.currentPrice[pair]['PRICE'] - this.currentPrice[pair]['OPEN24HOUR']) * conversionCurrency);
            this.currentPrice[pair]['CHANGE24HOURPCT'] =
                ( (this.currentPrice[pair]['PRICE'] - this.currentPrice[pair]['OPEN24HOUR']) /
                this.currentPrice[pair]['OPEN24HOUR'] * 100).toFixed(2) + '%';
            this.currentPrice[pair]['PRICE'] = price * conversionCurrency;
            return this.currentPrice;
        }

        for (const key in unPackedData) {
            this.currentPrice[pair][key] = unPackedData[key];
        }

        if (to === from) {
            this.currentPrice[pair]['PRICE'] = 1;
            this.currentPrice[pair]['OPEN24HOUR'] = 1;
        }

        this.currentPrice[pair]['CHANGE24HOUR'] =
            CCC.convertValueToDisplay(tsym, (this.currentPrice[pair]['PRICE'] - this.currentPrice[pair]['OPEN24HOUR']));
        this.currentPrice[pair]['CHANGE24HOURPCT'] =
            ((this.currentPrice[pair]['PRICE'] - this.currentPrice[pair]['OPEN24HOUR']) /
            this.currentPrice[pair]['OPEN24HOUR'] * 100).toFixed(2) + '%';
        return this.currentPrice;
    }
}
