import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { CoinsService } from './coins.service';
import { CoinData } from '../shared/cryptocompare/interfaces';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.scss']
})
export class CoinsComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  getCoinDataSub: Subscription = new Subscription();
  coinsDataToDisplay: CoinData[] = [];
  currencyTicker = 'USD';
  numberOfCoinsToDisplay = 10;
  isStreaming = false;

  constructor(private coinsService: CoinsService) { }

  ngOnInit() {
    this.getCoinData(this.currencyTicker, this.numberOfCoinsToDisplay);
  }

  ngOnDestroy() {
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.stopStream();
  }

  onChangeStreamingStatus() {
    this.isStreaming = !this.coinsService.isStreaming;
    this.isStreaming ?  this.coinsService.restartStream() : this.coinsService.stopStream();
  }

  /**
   * Gets coin data for the currency and numberOfCoins provided
   */
  private getCoinData(currency: string, numberOfCoins: number) {
    this.getCoinDataSub = this.coinsService.getCoinData(currency, numberOfCoins)
      .subscribe(coinData => {
        this.coinsDataToDisplay = coinData;
        this.isStreaming = this.coinsService.isStreaming;
      });
    this.subscriptions.push(this.getCoinDataSub);
  }

}
