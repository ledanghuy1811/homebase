import { useQuery } from '@tanstack/react-query';
import { TokenItemType } from 'config/bridgeTokens';
import { fetchTokenInfo, getPairAmountInfo } from 'rest/api';
import { PoolDetail } from 'types/pool';

export const useGetPairInfo = ({ token1, token2, info: pairInfoData }: PoolDetail) => {
  const { data: lpTokenInfoData } = useQuery(
    ['token-info', pairInfoData],
    () =>
      fetchTokenInfo({
        contractAddress: pairInfoData.liquidityAddr
      } as TokenItemType),
    {
      enabled: !!pairInfoData,
      refetchOnWindowFocus: false
    }
  );

  const { data: pairAmountInfoData, refetch: refetchPairAmountInfo } = useQuery(
    ['pair-amount-info', token1, token2],
    () => {
      return getPairAmountInfo(token1, token2);
    },
    {
      enabled: !!token1 && !!token2,
      refetchOnWindowFocus: false,
      refetchInterval: 15000
    }
  );

  return { lpTokenInfoData, pairAmountInfoData, refetchPairAmountInfo };
};
