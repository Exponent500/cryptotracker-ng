import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { CCC } from './cryptocompare-socket.utilities';
import { CCCSocketDataModified } from './interfaces';

export class CryptocompareSocketService {
    private socket: SocketIOClient.Socket;
    private subscriptions: string [] = [];
    private currentPrice = {};

    constructor() {
        this.socket = io('https://streamer.cryptocompare.com/');
    }

    /**
     * Add a list of subscriptions to listen to.
     */
    addSubscriptions(subscriptions: string[]) {
        this.subscriptions = subscriptions;
        this.socket.emit('SubAdd', { subs: subscriptions });
    }

    /**
     * Creates an observable that emits the socketData you've subscribed to.
     */
    onNewMessage(): Observable<CCCSocketDataModified> {
        return Observable.create(observer => {
            this.socket.on('m', message => {
                observer.next(this.unPackData(message));
            });
        });
    }

    /**
     * Converts Raw socket data to a shape more amenable for being displayed on the template.
     */
    unPackData(message: string): CCCSocketDataModified {
        const unPackedData = CCC.CURRENT.unpack(message);
        const from = unPackedData['FROMSYMBOL'];
        const to = unPackedData['TOSYMBOL'];
        const tsym = CCC.STATIC.CURRENCY.getSymbol(to);
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

    /**
     * Unsubscribes from all events you are currently listening to.
     */
    unSubscribe() {
        this.socket.emit('SubRemove', { subs: this.subscriptions });
    }
}
