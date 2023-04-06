import loadingGif from 'assets/gif/loading.gif';
import { ReactComponent as ArrowDownIcon } from 'assets/icons/arrow.svg';
import classNames from 'classnames';
import Input from 'components/Input';
import Loader from 'components/Loader';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import TokenBalance from 'components/TokenBalance';
import { evmChains, filteredTokens, TokenItemType, tokenMap } from 'config/bridgeTokens';
import {
  COSMOS_TYPE,
  EVM_TYPE,
  GAS_ESTIMATION_BRIDGE_DEFAULT,
  KAWAII_ORG,
  KWT_SUBNETWORK_CHAIN_ID,
  ORAI,
  ORAICHAIN_ID,
  ORAI_BRIDGE_CHAIN_ID,
  TRON_CHAIN_ID,
} from 'config/constants';
import { feeEstimate, filterChainBridge, getTokenChain, networks, renderLogoNetwork } from 'helper';
import { useCoinGeckoPrices } from 'hooks/useCoingecko';
import useConfigReducer from 'hooks/useConfigReducer';
import { reduceString, toDisplay } from 'libs/utils';
import { FC, useEffect, useState } from 'react';
import NumberFormat from 'react-number-format';
import styles from './index.module.scss';

const AMOUNT_BALANCE_ENTRIES: [number, string][] = [
  [0.25, '25%'],
  [0.5, '50%'],
  [0.75, '75%'],
  [1, 'MAX']
];

interface TransferConvertProps {
  token: TokenItemType;
  amountDetail?: [string, number];
  convertToken?: any;
  transferIBC?: any;
  convertKwt?: any;
  onClickTransfer?: any;
  subAmounts?: object;
}

