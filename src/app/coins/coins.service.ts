import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    CoinData,
    SocketData,
    CoinDataWithSocketData } from '../shared/cryptocompare/interfaces';
import { CryptocompareSocketService } from '../shared/cryptocompare/cryptocompare-socket.service';
import { CCC } from '../shared/cryptocompare/cryptocompare-socket.utilities';

@Injectable()
export class CoinsService {
    coinsDataToDisplay: CoinDataWithSocketData[] = [];
    isStreaming = false;
    constructor(private cryptocompareSocketService: CryptocompareSocketService) {}


    /**
     * Pre-populates currency price, %change and mcap values within socket data.
     * This is a special case for when the conversion currency for BTC and ETH, when the conversion currency is
     * BTC or ETH, respectively.
     * @param currencyName -- currency to pre-populate data
     */
    prePopulateCCSocketData(currencyName: string) {
        const currencySymbol = CCC.STATIC.CURRENCY.getSymbol(currencyName);
        const coinData = this.coinsDataToDisplay.find( item => item.CoinInfo.Name === currencyName);
        const supply = coinData.ConversionInfo.Supply;
        const price = CCC.convertValueToDisplay(currencySymbol, 1);
        const mcap = CCC.convertValueToDisplay(currencySymbol, supply, 'short');
        const socketDatum: SocketData = {
            price: price,
            changePercent: 0,
            changePercentDisplay: '0.0%',
            mcap: mcap
        };
        coinData.SocketData = socketDatum;
    }

