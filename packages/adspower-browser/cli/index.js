#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_commander = require("commander");

// src/store/index.ts
var Store = class {
  apiKey;
  baseUrl;
  nodeEnv;
  apiPort;
  appPort;
  intranet;
  rpaPid;
  rpaPlusPid;
  aiPid;
  status;
  pid;
  constructor() {
    this.apiKey = "";
    this.baseUrl = "";
    this.nodeEnv = "";
    this.apiPort = "";
    this.appPort = "";
    this.intranet = "";
    this.rpaPid = "";
    this.rpaPlusPid = "";
    this.aiPid = "";
    this.status = "stop";
    this.pid = "";
  }
  getStoreValue(key) {
    if (key === "apiKey" && !this.apiKey) {
      return process.env.ADS_API_KEY || "";
    }
    return this[key];
  }
  setStoreValue(key, value) {
    this[key] = value;
  }
  clear() {
    this.apiKey = "";
    this.baseUrl = "";
    this.nodeEnv = "";
    this.apiPort = "";
    this.appPort = "";
    this.intranet = "";
    this.rpaPid = "";
    this.rpaPlusPid = "";
    this.aiPid = "";
    this.status = "stop";
    this.pid = "";
  }
  getAllStoreValue() {
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
      pid: this.pid
    };
  }
};
var store = new Store();

// src/core/start.ts
var path2 = __toESM(require("path"));
var import_node_child_process2 = require("child_process");

// src/tools/index.ts
var os = __toESM(require("os"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));
var crypto = __toESM(require("crypto"));
var util = __toESM(require("util"));
var import_node_child_process = require("child_process");
var import_colors = require("colors");
var import_fs_extra2 = require("fs-extra2");
var VERSION = "1.0.0";
var logError = (message) => {
  console.error((0, import_colors.red)(message));
};
var logSuccess = (message) => {
  console.log((0, import_colors.green)(message));
};
var logWarning = (message) => {
  console.log((0, import_colors.yellow)(message));
};
var logInfo = (message) => {
  console.log(message);
};
var sleepTime = (time) => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, time);
});
var browsersKill = async () => {
  await taskKillBrowser();
  await taskKillFlowser();
};
var taskKillBrowser = () => new Promise((resolve) => {
  const cmd = ["linux", "darwin"].includes(process.platform) ? 'pkill -u `whoami` -f "SunBrowser"' : "taskkill -PID SunBrowser.exe";
  (0, import_node_child_process.exec)(cmd, (err) => {
    if (err) {
    }
    resolve();
  });
});
var taskKillFlowser = () => new Promise((resolve) => {
  const cmd = ["linux", "darwin"].includes(process.platform) ? 'pkill -u `whoami` -f "FlowerBrowser"' : "taskkill -PID FlowerBrowser.exe";
  (0, import_node_child_process.exec)(cmd, (err) => {
    if (err) {
    }
    resolve();
  });
});
var getHomedir = () => {
  return (typeof os.homedir == "function" ? os.homedir() : process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]) || "~";
};
var getPidFileDir = () => {
  const dir = path.join(getHomedir(), ".adspowerCli");
  if (!fs.existsSync(dir)) {
    (0, import_fs_extra2.ensureDirSync)(dir);
  }
  return dir;
};
var pidFileName = () => {
  const md5 = crypto.createHash("md5").update(VERSION).digest("hex");
  return md5;
};
var writePidFile = (config2) => {
  const filePath = path.join(getPidFileDir(), pidFileName());
  (0, import_fs_extra2.outputJsonSync)(filePath, config2 || {});
};
var readPidFile = () => {
  const filePath = path.join(getPidFileDir(), pidFileName());
  if (fs.existsSync(filePath)) {
    return (0, import_fs_extra2.readJsonSync)(filePath);
  }
  return {};
};
var removePidFile = () => {
  const filePath = path.join(getPidFileDir(), pidFileName());
  if (fs.existsSync(filePath)) {
    (0, import_fs_extra2.removeSync)(filePath);
  }
};
var isRunning = (pid) => {
  return new Promise((resolve) => {
    if (pid) {
      (0, import_node_child_process.exec)(
        util.format(process.platform === "win32" ? 'tasklist /fi "PID eq %s" | findstr /i "node.exe"' : 'ps -f -p %s | grep "node"', pid),
        function(err, stdout, stderr) {
          resolve(!err && !!stdout.toString().trim());
        }
      );
    } else {
      resolve(false);
    }
  });
};
var ensureBrowserPath = () => {
  const dir = path.join(__dirname, "../cwd/source", ".browser");
  if (!fs.existsSync(dir)) {
    (0, import_fs_extra2.ensureDirSync)(dir);
  }
};
var getApiKeyAndPort = (options) => {
  const apiKey = options.apiKey;
  const port = options.port;
  if (apiKey && port) {
    return {
      apiKey,
      port
    };
  }
  const result = {
    apiKey,
    port
  };
  const processInstance = readPidFile();
  if (!apiKey) {
    if (processInstance.apiKey) {
      result.apiKey = processInstance.apiKey;
    } else if (process.env.ADS_API_KEY) {
      result.apiKey = process.env.ADS_API_KEY;
    }
  }
  if (!port && processInstance.apiPort) {
    result.port = processInstance.apiPort;
  }
  return result;
};
var hasRunning = async (options) => {
  const { apiKey, port } = options;
  if (apiKey && port) {
    return true;
  }
  const processInstance = readPidFile();
  if (processInstance.pid) {
    return await isRunning(processInstance.pid);
  }
  return false;
};
var loadingFramesList = {
  default: ["|", "/", "-", "\\"],
  frames: ["\u2596", "\u2597", "\u2598", "\u2599", "\u259A", "\u259B", "\u259C", "\u259D", "\u259E", "\u259F"],
  dotFrames: ["\u2840", "\u2844", "\u2846", "\u2847", "\u284F", "\u285F", "\u287F", "\u28FF", "\u28F7", "\u28F6", "\u28E6", "\u28E4", "\u28E0", "\u2880"]
};
var createLoading = (text) => {
  if (!process.stdout.isTTY) {
    return {
      stop() {
      }
    };
  }
  let index = 0;
  const frames = loadingFramesList.default;
  process.stdout.write(`${frames[index]} ${text}`);
  const timer = setInterval(() => {
    index = (index + 1) % frames.length;
    process.stdout.write(`\r${frames[index]} ${text}`);
  }, 120);
  return {
    stop() {
      clearInterval(timer);
      process.stdout.write(`\r${" ".repeat(text.length + 2)}\r`);
    }
  };
};
var initSqlite3 = () => {
  const sqliteFile = path.join(__dirname, "../cwd/lib", "node_sqlite3.node");
  if (fs.existsSync(sqliteFile)) {
    return;
  }
  const isMac = process.platform === "darwin";
  const isLinux = process.platform === "linux";
  const is32 = process.arch === "ia32";
  const isArm = process.arch === "arm64";
  const isX64 = process.arch === "x64";
  const macFolder = isArm ? "arm64" : "mac";
  const winFolder = is32 ? "ia32" : "x64";
  const linuxFolder = isLinux && isX64 && "linux";
  const sqliteFolder = isMac ? macFolder : isLinux ? linuxFolder : winFolder;
  const dir = path.join(__dirname, `../sqlite/${sqliteFolder}`);
  if (!fs.existsSync(dir)) {
    throw new Error(`SQLite folder not found: ${dir}`);
  } else {
    const sqliteFile2 = path.join(dir, "node_sqlite3.node");
    const cwdPath = path.join(__dirname, "../cwd/lib");
    (0, import_fs_extra2.copySync)(sqliteFile2, path.join(cwdPath, "node_sqlite3.node"));
    logSuccess(`[i] SQLite file initialized successfully!`);
  }
};
var renderKernelProgress = (result) => {
  const status = result.status || "pending";
  const progress = ["completed", "installing"].includes(status) ? 100 : Math.max(0, Math.min(100, Number(result.progress) || 0));
  if (!process.stdout.isTTY) {
    logInfo(`Kernel progress: ${progress}% [${status}]`);
    return;
  }
  const width = 30;
  const filled = Math.round(progress / 100 * width);
  const bar = `${"=".repeat(filled)}${"-".repeat(width - filled)}`;
  process.stdout.write(`\r[${bar}] ${progress.toFixed(0).padStart(3, " ")}% ${status}     `);
};
var finishKernelProgress = () => {
  if (process.stdout.isTTY) {
    process.stdout.write("\n");
  }
};
var trackKernelDownload = async (fnc, args) => {
  while (true) {
    const result = await fnc(args);
    try {
      const resultJson = JSON.parse(result.replace("Kernel download/update status: ", ""));
      if (resultJson && resultJson.status && ["pending", "downloading", "completed", "installing", "failed"].includes(resultJson.status)) {
        renderKernelProgress(resultJson);
        if (["completed", "failed"].includes(resultJson.status)) {
          finishKernelProgress();
          return result;
        }
        await sleepTime(3e3);
      } else {
        return result;
      }
    } catch (error) {
      return result;
    }
  }
};

// src/core/start.ts
var getEnv = () => {
  const env = {
    ...process.env,
    // 系统的环境变量信息
    API_KEY: store.getStoreValue("apiKey"),
    IS_CLOUD_BROWSER: true
    // 云浏览器场景预留标识
  };
  if (store.getStoreValue("baseUrl")) {
    env.BASE_URL = store.getStoreValue("baseUrl");
  }
  if (store.getStoreValue("nodeEnv")) {
    env.NODE_ENV = store.getStoreValue("nodeEnv");
  }
  return env;
};
var startChild = (type) => {
  let timer;
  let child = null;
  return new Promise(async (resolve, reject) => {
    initSqlite3();
    const processInstance = readPidFile();
    if (processInstance && processInstance.pid) {
      const isRun = await isRunning(processInstance.pid);
      removePidFile();
      if (isRun) {
        process.kill(Number(processInstance.pid), "SIGKILL");
        await sleepTime(1e3);
      }
    }
    const env = Object.fromEntries(
      Object.entries(getEnv()).map(([key, value]) => [key, value == null ? value : String(value)])
    );
    try {
      const mainJs = path2.join(__dirname, "../cwd/lib", "main.min.js");
      child = (0, import_node_child_process2.fork)(mainJs, {
        env,
        detached: true,
        stdio: ["ignore", "ignore", "ignore", "ipc"]
      });
      ensureBrowserPath();
      store.setStoreValue("status", "starting");
      logSuccess(`[i] Adspower program is starting...`);
      store.setStoreValue("pid", child?.pid?.toString() || "");
      let isAppPortOk = false;
      writePidFile(store.getAllStoreValue());
      child.on("message", async (msg) => {
        const text = String(msg);
        if (text.indexOf("SERVER_PORT_$$_") === 0 && !isAppPortOk) {
          const port = text.replace("SERVER_PORT_$$_", "").trim();
          store.setStoreValue("appPort", port);
          isAppPortOk = true;
        }
        if (text.indexOf("START_API_SERVER_SUCCESS_$$_") === 0) {
          const port = text.replace("START_API_SERVER_SUCCESS_$$_", "").trim();
          store.setStoreValue("apiPort", port);
          logSuccess(`Server running at:`);
          logSuccess(` - local: http://local.adspower.net:${port}`);
          writePidFile(store.getAllStoreValue());
          if (child) {
            child.disconnect();
            child.unref();
          }
        }
        if (text.indexOf("START_API_SERVER_FAIL_$$_") === 0) {
          const serverMsg = text.replace("START_API_SERVER_FAIL_$$_", "").split("_").filter(Boolean);
          if (serverMsg[0]) {
            logError(`ERROR - ${serverMsg[0]}`);
          }
          if (serverMsg[1]) {
            logError(`ERROR - ${serverMsg[1]}`);
          }
          process.exit(0);
        }
        if (text === "start") {
          clearTimeout(timer);
          resolve();
          store.setStoreValue("status", "doing");
          writePidFile(store.getAllStoreValue());
        }
        if (text === "restart") {
          child && child.kill("SIGKILL");
          store.setStoreValue("status", "restarting");
          startChild("2").catch(() => {
          });
        }
        if (text.indexOf("INTRANET_$$_") > -1) {
          const arr = text.split("_$$_");
          if (arr && arr[1]) {
            store.setStoreValue("intranet", arr[1]);
          }
        }
        if (text === "browser-kill") {
          await browsersKill();
        }
        if (text.indexOf("RPA_PROCESS_PID_") > -1) {
          const rpaPid = text.replace("RPA_PROCESS_PID_", "");
          store.setStoreValue("rpaPid", rpaPid);
        }
        if (text.indexOf("RPA_PLUS_PROCESS_PID_") > -1) {
          const rpaPlusPid = text.replace("RPA_PLUS_PROCESS_PID_", "");
          store.setStoreValue("rpaPlusPid", rpaPlusPid);
        }
        if (text.indexOf("AI_PROCESS_PID_") > -1) {
          const aiPid = text.replace("AI_PROCESS_PID_", "");
          store.setStoreValue("aiPid", aiPid);
        }
      });
      child.on("error", (err) => {
        logError(`[!] Node\u542F\u52A8\u5931\u8D25: ${err.message}`);
        store.setStoreValue("status", "stop");
        store.clear();
        removePidFile();
        process.exit(0);
      });
      child.on("exit", async (code, signal) => {
        if (signal === "SIGKILL") {
          await browsersKill();
          store.clear();
          removePidFile();
        } else {
          child = null;
          await sleepTime(500);
          startChild("2").then(() => {
          }).catch(() => {
            logError("[!] Restart failed");
          });
        }
      });
      timer = setTimeout(() => {
        child && child.kill("SIGKILL");
        child = null;
        store.setStoreValue("status", "stop");
        logError("[!] Start Timeout");
        reject("Start Timeout");
      }, 30 * 1e3);
    } catch (error) {
      clearTimeout(timer);
      reject(error);
      child = null;
      store.clear();
      logError(`[!] Node\u542F\u52A8\u5931\u8D25: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  });
};
var stopChild = async () => {
  const processInstance = readPidFile();
  if (processInstance.pid) {
    const isRun = await isRunning(processInstance.pid);
    try {
      process.kill(Number(processInstance.pid), "SIGKILL");
      removePidFile();
    } catch (error) {
      try {
        await sleepTime(2e3);
        process.kill(Number(processInstance.pid), "SIGKILL");
        removePidFile();
      } catch (error2) {
        logError(`[!] Stop child fail: ${error2 instanceof Error ? error2.message : JSON.stringify(error2)}`);
        if (isRun) {
          logWarning(`[!] Please manually close the browser process: ${processInstance.pid}`);
        }
        return;
      }
    }
    logSuccess("[i] Adspower program is stopped");
  } else {
    logInfo("[i] No running adspower program");
  }
};
var restartChild = async () => {
  const processInstance = readPidFile();
  if (processInstance.pid) {
    const apiKey = processInstance.apiKey;
    const baseUrl = processInstance.baseUrl;
    const nodeEnv = processInstance.nodeEnv;
    await stopChild();
    await sleepTime(1e3);
    store.setStoreValue("apiKey", apiKey);
    store.setStoreValue("baseUrl", baseUrl);
    store.setStoreValue("nodeEnv", nodeEnv);
    await startChild().then(() => {
      logSuccess("[i] Adspower program is restarted");
    }).catch((error) => {
      logError(`[!] Restart failed: ${error.message}`);
    });
  } else {
    logInfo("[i] No running adspower program");
  }
};
var getChildStatus = async () => {
  const processInstance = readPidFile();
  if (processInstance.pid) {
    const isRun = await isRunning(processInstance.pid);
    if (!isRun) {
      removePidFile();
      logInfo("[i] Adspower program is not running");
      return;
    }
    const status = processInstance.status;
    if (status === "starting") {
      logSuccess("[i] Adspower program is starting...");
    } else if (status === "doing" && processInstance.apiPort) {
      logSuccess("[i] Adspower program is running at:");
      logSuccess(` - http://local.adspower.net:${processInstance.apiPort}`);
    } else if (status === "stop") {
      logInfo("[i] Adspower program is stopped");
    } else {
      logInfo("[i] Adspower program is not started");
    }
  } else {
    logInfo("[i] Adspower program is not running");
  }
};

// src/index.ts
var import_colors2 = require("colors");

// ../core/src/constants/api.ts
var import_axios = __toESM(require("axios"));

// ../core/src/constants/config.ts
function parseArgs() {
  const args = process.argv;
  let port;
  let apiKey;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" && i + 1 < args.length) {
      port = args[i + 1];
    }
    if (args[i] === "--api-key" && i + 1 < args.length) {
      apiKey = args[i + 1];
    }
  }
  return {
    port: port || process.env.PORT || "50326",
    apiKey: apiKey || process.env.API_KEY
  };
}
var config = parseArgs();
var updateConfig = (apiKey, port) => {
  if (apiKey) {
    config.apiKey = apiKey;
  }
  if (port) {
    config.port = port;
  }
};
var PORT = config.port;
var API_KEY = config.apiKey;
var CONFIG = config;

