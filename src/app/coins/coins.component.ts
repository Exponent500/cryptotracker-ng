import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { CoinsService } from './coins.service';
import { CoinDataWithSocketData } from '../shared/cryptocompare/interfaces';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.scss']
})
export class CoinsComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  getCoinDataSub: Subscription = new Subscription();
  coinData: CoinDataWithSocketData[] = [];
  conversionCurrencyTabs: string[] = ['USD', 'BTC', 'ETH', 'EUR', 'GBP', 'JPY', 'KRW'];
  isStreaming = false;
  loading = true;
  currentPage = 1;

  constructor(private coinsService: CoinsService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.route.data.subscribe(
      data => {
        const coinsDataSortedByTotalVolume = data['coinsByTotalVolume'].Data;
        this.coinsService.coinsDataToDisplay = coinsDataSortedByTotalVolume;
        this.getCoinDataSub = this.coinsService.getRealTimeCoinData(coinsDataSortedByTotalVolume)
          .subscribe(coinData => {
            this.loading = false;
            this.coinData = coinData;
            this.isStreaming = this.coinsService.isStreaming;
          });
        this.subscriptions.push(this.getCoinDataSub);
      });
  }


  /**
   * Click handler for when conversion currency is changed.
   * @param ticker -- ticker name of conversion currency
   */
  onChangeConversionCurrency(ticker: string) {
    this.loading = true;
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.stopStream();
    this.router.navigate([`/coins/${ticker}/${this.currentPage}`]);
  }

  ngOnDestroy() {
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.stopStream();
  }

  /**
   * Click handler for when streaming status is changed via the "Live" button.
   * Toggles between stopping and resuming stream.
   */
  onChangeStreamingStatus() {
    this.isStreaming = !this.coinsService.isStreaming;
    this.isStreaming ?  this.coinsService.restartStream() : this.coinsService.stopStream();
  }
}
