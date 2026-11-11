// 解析命令行参数
function parseArgs() {
    const args = process.argv;
    let port: string | undefined;
    let apiKey: string | undefined;
    let rpaPort: string | undefined;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--port' && i + 1 < args.length) {
            port = args[i + 1];
        }
        if (args[i] === '--api-key' && i + 1 < args.length) {
            apiKey = args[i + 1];
        }
        if ((args[i] === '--rpa-port' || args[i] === '-rp') && i + 1 < args.length) {
            rpaPort = args[i + 1];
        }
    }

    return {
        port: port || process.env.PORT || '50325',
        apiKey: apiKey || process.env.API_KEY,
        rpaPort: rpaPort || process.env.RPA_PORT || '20409'
    };
}

const config = parseArgs();
export const updateConfig = (apiKey?: string, port?: string, rpaPort?: string) => {
    if (apiKey) {
        config.apiKey = apiKey;
    }
    if (port) {
        config.port = port;
    }
    if (rpaPort) {
        config.rpaPort = rpaPort;
    }
}
export const PORT = config.port;
export const RPA_PORT = config.rpaPort;
export const API_KEY = config.apiKey;
export const CONFIG = config;