// ../core/src/constants/localApiContracts.ts
var LOCAL_API_CONTRACTS = {
  "check-status": {
    method: "GET",
    path: "/status",
    params: {}
  },
  "get-application-list": {
    method: "GET",
    path: "/api/v2/category/list",
    params: {
      category_id: { apiName: "category_id", location: "query" },
      page: { apiName: "page", location: "query" },
      limit: { apiName: "limit", location: "query" }
    }
  },
  "open-browser": {
    method: "POST",
    path: "/api/v2/browser-profile/start",
    params: {
      profile_id: { apiName: "profile_id", location: "body" },
      profile_no: { apiName: "profile_no", location: "body" },
      ip_tab: { apiName: "ip_tab", location: "body" },
      launch_args: { apiName: "launch_args", location: "body" },
      headless: { apiName: "headless", location: "body" },
      last_opened_tabs: { apiName: "last_opened_tabs", location: "body" },
      proxy_detection: { apiName: "proxy_detection", location: "body" },
      password_filling: { apiName: "password_filling", location: "body" },
      password_saving: { apiName: "password_saving", location: "body" },
      cdp_mask: { apiName: "cdp_mask", location: "body" },
      delete_cache: { apiName: "delete_cache", location: "body" },
      device_scale: { apiName: "device_scale", location: "body" }
    }
  },
  "close-browser": {
    method: "POST",
    path: "/api/v2/browser-profile/stop",
    params: {
      profile_id: { apiName: "profile_id", location: "body" },
      profile_no: { apiName: "profile_no", location: "body" }
    }
  },
  "create-browser": {
    method: "POST",
    path: "/api/v2/browser-profile/create",
    params: {
      group_id: { apiName: "group_id", location: "body" },
      username: { apiName: "username", location: "body" },
      password: { apiName: "password", location: "body" },
      cookie: { apiName: "cookie", location: "body" },
      fakey: { apiName: "fakey", location: "body" },
      name: { apiName: "name", location: "body" },
      platform: { apiName: "platform", location: "body" },
      remark: { apiName: "remark", location: "body" },
      user_proxy_config: { apiName: "user_proxy_config", location: "body" },
      proxyid: { apiName: "proxyid", location: "body" },
      repeat_config: { apiName: "repeat_config", location: "body" },
      ignore_cookie_error: { apiName: "ignore_cookie_error", location: "body" },
      tabs: { apiName: "tabs", location: "body" },
      ip: { apiName: "ip", location: "body" },
      country: { apiName: "country", location: "body" },
      region: { apiName: "region", location: "body" },
      city: { apiName: "city", location: "body" },
      ipchecker: { apiName: "ipchecker", location: "body" },
      category_id: { apiName: "category_id", location: "body" },
      profile_tag_ids: { apiName: "profile_tag_ids", location: "body" },
      fingerprint_config: { apiName: "fingerprint_config", location: "body" },
      platform_account: { apiName: "platform_account", location: "body" }
    }
  },
  "update-browser": {
    method: "POST",
    path: "/api/v2/browser-profile/update",
    params: {
      profile_id: { apiName: "profile_id", location: "body" },
      group_id: { apiName: "group_id", location: "body" },
      username: { apiName: "username", location: "body" },
      password: { apiName: "password", location: "body" },
      cookie: { apiName: "cookie", location: "body" },
      fakey: { apiName: "fakey", location: "body" },
      name: { apiName: "name", location: "body" },
      platform: { apiName: "platform", location: "body" },
      remark: { apiName: "remark", location: "body" },
      user_proxy_config: { apiName: "user_proxy_config", location: "body" },
      proxyid: { apiName: "proxyid", location: "body" },
      repeat_config: { apiName: "repeat_config", location: "body" },
      ignore_cookie_error: { apiName: "ignore_cookie_error", location: "body" },
      tabs: { apiName: "tabs", location: "body" },
      ip: { apiName: "ip", location: "body" },
      country: { apiName: "country", location: "body" },
      region: { apiName: "region", location: "body" },
      city: { apiName: "city", location: "body" },
      ipchecker: { apiName: "ipchecker", location: "body" },
      category_id: { apiName: "category_id", location: "body" },
      profile_tag_ids: { apiName: "profile_tag_ids", location: "body" },
      fingerprint_config: { apiName: "fingerprint_config", location: "body" },
      platform_account: { apiName: "platform_account", location: "body" },
      launch_args: { apiName: "launch_args", location: "body" },
      tags_update_type: { apiName: "tags_update_type", location: "body" }
    }
  },
  "delete-browser": {
    method: "POST",
    path: "/api/v2/browser-profile/delete",
    params: {
      profile_id: { apiName: "profile_id", location: "body" }
    }
  },
  "get-browser-list": {
    method: "POST",
    path: "/api/v2/browser-profile/list",
    params: {
      group_id: { apiName: "group_id", location: "body" },
      limit: { apiName: "limit", location: "body" },
      page: { apiName: "page", location: "body" },
      profile_id: { apiName: "profile_id", location: "body" },
      profile_no: { apiName: "profile_no", location: "body" },
      sort_type: { apiName: "sort_type", location: "body" },
      sort_order: { apiName: "sort_order", location: "body" },
      tag_ids: { apiName: "tag_ids", location: "body" },
      tags_filter: { apiName: "tags_filter", location: "body" },
      name: { apiName: "name", location: "body" },
      name_filter: { apiName: "name_filter", location: "body" }
    }
  },
  "get-opened-browser": {
    method: "GET",
    path: "/api/v1/browser/local-active",
    params: {}
  },
  "move-browser": {
    method: "POST",
    path: "/api/v1/user/regroup",
    params: {
      user_ids: { apiName: "user_ids", location: "body" },
      group_id: { apiName: "group_id", location: "body" }
    }
  },
  "get-profile-cookies": {
    method: "GET",
    path: "/api/v2/browser-profile/cookies",
    params: {
      profile_id: { apiName: "profile_id", location: "query" },
      profile_no: { apiName: "profile_no", location: "query" }
    }
  },
  "get-profile-ua": {
    method: "POST",
    path: "/api/v2/browser-profile/ua",
    params: {
      profile_id: { apiName: "profile_id", location: "body" },
      profile_no: { apiName: "profile_no", location: "body" }
    }
  },
  "close-all-profiles": {
    method: "POST",
    path: "/api/v2/browser-profile/stop-all",
    params: {}
  },
  "new-fingerprint": {
    method: "POST",
    path: "/api/v2/browser-profile/new-fingerprint",
    params: {
      profile_id: { apiName: "profile_id", location: "body" },
      profile_no: { apiName: "profile_no", location: "body" }
    }
  },
  "delete-cache-v2": {
    method: "POST",
    path: "/api/v2/browser-profile/delete-cache",
    params: {
      profile_id: { apiName: "profile_id", location: "body" },
      type: { apiName: "type", location: "body" }
    }
  },
  "share-profile": {
    method: "POST",
    path: "/api/v2/browser-profile/share",
    params: {
      profile_id: { apiName: "profile_id", location: "body" },
      receiver: { apiName: "receiver", location: "body" },
      share_type: { apiName: "share_type", location: "body" },
      content: { apiName: "content", location: "body" }
    }
  },
  "get-browser-active": {
    method: "GET",
    path: "/api/v2/browser-profile/active",
    params: {
      profile_id: { apiName: "profile_id", location: "query" },
      profile_no: { apiName: "profile_no", location: "query" }
    }
  },
  "get-cloud-active": {
    method: "POST",
    path: "/api/v1/browser/cloud-active",
    params: {
      user_ids: { apiName: "user_ids", location: "body" }
    }
  },
  "create-group": {
    method: "POST",
    path: "/api/v1/group/create",
    params: {
      group_name: { apiName: "group_name", location: "body" },
      remark: { apiName: "remark", location: "body" }
    }
  },
  "update-group": {
    method: "POST",
    path: "/api/v1/group/update",
    params: {
      group_id: { apiName: "group_id", location: "body" },
      group_name: { apiName: "group_name", location: "body" },
      remark: { apiName: "remark", location: "body" }
    }
  },
  "get-group-list": {
    method: "GET",
    path: "/api/v1/group/list",
    params: {
      group_name: { apiName: "group_name", location: "query" },
      page: { apiName: "page", location: "query" },
      page_size: { apiName: "page_size", location: "query" }
    }
  },
  "create-proxy": {
    method: "POST",
    path: "/api/v2/proxy-list/create",
    params: {},
    bodyShape: "array"
  },
  "update-proxy": {
    method: "POST",
    path: "/api/v2/proxy-list/update",
    params: {
      proxy_id: { apiName: "proxy_id", location: "body" },
      type: { apiName: "type", location: "body" },
      host: { apiName: "host", location: "body" },
      port: { apiName: "port", location: "body" },
      user: { apiName: "user", location: "body" },
      password: { apiName: "password", location: "body" },
      proxy_url: { apiName: "proxy_url", location: "body" },
      remark: { apiName: "remark", location: "body" },
      ipchecker: { apiName: "ipchecker", location: "body" }
    }
  },
  "get-proxy-list": {
    method: "POST",
    path: "/api/v2/proxy-list/list",
    params: {
      proxy_id: { apiName: "proxy_id", location: "body" },
      limit: { apiName: "limit", location: "body" },
      page: { apiName: "page", location: "body" }
    }
  },
  "delete-proxy": {
    method: "POST",
    path: "/api/v2/proxy-list/delete",
    params: {
      proxy_id: { apiName: "proxy_id", location: "body" }
    }
  },
  "get-tag-list": {
    method: "POST",
    path: "/api/v2/browser-tags/list",
    params: {
      ids: { apiName: "ids", location: "body" },
      page: { apiName: "page", location: "body" },
      limit: { apiName: "limit", location: "body" }
    }
  },
  "create-tag": {
    method: "POST",
    path: "/api/v2/browser-tags/create",
    params: {
      tags: { apiName: "tags", location: "body" }
    }
  },
  "update-tag": {
    method: "POST",
    path: "/api/v2/browser-tags/update",
    params: {
      tags: { apiName: "tags", location: "body" }
    }
  },
  "delete-tag": {
    method: "POST",
    path: "/api/v2/browser-tags/delete",
    params: {
      ids: { apiName: "ids", location: "body" }
    }
  },
  "download-kernel": {
    method: "POST",
    path: "/api/v2/browser-profile/download-kernel",
    params: {
      kernel_type: { apiName: "kernel_type", location: "body" },
      kernel_version: { apiName: "kernel_version", location: "body" }
    }
  },
  "get-kernel-list": {
    method: "GET",
    path: "/api/v2/browser-profile/kernels",
    params: {
      kernel_type: { apiName: "kernel_type", location: "query" }
    }
  },
  "update-patch": {
    method: "POST",
    path: "/api/v2/browser-profile/update-patch",
    params: {
      version_type: { apiName: "version_type", location: "body" }
    }
  }
};

// ../core/src/constants/api.ts
var LOCAL_API_BASE = `http://127.0.0.1:${PORT}`;
var getLocalApiBase = () => {
  return `http://127.0.0.1:${CONFIG.port}`;
};
var API_ENDPOINTS = {
  STATUS: "/status",
  START_BROWSER: LOCAL_API_CONTRACTS["open-browser"].path,
  CLOSE_BROWSER: LOCAL_API_CONTRACTS["close-browser"].path,
  CREATE_BROWSER: LOCAL_API_CONTRACTS["create-browser"].path,
  GET_BROWSER_LIST: LOCAL_API_CONTRACTS["get-browser-list"].path,
  UPDATE_BROWSER: LOCAL_API_CONTRACTS["update-browser"].path,
  DELETE_BROWSER: LOCAL_API_CONTRACTS["delete-browser"].path,
  GET_PROFILE_COOKIES: LOCAL_API_CONTRACTS["get-profile-cookies"].path,
  GET_PROFILE_UA: LOCAL_API_CONTRACTS["get-profile-ua"].path,
  CLOSE_ALL_PROFILES: LOCAL_API_CONTRACTS["close-all-profiles"].path,
  NEW_FINGERPRINT: LOCAL_API_CONTRACTS["new-fingerprint"].path,
  DELETE_CACHE_V2: LOCAL_API_CONTRACTS["delete-cache-v2"].path,
  SHARE_PROFILE: LOCAL_API_CONTRACTS["share-profile"].path,
  GET_BROWSER_ACTIVE: LOCAL_API_CONTRACTS["get-browser-active"].path,
  CREATE_PROXY: LOCAL_API_CONTRACTS["create-proxy"].path,
  UPDATE_PROXY: LOCAL_API_CONTRACTS["update-proxy"].path,
  GET_PROXY_LIST: LOCAL_API_CONTRACTS["get-proxy-list"].path,
  DELETE_PROXY: LOCAL_API_CONTRACTS["delete-proxy"].path,
  GET_OPENED_BROWSER: LOCAL_API_CONTRACTS["get-opened-browser"].path,
  GET_CLOUD_ACTIVE: LOCAL_API_CONTRACTS["get-cloud-active"].path,
  MOVE_BROWSER: LOCAL_API_CONTRACTS["move-browser"].path,
  GET_GROUP_LIST: LOCAL_API_CONTRACTS["get-group-list"].path,
  CREATE_GROUP: LOCAL_API_CONTRACTS["create-group"].path,
  UPDATE_GROUP: LOCAL_API_CONTRACTS["update-group"].path,
  GET_APPLICATION_LIST: LOCAL_API_CONTRACTS["get-application-list"].path,
  GET_TAG_LIST: LOCAL_API_CONTRACTS["get-tag-list"].path,
  CREATE_TAG: LOCAL_API_CONTRACTS["create-tag"].path,
  UPDATE_TAG: LOCAL_API_CONTRACTS["update-tag"].path,
  DELETE_TAG: LOCAL_API_CONTRACTS["delete-tag"].path,
  DOWNLOAD_KERNEL: LOCAL_API_CONTRACTS["download-kernel"].path,
  GET_KERNEL_LIST: LOCAL_API_CONTRACTS["get-kernel-list"].path,
  UPDATE_PATCH: LOCAL_API_CONTRACTS["update-patch"].path
};
var apiClient = import_axios.default.create({
  headers: API_KEY ? { "Authorization": `Bearer ${API_KEY}` } : {}
});
var getApiClient = () => {
  return import_axios.default.create({
    headers: CONFIG.apiKey ? { "Authorization": `Bearer ${CONFIG.apiKey}` } : {}
  });
};