    /**
     * Gets real-time coin data in a format that a consumer can display on the view.
     * @param topCoinsByTotalVolume - coin data sorted by total volume
     */
    getRealTimeCoinData(topCoinsByTotalVolume: CoinDataWithSocketData[]): Observable<CoinDataWithSocketData[]> {
        const cryptocompareSubscriptionsToAdd: string[] = this.generateCCSocketSubscriptions(topCoinsByTotalVolume);
        this.addCCSocketSubscriptions(cryptocompareSubscriptionsToAdd);
        return this.subscribeToCCSocket()
            .pipe(
                map(socketData => {
                    const messageType = socketData.substring(0, socketData.indexOf('~'));
                    if (messageType === CCC.STATIC.TYPE.CURRENTAGG) {
                        this.handleCURRENTAGGSocketData(socketData);
                    } else if (messageType === CCC.STATIC.TYPE.FULLVOLUME) {
                        this.handleVolumeSocketData(socketData);
                    }
                    return this.coinsDataToDisplay;
                })
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
     * Extracts volume data from socket emission, converts it to be denominated in the conversion currency currently selected by the user,
     * then adds it to the approriate coin data element within the master coinsDataToDisplay array
     * @param socketVolumeData - RAW Cryptocompare volume socket emission.
     */
    private handleVolumeSocketData (socketVolumeData: string) {
        const socketVolumeDataUnPacked = CCC.FULLVOLUME.unpack(socketVolumeData);
        const socketDataCurrencyFromTicker = socketVolumeDataUnPacked['SYMBOL'];
        const socketDataFullVolumeFrom = parseFloat(socketVolumeDataUnPacked['FULLVOLUME']);
        const coinData = this.coinsDataToDisplay.find( item => item.ConversionInfo.CurrencyFrom === socketDataCurrencyFromTicker);
        const conversionType = coinData.ConversionInfo.Conversion;
        const currencyToSymbol = CCC.STATIC.CURRENCY.getSymbol(coinData.ConversionInfo.CurrencyTo);

        // special case where the currency we are converting from and to are one in the same (i.e BTCBTC or ETHETH)
        if (conversionType === 'not_needed') {
            coinData.SocketData.fullVolume24Hour = CCC.convertValueToDisplay(currencyToSymbol, socketDataFullVolumeFrom, 'short');
            return;
        }
        if (coinData.SocketData.price && conversionType === 'direct') {
            const price = coinData.SocketData.price;
            const volume24Hour = coinData.SocketData.volume24Hour;
            const volume24HourTo = coinData.SocketData.volume24HourTo;
            const fullVolume24Hour = ((socketDataFullVolumeFrom - volume24Hour) * price) + volume24HourTo;
            coinData.SocketData.fullVolume24Hour = CCC.convertValueToDisplay(currencyToSymbol, fullVolume24Hour, 'short');
            return;
        } else if (coinData.SocketData.price) {
            const price = coinData.SocketData.price;
            const fullVolume24Hour = socketDataFullVolumeFrom * price;
            coinData.SocketData.fullVolume24Hour = CCC.convertValueToDisplay(currencyToSymbol, fullVolume24Hour, 'short');
            return;
        }
    }

    /**
     * Unpacks RAW CURRENTAGG socket data, and adds price, mcap, and change24hour values to the appropriate coin data element
     * within the master coinsDataToDisplay array.
     * @param socketCurrentAGGData -- RAW CURRENTAGG socket data
     */
    private handleCURRENTAGGSocketData(socketCURRENTAGGDataRAW: string) {
        const socketCURRENTAGGDataUnPacked = CCC.CURRENT.unpack(socketCURRENTAGGDataRAW);
        const socketDataCurrencyFromTicker: string = socketCURRENTAGGDataUnPacked['FROMSYMBOL'];
        const socketDataCurrencyToTicker: string = socketCURRENTAGGDataUnPacked['TOSYMBOL'];
        const socketDataPrice: number = socketCURRENTAGGDataUnPacked['PRICE'];
        const socketDataMarket = socketCURRENTAGGDataUnPacked['MARKET'];
        const socketDataType = socketCURRENTAGGDataUnPacked['TYPE'];
        const socketSub = `${socketDataType}~${socketDataMarket}~${socketDataCurrencyFromTicker}~${socketDataCurrencyToTicker}`;

        this.coinsDataToDisplay.forEach( coinDatum => {
            if (coinDatum.ConversionInfo.SubsNeeded[0] === socketSub) {
                switch (coinDatum.ConversionInfo.Conversion) {
                    case 'invert_divide':
                        if (socketDataPrice) {
                            coinDatum.SocketData.priceConversionCurrency = socketDataPrice;
                        }
                        break;
                    case 'direct':
                        this.addCCSocketDataToCoinData(socketCURRENTAGGDataUnPacked, coinDatum);
                        break;
                    case 'invert':
                        socketCURRENTAGGDataUnPacked['PRICE'] = 1 / socketCURRENTAGGDataUnPacked['PRICE'];
                        socketCURRENTAGGDataUnPacked['OPEN24HOUR'] = 1 / socketCURRENTAGGDataUnPacked['OPEN24HOUR'];
                        this.addCCSocketDataToCoinData(socketCURRENTAGGDataUnPacked, coinDatum);
                        break;
                    case 'multiply':
                        socketCURRENTAGGDataUnPacked['PRICE'] =
                            socketCURRENTAGGDataUnPacked['PRICE'] * coinDatum.SocketData.priceConversionCurrency;
                        socketCURRENTAGGDataUnPacked['OPEN24HOUR'] =
                            socketCURRENTAGGDataUnPacked['OPEN24HOUR'] * coinDatum.SocketData.priceConversionCurrency;
                        this.addCCSocketDataToCoinData(socketCURRENTAGGDataUnPacked, coinDatum);
                        break;
                    case 'divide':
                        socketCURRENTAGGDataUnPacked['PRICE'] =
                            socketCURRENTAGGDataUnPacked['PRICE'] / coinDatum.SocketData.priceConversionCurrency;
                        socketCURRENTAGGDataUnPacked['OPEN24HOUR'] =
                            socketCURRENTAGGDataUnPacked['OPEN24HOUR'] / coinDatum.SocketData.priceConversionCurrency;
                        this.addCCSocketDataToCoinData(socketCURRENTAGGDataUnPacked, coinDatum);
                        break;
                }
            }
            if (coinDatum.ConversionInfo.SubsNeeded[1] === socketSub) {
                switch (coinDatum.ConversionInfo.Conversion) {
                    case 'multiply':
                    case 'divide':
                        if (socketDataPrice) {
                            coinDatum.SocketData.priceConversionCurrency = socketDataPrice;
                        }
                        break;
                    case 'invert_divide':
                        socketCURRENTAGGDataUnPacked['PRICE'] =
                            coinDatum.SocketData.priceConversionCurrency / socketCURRENTAGGDataUnPacked['PRICE'];
                        socketCURRENTAGGDataUnPacked['OPEN24HOUR'] =
                            coinDatum.SocketData.priceConversionCurrency / socketCURRENTAGGDataUnPacked['OPEN24HOUR'];
                        this.addCCSocketDataToCoinData(socketCURRENTAGGDataUnPacked, coinDatum);
                        break;
                }
            }
        });
    }

    /**
     * Adds socketData to coinData
     * @param socketData - socketData to add
     * @param coinDatum  - coinDatum to add socketData to
     */
    private addCCSocketDataToCoinData(socketData, coinDatum) {
        const currencyToSymbol = CCC.STATIC.CURRENCY.getSymbol(coinDatum.ConversionInfo.CurrencyTo);
        const coinSupply = coinDatum.ConversionInfo.Supply;
        const socketDataPrice: number = socketData['PRICE'];
        const socketDataOpen24Hour = socketData['OPEN24HOUR'];
        const socketDataVolume24Hour = socketData['VOLUME24HOUR'];
        const socketDataVolume24HourTo = socketData['VOLUME24HOURTO'];
        const socketDataFlags = socketData['FLAGS'];

        if (socketDataPrice) {
            coinDatum.SocketData.priceDisplay = CCC.convertValueToDisplay(currencyToSymbol, socketDataPrice);
            coinDatum.SocketData.price = socketDataPrice;
            coinDatum.SocketData.mcap = CCC.convertValueToDisplay(currencyToSymbol, socketDataPrice * coinSupply, 'short');
        }
        if (socketDataOpen24Hour) {
            coinDatum.SocketData.open24Hour = socketDataOpen24Hour;
        }
        if (coinDatum.SocketData.price && coinDatum.SocketData.open24Hour) {
            const changePercent =
                ((coinDatum.SocketData.price - coinDatum.SocketData.open24Hour) / coinDatum.SocketData.open24Hour * 100).toFixed(2);
            coinDatum.SocketData.changePercent = changePercent;
            coinDatum.SocketData.changePercentDisplay = `${changePercent}%`;
        }
        coinDatum.SocketData.volume24Hour = socketDataVolume24Hour;
        coinDatum.SocketData.volume24HourTo = socketDataVolume24HourTo;
        coinDatum.SocketData.flags = socketDataFlags;
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
    private subscribeToCCSocket(): Observable<string> {
        this.isStreaming = true;
        return this.cryptocompareSocketService.onNewMessage();
    }

    /**
     * Generates cryptocompare socket subscriptions of interest based on the provided topCoinsByTotalVolume data.
     * @param topCoinsByTotalVolume - coin data sorted by total volume
     */
    private generateCCSocketSubscriptions(topCoinsByTotalVolume: CoinData[]): string[] {
        let CCSocketSubscriptions = [];
        topCoinsByTotalVolume.forEach( item => {
            const currencyFrom: string = item.ConversionInfo.CurrencyFrom;
            const totalVolumeSubscription = `11~${currencyFrom}`;
            CCSocketSubscriptions = Array.from(new Set([...CCSocketSubscriptions, ...item.ConversionInfo.SubsNeeded]));
            CCSocketSubscriptions.push(totalVolumeSubscription);
        });
        return CCSocketSubscriptions;
    }
}
