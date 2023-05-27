import cn from 'classnames/bind';
import Modal from 'components/Modal';
import { FC, useState } from 'react';
import styles from './NewTokenModal.module.scss';
import { ReactComponent as OraiIcon } from 'assets/icons/oraichain.svg';
import { ReactComponent as OraixIcon } from 'assets/icons/oraix.svg';
import { ReactComponent as RewardIcon } from 'assets/icons/reward.svg';
import Input from 'components/Input';
import NumberFormat from 'react-number-format';
import Loader from 'components/Loader';
import { handleErrorTransaction } from 'helper';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import { toAmount, toDisplay } from 'libs/utils';
import { oraichainTokens } from 'config/bridgeTokens';
import { network } from 'config/networks';
import { OraidexListingContractClient } from 'libs/contracts';
import { ORAI } from 'config/constants';
import { getCosmWasmClient } from 'libs/cosmjs';
import { Asset } from '@oraichain/oraidex-contracts-sdk';
const cx = cn.bind(styles);

interface ModalProps {
  className?: string;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  isCloseBtn?: boolean;
}

const checkRegex = (str: string) => {
  const regex = /^[a-zA-Z\-]{3,12}$/;
  return regex.test(str);
};

const NewTokenModal: FC<ModalProps> = ({ isOpen, close, open }) => {
  const [tokenName, setTokenName] = useState('');
  const [oraiPer, setOraiPer] = useState(BigInt(1e6));
  const [oraixPer, setOraixPer] = useState(BigInt(1e6));
  const [isLoading, setIsLoading] = useState(false);
  const oraiReward = oraichainTokens.find((token) => token.coinGeckoId === 'oraichain-token');
  const oraixReward = oraichainTokens.find(
    (token) => token.contractAddress === 'orai1lus0f0rhx8s03gdllx2n6vhkmf0536dv57wfge'
  );
  const handleCreateToken = async (tokenSymbol: string, rewardPerSecondOrai: bigint, rewardPerSecondOraiX: bigint) => {
    try {
      if (!checkRegex(tokenSymbol))
        return displayToast(TToastType.TX_FAILED, {
          message: 'Token name is required and must be letter (3 to 12 characters)'
        });

      setIsLoading(true);
      const { client, defaultAddress: address } = await getCosmWasmClient();
      console.log({
        address,
        client
      });

      if (!address)
        return displayToast(TToastType.TX_FAILED, {
          message: 'Wallet address does not exist!'
        });

      if (!tokenSymbol) {
        return displayToast(TToastType.TX_FAILED, {
          message: 'Empty token symbol!'
        });
      }

      const oraidexListing = new OraidexListingContractClient(client, address.address, network.oraidex_listing);
      // TODO: add more options for users like name, marketing, additional token rewards
      const result = await oraidexListing.listToken({
        symbol: tokenSymbol,
        liquidityPoolRewardAssets: [
          { amount: rewardPerSecondOrai.toString(), info: { native_token: { denom: ORAI } } } as Asset
        ]
      });
      if (result) {
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: `${network.explorer}/txs/${result.transactionHash}`
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.log('error listing token: ', error);
      handleErrorTransaction(error);
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} close={close} open={open} isCloseBtn={true} className={cx('modal')}>
      <div className={cx('container')}>
        <RewardIcon className={cx('reward-icon')} />
        <div className={cx('title')}>List a new token</div>
        <div className={cx('content')}>
          <div className={cx('token')}>
            <div className={cx('label')}>Token name</div>
            <Input
              className={cx('input')}
              value={tokenName}
              onChange={(e) => setTokenName(e?.target?.value)}
              placeholder="ORAICHAIN"
            />
          </div>
          <div className={cx('rewards')}>
            <div className={cx('orai')}>
              <div className={cx('orai_label')}>
                <OraiIcon className={cx('logo')} />
                <div className={cx('per')}>ORAI Reward/s</div>
              </div>
              <div className={cx('input_per')}>
                <NumberFormat
                  placeholder="0"
                  thousandSeparator
                  decimalScale={6}
                  customInput={Input}
                  value={toDisplay(oraiPer.toString(), oraiReward.decimals)}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  onValueChange={(e) => {
                    setOraiPer(toAmount(Number(e.value), 6));
                  }}
                  className={cx('value')}
                />
              </div>
            </div>
            <div style={{ height: 32 }} />
            <div className={cx('orai')}>
              <div className={cx('orai_label')}>
                <OraixIcon className={cx('logo')} />
                <div className={cx('per')}>ORAIX Reward/s</div>
              </div>
              <div className={cx('input_per')}>
                <NumberFormat
                  placeholder="0"
                  thousandSeparator
                  decimalScale={6}
                  customInput={Input}
                  value={toDisplay(oraixPer.toString(), oraixReward.decimals)}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  onValueChange={(e) => {
                    setOraixPer(toAmount(Number(e.value), 6));
                  }}
                  className={cx('value')}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className={cx('create-btn', (isLoading || !checkRegex(tokenName)) && 'disable-btn')}
          onClick={() => !isLoading && checkRegex(tokenName) && handleCreateToken(tokenName, oraiPer, oraixPer)}
        >
          {isLoading && <Loader width={20} height={20} />}
          {isLoading && <div style={{ width: 8 }}></div>}
          <span>Create</span>
        </div>
      </div>
    </Modal>
  );
};

export default NewTokenModal;
