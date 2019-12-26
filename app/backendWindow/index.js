// Copyright (C) 2019 ExtraHash
//
// Please see the included LICENSE file for more information.
import fs from 'fs';
import { ipcRenderer, IpcRendererEvent, clipboard } from 'electron';
import log from 'electron-log';
import Backend from './Backend';

let config = null;
let backend = null;

ipcRenderer.on('fromMain', (event: IpcRendererEvent, message: any) => {
  parseMessage(message);
});

ipcRenderer.on('fromFrontend', (event: IpcRendererEvent, message: any) => {
  parseMessage(message);
});

function parseMessage(message: any) {
  const { messageType, data } = message;
  switch (messageType) {
    case 'config':
      config = data;
      backend = new Backend(config);
      break;
    case 'changeNode':
      backend.changeNode(data);
      break;
    case 'backupToFile':
      fs.writeFile(data, backend.getSecret(), error => {
        if (error) {
          throw error;
        }
      });
      break;
    case 'backupToClipboard':
      clipboard.writeText(backend.getSecret());
      break;
    case 'exportToCSV':
      backend.exportToCSV(data);
      break;
    case 'saveWallet':
      backend.saveWallet(data);
      break;
    case 'saveWalletAs':
      backend.saveWallet(data.notify, data.savePath);
      break;
    case 'openNewWallet':
      backend.stop();
      backend = null;
      break;
    case 'walletPassword':
      backend.startWallet(data);
      break;
    case 'verifyWalletPassword':
      backend.verifyPassword(data);
      break;
    case 'changePasswordRequest':
      backend.changePassword(data);
      break;
    case 'transactionRequest':
      // data is the amount of transactions to get
      backend.getTransactions(data);
      break;
    case 'sendTransactionRequest':
      backend.sendTransaction(data);
      break;
    default:
      log.info(message);
      break;
  }
}
