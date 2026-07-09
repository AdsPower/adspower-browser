type StoreKey = 'apiKey' | 'baseUrl' | 'nodeEnv' | 'apiPort' | 'appPort' | 'intranet' | 'rpaPid' | 'rpaPlusPid' | 'aiPid' | 'status' | 'pid' | 'hide';

class Store {
    private apiKey: string;
    private baseUrl: string;
    private nodeEnv: string;
    private apiPort: string;
    private appPort: string;
    private intranet: string;
    private rpaPid: string;
    private rpaPlusPid: string;
    private aiPid: string;
    private status: string;
    private pid: string;
    private hide: string;
    constructor() {
        this.apiKey = '';
        this.baseUrl = '';
        this.nodeEnv = '';
        this.apiPort = '';
        this.appPort = '';
        this.intranet = '';
        this.rpaPid = '';
        this.rpaPlusPid = '';
        this.aiPid = '';
        this.status = 'stop';
        this.pid = '';
        this.hide = '';
    }

    public getStoreValue(key: StoreKey): string {
        if (key === 'apiKey' && !this.apiKey) {
            return process.env.ADS_API_KEY || '';
        }
        return this[key];
    }

    public setStoreValue(key: StoreKey, value: string): void {
        this[key] = value;
    }

    public clear(): void {
        this.apiKey = '';
        this.baseUrl = '';
        this.nodeEnv = '';
        this.apiPort = '';
        this.appPort = '';
        this.intranet = '';
        this.rpaPid = '';
        this.rpaPlusPid = '';
        this.aiPid = '';
        this.status = 'stop';
        this.pid = '';
        this.hide = '';
    }

    public getAllStoreValue() {
        return {
            apiKey: this.apiKey,
            baseUrl: this.baseUrl,
            nodeEnv: this.nodeEnv,
            apiPort: this.apiPort,
            appPort: this.appPort,
            intranet: this.intranet,
            rpaPid: this.rpaPid,
            rpaPlusPid: this.rpaPlusPid,
            aiPid: this.aiPid,
            status: this.status,
            pid: this.pid,
            hide: this.hide,
        };
    }
}

export const store = new Store();