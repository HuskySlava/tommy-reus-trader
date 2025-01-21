import {KrakenService} from "./services/kraken.service";

const krakenService = KrakenService.getInstance();

async function test(){
    await krakenService.connect();
    krakenService.quotes(['BTC/USD', 'TRUMP/USD']);
    krakenService.ticker.subscribe((tick) => {
        console.log(tick);
    })
}
test();
