import { ChainInfo } from '@keplr-wallet/types';
import { network } from 'constants/networks';
import { embedChainInfos } from 'networks';

export default class Keplr {
  constructor() {
    window.onload = async () => {
      if (window.keplr) {
        // window.keplr.defaultOptions = {
        //     sign: {
        //         preferNoSetFee: true,
        //         preferNoSetMemo: true,
        //     },
        // };
      }
    };
  }

  suggestChain = async (chainId: string) => {
    const chainInfo = embedChainInfos.find(
      (chainInfo) => chainInfo.chainId === chainId
    );
    if (!chainInfo) return;
    await window.keplr.experimentalSuggestChain(chainInfo);
    await window.keplr.enable(chainInfo.chainId);
  };

  async getKeplr(): Promise<keplrType | undefined> {
    if (window.keplr) {
      return window.keplr;
    }

    if (document.readyState === 'complete') {
      return window.keplr;
    }

    return new Promise((resolve) => {
      const documentStateChange = (event: Event) => {
        if (
          event.target &&
          (event.target as Document).readyState === 'complete'
        ) {
          resolve(window.keplr);
          document.removeEventListener('readystatechange', documentStateChange);
        }
      };

      document.addEventListener('readystatechange', documentStateChange);
    });
  }

  private async getKeplrKey(chain_id?: string): Promise<any | undefined> {
    let chainId = network.chainId;
    if (chain_id) chainId = chain_id;
    if (!chainId) return undefined;
    const keplr = await this.getKeplr();
    if (keplr) {
      return keplr.getKey(chainId);
    }
    return undefined;
  }

  async getKeplrAddr(chain_id?: string): Promise<String | undefined> {
    const key = await this.getKeplrKey(chain_id);
    return key.bech32Address;
  }

  async getKeplrPubKey(): Promise<Uint8Array | undefined> {
    const key = await this.getKeplrKey();
    return key.pubKey;
  }
}
