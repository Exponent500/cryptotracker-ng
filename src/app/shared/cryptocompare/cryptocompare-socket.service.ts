import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

import { CCC } from './cryptocompare-socket.utilities';
import { CCCSocketDataModified } from './interfaces';

export class CryptocompareSocketService {
    private socket: SocketIOClient.Socket;
    private socketSubscriptions: string [] = [];
    private currentPrice = {};

    constructor() {
        this.socket = io('https://streamer.cryptocompare.com/');
    }

    /**
     * Add socket subscriptions of interest.
     */
    addSubscriptions(subscriptions: string[]) {
        this.socketSubscriptions = subscriptions;
        console.log(subscriptions);
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
     * Unsubscribes from all socket subscriptions that are currently being subscribed to.
     */
    unSubscribe() {
        this.socket.emit('SubRemove', { subs: this.socketSubscriptions });
    }

    reSubscribe() {
        this.socket.emit('SubAdd', { subs: this.socketSubscriptions });
    }


    private addFullVolumeDataToCurrentPriceData = (message: string) => {
        console.log(message);
        const volData = CCC.FULLVOLUME.unpack(message);
        console.log(volData);
        const from = volData['SYMBOL'];
        const to = 'USD';
        const tsym = CCC.STATIC.CURRENCY.getSymbol(to);
        const pair = from + to;

        if (!this.currentPrice.hasOwnProperty(pair)) {
            this.currentPrice[pair] = {};
        }

        this.currentPrice[pair]['FULLVOLUMEFROM'] = parseFloat(volData['FULLVOLUME']);
        if (this.currentPrice[pair]['PRICE']) {
            const fullVolumeTo = ( (this.currentPrice[pair]['FULLVOLUMEFROM'] - this.currentPrice[pair]['VOLUME24HOUR']) *
            this.currentPrice[pair]['PRICE'] ) + this.currentPrice[pair]['VOLUME24HOURTO'];
            this.currentPrice[pair]['FULLVOLUMETO'] = CCC.convertValueToDisplay(tsym, fullVolumeTo, 'short');
        }
        console.log(this.currentPrice);
    }

    /**
     * Convert cryptocompare CURRENTAGG subscription socket data to a dictionary with a shape of CCCSocketDataModified.
     */
    private mapCURRENTAGGToCCCSocketModified(message: string): CCCSocketDataModified {
        console.log(message);
        const unPackedData = CCC.CURRENT.unpack(message);
        const from: string = unPackedData['FROMSYMBOL'];
        const to: string = unPackedData['TOSYMBOL'];
        const tsym: string = CCC.STATIC.CURRENCY.getSymbol(to);
        const pair = from + to;

        if (!this.currentPrice.hasOwnProperty(pair)) {
            this.currentPrice[pair] = {};
        }

        for (const key in unPackedData) {
            this.currentPrice[pair][key] = unPackedData[key];
        }

        if (this.currentPrice[pair]['LASTTRADEID']) {
            this.currentPrice[pair]['LASTTRADEID'] = parseInt(this.currentPrice[pair]['LASTTRADEID']).toFixed(0);
        }
        this.currentPrice[pair]['CHANGE24HOUR'] =
            CCC.convertValueToDisplay(tsym, (this.currentPrice[pair]['PRICE'] - this.currentPrice[pair]['OPEN24HOUR']));
        this.currentPrice[pair]['CHANGE24HOURPCT'] =
            ((this.currentPrice[pair]['PRICE'] - this.currentPrice[pair]['OPEN24HOUR']) /
            this.currentPrice[pair]['OPEN24HOUR'] * 100).toFixed(2) + '%';
        return this.currentPrice;
    }
}
