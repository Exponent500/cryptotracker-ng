
interface CoinInfo {
    Algorithm: string;
    BlockNumber: number;
    BlockReward: number;
    BlockTime: number;
    DocumentType: string;
    FullName: string;
    Id: string;
    ImageUrl: string;
    Internal: string;
    Name: string;
    NetHashesPerSecond: number;
    ProofType: string;
    Type: number;
    Url: string;
}

interface ConversionInfo {
    Conversion: string;
    ConversionSymbol: string;
    CurrencyFrom: string;
    CurrencyTo: string;
    Market: string;
    RAW: string[];
    SubBase: string;
    SubsNeeded: string[];
    Supply: number;
    TotalVolume24H: number;
}

export interface SocketData {
    price: number;
    volume: number;
    mcap: number;
    changePercent: string;
    flags: string;
}

export interface CoinData {
    CoinInfo: CoinInfo;
    ConversionInfo: ConversionInfo;
}

export interface CoinDataWithSocketData extends CoinData {
    SocketData?: SocketData;
}

interface SponsoredData {
    CoinInfo: CoinInfo;
    ConversionInfo: ConversionInfo;
}

export interface TopCoinsByTotalVolumeResponse {
    Data: CoinData[];
    HasWarning: boolean;
    Message: string;
    RateLimit: any;
    SponsoredData: SponsoredData[];
    Type: number;
}

interface CurrencyDataDISPLAY {
    FROMSYMBOL: string;
    TOSYMBOL: string;
    MARKET: string;
    PRICE: string;
    LASTUPDATE: string;
    LASTVOLUME: string;
    LASTVOLUMETO: string;
    LASTTRADEID: string;
    VOLUMEDAY: string;
    VOLUMEDAYTO: string;
    VOLUME24HOUR: string;
    VOLUME24HOURTO: string;
    OPENDAY: string;
    HIGHDAY: string;
    LOWDAY: string;
    OPEN24HOUR: string;
    HIGH24HOUR: string;
    LOW24HOUR: string;
    LASTMARKET: string;
    CHANGE24HOUR: string;
    CHANGEPCT24HOUR: string;
    CHANGEDAY: string;
    CHANGEPCTDAY: string;
    SUPPLY: string;
    MKTCAP: string;
    TOTALVOLUME24H: string;
    TOTALVOLUME24HTO: string;
}

interface CurrencyDataRAW {
    TYPE: string;
    MARKET: string;
    FROMSYMBOL: string;
    TOSYMBOL: string;
    FLAGS: string;
    PRICE: number;
    LASTUPDATE: number;
    LASTVOLUME: number;
    LASTVOLUMETO: number;
    LASTTRADEID: string;
    VOLUMEDAY: number;
    VOLUMEDAYTO: number;
    VOLUME24HOUR: number;
    VOLUME24HOURTO: number;
    OPENDAY: number;
    HIGHDAY: number;
    LOWDAY: number;
    OPEN24HOUR: number;
    HIGH24HOUR: number;
    LOW24HOUR: number;
    LASTMARKET: string;
    CHANGE24HOUR: number;
    CHANGEPCT24HOUR: number;
    CHANGEDAY: number;
    CHANGEPCTDAY: number;
    SUPPLY: number;
    MKTCAP: number;
    TOTALVOLUME24H: number;
    TOTALVOLUME24HTO: number;
}

interface ToCurrencyRAW {
    [key: string]: CurrencyDataRAW;
}

interface ToCurrencyDISPLAY {
    [key: string]: CurrencyDataDISPLAY;
}

interface FromCurrencyRAW {
    [key: string]: ToCurrencyRAW;
}

interface FromCurrencyDISPLAY {
    [key: string]: ToCurrencyDISPLAY;
}

export interface FullCoinTradingDataResponse {
    RAW: FromCurrencyRAW;
    DISPLAY: FromCurrencyDISPLAY;
}

interface CCCSocketDatumModified {
    CHANGE24HOUR: string;
    CHANGE24HOURPCT: string;
    FLAGS: string;
    FROMSYMBOL: string;
    FULLVOLUMEFROM: number;
    FULLVOLUMETO: number;
    HIGH24HOUR: number;
    LASTMARKET: string;
    LASTTRADEID: string;
    LASTUPDATE: number;
    LASTVOLUME: number;
    LASTVOLUMETO: number;
    LOW24HOUR: number;
    LOWHOUR: number;
    MARKET: string;
    OPEN24HOUR: number;
    OPENHOUR: number;
    PRICE: number;
    TOSYMBOL: string;
    TYPE: string;
    VOLUME24HOUR: number;
    VOLUME24HOURTO: number;
    VOLUMEHOUR: number;
    VOLUMEHOURTO: number;
}

export interface CCCSocketDataModified {
    [key: string]: CCCSocketDatumModified;
}
