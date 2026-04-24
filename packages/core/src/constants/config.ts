// 解析命令行参数
function parseArgs() {
    const args = process.argv;
    let port: string | undefined;
    let apiKey: string | undefined;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--port' && i + 1 < args.length) {
            port = args[i + 1];
        }
        if (args[i] === '--api-key' && i + 1 < args.length) {
            apiKey = args[i + 1];
        }
    }

    return {
        port: port || process.env.PORT || '50325',
        apiKey: apiKey || process.env.API_KEY
    };
}

const config = parseArgs();
export const updateConfig = (apiKey: string, port: string) => {
    if (apiKey) {
        config.apiKey = apiKey;
    }
    if (port) {
        config.port = port;
    }
}
export const PORT = config.port;
export const API_KEY = config.apiKey;
export const CONFIG = config;