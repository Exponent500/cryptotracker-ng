import { Component, OnInit, OnDestroy } from '@angular/core';

import { CoinsService } from './coins.service';
import { CoinData } from '../shared/cryptocompare/interfaces';

import { Subscription } from 'rxjs';

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
  numberOfCoinsToDisplay = 100;

  constructor(private coinsService: CoinsService) { }

  ngOnInit() {
    this.getCoinData(this.currencyTicker, this.numberOfCoinsToDisplay);
  }

  ngOnDestroy() {
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.unSubscribeFromSocket();
  }

  /**
   * Gets coin data for the currency and numberOfCoins provided
   */
  private getCoinData(currency: string, numberOfCoins: number) {
    this.getCoinDataSub = this.coinsService.getCoinData(currency, numberOfCoins)
      .subscribe(coinData => this.coinsDataToDisplay = coinData);
    this.subscriptions.push(this.getCoinDataSub);
  }

}
