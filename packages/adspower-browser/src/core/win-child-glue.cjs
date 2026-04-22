'use strict';
/**
 * Windows：父进程用 detached:false + windowsHide 连接本脚本（避免 job 杀子进程与顶层闪窗），
 * 再由本脚本 detached:true fork 真正的 worker，使 worker 在父进程退出后仍可存活。
 */
const { fork } = require('child_process');

const mainJs = process.env.ADSPOWER_MAIN_JS;
if (!mainJs) {
  process.exit(1);
}

const env = { ...process.env };
delete env.ADSPOWER_MAIN_JS;

const child = fork(mainJs, [], {
  env,
  detached: true,
  windowsHide: true,
  stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
  execArgv: [],
});

if (typeof process.send === 'function' && child.pid) {
  process.send(`ADSPOWER_WORKER_PID_$$_${child.pid}`);
}

child.on('message', (msg) => {
  if (typeof process.send === 'function') {
    process.send(msg);
  }
});

child.on('error', (err) => {
  if (typeof process.send === 'function') {
    process.send(`ADSPOWER_GLUE_ERROR_$$_${err && err.message ? err.message : String(err)}`);
  }
});

child.on('exit', (code) => {
  process.exit(code == null ? 1 : code);
});

if (typeof process.send === 'function') {
  process.on('message', (msg) => {
    if (child.connected && typeof child.send === 'function') {
      child.send(msg);
    }
  });

  process.on('disconnect', () => {
    process.exit(0);
  });
}
