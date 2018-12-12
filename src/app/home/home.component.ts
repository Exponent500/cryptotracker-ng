import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { CoinsService } from 'src/app/coins/coins.service';
import { CoinDataWithSocketData } from 'src/app/shared/cryptocompare/interfaces';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  getCoinDataSub: Subscription = new Subscription();
  coinData: CoinDataWithSocketData[] = [];
  isStreaming = false;
  loading = true;

  constructor(private coinsService: CoinsService,
              private route: ActivatedRoute) {}

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
