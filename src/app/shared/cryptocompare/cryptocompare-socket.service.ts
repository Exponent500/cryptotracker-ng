import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable()
export class CryptocompareSocketService {
    private socket: SocketIOClient.Socket;
    private socketSubscriptions: string [] = [];

    constructor() {}

    openSocket() {
        this.socket = io('https://streamer.cryptocompare.com/');
    }
    closeSocket() {
        this.socket.disconnect();
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
    onNewMessage(): Observable<string> {
        return Observable.create(observer => {
            this.socket.on('m', (message: string) => observer.next(message));
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
}
