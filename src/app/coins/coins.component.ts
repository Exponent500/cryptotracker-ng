import { Component, OnInit, OnDestroy } from '@angular/core';

import { CoinsService } from './coins.service';
import { CryptocompareSocketService } from '../shared/cryptocompare/cryptocompare-socket.service';
import { CoinData, RealTimeInfo } from '../shared/cryptocompare/interfaces';

import { Subscription } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css'],
  providers: [CryptocompareSocketService]
})
export class CoinsComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  getCoinDataSub: Subscription = new Subscription();
  coinsDataToDisplay: CoinData[] = [];

  constructor(private coinsService: CoinsService,
              private cryptocompareSocketService: CryptocompareSocketService) { }

  ngOnInit() {
    this.getCoinData();
  }

  getCoinData() {
    this.getCoinDataSub = this.coinsService.getCoinData()
      .pipe(
        mergeMap( coinData => {
          const coinsDataToDisplay = coinData;
          const cryptocompareSubscriptionsToAdd = coinData.map( item => item.ConversionInfo.SubsNeeded[0]);
          this.cryptocompareSocketService.addSubscriptions(cryptocompareSubscriptionsToAdd);
          return this.cryptocompareSocketService.onNewMessage()
            .pipe(
              map(realTimeData => {
                console.log(realTimeData);
                const keys = Object.keys(realTimeData);
                keys.forEach( key => {
                  const index = coinsDataToDisplay.findIndex( datum => {
                    return (key === (datum.ConversionInfo.CurrencyFrom + datum.ConversionInfo.CurrencyTo));
                  });
                  if (index !== -1) {
                    const realTimeInfo: RealTimeInfo = {
                      price: realTimeData[key].PRICE,
                      volume: realTimeData[key].VOLUME24HOUR,
                      mcap: realTimeData[key].PRICE * coinsDataToDisplay[index].ConversionInfo.Supply,
                      changePercent: realTimeData[key].CHANGE24HOURPCT
                    };
                    coinsDataToDisplay[index].RealTimeInfo = realTimeInfo;
                    this.coinsDataToDisplay = coinsDataToDisplay;
                  }
                });
              })
            );
          })
        )
      .subscribe();
  }

  ngOnDestroy() {
    this.subscriptions.map( subscription => subscription.unsubscribe());
    this.cryptocompareSocketService.unSubscribe();
  }

}