// ../core/src/constants/toolIntentMetadata.ts
var TOOL_INTENT_BY_NAME = {
  "open-browser": {
    intentEn: "Start an existing AdsPower browser profile (launch the profile browser).",
    intentZh: "\u542F\u52A8\u5DF2\u5B58\u5728\u7684 AdsPower \u6D4F\u89C8\u5668\u73AF\u5883\uFF08\u7528\u6237\u5E38\u79F0\u73AF\u5883\u3001\u914D\u7F6E\u6587\u4EF6\u3001profile\uFF09\u3002",
    triggersEn: "open browser, launch profile, start environment, open AdsPower, open config profile",
    triggersZh: "\u6253\u5F00\u6D4F\u89C8\u5668,\u542F\u52A8\u73AF\u5883,\u6253\u5F00\u914D\u7F6E,\u6253\u5F00\u914D\u7F6E\u6587\u4EF6,\u6253\u5F00profile,\u62C9\u8D77AdsPower,\u542F\u52A8\u6307\u7EB9\u6D4F\u89C8\u5668"
  },
  "close-browser": {
    intentEn: "Stop a running AdsPower browser profile.",
    intentZh: "\u5173\u95ED\u6B63\u5728\u8FD0\u884C\u7684\u6D4F\u89C8\u5668\u73AF\u5883 / profile\u3002",
    triggersEn: "close browser, stop profile, shutdown environment, kill browser",
    triggersZh: "\u5173\u95ED\u6D4F\u89C8\u5668,\u505C\u6B62\u73AF\u5883,\u5173\u6389profile,\u7ED3\u675F\u6D4F\u89C8\u5668,\u9000\u51FA\u6307\u7EB9\u73AF\u5883"
  },
  "create-browser": {
    intentEn: "Create a new AdsPower browser profile (account).",
    intentZh: "\u65B0\u5EFA\u6D4F\u89C8\u5668\u73AF\u5883 / \u8D26\u53F7 profile\u3002",
    triggersEn: "create profile, new browser, add account, spin up profile",
    triggersZh: "\u65B0\u5EFA\u73AF\u5883,\u521B\u5EFAprofile,\u6DFB\u52A0\u6D4F\u89C8\u5668,\u65B0\u5F00\u6307\u7EB9,\u521B\u5EFA\u8D26\u53F7"
  },
  "update-browser": {
    intentEn: "Update fields of an existing browser profile.",
    intentZh: "\u66F4\u65B0\u5DF2\u6709 profile \u7684\u914D\u7F6E\uFF08\u5907\u6CE8\u3001\u4EE3\u7406\u3001\u6307\u7EB9\u7B49\uFF09\u3002",
    triggersEn: "edit profile, change settings, modify browser, update fingerprint",
    triggersZh: "\u4FEE\u6539\u914D\u7F6E,\u66F4\u65B0profile,\u6539\u4EE3\u7406,\u6539\u6307\u7EB9,\u7F16\u8F91\u73AF\u5883"
  },
  "delete-browser": {
    intentEn: "Delete one or more browser profiles permanently.",
    intentZh: "\u6C38\u4E45\u5220\u9664\u4E00\u4E2A\u6216\u591A\u4E2A\u6D4F\u89C8\u5668 profile\u3002",
    triggersEn: "remove profile, delete account, trash browser",
    triggersZh: "\u5220\u9664\u73AF\u5883,\u79FB\u9664profile,\u5220\u6389\u6D4F\u89C8\u5668\u8D26\u53F7"
  },
  "get-browser-list": {
    intentEn: "List or search browser profiles (pagination, filters).",
    intentZh: "\u5206\u9875/\u6761\u4EF6\u67E5\u8BE2\u6D4F\u89C8\u5668 profile \u5217\u8868\u3002",
    triggersEn: "list profiles, search browsers, query accounts, show all profiles",
    triggersZh: "\u5217\u8868,\u67E5\u8BE2\u73AF\u5883,\u641C\u7D22profile,\u5217\u51FA\u6240\u6709\u6D4F\u89C8\u5668"
  },
  "get-opened-browser": {
    intentEn: "List browser profiles currently open on this device.",
    intentZh: "\u67E5\u770B\u672C\u673A\u5F53\u524D\u5DF2\u6253\u5F00\u7684\u6D4F\u89C8\u5668 profile\u3002",
    triggersEn: "opened browsers, running profiles, active local sessions",
    triggersZh: "\u5DF2\u6253\u5F00,\u6B63\u5728\u8FD0\u884C,\u5F53\u524D\u4F1A\u8BDD,\u672C\u5730\u6D3B\u8DC3"
  },
  "move-browser": {
    intentEn: "Move profiles to another group (regroup).",
    intentZh: "\u5C06 profile \u79FB\u52A8\u5230\u6307\u5B9A\u5206\u7EC4\u3002",
    triggersEn: "move to group, regroup profiles, change group",
    triggersZh: "\u79FB\u52A8\u5206\u7EC4,\u6362\u7EC4,\u5F52\u7C7B\u5230\u7EC4"
  },
  "get-profile-cookies": {
    intentEn: "Read cookies for one profile.",
    intentZh: "\u8BFB\u53D6\u5355\u4E2A profile \u7684 Cookie\u3002",
    triggersEn: "get cookies, export cookies, read cookie jar",
    triggersZh: "\u5BFC\u51FACookie,\u67E5\u770BCookie,\u8BFB\u53D6\u7AD9\u70B9Cookie"
  },
  "get-profile-ua": {
    intentEn: "Get User-Agent strings for up to 10 profiles.",
    intentZh: "\u6279\u91CF\u67E5\u8BE2\u6700\u591A 10 \u4E2A profile \u7684 UA\u3002",
    triggersEn: "user agent, UA string, browser UA",
    triggersZh: "UA,\u7528\u6237\u4EE3\u7406,\u6D4F\u89C8\u5668\u6807\u8BC6"
  },
  "close-all-profiles": {
    intentEn: "Close all opened profiles on this device.",
    intentZh: "\u5173\u95ED\u672C\u673A\u6240\u6709\u5DF2\u6253\u5F00\u7684\u73AF\u5883\u3002",
    triggersEn: "close everything, stop all browsers, shutdown all profiles",
    triggersZh: "\u5168\u90E8\u5173\u95ED,\u4E00\u952E\u5173\u73AF\u5883,\u5173\u6240\u6709\u6D4F\u89C8\u5668"
  },
  "new-fingerprint": {
    intentEn: "Generate a new fingerprint for up to 10 profiles.",
    intentZh: "\u4E3A\u6700\u591A 10 \u4E2A profile \u91CD\u65B0\u751F\u6210\u6307\u7EB9\u3002",
    triggersEn: "refresh fingerprint, regenerate fp, new device identity",
    triggersZh: "\u5237\u65B0\u6307\u7EB9,\u91CD\u65B0\u6307\u7EB9,\u6362\u8BBE\u5907\u6307\u7EB9"
  },
  "delete-cache-v2": {
    intentEn: "Clear selected local cache types for profiles.",
    intentZh: "\u6309\u7C7B\u578B\u6E05\u7406 profile \u672C\u5730\u7F13\u5B58\u3002",
    triggersEn: "clear cache, wipe storage, delete history cache",
    triggersZh: "\u6E05\u7F13\u5B58,\u5220\u5386\u53F2,\u6E05\u7406\u672C\u5730\u6570\u636E"
  },
  "share-profile": {
    intentEn: "Share profiles to another AdsPower account.",
    intentZh: "\u5C06 profile \u5206\u4EAB\u7ED9\u5176\u4ED6 AdsPower \u8D26\u53F7\u3002",
    triggersEn: "share account, transfer profile, send browser to user",
    triggersZh: "\u5206\u4EAB\u73AF\u5883,\u8F6C\u8BA9profile,\u53D1\u7ED9\u540C\u4E8B"
  },
  "get-browser-active": {
    intentEn: "Get active status/details for one profile.",
    intentZh: "\u67E5\u8BE2\u5355\u4E2A profile \u7684\u6D3B\u8DC3/\u8FD0\u884C\u4FE1\u606F\u3002",
    triggersEn: "is profile running, active status, browser state",
    triggersZh: "\u662F\u5426\u5728\u7EBF,\u6D3B\u8DC3\u72B6\u6001,\u8FD0\u884C\u4FE1\u606F"
  },
  "get-cloud-active": {
    intentEn: "Query cloud-side active status for many profile IDs.",
    intentZh: "\u6309 user_ids \u6279\u91CF\u67E5\u8BE2\u4E91\u7AEF\u6D3B\u8DC3\u72B6\u6001\u3002",
    triggersEn: "cloud status, remote active, team multi device caveat",
    triggersZh: "\u4E91\u7AEF\u72B6\u6001,\u8FDC\u7A0B\u662F\u5426\u6253\u5F00,\u591A\u8BBE\u5907\u6A21\u5F0F\u9650\u5236"
  },
  "create-group": {
    intentEn: "Create a browser profile group.",
    intentZh: "\u65B0\u5EFA\u6D4F\u89C8\u5668\u5206\u7EC4\u3002",
    triggersEn: "new group, add folder for profiles",
    triggersZh: "\u65B0\u5EFA\u5206\u7EC4,\u521B\u5EFA\u7EC4,\u73AF\u5883\u5206\u7EC4"
  },
  "update-group": {
    intentEn: "Rename or update a group.",
    intentZh: "\u91CD\u547D\u540D\u6216\u66F4\u65B0\u5206\u7EC4\u4FE1\u606F\u3002",
    triggersEn: "rename group, edit group",
    triggersZh: "\u6539\u7EC4\u540D,\u66F4\u65B0\u5206\u7EC4"
  },
  "get-group-list": {
    intentEn: "List groups with optional name search.",
    intentZh: "\u5206\u9875\u67E5\u8BE2\u5206\u7EC4\u5217\u8868\uFF0C\u53EF\u6309\u540D\u79F0\u641C\u7D22\u3002",
    triggersEn: "list groups, search group name",
    triggersZh: "\u5206\u7EC4\u5217\u8868,\u67E5\u7EC4\u540D"
  },
  "check-status": {
    intentEn: "Check Local API availability on this machine.",
    intentZh: "\u68C0\u6D4B\u672C\u673A Local API \u662F\u5426\u53EF\u7528\u3002",
    triggersEn: "API health, connection status, ping AdsPower API",
    triggersZh: "\u63A5\u53E3\u901A\u4E0D\u901A,\u68C0\u6D4BAPI,\u8FDE\u63A5\u72B6\u6001"
  },
  "get-application-list": {
    intentEn: "List application/extension categories with pagination.",
    intentZh: "\u5206\u9875\u83B7\u53D6\u5E94\u7528/\u6269\u5C55\u5206\u7C7B\u5217\u8868\u3002",
    triggersEn: "categories, extension list, application catalog",
    triggersZh: "\u5E94\u7528\u5206\u7C7B,\u6269\u5C55\u76EE\u5F55,\u7C7B\u522B\u5217\u8868"
  },
  "create-proxy": {
    intentEn: "Create one or more proxy entries.",
    intentZh: "\u65B0\u5EFA\u4E00\u6761\u6216\u591A\u6761\u4EE3\u7406\u914D\u7F6E\u3002",
    triggersEn: "add proxy, new proxy row",
    triggersZh: "\u6DFB\u52A0\u4EE3\u7406,\u65B0\u5EFA\u4EE3\u7406"
  },
  "update-proxy": {
    intentEn: "Update an existing proxy entry.",
    intentZh: "\u66F4\u65B0\u5DF2\u6709\u4EE3\u7406\u9879\u3002",
    triggersEn: "edit proxy, change proxy host",
    triggersZh: "\u4FEE\u6539\u4EE3\u7406,\u66F4\u65B0\u4EE3\u7406"
  },
  "get-proxy-list": {
    intentEn: "List proxies with filters/pagination.",
    intentZh: "\u5206\u9875/\u6761\u4EF6\u67E5\u8BE2\u4EE3\u7406\u5217\u8868\u3002",
    triggersEn: "list proxies, search proxy",
    triggersZh: "\u4EE3\u7406\u5217\u8868,\u67E5\u4EE3\u7406"
  },
  "delete-proxy": {
    intentEn: "Delete proxies by id list.",
    intentZh: "\u6309 ID \u5217\u8868\u5220\u9664\u4EE3\u7406\u3002",
    triggersEn: "remove proxy, delete proxy entries",
    triggersZh: "\u5220\u9664\u4EE3\u7406,\u79FB\u9664\u4EE3\u7406"
  },
  "get-tag-list": {
    intentEn: "List browser tags.",
    intentZh: "\u67E5\u8BE2\u6D4F\u89C8\u5668\u6807\u7B7E\u5217\u8868\u3002",
    triggersEn: "list tags, label list",
    triggersZh: "\u6807\u7B7E\u5217\u8868,\u67E5\u770B\u6807\u7B7E"
  },
  "create-tag": {
    intentEn: "Create tags (batch).",
    intentZh: "\u6279\u91CF\u521B\u5EFA\u6807\u7B7E\u3002",
    triggersEn: "new tag, add label",
    triggersZh: "\u65B0\u5EFA\u6807\u7B7E,\u6DFB\u52A0\u6807\u7B7E"
  },
  "update-tag": {
    intentEn: "Update existing tags (batch).",
    intentZh: "\u6279\u91CF\u66F4\u65B0\u6807\u7B7E\u3002",
    triggersEn: "rename tag, change tag color",
    triggersZh: "\u6539\u6807\u7B7E\u540D,\u6539\u989C\u8272"
  },
  "delete-tag": {
    intentEn: "Delete tags by id list.",
    intentZh: "\u6309 ID \u5220\u9664\u6807\u7B7E\u3002",
    triggersEn: "remove tags",
    triggersZh: "\u5220\u9664\u6807\u7B7E"
  },
  "download-kernel": {
    intentEn: "Download or update a browser kernel version.",
    intentZh: "\u4E0B\u8F7D\u6216\u66F4\u65B0\u6307\u5B9A\u5185\u6838\u7248\u672C\u3002",
    triggersEn: "download chrome kernel, fetch firefox kernel",
    triggersZh: "\u4E0B\u8F7D\u5185\u6838,\u66F4\u65B0Chrome\u5185\u6838"
  },
  "get-kernel-list": {
    intentEn: "List supported kernel versions (optional type filter).",
    intentZh: "\u67E5\u8BE2\u652F\u6301\u7684\u5185\u6838\u7248\u672C\u5217\u8868\u3002",
    triggersEn: "kernel versions, supported browsers list",
    triggersZh: "\u5185\u6838\u5217\u8868,\u53EF\u7528\u7248\u672C"
  },
  "update-patch": {
    intentEn: "Update AdsPower client patch channel.",
    intentZh: "\u5C06 AdsPower \u5BA2\u6237\u7AEF\u66F4\u65B0\u5230\u8865\u4E01\u901A\u9053\u7248\u672C\u3002",
    triggersEn: "upgrade client, patch update, stable beta channel",
    triggersZh: "\u5347\u7EA7\u5BA2\u6237\u7AEF,\u8865\u4E01\u66F4\u65B0,\u7A33\u5B9A\u7248\u6D4B\u8BD5\u7248"
  },
  "connect-browser-with-ws": {
    intentEn: "Attach Playwright automation using ws from open-browser.",
    intentZh: "\u7528 open-browser \u8FD4\u56DE\u7684 ws \u8FDE\u63A5\u81EA\u52A8\u5316\uFF08Playwright\uFF09\u3002",
    triggersEn: "connect puppeteer, attach playwright, ws automation",
    triggersZh: "\u8FDE\u63A5\u81EA\u52A8\u5316,\u6302\u4E0APlaywright,\u7528ws\u63A7\u5236"
  },
  "open-new-page": {
    intentEn: "Open a new page in the connected automation session.",
    intentZh: "\u5728\u5DF2\u8FDE\u63A5\u4F1A\u8BDD\u4E2D\u6253\u5F00\u65B0\u6807\u7B7E\u9875/\u9875\u9762\u3002",
    triggersEn: "new tab, new page",
    triggersZh: "\u65B0\u6807\u7B7E\u9875,\u65B0\u9875\u9762"
  },
  "navigate": {
    intentEn: "Navigate current automation page to a URL.",
    intentZh: "\u81EA\u52A8\u5316\u5F53\u524D\u9875\u8DF3\u8F6C\u5230 URL\u3002",
    triggersEn: "goto url, open url in automation",
    triggersZh: "\u8DF3\u8F6C\u7F51\u5740,\u6253\u5F00\u94FE\u63A5"
  },
  "screenshot": {
    intentEn: "Capture screenshot of the automation page.",
    intentZh: "\u622A\u53D6\u81EA\u52A8\u5316\u5F53\u524D\u9875\u9762\u622A\u56FE\u3002",
    triggersEn: "screenshot, capture page image",
    triggersZh: "\u622A\u56FE,\u622A\u5C4F"
  },
  "get-page-visible-text": {
    intentEn: "Read visible text of the current page.",
    intentZh: "\u8BFB\u53D6\u5F53\u524D\u9875\u53EF\u89C1\u6587\u672C\u3002",
    triggersEn: "visible text, page text content",
    triggersZh: "\u53EF\u89C1\u6587\u5B57,\u9875\u9762\u6587\u672C"
  },
  "get-page-html": {
    intentEn: "Read HTML of the current page.",
    intentZh: "\u8BFB\u53D6\u5F53\u524D\u9875 HTML\u3002",
    triggersEn: "page source, dom html",
    triggersZh: "\u7F51\u9875\u6E90\u7801,HTML"
  },
  "click-element": {
    intentEn: "Click an element by selector in automation session.",
    intentZh: "\u5728\u81EA\u52A8\u5316\u4F1A\u8BDD\u4E2D\u6309\u9009\u62E9\u5668\u70B9\u51FB\u5143\u7D20\u3002",
    triggersEn: "click button, tap element",
    triggersZh: "\u70B9\u51FB\u6309\u94AE,\u70B9\u5143\u7D20"
  },
  "fill-input": {
    intentEn: "Fill an input field by selector.",
    intentZh: "\u6309\u9009\u62E9\u5668\u586B\u5199\u8F93\u5165\u6846\u3002",
    triggersEn: "type text, enter value, input field",
    triggersZh: "\u8F93\u5165\u6587\u5B57,\u586B\u8868\u5355"
  },
  "select-option": {
    intentEn: "Select a dropdown option by selector and value.",
    intentZh: "\u4E0B\u62C9\u6846\u6309 selector \u4E0E value \u9009\u62E9\u3002",
    triggersEn: "dropdown select, pick option",
    triggersZh: "\u4E0B\u62C9\u9009\u62E9,\u9009\u9009\u9879"
  },
  "hover-element": {
    intentEn: "Hover an element by selector.",
    intentZh: "\u60AC\u505C\u5230\u6307\u5B9A\u5143\u7D20\u3002",
    triggersEn: "mouse over, hover menu",
    triggersZh: "\u9F20\u6807\u60AC\u505C,\u5212\u8FC7\u83DC\u5355"
  },
  "scroll-element": {
    intentEn: "Scroll an element into view or by selector.",
    intentZh: "\u6EDA\u52A8\u6307\u5B9A\u5143\u7D20\u6216\u533A\u57DF\u3002",
    triggersEn: "scroll into view, page scroll",
    triggersZh: "\u6EDA\u52A8\u5230\u53EF\u89C1,\u9875\u9762\u6EDA\u52A8"
  },
  "press-key": {
    intentEn: "Press a keyboard key (optional focused selector).",
    intentZh: "\u6A21\u62DF\u6309\u952E\uFF08\u53EF\u9009\u9650\u5B9A\u5728\u5143\u7D20\u4E0A\uFF09\u3002",
    triggersEn: "hit Enter, keyboard shortcut",
    triggersZh: "\u6309\u56DE\u8F66,\u5FEB\u6377\u952E"
  },
  "evaluate-script": {
    intentEn: "Run JavaScript in the page context.",
    intentZh: "\u5728\u9875\u9762\u4E0A\u4E0B\u6587\u6267\u884C JS\u3002",
    triggersEn: "execute js, run script in page",
    triggersZh: "\u6267\u884C\u811A\u672C,\u9875\u9762JS"
  },
  "drag-element": {
    intentEn: "Drag an element to a target element.",
    intentZh: "\u62D6\u62FD\u5143\u7D20\u5230\u53E6\u4E00\u5143\u7D20\u3002",
    triggersEn: "drag and drop, dnd",
    triggersZh: "\u62D6\u62FD,\u62D6\u653E"
  },
  "iframe-click-element": {
    intentEn: "Click inside an iframe by iframe and inner selectors.",
    intentZh: "\u5728 iframe \u5185\u70B9\u51FB\u5B50\u5143\u7D20\u3002",
    triggersEn: "iframe click, nested frame",
    triggersZh: "\u6846\u67B6\u5185\u70B9\u51FB,iframe\u91CC\u70B9"
  }
};
function formatDescription(rec) {
  return `${rec.intentEn} / ${rec.intentZh} | Triggers: ${rec.triggersEn}; ${rec.triggersZh}`;
}
function buildMcpToolDescription(toolName, legacyFallback) {
  const rec = TOOL_INTENT_BY_NAME[toolName];
  return rec ? formatDescription(rec) : legacyFallback;
}
function buildCliCommandDescription(commandName, legacyFallback) {
  return buildMcpToolDescription(commandName, legacyFallback);
}

