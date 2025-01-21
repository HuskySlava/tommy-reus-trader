import WebSocket from "ws";
import {Subject} from "rxjs";

const KRAKEN_WS_URL = "wss://ws.kraken.com/v2";

export class KrakenService {
    private static instance: KrakenService;
    private ws: WebSocket;
    public isConnected: boolean;

    public ticker: Subject<string[]>;

    constructor() {
        this.ws = new WebSocket(KRAKEN_WS_URL);
        this.isConnected = false;
        this.ticker = new Subject<string[]>();
    }

    public static getInstance(): KrakenService {
        if (!this.instance) {
            this.instance = new KrakenService()
        }
        return this.instance;
    }

    public async connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.ws.on("open",() => {
                this.isConnected = true;
                resolve();
            });
        })
    }

    public async onDisconnect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.ws.on("close",() => {
                this.isConnected = false;
                resolve()
            })
        })
    }

    public async disconnect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.ws.close();
            this.isConnected = false;
            resolve();
        })
    }

    public quotes(symbols: string[]) {
        const request = {
            method: "subscribe",
            params: {
                channel: "ticker",
                symbol: symbols
            }
        }
        this.ws.send(JSON.stringify(request));
        this.ws.on("message", (res) => {
            try {
                const quote = JSON.parse(res.toString());
                if (quote?.data?.[0]?.bid) {
                    this.ticker.next([quote.data[0].symbol, quote.data[0].bid, quote.data[0].ask])
                }
            } catch (error) {
                console.error("[WS] [ERROR]:", error);
            }
        })
    }

}
