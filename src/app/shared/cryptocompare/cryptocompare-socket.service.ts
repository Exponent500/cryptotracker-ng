import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { CCC } from './cryptocompare-socket.utilities';
import { CCCSocketDataModified } from './interfaces';

export class CryptocompareSocketService {
    private socket: SocketIOClient.Socket;
    private socketSubscriptions: string [] = [];

    constructor() {
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
                observer.next(this.unPackData(message));
            });
        });
    }

    /**
     * Unsubscribes from all socket subscriptions that are currently being subscribed to.
     */
    unSubscribe() {
        this.socket.emit('SubRemove', { subs: this.socketSubscriptions });
    }

    /**
     * Converts Raw socket data to a shape more amenable for being displayed on the template.
     */
    private unPackData(message: string): CCCSocketDataModified {
        console.log(message);
        const currentPrice = {};
        const unPackedData = CCC.CURRENT.unpack(message);
        const from: string = unPackedData['FROMSYMBOL'];
        const to: string = unPackedData['TOSYMBOL'];
        const volume24hr: number = unPackedData['VOLUME24HOURTO'];
        const tsym: string = CCC.STATIC.CURRENCY.getSymbol(to);
        const pair = from + to;

        if (!currentPrice.hasOwnProperty(pair)) {
            currentPrice[pair] = {};
        }

        for (const key in unPackedData) {
            currentPrice[pair][key] = unPackedData[key];
        }

        if (currentPrice[pair]['LASTTRADEID']) {
            currentPrice[pair]['LASTTRADEID'] = parseInt(currentPrice[pair]['LASTTRADEID']).toFixed(0);
        }
        currentPrice[pair]['VOLUME24HOURTO'] =
            CCC.convertValueToDisplay(tsym, volume24hr, 'short');
        currentPrice[pair]['CHANGE24HOUR'] =
            CCC.convertValueToDisplay(tsym, (currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']));
        currentPrice[pair]['CHANGE24HOURPCT'] =
            ((currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']) /
            currentPrice[pair]['OPEN24HOUR'] * 100).toFixed(2) + '%';
        return currentPrice;
    }
}
