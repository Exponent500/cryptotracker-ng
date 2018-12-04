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
    private currentCoinSocketData = {};
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
     * Adds socket volume data to the appropriate currencyPair key within the master currentCoinSocketData object
     */
    private addFullVolumeDataToCurrentCoinSocketData (socketVolumeData: string) {
        const socketVolumeDataUnPacked = CCC.FULLVOLUME.unpack(socketVolumeData);
        const socketDataCurrencyFromTicker = socketVolumeDataUnPacked['SYMBOL'];
        const currencyToConvertToTicker = this.cryptocompareDataService.coinToCurrency;
        const currencyToConvertToSymbol = CCC.STATIC.CURRENCY.getSymbol(currencyToConvertToTicker);
        const currencyPair = socketDataCurrencyFromTicker + currencyToConvertToTicker;

        if (!this.currentCoinSocketData.hasOwnProperty(currencyPair)) {
            this.currentCoinSocketData[currencyPair] = {};
        }

        this.currentCoinSocketData[currencyPair]['FULLVOLUMEFROM'] = parseFloat(socketVolumeDataUnPacked['FULLVOLUME']);

        if (currencyPair === 'BTCBTC') {
            this.currentCoinSocketData[currencyPair]['FULLVOLUMETO'] =
                CCC.convertValueToDisplay(currencyToConvertToSymbol, this.currentCoinSocketData[currencyPair]['FULLVOLUMEFROM'], 'short');
            return;
        }

        if (this.currentCoinSocketData[currencyPair]['PRICE']) {
            const fullVolumeTo = (
                (this.currentCoinSocketData[currencyPair]['FULLVOLUMEFROM'] - this.currentCoinSocketData[currencyPair]['VOLUME24HOUR']) *
                this.currentCoinSocketData[currencyPair]['PRICE'] ) + this.currentCoinSocketData[currencyPair]['VOLUME24HOURTO'];
            this.currentCoinSocketData[currencyPair]['FULLVOLUMETO'] =
                CCC.convertValueToDisplay(currencyToConvertToSymbol, fullVolumeTo, 'short');
        }
    }

    /**
     * Convert cryptocompare CURRENTAGG subscription socket data to a CCCSocketDataModified dictionary object.
     */
    private mapCURRENTAGGToCCCSocketModified(socketCurrentAGGData: string): CCCSocketDataModified {
        const currencyToConvertToTicker = this.cryptocompareDataService.coinToCurrency;
        const socketCurrentAGGDataUnPacked = CCC.CURRENT.unpack(socketCurrentAGGData);
        const socketDataCurrencyFromTicker: string = socketCurrentAGGDataUnPacked['FROMSYMBOL'];
        const socketDataCurrencyToTicker: string = socketCurrentAGGDataUnPacked['TOSYMBOL'];
        const price: number = socketCurrentAGGDataUnPacked['PRICE'];
        const socketDataCurrencyToSymbol: string = CCC.STATIC.CURRENCY.getSymbol(socketDataCurrencyToTicker);
        let currencyPair = socketDataCurrencyFromTicker + socketDataCurrencyToTicker;
        let BTCorETHPriceInConversionCurrency;

        // Saves BTC and ETH prices in the currently selected conversion currency (USD, JPY, etc) for future use.
        // This is because there are some coins that do not have direct pairs with all the possible conversion currencies that we support.
        // For example ZEC may only have a ZECBTC or ZECETH pair, but NOT a ZECJPY pair. In this case we can multiply the ZECBTC pair
        // by the BTCPJY data to get our ZECJPY data.
        if (currencyPair === `BTC${currencyToConvertToTicker}`) {
            this.BTCPriceInConversionCurrency = socketCurrentAGGDataUnPacked.PRICE;
        } else if (currencyPair === `ETH${currencyToConvertToTicker}`) {
            this.ETHPriceInConversionCurrency = socketCurrentAGGDataUnPacked.PRICE;
        }

        if (!this.currentCoinSocketData.hasOwnProperty(currencyPair)) {
            this.currentCoinSocketData[currencyPair] = {};
        }

        // Special case where the socketData's TOSYMBOL does not match the currency we want to convert to. This indicates we received
        // socket data for a coin that does NOT have a direct pair with the currency we are looking to convert to.
        // In this case we must need to multiply it's values by the values within the BTC (or ETH) to currencyToConvertToTicker pair.
        if (socketDataCurrencyToTicker !== currencyToConvertToTicker) {
            currencyPair = socketDataCurrencyFromTicker + currencyToConvertToTicker;
            for (const key of Object.keys(socketCurrentAGGDataUnPacked)) {
                this.currentCoinSocketData[currencyPair][key] = socketCurrentAGGDataUnPacked[key];
            }

            if (socketDataCurrencyToTicker === 'BTC') {
                BTCorETHPriceInConversionCurrency = this.BTCPriceInConversionCurrency;
            } else if (socketDataCurrencyToTicker === 'ETH') {
                BTCorETHPriceInConversionCurrency = this.ETHPriceInConversionCurrency;
            }

            this.currentCoinSocketData[currencyPair]['CHANGE24HOUR'] =
                CCC.convertValueToDisplay(socketDataCurrencyToSymbol,
                    (this.currentCoinSocketData[currencyPair]['PRICE'] - this.currentCoinSocketData[currencyPair]['OPEN24HOUR']) *
                    BTCorETHPriceInConversionCurrency);
            this.currentCoinSocketData[currencyPair]['CHANGE24HOURPCT'] =
                ( (this.currentCoinSocketData[currencyPair]['PRICE'] - this.currentCoinSocketData[currencyPair]['OPEN24HOUR']) /
                this.currentCoinSocketData[currencyPair]['OPEN24HOUR'] * 100).toFixed(2) + '%';
            this.currentCoinSocketData[currencyPair]['PRICE'] = price * BTCorETHPriceInConversionCurrency;
            return this.currentCoinSocketData;
        }

        for (const key of Object.keys(socketCurrentAGGDataUnPacked)) {
            this.currentCoinSocketData[currencyPair][key] = socketCurrentAGGDataUnPacked[key];
        }

        if (socketDataCurrencyToTicker === socketDataCurrencyFromTicker) {
            this.currentCoinSocketData[currencyPair]['PRICE'] = 1;
            this.currentCoinSocketData[currencyPair]['OPEN24HOUR'] = 1;
        }

        this.currentCoinSocketData[currencyPair]['CHANGE24HOUR'] =
            CCC.convertValueToDisplay(socketDataCurrencyToSymbol,
                (this.currentCoinSocketData[currencyPair]['PRICE'] - this.currentCoinSocketData[currencyPair]['OPEN24HOUR']));
        this.currentCoinSocketData[currencyPair]['CHANGE24HOURPCT'] =
            ((this.currentCoinSocketData[currencyPair]['PRICE'] - this.currentCoinSocketData[currencyPair]['OPEN24HOUR']) /
            this.currentCoinSocketData[currencyPair]['OPEN24HOUR'] * 100).toFixed(2) + '%';
        return this.currentCoinSocketData;
    }
}
