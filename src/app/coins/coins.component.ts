import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { CoinsService } from './coins.service';
import { CoinData } from '../shared/cryptocompare/interfaces';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.scss']
})
export class CoinsComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  getCoinDataSub: Subscription = new Subscription();
  coinsDataToDisplay: CoinData[] = [];
  isStreaming = false;
  loading = true;

  constructor(private coinsService: CoinsService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(
      data => {
        this.coinsService.getRealTimeCoinData(data['coinsByTotalVolume'].Data)
          .subscribe(coinData => {
            this.loading = false;
            this.coinsDataToDisplay = coinData;
            this.isStreaming = this.coinsService.isStreaming;
          });
      });
  }

  ngOnDestroy() {
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.coinsService.stopStream();
  }

  onChangeStreamingStatus() {
    this.isStreaming = !this.coinsService.isStreaming;
    this.isStreaming ?  this.coinsService.restartStream() : this.coinsService.stopStream();
  }
}
