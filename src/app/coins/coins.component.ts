import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { CoinsService } from './coins.service';
import { CoinData } from '../shared/cryptocompare/interfaces';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.scss']
})
export class CoinsComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  getCoinDataSub: Subscription = new Subscription();
  coinsDataToDisplay: CoinData[] = [];
  currencyToTabs: string[] = ['USD', 'BTC', 'ETH', 'EUR', 'GBP', 'JPY', 'KRW'];
  isStreaming = false;
  loading = true;
  currentPage = 1;

  constructor(private coinsService: CoinsService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    console.log('in ngOnInit');
    this.route.data.subscribe(
      data => {
        console.log(data);
        this.getCoinDataSub = this.coinsService.getRealTimeCoinData(data['coinsByTotalVolume'].Data)
          .subscribe(coinData => {
            this.loading = false;
            this.coinsDataToDisplay = coinData;
            this.isStreaming = this.coinsService.isStreaming;
          });
        this.subscriptions.push(this.getCoinDataSub);
      });
  }

  onChangeCurrencyTo(ticker: string) {
    this.loading = true;
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.stopStream();
    this.router.navigate([`/coins/${ticker}/${this.currentPage}`]);
  }

  ngOnDestroy() {
    console.log('in ngOnDestroy');
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.stopStream();
  }

  onChangeStreamingStatus() {
    this.isStreaming = !this.coinsService.isStreaming;
    this.isStreaming ?  this.coinsService.restartStream() : this.coinsService.stopStream();
  }
}
