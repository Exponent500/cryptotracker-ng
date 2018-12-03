/**
 * These utilities are taken directly from https://github.com/cryptoqween/cryptoqween.github.io with minor mods.
 * Further docs for interacting with the cryptocompare websocket are found here: https://www.cryptocompare.com/api/#-api-web-socket-
 */

export const CCC: any = {};
CCC.STATIC = CCC.STATIC || {};

CCC.STATIC.TYPE = {
  'TRADE': '0',
  'FEEDNEWS': '1',
  'CURRENT': '2',
  'LOADCOMPLATE': '3',
  'COINPAIRS': '4',
  'CURRENTAGG': '5',
  'TOPLIST': '6',
  'TOPLISTCHANGE': '7',
  'ORDERBOOK': '8',
  'FULLORDERBOOK': '9',
  'ACTIVATION': '10',
  'FULLVOLUME': '11',
  'TRADECATCHUP': '100',
  'NEWSCATCHUP': '101',
  'TRADECATCHUPCOMPLETE': '300',
  'NEWSCATCHUPCOMPLETE': '301'
};

CCC.STATIC.CURRENCY = CCC.STATIC.CURRENCY || {};
// A dictionary of currency symbols used for various currencies.
CCC.STATIC.CURRENCY.SYMBOL = {
    'BTC': 'Ƀ',
    'LTC': 'Ł',
    'DAO': 'Ð',
    'USD': '$',
    'CNY': '¥',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'PLN': 'zł',
    'RUB': '₽',
    'ETH': 'Ξ',
    'GOLD': 'Gold g',
    'INR': '₹',
    'BRL': 'R$',
    'KRW': '₩'
};

// Returns the currency symbol associated with a specific currency ticker name.
// For example, if provided the ticker 'USD', it will return the symbol '$'.
// If no symbol is found, then the ticker provided will be returned.
// For example, if provided the ticker 'US', it would return 'US', as 'US' not a valid ticker.
CCC.STATIC.CURRENCY.getSymbol = (ticker: string): string => {
    return CCC.STATIC.CURRENCY.SYMBOL[ticker] || ticker;
};

// There are 3 types of socket subscriptions available: TRADE, CURRENT, and CURRENTAGG.
// Cryptocompare provides utilities for the TRADE and CURRENT subscriptions.
// The utilities for the CURRENT subscription suffice for the CURRENTAGG subscription,
// so there is no utility names specific to the CURRENTAGG subscription.
CCC.TRADE = CCC.TRADE || {};
CCC.CURRENT = CCC.CURRENT || {};


// A dictionary of FLAG values emitted from the CURRENT and CURRENTAGG socket data subscriptions.
// The keys describe what changed between the last and current emissions of CURRENT and CURRENTAGG subscriptions.
// The values represents the FLAG value sent by the CURRENT and CURRENTAGG subscriptions.
// The CURRENT subscription has output data in the following format:
// '{Type}~{ExchangeName}~{FromCurrency}~{ToCurrency}~{Flag}~{Price}~{LastUpdate}~{LastVolume}~{LastVolumeTo}~{LastTradeId}~{Volume24h}~{Volume24hTo}~{MaskInt}'
// The CURRENTAGG subscription has output data in the following format:
// '{SubscriptionId}~{ExchangeName}~{FromCurrency}~{ToCurrency}~{Flag}~{Price}~{LastUpdate}~{LastVolume}~{LastVolumeTo}~{LastTradeId}~{Volume24h}~{Volume24hTo}~{LastMarket}'
// As you can see from both formats, there are various ~ separated fields. The value of the Flag field is what is of interest here.
// So for example, if the Flag field is 0x1, then we know that the Price has gone up since the last emission.

CCC.CURRENT.FLAGS = {
  'PRICEUP': 0x1, // hex for binary 1
  'PRICEDOWN': 0x2, // hex for binary 10
  'PRICEUNCHANGED': 0x4, // hex for binary 100
  'BIDUP': 0x8, // hex for binary 1000
  'BIDDOWN': 0x10, // hex for binary 10000
  'BIDUNCHANGED': 0x20, // hex for binary 100000
  'OFFERUP': 0x40, // hex for binary 1000000
  'OFFERDOWN': 0x80, // hex for binary 10000000
  'OFFERUNCHANGED': 0x100, // hex for binary 100000000
  'AVGUP': 0x200, // hex for binary 1000000000
  'AVGDOWN': 0x400, // hex for binary 10000000000
  'AVGUNCHANGED': 0x800, // hex for binary 100000000000
};

