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

  constructor(private coinsService: CoinsService) { }

  ngOnInit() {
    this.getCoinData();
  }

  getCoinData() {
    this.getCoinDataSub = this.coinsService.getCoinData()
      .subscribe(coinData => this.coinsDataToDisplay = coinData);
  }

  ngOnDestroy() {
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.unSubscribeFromSocket();
  }

}
