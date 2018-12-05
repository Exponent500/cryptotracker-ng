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
    private coinsSocketData = {};
    private BTCPriceInConversionCurrency: number;
    private ETHPriceInConversionCurrency: number;

    constructor(private cryptocompareDataService: CryptoCompareDataService) {
        this.socket = io('https://streamer.cryptocompare.com/');
    }

    /**
     * Add socket subscriptions of interest.
     * @param subscriptions - subscriptions to add
     */
    addSubscriptions(subscriptions: string[]) {
        console.log(subscriptions);
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
                    observer.next(this.handleCURRENTAGGSocketData(message));
                } else if (messageType === CCC.STATIC.TYPE.FULLVOLUME) {
                    this.addFullVolumeDataToCurrentCoinSocketData(message);
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

    /**
     * Adds socket volume data to the appropriate currencyPair key within the master coinsSocketData object
     * @param socketVolumeData - socket volume data to add.
     */
    private addFullVolumeDataToCurrentCoinSocketData (socketVolumeData: string) {
        const socketVolumeDataUnPacked = CCC.FULLVOLUME.unpack(socketVolumeData);
        const socketDataCurrencyFromTicker = socketVolumeDataUnPacked['SYMBOL'];
        const currencyToConvertToTicker = this.cryptocompareDataService.coinToCurrency;
        const currencyToConvertToSymbol = CCC.STATIC.CURRENCY.getSymbol(currencyToConvertToTicker);
        const currencyPair = socketDataCurrencyFromTicker + currencyToConvertToTicker;

        if (!this.coinsSocketData.hasOwnProperty(currencyPair)) {
            this.coinsSocketData[currencyPair] = {};
        }

        this.coinsSocketData[currencyPair]['FULLVOLUMEFROM'] = parseFloat(socketVolumeDataUnPacked['FULLVOLUME']);

        if (currencyPair === 'BTCBTC') {
            this.coinsSocketData[currencyPair]['FULLVOLUMETO'] =
                CCC.convertValueToDisplay(currencyToConvertToSymbol, this.coinsSocketData[currencyPair]['FULLVOLUMEFROM'], 'short');
            return;
        }

        if (this.coinsSocketData[currencyPair]['PRICE']) {
            const fullVolumeTo = (
                (this.coinsSocketData[currencyPair]['FULLVOLUMEFROM'] - this.coinsSocketData[currencyPair]['VOLUME24HOUR']) *
                this.coinsSocketData[currencyPair]['PRICE'] ) + this.coinsSocketData[currencyPair]['VOLUME24HOURTO'];
            this.coinsSocketData[currencyPair]['FULLVOLUMETO'] =
                CCC.convertValueToDisplay(currencyToConvertToSymbol, fullVolumeTo, 'short');
        }
    }

    /**
     * Unpacks RAW CURRENTAGG socket data, adds it to coinsSocketData and returns said coinsSocketData.
     * @param socketCurrentAGGData -- RAW CURRENTAGG socket data
     */
    private handleCURRENTAGGSocketData(socketCURRENTAGGDataRAW: string): CCCSocketDataModified {
        console.log(socketCURRENTAGGDataRAW);
        const currencyToConvertToTicker = this.cryptocompareDataService.coinToCurrency;
        const socketCURRENTAGGDataUnPacked = CCC.CURRENT.unpack(socketCURRENTAGGDataRAW);
        const socketDataCurrencyFromTicker: string = socketCURRENTAGGDataUnPacked['FROMSYMBOL'];
        const socketDataCurrencyToTicker: string = socketCURRENTAGGDataUnPacked['TOSYMBOL'];
        const socketDataPrice: number = socketCURRENTAGGDataUnPacked['PRICE'];
        const socketDataCurrencyPair = socketDataCurrencyFromTicker + socketDataCurrencyToTicker;

        // Save BTC and ETH prices in the currently selected conversion currency (USD, JPY, etc) for future use.
        // This is to later assist with converting socket data for a coin that does not have a direct pair
        // with the currently selected conversion currency, but instead has a BTC or ETH pair.
        // For example ZEC may only have a ZECBTC or ZECETH pair, but NOT a ZECJPY pair. In this case we can multiply the ZECBTC pair
        // by the BTCPJY data to get our ZECJPY data.
        if (socketDataCurrencyPair === `BTC${currencyToConvertToTicker}`) {
            this.BTCPriceInConversionCurrency = socketDataPrice;
        } else if (socketDataCurrencyPair === `ETH${currencyToConvertToTicker}`) {
            this.ETHPriceInConversionCurrency = socketDataPrice;
        }

        // Received socket data for a currency pair that is NOT a direct pair with the currency we are looking to convert to.
        if (socketDataCurrencyToTicker !== currencyToConvertToTicker) {
            const currencyPair = socketDataCurrencyFromTicker + currencyToConvertToTicker;
            this.mapCURRENTAGGDataToCCCSocketModified(socketCURRENTAGGDataUnPacked, currencyPair, false);
            return this.coinsSocketData;
        }

        this.mapCURRENTAGGDataToCCCSocketModified(socketCURRENTAGGDataUnPacked, socketDataCurrencyPair, true);
        return this.coinsSocketData;
    }

    /**
     * Takes the latest emission from the CURRENTAGG subscription and adds it to the master coinsSocketData object.
     * @param socketCURRENTAGGData -- unPacked CURRENTAGG socket data
     * @param currencyPair -- name of the currency pair who's socket data we want to add to the master coinsSocketData object.
     * @param hasDirectPair -- whether or not the currency pair has a direct pair with the currency we are converting to
     */
    private mapCURRENTAGGDataToCCCSocketModified(socketCURRENTAGGData: any, currencyPair: string, hasDirectPair: boolean) {
        let BTCorETHPriceInConversionCurrency;
        const socketDataPrice: number = socketCURRENTAGGData['PRICE'];
        const socketDataCurrencyToTicker: string = socketCURRENTAGGData['TOSYMBOL'];
        const socketDataCurrencyFromTicker: string = socketCURRENTAGGData['FROMSYMBOL'];

        if (!this.coinsSocketData.hasOwnProperty(currencyPair)) {
            this.coinsSocketData[currencyPair] = {};
        }

        for (const key of Object.keys(socketCURRENTAGGData)) {
            this.coinsSocketData[currencyPair][key] = socketCURRENTAGGData[key];
        }

        // special case if currency pair is BTCBTC or ETHETH
        if (socketDataCurrencyToTicker === socketDataCurrencyFromTicker) {
            this.coinsSocketData[currencyPair]['PRICE'] = 1;
            this.coinsSocketData[currencyPair]['OPEN24HOUR'] = 1;
            this.coinsSocketData[currencyPair]['CHANGE24HOURPCT'] = '0.0%';
            return;
        }

        if (socketDataCurrencyToTicker === 'BTC') {
            BTCorETHPriceInConversionCurrency = this.BTCPriceInConversionCurrency;
        } else if (socketDataCurrencyToTicker === 'ETH') {
            BTCorETHPriceInConversionCurrency = this.ETHPriceInConversionCurrency;
        }

        if (socketDataPrice) {
            this.coinsSocketData[currencyPair]['CHANGE24HOURPCT'] =
                ( (this.coinsSocketData[currencyPair]['PRICE'] - this.coinsSocketData[currencyPair]['OPEN24HOUR']) /
                this.coinsSocketData[currencyPair]['OPEN24HOUR'] * 100).toFixed(2) + '%';
            if (!hasDirectPair) {
                this.coinsSocketData[currencyPair]['PRICE'] = socketDataPrice * BTCorETHPriceInConversionCurrency;
            }
            return;
        }
    }
}
