import * as net from 'node:net';
import { firefox } from '@playwright/test';

const BIND_HOST = '127.0.0.1';

/**
 * @param {number} port
 */
export async function isPortOccupied(port) {
  return new Promise(function (resolve) {
    const server = net.createServer();
    server.once('error', function (error) {
      if (error.code === 'EADDRINUSE') {
        resolve(true);
      }
    });
    server.once('listening', function () {
      server.close(function (error) {
        if (error !== undefined) {
          resolve(true);
          return;
        }
        resolve(false);
      });
    });
    server.listen(port, BIND_HOST);
  });
}

/**
 * @param {number} min A minimum port number to search
 * @param {number} max A maximum port number to search
 */
export async function getIdlePortInRange(min, max) {
  for (let i = min; i <= max; i++) {
    if (!(await isPortOccupied(i))) {
      return i;
    }
  }

  throw new Error('None of port in range is available!');
}

class FirefoxDebuggerClient {
  socket = null;
  queue = null;
  isBusy = false;

  readBuffer = null;
  remainingBytes = 0;

  constructor() {
    this.queue = [];
    this.readBuffer = [];
  }

  /**
   * @param {number} port
   * @param {string} host
   */
  async connect(port, host = BIND_HOST) {
    const instance = this;
    return new Promise(function (resolve) {
      instance.socket = net.connect({
        port,
        host,
      });
      instance.socket.once('ready', resolve);
      instance.socket.on('data', instance.handleData.bind(instance));
    });
  }

  /**
   * @param {string | Record<string, unknown>} message
   * @param {(message: unkonwn) => boolean} responseFilter
   */
  async request(message, responseFilter) {
    const instance = this;
    return new Promise(function (resolve) {
      function callback(response) {
        if (responseFilter(response) === false) {
          return true;
        }
        resolve(response);
      }
      instance.enqueue(message, callback);
    });
  }

  /**
   * @param {string | Record<string, unknown>} message
   * @param {Function} callback
   */
  enqueue(message, callback) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    this.queue.push({
      message,
      callback,
    });
    void this.handleIdle();
  }

  async handleIdle() {
    if (this.isBusy === true) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.isBusy = true;

    const chunk = Buffer.from(JSON.stringify(this.queue[0].message));
    this.socket.write(chunk.length.toString());
    this.socket.write(':');
    this.socket.write(chunk);
  }

  /**
   * @param {Buffer} chunk
   */
  async handleData(chunk) {
    chunk = Buffer.from(chunk);

    if (this.remainingBytes === 0) {
      const coordinatorIndex = chunk.indexOf(':');
      if (coordinatorIndex === -1) {
        this.readBuffer.push(chunk);
        return;
      }

      this.readBuffer.push(chunk.subarray(0, coordinatorIndex));
      const messageBytes = Number(Buffer.concat(this.readBuffer).toString());

      if (!isFinite(messageBytes)) {
        throw new Error('Unable to sync the state!');
      }

      this.readBuffer = [];
      this.remainingBytes = messageBytes;

      if (chunk.length >= coordinatorIndex) {
        this.handleData(chunk.subarray(coordinatorIndex + 1));
      }

      return;
    }

    this.readBuffer.push(chunk.subarray(0, this.remainingBytes));
    const bytesAfterConsumption = this.remainingBytes - chunk.byteLength;

    if (bytesAfterConsumption <= 0) {
      this.handleResponse(Buffer.concat(this.readBuffer));
      this.readBuffer = [];
      this.remainingBytes = 0;

      if (bytesAfterConsumption === 0) {
        return;
      }

      this.handleData(chunk.subarray(chunk.byteLength + bytesAfterConsumption));
    }
  }

  /**
   * @param {Buffer} responseBuffer
   */
  handleResponse(responseBuffer) {
    const response = JSON.parse(responseBuffer.toString());

    const { callback } = this.queue[0];
    const shouldContinueListening = callback(response);

    if (shouldContinueListening === false) {
      this.queue.pop();

      this.isBusy = false;
      this.handleIdle();
    }
  }

  async close() {
    this.socket.end();
  }
}

/**
 * @param {string} extensionPath
 */
export async function loadFirefoxBrowserWithExtension(extensionPath) {
  // Make sure to select port number bigger than 1024
  // to avoid requiring network capability
  const debuggerPort = await getIdlePortInRange(30000, 30010);
  const context = await firefox.launchPersistentContext('./.temp', {
    headless: false,
    args: ['-start-debugger-server', debuggerPort.toString()],
    firefoxUserPrefs: {
      'devtools.debugger.remote-enabled': true,
      'devtools.debugger.prompt-connection': false,
      'xpinstall.signatures.required': false,
      'xpinstall.whitelist.required': false,
      'extensions.langpacks.signatures.required': false,
    },
  });

  // Initialise the client
  const client = new FirefoxDebuggerClient(debuggerPort);
  await client.connect(debuggerPort);

  // Install the extension
  const getRootResponse = await client.request(
    {
      to: 'root',
      type: 'getRoot',
    },
    function (message) {
      console.log(message);

      return message.addonsActor !== undefined;
    },
  );
  await client.request(
    {
      to: getRootResponse.addonsActor,
      type: 'installTemporaryAddon',
      addonPath: extensionPath,
      openDevTools: false,
    },
    function (message) {
      console.log(message);

      return message.addon !== undefined;
    },
  );

  return context;
}