// ../core/src/handlers/browser.ts
var import_node_os = __toESM(require("os"));

// ../core/src/utils/requestBuilder.ts
function toContractValue(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === "object") {
    return buildNestedConfig(value);
  }
  return value;
}
function buildRequestBodyFor(command, params) {
  const requestBody = {};
  const contract = LOCAL_API_CONTRACTS[command];
  Object.entries(contract.params).forEach(([inputName, config2]) => {
    if (config2.location !== "body") {
      return;
    }
    const value = params[inputName];
    if (value !== void 0) {
      requestBody[config2.apiName] = toContractValue(value);
    }
  });
  return requestBody;
}
function buildQueryParamsFor(command, params) {
  const query = new URLSearchParams();
  const contract = LOCAL_API_CONTRACTS[command];
  Object.entries(contract.params).forEach(([inputName, config2]) => {
    if (config2.location !== "query") {
      return;
    }
    const value = params[inputName];
    if (value === void 0) {
      return;
    }
    query.set(config2.apiName, Array.isArray(value) ? value.join(",") : String(value));
  });
  return query;
}
function buildNestedConfig(config2) {
  const result = {};
  Object.entries(config2).forEach(([key, value]) => {
    if (value !== void 0) {
      if (Array.isArray(value)) {
        result[key] = value;
      } else if (typeof value === "object" && value !== null) {
        const nestedConfig = buildNestedConfig(value);
        if (Object.keys(nestedConfig).length > 0) {
          result[key] = nestedConfig;
        }
      } else {
        result[key] = value;
      }
    }
  });
  return result;
}

// ../core/src/utils/openBrowserHeadless.ts
function isTruthyCi(env) {
  const v = env.CI;
  return v === "true" || v === "1" || v === "True";
}
function linuxLooksHeadless(env) {
  const d = (env.DISPLAY ?? "").trim();
  const w = (env.WAYLAND_DISPLAY ?? "").trim();
  return d === "" && w === "";
}
function resolveOpenBrowserHeadless(params, env, platform) {
  if (params.headless !== void 0) {
    return { params: { ...params }, didAutoSetHeadless: false };
  }
  let needHeadless = false;
  if (isTruthyCi(env)) {
    needHeadless = true;
  } else if (platform === "linux" && linuxLooksHeadless(env)) {
    needHeadless = true;
  }
  if (!needHeadless) {
    return { params: { ...params }, didAutoSetHeadless: false };
  }
  return {
    params: { ...params, headless: "1" },
    didAutoSetHeadless: true
  };
}

// ../core/src/handlers/browser.ts
var browserHandlers = {
  async openBrowser(params) {
    const { params: resolvedParams, didAutoSetHeadless } = resolveOpenBrowserHeadless(
      params,
      process.env,
      import_node_os.default.platform()
    );
    const requestBody = buildRequestBodyFor("open-browser", resolvedParams);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.START_BROWSER}`, requestBody);
    if (response.data.code === 0) {
      const autoNote = didAutoSetHeadless ? "\n\u5DF2\u6839\u636E\u8FD0\u884C\u73AF\u5883\u81EA\u52A8\u4F7F\u7528 headless=1\uFF08\u65E0\u53EF\u7528\u56FE\u5F62\u4F1A\u8BDD\uFF09\u3002\nAuto-set headless=1 (no graphical session detected)." : "";
      return `Browser opened successfully with: ${Object.entries(response.data.data).map(([key, value]) => {
        if (value && typeof value === "object") {
          return Object.entries(value).map(([key2, value2]) => `ws.${key2}: ${value2}`).join("\n");
        }
        return `${key}: ${value}`;
      }).join("\n")}${autoNote}`;
    }
    throw new Error(`Failed to open browser: ${response.data.msg}`);
  },
  async closeBrowser(params) {
    const requestBody = buildRequestBodyFor("close-browser", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CLOSE_BROWSER}`, requestBody);
    if (response.data.code === 0) {
      return "Browser closed successfully";
    }
    throw new Error(`Failed to close browser: ${response.data.msg}`);
  },
  async createBrowser(params) {
    const requestBody = buildRequestBodyFor("create-browser", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CREATE_BROWSER}`, requestBody);
    if (response.data.code === 0) {
      return `Browser created successfully with: ${Object.entries(response.data.data).map(([key, value]) => `${key}: ${value}`).join("\n")}`;
    }
    throw new Error(`Failed to create browser: ${response.data.msg}`);
  },
  async updateBrowser(params) {
    const requestBody = buildRequestBodyFor("update-browser", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_BROWSER}`, requestBody);
    if (response.data.code === 0) {
      return `Browser updated successfully with: ${Object.entries(response.data.data || {}).map(([key, value]) => `${key}: ${value}`).join("\n")}`;
    }
    throw new Error(`Failed to update browser: ${response.data.msg}`);
  },
  async deleteBrowser(params) {
    const response = await getApiClient().post(
      `${getLocalApiBase()}${API_ENDPOINTS.DELETE_BROWSER}`,
      buildRequestBodyFor("delete-browser", params)
    );
    if (response.data.code === 0) {
      return `Browsers deleted successfully: ${params.profile_id.join(", ")}`;
    }
    throw new Error(`Failed to delete browsers: ${response.data.msg}`);
  },
  async getBrowserList(params) {
    const requestBody = buildRequestBodyFor("get-browser-list", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.GET_BROWSER_LIST}`, requestBody);
    if (response.data.code === 0) {
      return `Browser list: ${JSON.stringify(response.data.data.list, null, 2)}`;
    }
    throw new Error(`Failed to get browser list: ${response.data.msg}`);
  },
  async getOpenedBrowser() {
    const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_OPENED_BROWSER}`);
    if (response.data.code === 0) {
      return `Opened browser list: ${JSON.stringify(response.data.data.list, null, 2)}`;
    }
    throw new Error(`Failed to get opened browsers: ${response.data.msg}`);
  },
  async moveBrowser(params) {
    const requestBody = buildRequestBodyFor("move-browser", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.MOVE_BROWSER}`, requestBody);
    const { group_id, user_ids } = params;
    if (response.data.code === 0) {
      return `Browsers moved successfully to group ${group_id}: ${user_ids.join(", ")}`;
    }
    throw new Error(`Failed to move browsers: ${response.data.msg}`);
  },
  async getProfileCookies(params) {
    const query = buildQueryParamsFor("get-profile-cookies", params);
    const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_PROFILE_COOKIES}`, { params: query });
    if (response.data.code === 0) {
      return `Profile cookies: ${JSON.stringify(response.data.data, null, 2)}`;
    }
    throw new Error(`Failed to get profile cookies: ${response.data.msg}`);
  },
  async getProfileUa(params) {
    const requestBody = buildRequestBodyFor("get-profile-ua", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.GET_PROFILE_UA}`, requestBody);
    if (response.data.code === 0) {
      return `Profile User-Agent: ${JSON.stringify(response.data.data, null, 2)}`;
    }
    throw new Error(`Failed to get profile User-Agent: ${response.data.msg}`);
  },
  async closeAllProfiles(_params) {
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CLOSE_ALL_PROFILES}`, {});
    if (response.data.code === 0) {
      return "All profiles closed successfully";
    }
    throw new Error(`Failed to close all profiles: ${response.data.msg}`);
  },
  async newFingerprint(params) {
    const requestBody = buildRequestBodyFor("new-fingerprint", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.NEW_FINGERPRINT}`, requestBody);
    if (response.data.code === 0) {
      return `New fingerprint created: ${JSON.stringify(response.data.data, null, 2)}`;
    }
    throw new Error(`Failed to create new fingerprint: ${response.data.msg}`);
  },
  async deleteCacheV2(params) {
    const response = await getApiClient().post(
      `${getLocalApiBase()}${API_ENDPOINTS.DELETE_CACHE_V2}`,
      buildRequestBodyFor("delete-cache-v2", params)
    );
    if (response.data.code === 0) {
      return `Cache deleted successfully for profiles: ${params.profile_id.join(", ")}`;
    }
    throw new Error(`Failed to delete cache: ${response.data.msg}`);
  },
  async shareProfile(params) {
    const requestBody = buildRequestBodyFor("share-profile", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.SHARE_PROFILE}`, requestBody);
    if (response.data.code === 0) {
      return `Profiles shared successfully: ${params.profile_id.join(", ")}`;
    }
    throw new Error(`Failed to share profiles: ${response.data.msg}`);
  },
  async getBrowserActive(params) {
    const query = buildQueryParamsFor("get-browser-active", params);
    const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_BROWSER_ACTIVE}`, { params: query });
    if (response.data.code === 0) {
      return `Browser active info: ${JSON.stringify(response.data.data, null, 2)}`;
    }
    throw new Error(`Failed to get browser active: ${response.data.msg}`);
  },
  async getCloudActive(params) {
    const requestBody = buildRequestBodyFor("get-cloud-active", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.GET_CLOUD_ACTIVE}`, requestBody);
    if (response.data.code === 0) {
      return `Cloud active browsers: ${JSON.stringify(response.data.data, null, 2)}`;
    }
    throw new Error(`Failed to get cloud active browsers: ${response.data.msg}`);
  }
};