// A dictionary of ~ separated fields that are emitted by the CURRENT and CURRENTAGG subscriptions.
// The keys describe the field, and the values represent the location of said field within the long string
// of ~ separated fields that is emitted by the CURRENT and CURRENTAGG subscriptions.
// The CURRENT subscription has output data in the following format:
// '{Type}~{ExchangeName}~{FromCurrency}~{ToCurrency}~{Flag}~{Price}~{LastUpdate}~{LastVolume}~{LastVolumeTo}~{LastTradeId}~{Volume24h}~{Volume24hTo}~{MaskInt}'
// The CURRENTAGG subscription has output data in the following format:
// '{SubscriptionId}~{ExchangeName}~{FromCurrency}~{ToCurrency}~{Flag}~{Price}~{LastUpdate}~{LastVolume}~{LastVolumeTo}~{LastTradeId}~{Volume24h}~{Volume24hTo}~{LastMarket}'
// Here you can think of Type, ExchangeName, etc as Fields.

CCC.CURRENT.FIELDS = {
    'TYPE': 0x0, // hex for binary 0, it is a special case of fields that are always there
    'MARKET': 0x0, // hex for binary 0, it is a special case of fields that are always there
    'FROMSYMBOL': 0x0, // hex for binary 0, it is a special case of fields that are always there
    'TOSYMBOL': 0x0, // hex for binary 0, it is a special case of fields that are always there
    'FLAGS': 0x0, // hex for binary 0, it is a special case of fields that are always there
    'PRICE': 0x1, // hex for binary 1
    'BID': 0x2, // hex for binary 10
    'OFFER': 0x4, // hex for binary 100
    'LASTUPDATE': 0x8, // hex for binary 1000
    'AVG': 0x10, // hex for binary 10000
    'LASTVOLUME': 0x20, // hex for binary 100000
    'LASTVOLUMETO': 0x40, // hex for binary 1000000
    'LASTTRADEID': 0x80, // hex for binary 10000000
    'VOLUMEHOUR': 0x100, // hex for binary 100000000
    'VOLUMEHOURTO': 0x200, // hex for binary 1000000000
    'VOLUME24HOUR': 0x400, // hex for binary 10000000000
    'VOLUME24HOURTO': 0x800, // hex for binary 100000000000
    'OPENHOUR': 0x1000, // hex for binary 1000000000000
    'HIGHHOUR': 0x2000, // hex for binary 10000000000000
    'LOWHOUR': 0x4000, // hex for binary 100000000000000
    'OPEN24HOUR': 0x8000, // hex for binary 1000000000000000
    'HIGH24HOUR': 0x10000, // hex for binary 10000000000000000
    'LOW24HOUR': 0x20000, // hex for binary 100000000000000000
    'LASTMARKET': 0x40000 // hex for binary 1000000000000000000, this is a special case and will only appear on CCCAGG messages
};

// Takes CURRENT or CURRENTAGG subscription data and converts it to a dictionary who's keys represent descriptions of the data,
// and who's values represent the data itself.
CCC.CURRENT.unpack = (value: string) => {
    const valuesArray = value.split('~');
    const valuesArrayLenght = valuesArray.length;
    const mask = valuesArray[valuesArrayLenght - 1];
    const maskInt = parseInt(mask, 16);
    const unpackedCurrent = {};
    let currentField = 0;
    for (const property in CCC.CURRENT.FIELDS) {
      if (CCC.CURRENT.FIELDS[property] === 0) {
        unpackedCurrent[property] = valuesArray[currentField];
        currentField++;
      } else if (maskInt & CCC.CURRENT.FIELDS[property]) {
        //i know this is a hack, for cccagg, future code please don't hate me:(, i did this to avoid
        //subscribing to trades as well in order to show the last market
        if (property === 'LASTMARKET') {
          unpackedCurrent[property] = valuesArray[currentField];
        } else {
          unpackedCurrent[property] = parseFloat(valuesArray[currentField]);
        }
        currentField++;
      }
    }
    return unpackedCurrent;
};

