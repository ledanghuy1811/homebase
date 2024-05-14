import { useQuery } from '@tanstack/react-query';
import { ReactComponent as OBrigde } from 'assets/icons/OraiBridge_full_dark.svg';
import axios from 'axios';
import cn from 'classnames/bind';
import BuyOraiModal from 'layouts/BuyOraiModal';
import Content from 'layouts/Content';
import React, { useState } from 'react';
import { AssetsTab, HeaderTab } from './Component';
import ConnectBanner from './Component/ConnectBanner';
import Feature from './Component/Feature';
import StakeSummary from './Component/StakeSummary';
import SwapComponent from './Swap';
import { initPairSwap } from './Swap/hooks/useFillToken';
import { NetworkFilter, initNetworkFilter } from './helpers';
import styles from './index.module.scss';
const cx = cn.bind(styles);

const getInfoOraichain = async () => {
  try {
    const [market, status, controlCenter] = await Promise.all([
      axios.get('https://api.scan.orai.io/v1/market?id=oraichain-token'),
      axios.get('https://api.scan.orai.io/v1/status'),
      axios.get('https://control-center-api.orai.io/')
    ]);
    return {
      market: market?.data,
      status: status?.data,
      controlCenter: controlCenter?.data
    };
  } catch (e) {
    console.error('getInfoOraichain', e);
    return {
      market: {
        current_price: 0,
        market_cap: 0,
        total_volume: 0
      },
      status: {
        block_time: 0
      },
      controlCenter: {
        total_delegated: 0,
        ratio_bonded: 0
      }
    };
  }
};

export const useGetInfoOraichain = () => {
  const { data } = useQuery(['info_oraichain'], () => getInfoOraichain(), {
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000
  });
  return data;
};

const Swap: React.FC = () => {
  const [[fromTokenDenom, toTokenDenom], setSwapTokens] = useState<[string, string]>(initPairSwap);
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter>(initNetworkFilter);

  const [isLoadedIframe, setIsLoadedIframe] = useState(false); // check iframe data loaded
  const [openBuy, setOpenBuy] = useState(false);
  const data = useGetInfoOraichain();
  console.log('dataSummary', data);

  return (
    <Content nonBackground>
      <div className={cx('homebase')}>
        <HeaderTab
          openBuyModal={() => setOpenBuy(true)}
          price={data?.market?.current_price}
          marketCap={data?.market?.market_cap}
          volume={data?.market?.total_volume}
          blockTime={data?.status?.block_time}
        />
        <div className={cx('swap-container')}>
          <div className={cx('swap-col', 'w60')}>
            <ConnectBanner />
            <AssetsTab networkFilter={networkFilter.value} openBuyModal={() => setOpenBuy(true)} />
          </div>
          <div className={cx('swap-col', 'w40')}>
            <SwapComponent fromTokenDenom={fromTokenDenom} toTokenDenom={toTokenDenom} setSwapTokens={setSwapTokens} />
            <div className={styles.powerBy}>
              Powered by <OBrigde />
            </div>
          </div>
        </div>
        <div className={styles.looking}>You are looking for...</div>
        <StakeSummary data={data?.controlCenter} />
        <Feature />
      </div>

      {openBuy && (
        <BuyOraiModal
          open={openBuy}
          close={() => {
            setOpenBuy(false);
            setIsLoadedIframe(false);
          }}
          onAfterLoad={() => setIsLoadedIframe(true)}
          isLoadedIframe={isLoadedIframe}
        />
      )}
    </Content>
  );
};

export default Swap;
