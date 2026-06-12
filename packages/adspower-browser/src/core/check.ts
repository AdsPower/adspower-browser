import axios from 'axios';
import fs from 'fs';
import path from 'path';

export const checkUpdateJS = async (apiKey: string, baseUrl?: string): Promise<boolean> => {
    return new Promise(async (resolve) => {
        let system = '';
        if (process.platform === 'win32') {
            system = process.arch === 'x64' ? 'x64' : 'x86';
        }
        if (process.platform === 'darwin') {
            system = process.arch === 'arm64' ? 'arm64' : 'mac';
        }
        if (process.platform === 'linux') {
            system = 'linux_x64';
        }
        const curVersion = await getCurVersion();
        if (!curVersion) {
            resolve(false);
            return;
        }
        axios.get(`${baseUrl || 'https://api.adspower.com/'}client/sys-version/list`, {
            headers: {
                'api-key': apiKey
            },
            params: {
                version: `v${curVersion}`,
                system
            }
        }).then(async res => {
            const data = res.data.data;
            if (data && data.js) {
                const newVersion = data.js.version;
                if (curVersion) {
                    if (greaterThanVersion(newVersion, curVersion)) {
                        resolve(true);
                        return;
                    }
                }
            }
            resolve(false);
        }).catch(err => {
            console.log(err);
            resolve(false);
        });
    });
}

const getCurVersion = async () => {
    const mainJs = path.join(__dirname, '../cwd/lib', 'main.min.js');
    const curVersion = getVersion(await readFirstLienVersion(mainJs, (msg) => {
        // console.log(msg);
    }));
    return curVersion;
}

const getVersion = (line: string) => {
    if (!line) {
        return '';
    }
    return line.split(/\D/).filter(e => e).join('.');
}

const readFirstLienVersion = (filePath: string, cb: (m: string) => void): Promise<string> =>
new Promise((resolve) => {
    const rs = fs.createReadStream(filePath, {
        encoding: 'utf8',
        start: 0,
        end: 30,
    });
    let acc = '';
    let pos = 0;
    let index: number;
    rs.on('data', (chunk) => {
        index = chunk.indexOf('\n');
        acc += chunk;
        index !== -1 ? rs.close() : (pos += chunk.length);
    })
        .on('close', () => {
            const line = acc.slice(0, pos + index);
            const i = line.indexOf('AdsPower') !== -1 ? line.indexOf('AdsPower') : line.indexOf('RPA');
            if (i > 0 && i < 50) {
                cb(`line-${line}`);
                resolve(line);
                return;
            }
            resolve('');
        })
        .on('error', (err: any) => {
            resolve('');
        });
});

const greaterThanVersion = (onlineVersion: string, localVersion: string): boolean => {
    if (!onlineVersion) {
        return false;
    }
    if (!localVersion) {
        return false;
    }
    const onlineTemp = onlineVersion.replace(/[a-zA-Z]/g, '');
    const localTemp = localVersion.replace(/[a-zA-Z]/g, '');
    if (onlineTemp === localTemp) {
        return false;
    }
    const onlineArr = onlineTemp.split('.');
    const localArr = localTemp.split('.');
    for (let i = 0; i < onlineArr.length; i += 1) {
        if (+onlineArr[i] !== +localArr[i]) {
            return +onlineArr[i] > +localArr[i];
        }
    }
    return false;
};