CCC.FULLVOLUME = CCC.FULLVOLUME || {};

CCC.FULLVOLUME.FIELDS = {
  'TYPE': 0x0,
  'SYMBOL': 0x0,
  'FULLVOLUME': 0x0
};

CCC.FULLVOLUME.unpack = (volStr: string) => {
    const valuesArray = volStr.split('~');
    const unpackedCurrent = {};
    let currentField = 0;
    const fields = CCC.FULLVOLUME.FIELDS;
    for (const property in fields) {
      if (fields[property] === 0) {
        unpackedCurrent[property] = valuesArray[currentField];
        currentField++;
      }
    }
    return unpackedCurrent;
};


CCC.noExponents = function(value) {
    const data = String(value).split(/[eE]/);
    if (data.length === 1) {
        return data[0];
    }
    let z = '';
    const sign = value < 0 ? '-' : '';
    const str = data[0].replace('.', '');
    let mag = Number(data[1]) + 1;
  
    if (mag < 0) {
      z = sign + '0.';
      while (mag++) {
          z += '0';
      }
      return z + str.replace(/^\-/, '');
    }
    mag -= str.length;
    while (mag--) {
        z += '0';
    }
    return str + z;
};

CCC.filterNumberFunctionPolyfill = (value, decimals) => {
    const decimalsDenominator = Math.pow(10, decimals);
    const numberWithCorrectDecimals = Math.round(value * decimalsDenominator) / decimalsDenominator;
    const parts = numberWithCorrectDecimals.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
};

CCC.convertValueToDisplay = (symbol, value, type, fullNumbers) => {
    let prefix = '';
    let valueSign = 1;
    value = parseFloat(value);
    let valueAbs = Math.abs(value);
    let decimalsOnBigNumbers = 2;
    let decimalsOnNormalNumbers = 2;
    let decimalsOnSmallNumbers = 4;
    if (fullNumbers === true) {
        decimalsOnBigNumbers = 2;
        decimalsOnNormalNumbers = 0;
        decimalsOnSmallNumbers = 4;
    }
    if (symbol !== '') {
        prefix = symbol + ' ';
    }
    if (value < 0) {
        valueSign = -1;
    }
    if (value === 0) {
        return prefix + '0';
    }

    if (value < 0.00001000 && value >= 0.00000100 && decimalsOnSmallNumbers > 3) {
      decimalsOnSmallNumbers = 3;
    }
    if (value < 0.00000100 && value >= 0.00000010 && decimalsOnSmallNumbers > 2) {
      decimalsOnSmallNumbers = 2;
    }
    if (value < 0.00000010 && value >= 0.00000001 && decimalsOnSmallNumbers > 1) {
      decimalsOnSmallNumbers = 1;
    }
  
    if (type === 'short') {
      if (valueAbs > 1000000000) {
        valueAbs = valueAbs / 1000000000;
        return prefix + CCC.filterNumberFunctionPolyfill(valueSign * valueAbs, decimalsOnBigNumbers) + ' B';
      }
      if (valueAbs > 1000000) {
        valueAbs = valueAbs / 1000000;
        return prefix + CCC.filterNumberFunctionPolyfill(valueSign * valueAbs, decimalsOnBigNumbers) + ' M';
      }
      if (valueAbs > 1000) {
        valueAbs = valueAbs / 1000;
        return prefix + CCC.filterNumberFunctionPolyfill(valueSign * valueAbs, decimalsOnBigNumbers) + ' K';
      }
      if (valueAbs >= 1) {
        return prefix + CCC.filterNumberFunctionPolyfill(valueSign * valueAbs, decimalsOnNormalNumbers);
      }
      return prefix + (valueSign * valueAbs).toPrecision(decimalsOnSmallNumbers);
    } else {
      if (valueAbs >= 1) {
        return prefix + CCC.filterNumberFunctionPolyfill(valueSign * valueAbs, decimalsOnNormalNumbers);
      }
      return prefix + CCC.noExponents((valueSign * valueAbs).toPrecision(decimalsOnSmallNumbers));
    }
  };
