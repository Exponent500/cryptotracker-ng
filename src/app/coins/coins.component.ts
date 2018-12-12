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
  activeCurrencyConversionTab = 'USD';
  isStreaming = false;
  loading = true;
  currentPage = 1;

  constructor(private coinsService: CoinsService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.route.data.subscribe(
      data => {
        const coinsDataSortedByTotalVolume: CoinDataWithSocketData[] = data['coinsByTotalVolume'].Data;
        // need to assign an empty object to SocketData so that later on we can set it's properties.
        // Need to find a better way, and place for this.
        coinsDataSortedByTotalVolume.map( item => item.SocketData = {});
        const conversionCurrency = coinsDataSortedByTotalVolume[0].ConversionInfo.CurrencyTo;
        this.coinsService.coinsDataToDisplay = coinsDataSortedByTotalVolume;
        if (conversionCurrency === 'BTC' || conversionCurrency === 'ETH') {
          this.coinsService.prePopulateCCSocketData(conversionCurrency);
        }
        this.getCoinDataSub = this.coinsService.getRealTimeCoinData(coinsDataSortedByTotalVolume)
          .subscribe(coinData => {
            coinData[0].SocketData ? this.loading = false : this.loading = true;
            this.coinData = coinData;
            this.isStreaming = this.coinsService.isStreaming;
          });
        this.subscriptions.push(this.getCoinDataSub);
      });

      this.route.params.subscribe(
        params => {
          this.activeCurrencyConversionTab = params['conversionCurrency'];
          this.currentPage = params['page'];
        }
      );
  }


  /**
   * Click handler for when conversion currency is changed.
   * @param ticker -- ticker name of conversion currency
   */
  onChangeConversionCurrency(ticker: string) {
    if (this.activeCurrencyConversionTab === ticker) {
      return;
    }
    this.currentPage = 1;
    this.activeCurrencyConversionTab = ticker;
    this.loading = true;
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.stopStream();
    this.router.navigate([`/coins/${ticker}/${this.currentPage}`]);
  }

  /**
   * on click handler for when "next page" button is clicked
   */
  onNextPage() {
    this.loading = true;
    this.currentPage++;
    // move these two lines to a helper method since they are written in 3 different places by now.
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.stopStream();
    this.router.navigate([`/coins/${this.activeCurrencyConversionTab}/${this.currentPage}`]);
  }

  /**
   * on click handler for when "previous page" button is clicked
   */
  onPreviousPage() {
    this.loading = true;
    this.currentPage--;
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.stopStream();
    this.router.navigate([`/coins/${this.activeCurrencyConversionTab}/${this.currentPage}`]);
  }

  ngOnDestroy() {
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.closeSocket();
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