// ../core/src/handlers/group.ts
var groupHandlers = {
  async createGroup(params) {
    const requestBody = buildRequestBodyFor("create-group", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CREATE_GROUP}`, requestBody);
    const { group_name, remark } = params;
    if (response.data.code === 0) {
      return `Group created successfully with name: ${group_name}${remark ? `, remark: ${remark}` : ""}`;
    }
    throw new Error(`Failed to create group: ${response.data.msg}`);
  },
  async updateGroup(params) {
    const requestBody = buildRequestBodyFor("update-group", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_GROUP}`, requestBody);
    const { group_id, group_name, remark } = params;
    if (response.data.code === 0) {
      return `Group updated successfully with id: ${group_id}, name: ${group_name}${remark !== void 0 ? `, remark: ${remark === null ? "(cleared)" : remark}` : ""}`;
    }
    throw new Error(`Failed to update group: ${response.data.msg}`);
  },
  async getGroupList(params) {
    const query = buildQueryParamsFor("get-group-list", params);
    const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_GROUP_LIST}`, { params: query });
    if (response.data.code === 0) {
      return `Group list: ${JSON.stringify(response.data.data.list, null, 2)}`;
    }
    throw new Error(`Failed to get group list: ${response.data.msg}`);
  }
};

// ../core/src/handlers/application.ts
var applicationHandlers = {
  async checkStatus() {
    const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.STATUS}`);
    return `Connection status: ${JSON.stringify(response.data, null, 2)}`;
  },
  async getApplicationList(params) {
    const query = buildQueryParamsFor("get-application-list", params);
    const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_APPLICATION_LIST}`, { params: query });
    return `Application list: ${JSON.stringify(response.data.data.list, null, 2)}`;
  }
};

// ../core/src/handlers/proxy.ts
function buildCreateProxyRequestBody(proxy) {
  const requestBody = {};
  requestBody.type = proxy.type;
  requestBody.host = proxy.host;
  requestBody.port = proxy.port;
  if (proxy.user !== void 0) {
    requestBody.user = proxy.user;
  }
  if (proxy.password !== void 0) {
    requestBody.password = proxy.password;
  }
  if (proxy.proxy_url !== void 0) {
    requestBody.proxy_url = proxy.proxy_url;
  }
  if (proxy.remark !== void 0) {
    requestBody.remark = proxy.remark;
  }
  if (proxy.ipchecker !== void 0) {
    requestBody.ipchecker = proxy.ipchecker;
  }
  return requestBody;
}
var proxyHandlers = {
  async createProxy(params) {
    const requestBody = params.map((proxy) => buildCreateProxyRequestBody(proxy));
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CREATE_PROXY}`, requestBody);
    if (response.data.code === 0) {
      return `Proxy created successfully with: ${Object.entries(response.data.data || {}).map(([key, value]) => `${key}: ${value}`).join("\n")}`;
    }
    throw new Error(`Failed to create proxy: ${response.data.msg}`);
  },
  async updateProxy(params) {
    const requestBody = buildRequestBodyFor("update-proxy", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_PROXY}`, requestBody);
    if (response.data.code === 0) {
      return `Proxy updated successfully with: ${Object.entries(response.data.data || {}).map(([key, value]) => `${key}: ${value}`).join("\n")}`;
    }
    throw new Error(`Failed to update proxy: ${response.data.msg}`);
  },
  async getProxyList(params) {
    const requestBody = buildRequestBodyFor("get-proxy-list", params);
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.GET_PROXY_LIST}`, requestBody);
    if (response.data.code === 0) {
      return `Proxy list: ${JSON.stringify(response.data.data.list || response.data.data, null, 2)}`;
    }
    throw new Error(`Failed to get proxy list: ${response.data.msg}`);
  },
  async deleteProxy(params) {
    const response = await getApiClient().post(
      `${getLocalApiBase()}${API_ENDPOINTS.DELETE_PROXY}`,
      buildRequestBodyFor("delete-proxy", params)
    );
    const { proxy_id } = params;
    if (response.data.code === 0) {
      return `Proxies deleted successfully: ${proxy_id.join(", ")}`;
    }
    throw new Error(`Failed to delete proxies: ${response.data.msg}`);
  }
};

// ../core/src/handlers/tag.ts
var tagHandlers = {
  async getTagList(params) {
    const { ids, limit, page } = params;
    const requestBody = {};
    if (ids && ids.length > 0) {
      requestBody.ids = ids;
    }
    if (limit !== void 0) {
      requestBody.limit = limit;
    }
    if (page !== void 0) {
      requestBody.page = page;
    }
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.GET_TAG_LIST}`, requestBody);
    if (response.data.code === 0) {
      return `Tag list: ${JSON.stringify(response.data.data.list || response.data.data, null, 2)}`;
    }
    throw new Error(`Failed to get tag list: ${response.data.msg}`);
  },
  async createTag({ tags }) {
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CREATE_TAG}`, { tags });
    if (response.data.code === 0) {
      return `Tags created successfully: ${JSON.stringify(response.data.data, null, 2)}`;
    }
    throw new Error(`Failed to create tags: ${response.data.msg}`);
  },
  async updateTag({ tags }) {
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_TAG}`, { tags });
    if (response.data.code === 0) {
      return `Tags updated successfully: ${JSON.stringify(response.data.data, null, 2)}`;
    }
    throw new Error(`Failed to update tags: ${response.data.msg}`);
  },
  async deleteTag({ ids }) {
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.DELETE_TAG}`, { ids });
    if (response.data.code === 0) {
      return `Tags deleted successfully: ${ids.join(", ")}`;
    }
    throw new Error(`Failed to delete tags: ${response.data.msg}`);
  }
};

// ../core/src/handlers/automation.ts
var import_path = __toESM(require("path"));
var import_os = __toESM(require("os"));

// ../core/src/utils/browserBase.ts
var import_playwright_core = require("playwright-core");
var BrowserBase = class {
  browser;
  page;
  screenshots;
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshots = /* @__PURE__ */ new Map();
  }
  get browserInstance() {
    return this.browser;
  }
  get pageInstance() {
    return this.page;
  }
  set pageInstance(page) {
    this.page = page;
  }
  get screenshotsInstance() {
    return this.screenshots;
  }
  checkConnected() {
    const error = new Error("Browser not connected, please connect browser first");
    if (!this.browser) {
      throw error;
    }
    if (!this.browser.isConnected()) {
      throw error;
    }
    if (!this.page) {
      throw error;
    }
  }
  async connectBrowserWithWs(wsUrl) {
    this.browser = await import_playwright_core.chromium.connectOverCDP(wsUrl);
    const defaultContext = this.browser.contexts()[0];
    this.page = defaultContext.pages()[0];
    await this.page.bringToFront().catch((error) => {
      console.error("Failed to bring page to front", error);
    });
  }
  async resetBrowser() {
    this.browser = null;
    this.page = null;
  }
};
var browserBase_default = new BrowserBase();

// ../core/src/handlers/automation.ts
var defaultDownloadsPath = import_path.default.join(import_os.default.homedir(), "Downloads");

// ../core/src/handlers/kernel.ts
var kernelHandlers = {
  async downloadKernel({ kernel_type, kernel_version }) {
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.DOWNLOAD_KERNEL}`, {
      kernel_type,
      kernel_version
    });
    if (response.data.code === 0) {
      return `Kernel download/update status: ${JSON.stringify(response.data.data, null, 2)}`;
    }
    throw new Error(`Failed to download/update kernel: ${response.data.msg}`);
  },
  async getKernelList({ kernel_type }) {
    const params = new URLSearchParams();
    if (kernel_type) {
      params.set("kernel_type", kernel_type);
    }
    const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_KERNEL_LIST}`, { params });
    if (response.data.code === 0) {
      return `Kernel list: ${JSON.stringify(response.data.data.list || response.data.data, null, 2)}`;
    }
    throw new Error(`Failed to get kernel list: ${response.data.msg}`);
  }
};