const TransferConvertToken: FC<TransferConvertProps> = ({
  token,
  amountDetail,
  transferIBC,
  convertKwt,
  onClickTransfer,
  subAmounts
}) => {
  const [[convertAmount, convertUsd], setConvertAmount] = useState([undefined, 0]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [filterNetwork, setFilterNetwork] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [chainInfo] = useConfigReducer('chainInfo');
  const [addressTransfer, setAddressTransfer] = useState('');
  const { data: prices } = useCoinGeckoPrices();
  useEffect(() => {
    if (chainInfo) {
      setConvertAmount([undefined, 0]);
    }
  }, [chainInfo]);

  useEffect(() => {
    const chainDefault = getTokenChain(token);
    setFilterNetwork(chainDefault);
    const findNetwork = networks.find((net) => net.title == chainDefault);
    getAddressTransfer(findNetwork);
  }, [token?.chainId]);

  const [amount, usd] = amountDetail;
  const name = token.name;
  const ibcConvertToken = filteredTokens.filter(
    (t) =>
      t.cosmosBased &&
      (t.name === `ERC20 ${token.name}` || t.name === `BEP20 ${token.name}`) &&
      token.chainId === ORAICHAIN_ID &&
      t.chainId !== ORAI_BRIDGE_CHAIN_ID
  );

  // list of tokens where it exists in at least two different chains
  const listedTokens = filteredTokens.filter((t) => t.chainId !== token.chainId && t.coingeckoId === token.coingeckoId);
  const maxAmount = toDisplay(
    amount, // amount detail here can be undefined
    token?.decimals
  );

  const checkValidAmount = () => {
    if (!convertAmount || convertAmount <= 0 || convertAmount > maxAmount) {
      displayToast(TToastType.TX_FAILED, {
        message: 'Invalid amount!'
      });
      return false;
    }
    return true;
  };

  if (!name && !ibcConvertToken && token.chainId !== KWT_SUBNETWORK_CHAIN_ID && !onClickTransfer) return <></>;

  const getAddressTransfer = async (network) => {
    try {
      let address: string = '';
      if (network.networkType == EVM_TYPE && network.chainId !== TRON_CHAIN_ID) {
        if (!window.Metamask.isWindowEthereum()) return setAddressTransfer('');
        address = await window.Metamask!.getEthAddress();
      }
      if (network.chainId === TRON_CHAIN_ID) {
        address = window.tronWeb.defaultAddress.base58;
      }
      if (network.networkType == COSMOS_TYPE) {
        address = await window.Keplr.getKeplrAddr(network.chainId);
      }
      setAddressTransfer(address);
    } catch (error) {
      setAddressTransfer('');
    }
  };

  return (
    <div className={classNames(styles.tokenFromGroup, styles.small)} style={{ flexWrap: 'wrap' }}>
      <div className={styles.tokenSubAmouts}>
        {subAmounts &&
          Object.keys(subAmounts)?.length > 0 &&
          Object.keys(subAmounts).map((denom, idx) => {
            const subAmount = subAmounts[denom] ?? '0';
            const evmToken = tokenMap[denom];
            return (
              <div key={idx} className={styles.itemSubAmounts}>
                <TokenBalance
                  balance={{
                    amount: subAmount,
                    denom: evmToken.name,
                    decimals: evmToken.decimals
                  }}
                  className={styles.tokenAmount}
                  decimalScale={token.decimals}
                />
              </div>
            );
          })}
      </div>
      <div className={styles.tokenFromGroupBalance}>
        <div className={styles.network}>
          <div className={styles.loading}>{transferLoading && <img alt='loading' src={loadingGif} width={180} height={180} />}</div>
          <div className={styles.box}>
            <div className={styles.transfer}>
              <div className={styles.content}>
                <div className={styles.title}>Transfer to</div>
                <div className={styles.address}>{reduceString(addressTransfer, 10, 7)}</div>
              </div>
            </div>
            <div className={styles.search}>
              <div
                className={styles.search_filter}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsOpen(!isOpen);
                }}
              >
                <div className={styles.search_box}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className={styles.search_logo}>{renderLogoNetwork(filterNetwork)}</div>
                    <span className={styles.search_text}>{filterNetwork}</span>
                  </div>
                  <div>
                    <ArrowDownIcon />
                  </div>
                </div>
              </div>
              {isOpen && (
                <div>
                  <ul className={styles.items}>
                    {networks &&
                      networks
                        .filter((item) => filterChainBridge(token, item))
                        .map((network) => {
                          return (
                            <li
                              key={network.chainId}
                              onClick={async (e) => {
                                e.stopPropagation();
                                setFilterNetwork(network?.title);
                                await getAddressTransfer(network);
                                setIsOpen(false);
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <div>{renderLogoNetwork(network.chainId)}</div>
                                <div className={styles.items_title}>{network.title}</div>
                              </div>
                            </li>
                          );
                        })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <div className={styles.balanceDescription}>Convert Amount:</div>
          <div className={styles.balanceAmount}>
            <div>
              <NumberFormat
                placeholder="0"
                thousandSeparator
                decimalScale={Math.min(6, token?.decimals)}
                customInput={Input}
                value={convertAmount}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                onValueChange={({ floatValue }) => {
                  if (!floatValue) return setConvertAmount([undefined, 0]);
                  const usdValue = floatValue * (prices[token.coingeckoId] ?? 0);
                  setConvertAmount([floatValue!, usdValue]);
                }}
                className={styles.amount}
              />
              <div style={{ paddingTop: 8 }}>
                <TokenBalance balance={convertUsd} className={styles.balanceDescription} prefix="~$" decimalScale={2} />
              </div>
            </div>

            <div className={styles.balanceFromGroup}>
              {AMOUNT_BALANCE_ENTRIES.map(([coeff, text]) => (
                <button
                  key={coeff}
                  className={styles.balanceBtn}
                  onClick={(event) => {
                    event.stopPropagation();
                    // hardcode estimate fee oraichain
                    let finalAmount = maxAmount;
                    if (token?.denom === ORAI) {
                      const useFeeEstimate = feeEstimate(token, GAS_ESTIMATION_BRIDGE_DEFAULT);
                      if (coeff === 1) {
                        finalAmount = useFeeEstimate > finalAmount ? 0 : finalAmount - useFeeEstimate;
                      } else {
                        finalAmount = useFeeEstimate > maxAmount - finalAmount * coeff ? 0 : finalAmount;
                      }
                    }

                    setConvertAmount([finalAmount * coeff, usd * coeff]);
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.transferTab}>
        {(() => {
          if (token.chainId === KWT_SUBNETWORK_CHAIN_ID) {
            return (
              <>
                <button
                  className={styles.tfBtn}
                  disabled={transferLoading || !addressTransfer}
                  onClick={async (event) => {
                    event.stopPropagation();
                    try {
                      const isValid = checkValidAmount();
                      if (!isValid) return;
                      setTransferLoading(true);
                      if (filterNetwork === ORAICHAIN_ID) {
                        return await onClickTransfer(convertAmount);
                      }
                      await convertKwt(convertAmount, token);
                    } finally {
                      setTransferLoading(false);
                    }
                  }}
                >
                  {transferLoading && <Loader width={20} height={20} />}
                  <span>
                    {filterNetwork === ORAICHAIN_ID ? 'Transfer' : 'Convert'} <strong>{filterNetwork}</strong>
                  </span>
                </button>
              </>
            );
          }

          /** 
           * TODO: we can remove token.chainId !== ORAI_BRIDGE_CHAIN_ID because we filter it
           * in getFilterTokens from BalanceNews. and remove "name" because all token have name.
           */
          if (
            // (token.cosmosBased && token.chainId !== ORAI_BRIDGE_CHAIN_ID && listedTokens.length > 0 && name) ||
            (token.cosmosBased && listedTokens.length > 0) ||
            evmChains.find((chain) => chain.chainId === token.chainId)
          ) {
            return (
              <button
                disabled={transferLoading || !addressTransfer}
                className={styles.tfBtn}
                onClick={async (event) => {
                  event.stopPropagation();
                  try {
                    const isValid = checkValidAmount();
                    if (!isValid) return;
                    setTransferLoading(true);

                    /**
                     * TODO: remove this condition
                     * because token.bridgeNetworkIdentifier just appear in network with chainId: ORAI_BRIDGE_CHAIN_ID 
                     * but now we dont have this network in bridge.
                     */
                    // if (token.bridgeNetworkIdentifier && filterNetwork == ORAICHAIN_ID) {
                    //   return await convertToken(convertAmount, token, 'nativeToCw20');
                    // }

                    // [KWT, MILKY] from ORAICHAIN -> KWT_CHAIN || from EVM token -> ORAICHAIN.
                    if (
                      onClickTransfer &&
                      (filterNetwork === KAWAII_ORG || evmChains.find((chain) => chain.chainId === token.chainId))
                    ) {
                      return await onClickTransfer(convertAmount);
                    }

                    // remaining tokens 
                    // TODO: to is Oraibridge tokens
                    // or other token that have same coingeckoId that show in at least 2 chain.
                    const to = filteredTokens.find((t) =>
                      t.chainId === ORAI_BRIDGE_CHAIN_ID && t?.bridgeNetworkIdentifier
                        ? t.bridgeNetworkIdentifier === filterNetwork && t.coingeckoId === token.coingeckoId
                        : t.coingeckoId === token.coingeckoId && t.org === filterNetwork
                    );
                    // convert reverse before transferring
                    await transferIBC(token, to, convertAmount);
                  } catch (error) {
                    console.log({ error });
                  } finally {
                    setTransferLoading(false);
                  }
                }}
              >
                {transferLoading && <Loader width={20} height={20} />}
                <span>
                  {'Transfer'} <strong>{filterNetwork}</strong>
                </span>
              </button>
            );
          }


          /** 
           *  TODO: we can remove this render condition because conditions above covered all token to bridge.
           * first render condition: render token from Kawaiiverse
           * second render condition: render token based cosmos  and not based cosmos ( evm tokens ).
           */
          // if (token.chainId !== ORAI_BRIDGE_CHAIN_ID && ibcConvertToken.length) {
          //   return (
          //     <button
          //       className={styles.tfBtn}
          //       disabled={transferLoading || !addressTransfer}
          //       onClick={async (event) => {
          //         event.stopPropagation();
          //         try {
          //           const isValid = checkValidAmount();
          //           if (!isValid) return;
          //           setTransferLoading(true);
          //           const ibcConvert = ibcConvertToken.find((ibc) => ibc.bridgeNetworkIdentifier === filterNetwork);
          //           await convertToken(convertAmount, token, 'cw20ToNative', ibcConvert);
          //         } finally {
          //           setTransferLoading(false);
          //         }
          //       }}
          //     >
          //       {transferLoading && <Loader width={20} height={20} />}
          //       <span>
          //         Transfersss
          //         <strong style={{ marginLeft: 5 }}>{filterNetwork}</strong>
          //       </span>
          //     </button>
          //   );
          // }
        })()}
      </div>
    </div>
  );
};
export default TransferConvertToken;