// ../core/src/handlers/patch.ts
var patchHandlers = {
  async updatePatch({ version_type }) {
    const requestBody = {};
    if (version_type) {
      requestBody.version_type = version_type;
    }
    const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_PATCH}`, requestBody);
    if (response.data.code === 0) {
      return `Patch update status: ${JSON.stringify(response.data.data, null, 2)}, message: ${response.data.msg}`;
    }
    throw new Error(`Failed to update patch: ${response.data.msg}`);
  }
};

// ../core/src/types/schemas.ts
var import_zod = require("zod");
var userProxyConfigSchema = import_zod.z.object({
  proxy_soft: import_zod.z.enum([
    "brightdata",
    "brightauto",
    "oxylabsauto",
    "922S5auto",
    "ipideeauto",
    "ipfoxyauto",
    "922S5auth",
    "kookauto",
    "ssh",
    "other",
    "no_proxy"
  ]).describe("The proxy soft of the browser"),
  proxy_type: import_zod.z.enum(["http", "https", "socks5", "no_proxy"]).optional(),
  proxy_host: import_zod.z.string().optional().describe("The proxy host of the browser, eg: 127.0.0.1"),
  proxy_port: import_zod.z.string().optional().describe("The proxy port of the browser, eg: 8080"),
  proxy_user: import_zod.z.string().optional().describe("The proxy user of the browser, eg: user"),
  proxy_password: import_zod.z.string().optional().describe("The proxy password of the browser, eg: password"),
  proxy_url: import_zod.z.string().optional().describe("The proxy url of the browser, eg: http://127.0.0.1:8080"),
  global_config: import_zod.z.enum(["0", "1"]).optional().describe("The global config of the browser, default is 0")
}).describe("The user proxy config of the browser");
var CHROME_VERSIONS = [
  "92",
  "99",
  "102",
  "105",
  "108",
  "111",
  "114",
  "115",
  "116",
  "117",
  "118",
  "119",
  "120",
  "121",
  "122",
  "123",
  "124",
  "125",
  "126",
  "127",
  "128",
  "129",
  "130",
  "131",
  "132",
  "133",
  "134",
  "135",
  "136",
  "137",
  "138",
  "139",
  "140",
  "141",
  "142",
  "143",
  "144",
  "ua_auto",
  "latest"
];
var FIREFOX_VERSIONS = ["100", "107", "114", "120", "123", "126", "129", "132", "135", "138", "141", "144", "ua_auto", "latest"];
var ALL_KERNEL_VERSIONS = [.../* @__PURE__ */ new Set([...CHROME_VERSIONS, ...FIREFOX_VERSIONS])];
var browserKernelConfigSchema = import_zod.z.object({
  version: import_zod.z.union(
    ALL_KERNEL_VERSIONS.map((v) => import_zod.z.literal(v))
  ).optional().describe("The version of the browser, must match type: chrome 92\u2013143 or ua_auto, firefox 100,107,114,120,123,126,129,132,135,138,141,144 or ua_auto; default is ua_auto"),
  type: import_zod.z.enum(["chrome", "firefox"]).optional().describe("The type of the browser, default is chrome")
}).optional().superRefine((data, ctx) => {
  if (!data) return;
  const type = data.type ?? "chrome";
  const version = data.version;
  if (version === void 0) return;
  const validForChrome = CHROME_VERSIONS.includes(version);
  const validForFirefox = FIREFOX_VERSIONS.includes(version);
  if (type === "chrome" && !validForChrome) {
    ctx.addIssue({ code: import_zod.z.ZodIssueCode.custom, message: `Chrome does not support version "${version}". Supported: ${CHROME_VERSIONS.join(", ")}` });
  }
  if (type === "firefox" && !validForFirefox) {
    ctx.addIssue({ code: import_zod.z.ZodIssueCode.custom, message: `Firefox does not support version "${version}". Supported: ${FIREFOX_VERSIONS.join(", ")}` });
  }
}).describe("The browser kernel config of the browser, default is version: ua_auto, type: chrome");
var randomUaConfigSchema = import_zod.z.object({
  ua_version: import_zod.z.array(import_zod.z.string()).optional(),
  ua_system_version: import_zod.z.array(
    import_zod.z.enum([
      "Android 9",
      "Android 10",
      "Android 11",
      "Android 12",
      "Android 13",
      "Android 14",
      "Android 15",
      "iOS 14",
      "iOS 15",
      "iOS 16",
      "iOS 17",
      "iOS 18",
      "Windows 7",
      "Windows 8",
      "Windows 10",
      "Windows 11",
      "Mac OS X 10",
      "Mac OS X 11",
      "Mac OS X 12",
      "Mac OS X 13",
      "Mac OS X 14",
      "Mac OS X 15",
      "Mac OS X",
      "Windows",
      "iOS",
      "Android",
      "Linux"
    ])
  ).optional().describe(
    'UA system version. Mac OS X / Windows / iOS / Android / Linux = random any version of that system; omit to random across all systems. e.g. ["Android 9", "iOS 14"] or ["Android", "Mac OS X"]'
  )
}).optional().describe("Random UA config (ua_version, ua_system_version). Ignored when fingerprint ua (custom UA) is set.");
var TLS_CIPHER_SUITES = {
  TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384: "0xC02C",
  TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384: "0xC030",
  TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256: "0xC02B",
  TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256: "0xC02F",
  TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256: "0xCCA9",
  TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256: "0xCCA8",
  TLS_DHE_RSA_WITH_AES_256_GCM_SHA384: "0x009F",
  TLS_DHE_RSA_WITH_AES_128_GCM_SHA256: "0x009E",
  TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384: "0xC024",
  TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384: "0xC028",
  TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA: "0xC00A",
  TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA: "0xC014",
  TLS_DHE_RSA_WITH_AES_256_CBC_SHA256: "0x006B",
  TLS_DHE_RSA_WITH_AES_256_CBC_SHA: "0x0039",
  TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256: "0xC023",
  TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256: "0xC027",
  TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA: "0xC009",
  TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA: "0xC013",
  TLS_DHE_RSA_WITH_AES_128_CBC_SHA256: "0x0067",
  TLS_DHE_RSA_WITH_AES_128_CBC_SHA: "0x0033",
  TLS_RSA_WITH_AES_256_GCM_SHA384: "0x009D",
  TLS_RSA_WITH_AES_128_GCM_SHA256: "0x009C",
  TLS_RSA_WITH_AES_256_CBC_SHA256: "0x003D",
  TLS_RSA_WITH_AES_128_CBC_SHA256: "0x003C",
  TLS_RSA_WITH_AES_256_CBC_SHA: "0x0035",
  TLS_RSA_WITH_AES_128_CBC_SHA: "0x002F",
  TLS_AES_128_CCM_8_SHA256: "0x1305",
  TLS_AES_128_CCM_SHA256: "0x1304"
};
var TLS_HEX_CODES = Object.values(TLS_CIPHER_SUITES);
var COUNTRY_CODES = [
  "ad",
  "ae",
  "af",
  "ag",
  "ai",
  "al",
  "am",
  "ao",
  "aq",
  "ar",
  "as",
  "at",
  "au",
  "aw",
  "ax",
  "az",
  "ba",
  "bb",
  "bd",
  "be",
  "bf",
  "bg",
  "bh",
  "bi",
  "bj",
  "bl",
  "bm",
  "bn",
  "bo",
  "bq",
  "br",
  "bs",
  "bt",
  "bv",
  "bw",
  "by",
  "bz",
  "ca",
  "cc",
  "cd",
  "cf",
  "cg",
  "ch",
  "ci",
  "ck",
  "cl",
  "cm",
  "cn",
  "co",
  "cr",
  "cu",
  "cv",
  "cx",
  "cy",
  "cz",
  "de",
  "dj",
  "dk",
  "dm",
  "do",
  "dz",
  "ec",
  "ee",
  "eg",
  "eh",
  "er",
  "es",
  "et",
  "fi",
  "fj",
  "fk",
  "fm",
  "fo",
  "fr",
  "ga",
  "gb",
  "gd",
  "ge",
  "gf",
  "gg",
  "gh",
  "gi",
  "gl",
  "gm",
  "gn",
  "gp",
  "gq",
  "gr",
  "gs",
  "gt",
  "gu",
  "gw",
  "gy",
  "hk",
  "hm",
  "hn",
  "hr",
  "ht",
  "hu",
  "id",
  "ie",
  "il",
  "im",
  "in",
  "io",
  "iq",
  "ir",
  "is",
  "it",
  "je",
  "jm",
  "jo",
  "jp",
  "ke",
  "kg",
  "kh",
  "ki",
  "km",
  "kn",
  "kp",
  "kr",
  "kw",
  "ky",
  "kz",
  "la",
  "lb",
  "lc",
  "li",
  "lk",
  "lr",
  "ls",
  "lt",
  "lu",
  "lv",
  "ly",
  "ma",
  "mc",
  "md",
  "me",
  "mf",
  "mg",
  "mh",
  "mk",
  "ml",
  "mm",
  "mn",
  "mo",
  "mp",
  "mq",
  "mr",
  "ms",
  "mt",
  "mu",
  "mv",
  "mw",
  "mx",
  "my",
  "mz",
  "na",
  "nc",
  "ne",
  "nf",
  "ng",
  "ni",
  "nl",
  "no",
  "np",
  "nr",
  "nu",
  "nz",
  "om",
  "pa",
  "pe",
  "pf",
  "pg",
  "ph",
  "pk",
  "pl",
  "pm",
  "pn",
  "pr",
  "ps",
  "pt",
  "pw",
  "py",
  "qa",
  "re",
  "ro",
  "rs",
  "ru",
  "rw",
  "sa",
  "sb",
  "sc",
  "sd",
  "se",
  "sg",
  "sh",
  "si",
  "sj",
  "sk",
  "sl",
  "sm",
  "sn",
  "so",
  "sr",
  "ss",
  "st",
  "sv",
  "sy",
  "sz",
  "tc",
  "td",
  "tf",
  "tg",
  "th",
  "tj",
  "tk",
  "tl",
  "tm",
  "tn",
  "to",
  "tr",
  "tt",
  "tv",
  "tw",
  "tz",
  "ua",
  "ug",
  "um",
  "us",
  "uy",
  "uz",
  "va",
  "vc",
  "ve",
  "vg",
  "vi",
  "vn",
  "vu",
  "wf",
  "ws",
  "ye",
  "yt",
  "za",
  "zm",
  "zw"
];
var countryCodeSchema = import_zod.z.enum(COUNTRY_CODES);
var webglConfigSchema = import_zod.z.object({
  unmasked_vendor: import_zod.z.string().describe('WebGL vendor string, e.g. "Google Inc.". Required when webgl=2, cannot be empty.'),
  unmasked_renderer: import_zod.z.string().describe('WebGL renderer string, e.g. "ANGLE (Intel(R) HD Graphics 620 Direct3D11 vs_5_0 ps_5_0)". Required when webgl=2, cannot be empty.'),
  webgpu: import_zod.z.object({
    webgpu_switch: import_zod.z.enum(["0", "1", "2"]).describe("0: Disabled, 1: WebGL based matching, 2: Real")
  }).optional().describe("WebGPU setting (V2.6.8.1+)")
}).describe("Custom WebGL metadata when webgl=2. See AdsPower fingerprint_config webgl_config.");
var macAddressConfigSchema = import_zod.z.object({
  model: import_zod.z.enum(["0", "1", "2"]).describe("0: use current computer MAC, 1: match appropriate value, 2: custom (address required)"),
  address: import_zod.z.string().optional().describe('Custom MAC address when model=2, e.g. "E4-02-9B-3B-E9-27"')
}).describe("MAC address: model 0/1/2, address when model=2.");
var DEVICE_COUNT_VALUES = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
var mediaDevicesNumSchema = import_zod.z.object({
  audioinput_num: import_zod.z.enum(DEVICE_COUNT_VALUES).describe("Number of microphones, 1-9"),
  videoinput_num: import_zod.z.enum(DEVICE_COUNT_VALUES).describe("Number of cameras, 1-9"),
  audiooutput_num: import_zod.z.enum(DEVICE_COUNT_VALUES).describe("Number of speakers, 1-9")
}).describe("Device counts when media_devices=2: audioinput_num, videoinput_num, audiooutput_num each 1-9.");
var platformAccountSchema = import_zod.z.object({
  account: import_zod.z.string().min(1).describe("Platform account identifier, e.g. shop username or login email"),
  password: import_zod.z.string().min(1).optional().describe("Optional platform account password")
}).strict().optional().describe("Structured platform account metadata keyed by Postman field name platform_account.");
var nonEmptyStringArraySchema = import_zod.z.array(import_zod.z.string()).nonempty();
var fingerprintConfigSchema = import_zod.z.object({
  automatic_timezone: import_zod.z.enum(["0", "1"]).optional().describe("Auto timezone by IP: 0 custom, 1 (default) by IP"),
  timezone: import_zod.z.string().optional().describe("Timezone when automatic_timezone=0, e.g. Asia/Shanghai"),
  location_switch: import_zod.z.enum(["0", "1"]).optional().describe("Location by IP: 0 custom, 1 (default) by IP"),
  longitude: import_zod.z.number().min(-180).max(180).optional().describe("Custom longitude when location_switch=0, -180 to 180, up to 6 decimals"),
  latitude: import_zod.z.number().min(-90).max(90).optional().describe("Custom latitude when location_switch=0, -90 to 90, up to 6 decimals"),
  accuracy: import_zod.z.number().int().min(10).max(5e3).optional().describe("Location accuracy in meters when location_switch=0, 10-5000, default 1000"),
  location: import_zod.z.enum(["ask", "allow", "block"]).optional().describe("Site location permission: ask (default), allow, block"),
  language_switch: import_zod.z.enum(["0", "1"]).optional().describe("Language by IP country: 0 custom, 1 (default) by IP"),
  language: import_zod.z.array(import_zod.z.string()).optional().describe('Custom languages when language_switch=0, e.g. ["en-US", "zh-CN"]'),
  page_language_switch: import_zod.z.enum(["0", "1"]).optional().describe("Match UI language to language: 0 off, 1 (default) on; Chrome 109+ Win / 119+ macOS, v2.6.72+"),
  page_language: import_zod.z.string().optional().describe("Page language when page_language_switch=0, e.g. en-US"),
  ua: import_zod.z.string().optional().describe("Custom User-Agent string; when set, takes precedence over random_ua (random_ua is not sent). Omit for random UA."),
  screen_resolution: import_zod.z.union([
    import_zod.z.enum(["none", "random"]),
    import_zod.z.string().regex(/^\d+_\d+$/, "Custom resolution format: width_height e.g. 1024_600")
  ]).optional().describe("Screen resolution: none (default), random, or width_height e.g. 1024_600"),
  fonts: import_zod.z.array(import_zod.z.string()).optional().describe('Font list e.g. ["Arial", "Times New Roman"] or ["all"]'),
  canvas: import_zod.z.enum(["0", "1"]).optional().describe("Canvas fingerprint: 0 computer default, 1 (default) add noise"),
  webgl: import_zod.z.enum(["0", "2", "3"]).optional().describe("WebGL metadata: 0 computer default, 2 custom (use webgl_config), 3 random"),
  webgl_image: import_zod.z.enum(["0", "1"]).optional().describe("WebGL image fingerprint: 0 default, 1 (default) add noise"),
  webgl_config: webglConfigSchema.optional().describe("Custom WebGL metadata when webgl=2. Must include unmasked_vendor and unmasked_renderer (non-empty). webgpu.webgpu_switch: 0 Disabled, 1 WebGL based, 2 Real. V2.6.8.1+"),
  flash: import_zod.z.enum(["block", "allow"]).optional().describe("Flash: block (default) or allow"),
  webrtc: import_zod.z.enum(["disabled", "forward", "proxy", "local"]).optional().describe("WebRTC: disabled (default), forward, proxy, local"),
  audio: import_zod.z.enum(["0", "1"]).optional().describe("Audio fingerprint: 0 close, 1 (default) add noise"),
  do_not_track: import_zod.z.enum(["default", "true", "false"]).optional().describe("Do Not Track: default, true (open), false (close)"),
  hardware_concurrency: import_zod.z.enum(["2", "4", "6", "8", "16"]).optional().describe("CPU cores: 2, 4 (default if omitted), 6, 8, 16; omit to follow current computer"),
  device_memory: import_zod.z.enum(["2", "4", "6", "8"]).optional().describe("Device memory (GB): 2, 4, 6, 8 (default if omitted); omit to follow current computer"),
  scan_port_type: import_zod.z.enum(["0", "1"]).optional().describe("Port scan protection: 0 close, 1 (default) enable"),
  allow_scan_ports: import_zod.z.array(import_zod.z.string()).optional().describe('Ports allowed when scan_port_type=1, e.g. ["4000","4001"]. Empty to not pass.'),
  media_devices: import_zod.z.enum(["0", "1", "2"]).optional().describe("Media devices: 0 off (use computer default), 1 noise (count follows local), 2 noise (use media_devices_num). V2.6.4.2+"),
  media_devices_num: mediaDevicesNumSchema.optional().describe("When media_devices=2: audioinput_num, videoinput_num, audiooutput_num each 1-9. V2.6.4.2+"),
  client_rects: import_zod.z.enum(["0", "1"]).optional().describe("ClientRects: 0 use computer default, 1 add noise. V3.6.2+"),
  device_name_switch: import_zod.z.enum(["0", "1", "2"]).optional().describe("Device name: 0 close (use computer name), 1 mask, 2 custom (use device_name). V3.6.25+"),
  device_name: import_zod.z.string().optional().describe("Custom device name when device_name_switch=2. V2.4.8.1+"),
  speech_switch: import_zod.z.enum(["0", "1"]).optional().describe("SpeechVoices: 0 use computer default, 1 replace with value. V3.11.10+"),
  mac_address_config: macAddressConfigSchema.optional().describe("MAC address: model 0/1/2, address when model=2. V4.3.9+"),
  gpu: import_zod.z.enum(["0", "1", "2"]).optional().describe("GPU: 0 follow Local settings - Hardware acceleration, 1 turn on, 2 turn off"),
  browser_kernel_config: browserKernelConfigSchema.optional(),
  random_ua: randomUaConfigSchema.optional().describe("Random UA config; ignored when ua (custom UA) is provided."),
  tls_switch: import_zod.z.enum(["0", "1"]).optional().describe("TLS custom list: 0 (default) off, 1 on"),
  tls: import_zod.z.string().optional().refine(
    (val) => !val || val.split(",").every((hex) => TLS_HEX_CODES.includes(hex.trim())),
    { message: `tls must be comma-separated hex codes from: ${TLS_HEX_CODES.join(", ")}. e.g. "0xC02C,0xC030"` }
  ).describe("TLS cipher list when tls_switch=1: comma-separated hex codes. Chrome kernel only.")
}).optional().superRefine((data, ctx) => {
  if (!data) return;
  if (data.browser_kernel_config?.type === "firefox" && data.tls) {
    ctx.addIssue({ code: import_zod.z.ZodIssueCode.custom, message: "tls is only supported for Chrome kernel", path: ["tls"] });
  }
  if (data.webgl === "2") {
    const wc = data.webgl_config;
    if (!wc || typeof wc.unmasked_vendor !== "string" || wc.unmasked_vendor.trim() === "") {
      ctx.addIssue({ code: import_zod.z.ZodIssueCode.custom, message: "When webgl=2, webgl_config.unmasked_vendor is required and cannot be empty", path: ["webgl_config", "unmasked_vendor"] });
    }
    if (!wc || typeof wc.unmasked_renderer !== "string" || wc.unmasked_renderer.trim() === "") {
      ctx.addIssue({ code: import_zod.z.ZodIssueCode.custom, message: "When webgl=2, webgl_config.unmasked_renderer is required and cannot be empty", path: ["webgl_config", "unmasked_renderer"] });
    }
  }
}).describe("Fingerprint config (fingerprint_config). All fields optional. See AdsPower Local API fingerprint_config.");
var createProxyItemSchema = import_zod.z.object({
  type: import_zod.z.enum(["http", "https", "ssh", "socks5"]).describe("Proxy type, support: http/https/ssh/socks5"),
  host: import_zod.z.string().describe("Proxy host, support: ipV4, ipV6, eg: 192.168.0.1"),
  port: import_zod.z.string().describe("Port, range: 0-65536, eg: 8000"),
  user: import_zod.z.string().optional().describe("Proxy username, eg: user12345678"),
  password: import_zod.z.string().optional().describe("Proxy password, eg: password"),
  proxy_url: import_zod.z.string().optional().describe("URL used to refresh the proxy, eg: https://www.baidu.com/"),
  remark: import_zod.z.string().optional().describe("Remark/description for the proxy"),
  ipchecker: import_zod.z.enum(["ipinfo", "ip2location", "ipapi", "ipfoxy"]).optional().describe("IP checker.")
}).strict();
var schemas = {
  createBrowserSchema: import_zod.z.object({
    group_id: import_zod.z.string().regex(/^\d+$/, "Group ID must be a numeric string").describe('The group id of the browser, must be a numeric string (e.g., "123"). You can use the get-group-list tool to get the group list or create a new group, use 0 for Ungrouped'),
    username: import_zod.z.string().optional().describe("Platform account username"),
    password: import_zod.z.string().optional().describe("Platform account password"),
    cookie: import_zod.z.string().optional().describe("Cookie data in JSON or Netscape format"),
    fakey: import_zod.z.string().optional().describe("2FA key for online 2FA code generators"),
    name: import_zod.z.string().max(100).optional().describe("Account name, max 100 characters"),
    platform: import_zod.z.string().optional().describe("Platform domain, eg: facebook.com"),
    remark: import_zod.z.string().optional().describe("Remarks to describe the account. Maximum 1500 characters."),
    user_proxy_config: userProxyConfigSchema.default({ proxy_soft: "no_proxy" }).describe("Proxy configuration. If proxyid is provided, proxyid takes priority and this field is ignored. Defaults to no_proxy when neither proxyid nor a custom proxy is needed."),
    proxyid: import_zod.z.string().optional().describe("Proxy profile ID. Takes priority over userProxyConfig when provided."),
    repeat_config: import_zod.z.array(import_zod.z.union([import_zod.z.literal(0), import_zod.z.literal(2), import_zod.z.literal(3), import_zod.z.literal(4)])).optional().describe("Account deduplication settings (0, 2, 3, or 4)"),
    ignore_cookie_error: import_zod.z.enum(["0", "1"]).optional().describe("Handle cookie verification failures: 0 (default) return data as-is, 1 filter out incorrectly formatted cookies"),
    tabs: import_zod.z.array(import_zod.z.string()).optional().describe('URLs to open on startup, eg: ["https://www.google.com"]'),
    ip: import_zod.z.string().optional().describe("IP address"),
    country: countryCodeSchema.optional().describe('Country/Region, ISO 3166-1 alpha-2 (lowercase). eg: "cn", "us"'),
    region: import_zod.z.string().optional().describe("Region"),
    city: import_zod.z.string().optional().describe("City"),
    ipchecker: import_zod.z.enum(["ipinfo", "ip2location", "ipapi", "ipfoxy"]).optional().describe("IP query channel"),
    category_id: import_zod.z.string().optional().describe("The category id of the browser, you can use the get-application-list tool to get the application list"),
    profile_tag_ids: import_zod.z.array(import_zod.z.string()).max(30).optional().describe('Tag IDs to assign to the profile, max 30 tags per profile. Example: ["tag1","tag2"]'),
    fingerprint_config: fingerprintConfigSchema.optional().default({ random_ua: { ua_system_version: ["Windows"] } }),
    platform_account: platformAccountSchema
  }).strict(),
  updateBrowserSchema: import_zod.z.object({
    platform: import_zod.z.string().optional().describe("The platform of the browser, eg: facebook.com"),
    tabs: import_zod.z.array(import_zod.z.string()).optional().describe('The tabs of the browser, eg: ["https://www.google.com"]'),
    cookie: import_zod.z.string().optional().describe("The cookie of the browser"),
    username: import_zod.z.string().optional().describe('The username of the browser, eg: "user"'),
    password: import_zod.z.string().optional().describe('The password of the browser, eg: "password"'),
    fakey: import_zod.z.string().optional().describe("Enter the 2FA-key"),
    ignore_cookie_error: import_zod.z.enum(["0", "1"]).optional().describe("Specifies how to handle the case when cookie validation fails."),
    group_id: import_zod.z.string().optional().describe('The group id of the browser, must be a numeric string (e.g., "123"). You can use the get-group-list tool to get the group list or create a new group'),
    name: import_zod.z.string().max(100).optional().describe('The Profile name of the browser, eg: "My Browser"'),
    remark: import_zod.z.string().max(1500).optional().describe("Profile remarks, maximum 1500 characters"),
    country: countryCodeSchema.optional().describe('The country of the browser, ISO 3166-1 alpha-2 (lowercase). eg: "cn", "us"'),
    region: import_zod.z.string().optional().describe("The region of the browser"),
    city: import_zod.z.string().optional().describe("The city of the browser"),
    ipchecker: import_zod.z.enum(["ipinfo", "ip2location", "ipapi", "ipfoxy"]).optional().describe("IP query channel"),
    ip: import_zod.z.string().optional().describe("The IP of the browser"),
    category_id: import_zod.z.string().optional().describe("The category id of the browser, you can use the get-application-list tool to get the application list"),
    user_proxy_config: userProxyConfigSchema.optional(),
    proxyid: import_zod.z.string().optional().describe("Proxy ID"),
    fingerprint_config: fingerprintConfigSchema.optional(),
    launch_args: import_zod.z.string().optional().describe("Browser startup parameters"),
    profile_tag_ids: import_zod.z.array(import_zod.z.string()).max(30).optional().describe('Tag IDs to set on the profile, max 30 tags per profile. Example: ["tag1","tag2"]'),
    tags_update_type: import_zod.z.enum(["1", "2"]).optional().describe('How to apply profile_tag_ids: "1" (default) replace all existing tags; "2" append tags (truncated to 30 total if exceeded)'),
    profile_id: import_zod.z.string().describe("The profile id of the browser to update, it is required when you want to update the browser"),
    platform_account: platformAccountSchema
  }).strict(),
  openBrowserSchema: import_zod.z.object({
    profile_no: import_zod.z.string().optional().describe(
      "Profile serial number (environment number). \u73AF\u5883\u5E8F\u53F7/\u7F16\u53F7\u3002At least one of profile_id or profile_no is required; if both are provided, profile_id takes priority (AdsPower API). profile_id \u4E0E profile_no \u81F3\u5C11\u586B\u5176\u4E00\uFF1B\u540C\u65F6\u586B\u5199\u65F6 profile_id \u4F18\u5148\uFF08\u4E0E AdsPower API \u4E00\u81F4\uFF09\u3002"
    ),
    profile_id: import_zod.z.string().optional().describe(
      "Unique profile ID generated after creating a profile; identifies which browser to open. \u521B\u5EFA\u73AF\u5883\u540E\u751F\u6210\u7684\u552F\u4E00 profile ID\uFF0C\u7528\u4E8E\u6307\u5B9A\u8981\u6253\u5F00\u7684\u73AF\u5883\u3002At least one of profile_id or profile_no is required; if both are provided, profile_id takes priority (AdsPower API). profile_id \u4E0E profile_no \u81F3\u5C11\u586B\u5176\u4E00\uFF1B\u540C\u65F6\u586B\u5199\u65F6 profile_id \u4F18\u5148\uFF08\u4E0E AdsPower API \u4E00\u81F4\uFF09\u3002"
    ),
    ip_tab: import_zod.z.enum(["0", "1"]).optional().describe("The ip tab of the browser, 0 is not use ip tab, 1 is use ip tab, default is 0"),
    launch_args: import_zod.z.union([import_zod.z.string(), import_zod.z.array(import_zod.z.string())]).optional().describe("The launch args of the browser, use chrome launch args, or vista url"),
    headless: import_zod.z.enum(["0", "1"]).optional().describe(
      'Headless: "0" visible window, "1" headless. \u65E0\u5934\u6A21\u5F0F\u5F00\u5173\u3002If omitted, the runtime may auto-set "1" when no graphical session is detected (Linux without DISPLAY/WAYLAND, or CI). Explicit "0"/"1" is always sent as-is.'
    ),
    last_opened_tabs: import_zod.z.enum(["0", "1"]).optional().describe("Whether to restore the last opened tabs."),
    proxy_detection: import_zod.z.enum(["0", "1"]).optional().describe("Whether to enable proxy detection."),
    password_filling: import_zod.z.enum(["0", "1"]).optional().describe("Whether to enable password auto-filling."),
    password_saving: import_zod.z.enum(["0", "1"]).optional().describe("Whether to enable password saving."),
    delete_cache: import_zod.z.enum(["0", "1"]).optional().describe("The clear cache after closing of the browser, 0 is not clear cache after closing, 1 is clear cache after closing, default is 0"),
    cdp_mask: import_zod.z.enum(["0", "1"]).optional().describe("The cdp mask of the browser, 0 is not use cdp mask, 1 is use cdp mask, default is 0"),
    device_scale: import_zod.z.string().optional().describe("Device scale factor passed to browser-profile/start.")
  }).strict().refine((data) => data.profile_id || data.profile_no, {
    message: "Either profile_id or profile_no must be provided"
  }),
  closeBrowserSchema: import_zod.z.object({
    profile_id: import_zod.z.string().optional().describe("The profile id of the browser to stop, either profile_id or profile_no must be provided"),
    profile_no: import_zod.z.string().optional().describe("The profile number of the browser to stop, priority will be given to profile_id when profile_id is filled")
  }).strict().refine((data) => data.profile_id || data.profile_no, {
    message: "Either profile_id or profile_no must be provided"
  }),
  deleteBrowserSchema: import_zod.z.object({
    profile_id: import_zod.z.array(import_zod.z.string()).describe("The profile ids of the browsers to delete, it is required when you want to delete the browser")
  }).strict(),
  getBrowserListSchema: import_zod.z.object({
    group_id: import_zod.z.string().regex(/^\d+$/, "Group ID must be a numeric string").optional().describe("Query by group ID; searches all groups if empty"),
    limit: import_zod.z.number().min(1).max(200).optional().describe("Profiles per page. Number of profiles returned per page, range 1 ~ 200, default is 50"),
    page: import_zod.z.number().min(1).optional().describe("Page number for results, default is 1"),
    profile_id: nonEmptyStringArraySchema.optional().describe('Query by profile ID. Example: ["h1yynkm","h1yynks"]'),
    profile_no: nonEmptyStringArraySchema.optional().describe('Query by profile number. Example: ["123","124"]'),
    sort_type: import_zod.z.enum(["profile_no", "last_open_time", "created_time"]).optional().describe("Sort results by: profile_no, last_open_time, or created_time"),
    sort_order: import_zod.z.enum(["asc", "desc"]).optional().describe('Sort order: "asc" (ascending) or "desc" (descending)'),
    tag_ids: nonEmptyStringArraySchema.optional().describe('Tag IDs to filter profiles by tags. Example: ["tag1","tag2"]'),
    tags_filter: import_zod.z.enum(["include", "exclude"]).optional().describe('Tag matching mode: "include" (default) matches profiles with any of the tags, "exclude" matches profiles without the tags'),
    name: import_zod.z.string().optional().describe("Profile name keyword to search for"),
    name_filter: import_zod.z.enum(["include", "exclude"]).optional().describe('Name matching mode: "include" (default) matches profiles containing the name keyword, "exclude" matches profiles not containing the name keyword')
  }).strict(),
  moveBrowserSchema: import_zod.z.object({
    group_id: import_zod.z.string().regex(/^\d+$/, "Group ID must be a numeric string").describe('The target group id, must be a numeric string (e.g., "123"). You can use the get-group-list tool to get the group list'),
    user_ids: import_zod.z.array(import_zod.z.string()).describe("The browser Profile ids to move")
  }).strict(),
  getProfileCookiesSchema: import_zod.z.object({
    profile_id: import_zod.z.string().optional().describe("The profile id, either profile_id or profile_no must be provided"),
    profile_no: import_zod.z.string().optional().describe("The profile number, priority will be given to profile_id when profile_id is filled")
  }).strict().refine((data) => data.profile_id || data.profile_no, {
    message: "Either profile_id or profile_no must be provided"
  }),
  getProfileUaSchema: import_zod.z.object({
    profile_id: nonEmptyStringArraySchema.optional().describe("The profile id array, either profile_id or profile_no must be provided"),
    profile_no: nonEmptyStringArraySchema.optional().describe("The profile number array, priority will be given to profile_id when profile_id is filled")
  }).strict().refine((data) => data.profile_id && data.profile_id.length > 0 || data.profile_no && data.profile_no.length > 0, {
    message: "Either profile_id or profile_no must be provided with at least one element"
  }),
  closeAllProfilesSchema: import_zod.z.object({}).strict(),
  newFingerprintSchema: import_zod.z.object({
    profile_id: nonEmptyStringArraySchema.optional().describe("The profile id array, either profile_id or profile_no must be provided"),
    profile_no: nonEmptyStringArraySchema.optional().describe("The profile number array, priority will be given to profile_id when profile_id is filled")
  }).strict().refine((data) => data.profile_id && data.profile_id.length > 0 || data.profile_no && data.profile_no.length > 0, {
    message: "Either profile_id or profile_no must be provided with at least one element"
  }),
  deleteCacheV2Schema: import_zod.z.object({
    profile_id: import_zod.z.array(import_zod.z.string()).describe("The profile ids array, it is required"),
    type: import_zod.z.array(import_zod.z.enum(["local_storage", "indexeddb", "extension_cache", "cookie", "history", "image_file"])).describe("Types of cache to clear, it is required")
  }).strict(),
  shareProfileSchema: import_zod.z.object({
    profile_id: import_zod.z.array(import_zod.z.string()).describe("The profile ids array, it is required"),
    receiver: import_zod.z.string().describe("Receiver's account email or phone number (no area code), it is required"),
    share_type: import_zod.z.number().int().optional().describe("Share type: 1 for email (default), 2 for phone number"),
    content: import_zod.z.array(import_zod.z.enum(["name", "proxy", "remark", "tabs"])).optional().describe("Shared content")
  }).strict(),
  createGroupSchema: import_zod.z.object({
    group_name: import_zod.z.string().describe("The name of the group to create"),
    remark: import_zod.z.string().optional().describe("The remark of the group")
  }).strict(),
  updateGroupSchema: import_zod.z.object({
    group_id: import_zod.z.string().regex(/^\d+$/, "Group ID must be a numeric string").describe('The id of the group to update, must be a numeric string (e.g., "123"). You can use the get-group-list tool to get the group list'),
    group_name: import_zod.z.string().describe("The new name of the group"),
    remark: import_zod.z.string().nullable().optional().describe("The new remark of the group")
  }).strict(),
  getGroupListSchema: import_zod.z.object({
    group_name: import_zod.z.string().optional().describe("The name of the group to search, use like to search"),
    page_size: import_zod.z.number().optional().describe("The size of the page, max is 100, default is 10"),
    page: import_zod.z.number().optional().describe("The page of the group, default is 1")
  }).strict(),
  getApplicationListSchema: import_zod.z.object({
    category_id: import_zod.z.string().optional().describe("Extension category_id"),
    page: import_zod.z.number().optional().describe("Page number, default 1"),
    limit: import_zod.z.number().min(1).max(100).optional().describe("Default 1, how many values are returned per page, range 1 to 100")
  }).strict(),
  getBrowserActiveSchema: import_zod.z.object({
    profile_id: import_zod.z.string().optional().describe("The profile id, either profile_id or profile_no must be provided"),
    profile_no: import_zod.z.string().optional().describe("The profile number, priority will be given to profile_id when profile_id is filled")
  }).strict().refine((data) => data.profile_id || data.profile_no, {
    message: "Either profile_id or profile_no must be provided"
  }),
  getCloudActiveSchema: import_zod.z.object({
    user_ids: import_zod.z.string().describe("Profile IDs string to check (split by comma, max 100 per request). Unique profile ID, generated after creating the profile.")
  }).refine((data) => data.user_ids.split(",").length <= 100, {
    message: "The number of profile ids is too many, the maximum is 100"
  }),
  createProxySchema: import_zod.z.array(createProxyItemSchema).describe("Top-level array of proxy configurations to create"),
  createProxyMcpSchema: import_zod.z.object({
    proxies: import_zod.z.array(createProxyItemSchema).describe("Compatibility wrapper for MCP create-proxy input. Core and CLI accept a top-level array.")
  }).strict(),
  updateProxySchema: import_zod.z.object({
    proxy_id: import_zod.z.string().describe("The unique id after the proxy is added"),
    type: import_zod.z.enum(["http", "https", "ssh", "socks5"]).optional().describe("Proxy type, support: http/https/ssh/socks5"),
    host: import_zod.z.string().optional().describe("Proxy host, support: ipV4, ipV6, eg: 192.168.0.1"),
    port: import_zod.z.string().optional().describe("Port, range: 0-65536, eg: 8000"),
    user: import_zod.z.string().optional().describe("Proxy username, eg: user12345678"),
    password: import_zod.z.string().optional().describe("Proxy password, eg: password"),
    proxy_url: import_zod.z.string().optional().describe("URL used to refresh the proxy, eg: https://www.baidu.com/"),
    remark: import_zod.z.string().optional().describe("Remark/description for the proxy"),
    ipchecker: import_zod.z.enum(["ipinfo", "ip2location", "ipapi", "ipfoxy"]).optional().describe("IP checker.")
  }).strict(),
  getProxyListSchema: import_zod.z.object({
    limit: import_zod.z.number().optional().describe("Profiles per page. Number of proxies returned per page, range 1 ~ 200, default is 50"),
    page: import_zod.z.number().optional().describe("Page number for results, default is 1"),
    proxy_id: nonEmptyStringArraySchema.optional().describe('Query by proxy ID. Example: ["proxy1","proxy2"]')
  }).strict(),
  deleteProxySchema: import_zod.z.object({
    proxy_id: import_zod.z.array(import_zod.z.string()).describe("The proxy ids of the proxies to delete, it is required when you want to delete the proxy. The maximum is 100. ")
  }).strict(),
  getTagListSchema: import_zod.z.object({
    ids: import_zod.z.array(import_zod.z.string()).optional().describe('Tag IDs to query, max 100 per request. Example: ["tag1","tag2"]'),
    limit: import_zod.z.number().optional().describe("Number of tags returned per page, range 1 ~ 200, default is 50"),
    page: import_zod.z.number().optional().describe("Page number for results, default is 1")
  }).strict(),
  createTagSchema: import_zod.z.object({
    tags: import_zod.z.array(import_zod.z.object({
      name: import_zod.z.string().max(50).describe("Tag name, max 50 characters"),
      color: import_zod.z.enum(["darkBlue", "blue", "purple", "red", "yellow", "orange", "green", "lightGreen"]).optional().describe("Tag color, default is darkBlue")
    }).strict()).describe("Array of tags to create")
  }).strict(),
  updateTagSchema: import_zod.z.object({
    tags: import_zod.z.array(import_zod.z.object({
      id: import_zod.z.string().describe("Tag ID to update"),
      name: import_zod.z.string().max(50).optional().describe("Tag name, max 50 characters"),
      color: import_zod.z.enum(["darkBlue", "blue", "purple", "red", "yellow", "orange", "green", "lightGreen"]).optional().describe("Tag color")
    }).strict()).describe("Array of tags to update")
  }).strict(),
  deleteTagSchema: import_zod.z.object({
    ids: import_zod.z.array(import_zod.z.string()).describe("Tag IDs to delete")
  }).strict(),
  downloadKernelSchema: import_zod.z.object({
    kernel_type: import_zod.z.enum(["Chrome", "Firefox"]).describe("Browser kernel type"),
    kernel_version: import_zod.z.string().describe("Browser kernel version, e.g. 141")
  }).strict(),
  getKernelListSchema: import_zod.z.object({
    kernel_type: import_zod.z.enum(["Chrome", "Firefox"]).optional().describe("Browser kernel type; omit to return all supported kernels")
  }).strict(),
  updatePatchSchema: import_zod.z.object({
    version_type: import_zod.z.enum(["stable", "beta"]).optional().describe("Patch version type to update, default stable")
  }).strict(),
  emptySchema: import_zod.z.object({}).strict(),
  createAutomationSchema: import_zod.z.object({
    userId: import_zod.z.string().optional().describe("The browser id of the browser to connect"),
    serialNumber: import_zod.z.string().optional().describe("The serial number of the browser to connect"),
    wsUrl: import_zod.z.string().describe("The ws url of the browser, get from the open-browser tool content `ws.puppeteer`")
  }).strict(),
  navigateSchema: import_zod.z.object({
    url: import_zod.z.string().describe("The url to navigate to")
  }).strict(),
  screenshotSchema: import_zod.z.object({
    savePath: import_zod.z.string().optional().describe("The path to save the screenshot"),
    isFullPage: import_zod.z.boolean().optional().describe("The is full page of the screenshot")
  }).strict(),
  clickElementSchema: import_zod.z.object({
    selector: import_zod.z.string().describe("The selector of the element to click, find from the page source code")
  }).strict(),
  fillInputSchema: import_zod.z.object({
    selector: import_zod.z.string().describe("The selector of the input to fill, find from the page source code"),
    text: import_zod.z.string().describe("The text to fill in the input")
  }).strict(),
  selectOptionSchema: import_zod.z.object({
    selector: import_zod.z.string().describe("The selector of the option to select, find from the page source code"),
    value: import_zod.z.string().describe("The value of the option to select")
  }).strict(),
  hoverElementSchema: import_zod.z.object({
    selector: import_zod.z.string().describe("The selector of the element to hover, find from the page source code")
  }).strict(),
  scrollElementSchema: import_zod.z.object({
    selector: import_zod.z.string().describe("The selector of the element to scroll, find from the page source code")
  }).strict(),
  pressKeySchema: import_zod.z.object({
    key: import_zod.z.string().describe('The key to press, eg: "Enter"'),
    selector: import_zod.z.string().optional().describe("The selector of the element to press the key, find from the page source code")
  }).strict(),
  evaluateScriptSchema: import_zod.z.object({
    script: import_zod.z.string().describe(`The script to evaluate, eg: "document.querySelector('#username').value = 'test'"`)
  }).strict(),
  dragElementSchema: import_zod.z.object({
    selector: import_zod.z.string().describe("The selector of the element to drag, find from the page source code"),
    targetSelector: import_zod.z.string().describe("The selector of the element to drag to, find from the page source code")
  }).strict(),
  iframeClickElementSchema: import_zod.z.object({
    selector: import_zod.z.string().describe("The selector of the element to click, find from the page source code"),
    iframeSelector: import_zod.z.string().describe("The selector of the iframe to click, find from the page source code")
  }).strict()
};

// src/cli.ts
var STATELESS_HANDLERS = {
  "open-browser": {
    fn: browserHandlers.openBrowser,
    description: buildCliCommandDescription(
      "open-browser",
      "Open the browser, both environment and profile mean browser"
    )
  },
  "close-browser": {
    fn: browserHandlers.closeBrowser,
    description: buildCliCommandDescription("close-browser", "Close the browser")
  },
  "create-browser": {
    fn: browserHandlers.createBrowser,
    description: buildCliCommandDescription("create-browser", "Create a browser")
  },
  "update-browser": {
    fn: browserHandlers.updateBrowser,
    description: buildCliCommandDescription("update-browser", "Update the browser")
  },
  "delete-browser": {
    fn: browserHandlers.deleteBrowser,
    description: buildCliCommandDescription("delete-browser", "Delete the browser")
  },
  "get-browser-list": {
    fn: browserHandlers.getBrowserList,
    description: buildCliCommandDescription("get-browser-list", "Get the list of browsers")
  },
  "get-opened-browser": {
    fn: browserHandlers.getOpenedBrowser,
    description: buildCliCommandDescription("get-opened-browser", "Get the list of opened browsers")
  },
  "move-browser": {
    fn: browserHandlers.moveBrowser,
    description: buildCliCommandDescription("move-browser", "Move browsers to a group")
  },
  "get-profile-cookies": {
    fn: browserHandlers.getProfileCookies,
    description: buildCliCommandDescription(
      "get-profile-cookies",
      "Query and return cookies of the specified profile. Only one profile can be queried per request."
    )
  },
  "get-profile-ua": {
    fn: browserHandlers.getProfileUa,
    description: buildCliCommandDescription(
      "get-profile-ua",
      "Query and return the User-Agent of specified profiles. Up to 10 profiles can be queried per request."
    )
  },
  "close-all-profiles": {
    fn: browserHandlers.closeAllProfiles,
    description: buildCliCommandDescription(
      "close-all-profiles",
      "Close all opened profiles on the current device"
    )
  },
  "new-fingerprint": {
    fn: browserHandlers.newFingerprint,
    description: buildCliCommandDescription(
      "new-fingerprint",
      "Generate a new fingerprint for specified profiles. Up to 10 profiles are supported per request."
    )
  },
  "delete-cache-v2": {
    fn: browserHandlers.deleteCacheV2,
    description: buildCliCommandDescription(
      "delete-cache-v2",
      "Clear local cache of specific profiles.For account security, please ensure that there are no open browsers on the device when using this interface."
    )
  },
  "share-profile": {
    fn: browserHandlers.shareProfile,
    description: buildCliCommandDescription(
      "share-profile",
      "Share profiles via account email or phone number. The maximum number of profiles that can be shared at one time is 200."
    )
  },
  "get-browser-active": {
    fn: browserHandlers.getBrowserActive,
    description: buildCliCommandDescription("get-browser-active", "Get active browser profile information")
  },
  "get-cloud-active": {
    fn: browserHandlers.getCloudActive,
    description: buildCliCommandDescription(
      "get-cloud-active",
      'Query the status of browser profiles by user_ids, up to 100 profiles per request. If the team has enabled "Multi device mode," specific statuses cannot be retrieved and the response will indicate "Profile not opened."'
    )
  },
  "create-group": {
    fn: groupHandlers.createGroup,
    description: buildCliCommandDescription("create-group", "Create a browser group")
  },
  "update-group": {
    fn: groupHandlers.updateGroup,
    description: buildCliCommandDescription("update-group", "Update the browser group")
  },
  "get-group-list": {
    fn: groupHandlers.getGroupList,
    description: buildCliCommandDescription("get-group-list", "Get the list of groups")
  },
  "check-status": {
    fn: applicationHandlers.checkStatus,
    description: buildCliCommandDescription(
      "check-status",
      "Check the availability of the current device API interface (Connection Status)"
    )
  },
  "get-application-list": {
    fn: applicationHandlers.getApplicationList,
    description: buildCliCommandDescription(
      "get-application-list",
      "Get the list of applications (categories)"
    )
  },
  "create-proxy": {
    fn: proxyHandlers.createProxy,
    description: buildCliCommandDescription("create-proxy", "Create the proxy")
  },
  "update-proxy": {
    fn: proxyHandlers.updateProxy,
    description: buildCliCommandDescription("update-proxy", "Update the proxy")
  },
  "get-proxy-list": {
    fn: proxyHandlers.getProxyList,
    description: buildCliCommandDescription("get-proxy-list", "Get the list of proxies")
  },
  "delete-proxy": {
    fn: proxyHandlers.deleteProxy,
    description: buildCliCommandDescription("delete-proxy", "Delete the proxy")
  },
  "get-tag-list": {
    fn: tagHandlers.getTagList,
    description: buildCliCommandDescription("get-tag-list", "Get the list of browser tags")
  },
  "create-tag": {
    fn: tagHandlers.createTag,
    description: buildCliCommandDescription("create-tag", "Create browser tags (batch supported)")
  },
  "update-tag": {
    fn: tagHandlers.updateTag,
    description: buildCliCommandDescription("update-tag", "Update browser tags (batch supported)")
  },
  "delete-tag": {
    fn: tagHandlers.deleteTag,
    description: buildCliCommandDescription("delete-tag", "Delete browser tags")
  },
  "download-kernel": {
    fn: kernelHandlers.downloadKernel,
    description: buildCliCommandDescription(
      "download-kernel",
      "Download or update a browser kernel version"
    )
  },
  "get-kernel-list": {
    fn: kernelHandlers.getKernelList,
    description: buildCliCommandDescription("get-kernel-list", "Get browser kernel list by type or all")
  },
  "update-patch": {
    fn: patchHandlers.updatePatch,
    description: buildCliCommandDescription("update-patch", "Update AdsPower to latest patch version")
  }
};
var SINGLE_PROFILE_ID_COMMANDS = {
  "open-browser": "profile_id",
  "close-browser": "profile_id",
  "get-profile-cookies": "profile_id",
  "get-browser-active": "profile_id"
};
var SINGLE_PROFILE_ID_ARRAY_COMMANDS = ["get-profile-ua", "new-fingerprint"];
function resolveStatelessCommandArgs(commandName, params) {
  let args = {};
  if (!params) {
    return { ok: true, args };
  }
  const trimmed = params.trim();
  if (trimmed.startsWith("{")) {
    try {
      args = JSON.parse(params);
      return { ok: true, args };
    } catch {
      return { ok: false, error: "Invalid JSON for command args" };
    }
  }
  if (SINGLE_PROFILE_ID_COMMANDS[commandName]) {
    if (!isNaN(Number(trimmed))) {
      return { ok: true, args: { profile_no: trimmed } };
    }
    return { ok: true, args: { profile_id: trimmed } };
  }
  if (SINGLE_PROFILE_ID_ARRAY_COMMANDS.includes(commandName)) {
    if (!isNaN(Number(trimmed))) {
      return { ok: true, args: { profile_no: [trimmed] } };
    }
    return { ok: true, args: { profile_id: [trimmed] } };
  }
  try {
    args = JSON.parse(params);
    return { ok: true, args };
  } catch {
    return {
      ok: false,
      error: `Command requires JSON args (e.g. '{"key":"value"}') or use a supported shorthand`
    };
  }
}

// src/startConfig.ts
var MISSING_API_KEY_ERROR = "error: required option '-k, --api-key <apiKey>' not specified";
function resolveStartApiKey(optionApiKey, env = process.env) {
  if (optionApiKey) {
    return {
      ok: true,
      apiKey: optionApiKey
    };
  }
  if (env.ADS_API_KEY) {
    return {
      ok: true,
      apiKey: env.ADS_API_KEY
    };
  }
  return {
    ok: false,
    error: MISSING_API_KEY_ERROR
  };
}

// src/index.ts
var program = new import_commander.Command();
program.name("adspower-browser").description("CLI and runtime for adspower-browser").version(VERSION);
program.command("start").description("Start the adspower runtime").option("-k, --api-key <apiKey>", "Set the API key for the adspower runtime").addOption(new import_commander.Option("--base-url <baseUrl>", "Set the base URL for the adspower runtime").hideHelp()).addOption(new import_commander.Option("--node-env <nodeEnv>", "Set the node environment for the adspower runtime").hideHelp()).action(async (options) => {
  const resolvedApiKey = resolveStartApiKey(options.apiKey, process.env);
  if (!resolvedApiKey.ok) {
    logError(resolvedApiKey.error);
    process.exit(1);
  }
  store.setStoreValue("apiKey", resolvedApiKey.apiKey);
  if (options.baseUrl) {
    store.setStoreValue("baseUrl", options.baseUrl);
  }
  if (options.nodeEnv) {
    store.setStoreValue("nodeEnv", options.nodeEnv);
  }
  await startChild();
});
program.command("stop").description("Stop the adspower runtime").action(async () => {
  await stopChild();
});
program.command("restart").description("Restart the adspower runtime").action(async () => {
  await restartChild();
});
program.command("status").description("Get the status of the adspower runtime").action(async () => {
  getChildStatus();
});
for (const cmd of Object.keys(STATELESS_HANDLERS)) {
  const fnc = STATELESS_HANDLERS[cmd].fn;
  program.command(`${cmd} [params]`).description(STATELESS_HANDLERS[cmd].description).option("-k, --api-key <apiKey>", "Set the API key for the adspower runtime").option("-p, --port <port>", "Set the port for the adspower runtime").action(async (params, options, command) => {
    const isRun = await hasRunning(options);
    if (!isRun) {
      logError("[!] Adspower runtime is not running");
      const info = `[i] Please run "${(0, import_colors2.green)("adspower-browser start -k <apiKey>")}" to start the adspower runtime`;
      console.log(info);
      return;
    }
    const { apiKey, port } = getApiKeyAndPort(options);
    updateConfig(apiKey, port);
    const resolved = resolveStatelessCommandArgs(command.name(), params);
    if (!resolved.ok) {
      logError(resolved.error);
      return;
    }
    const args = resolved.args;
    logSuccess(`Executing command: ${command.name()}, params: ${JSON.stringify(args)}`);
    const loading = createLoading(`Executing ${command.name()}...`);
    try {
      if (command.name() === "download-kernel") {
        loading.stop();
        const result = await trackKernelDownload(fnc, args);
        const out = typeof result === "string" ? result : JSON.stringify(result, null, 2);
        logInfo(`

${out}

`);
      } else {
        const result = await fnc(args);
        const out = typeof result === "string" ? result : JSON.stringify(result, null, 2);
        logInfo(`

${out}
`);
        if (command.name() === "update-patch" && !out.includes("The client is already on the latest patch version. No update is required")) {
          loading.stop();
          await sleepTime(1e3 * 60);
          await restartChild();
        }
      }
    } finally {
      loading.stop();
    }
  });
}
program.parseAsync(process.argv).catch((error) => {
  console.error(error);
  process.exit(1);
});
