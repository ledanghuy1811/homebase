import { useQuery } from '@tanstack/react-query';
import { toAmount, toDisplay } from 'libs/utils';
import { useEffect, useState } from 'react';
import { simulateSwap } from 'rest/api';
import { TokenInfo } from 'types/token';

/**
 * Simulate ratio between fromToken & toToken
 * @param queryKey
 * @param fromTokenInfoData
 * @param toTokenInfoData
 * @param initAmount
 * @returns
 */
export const useSimulate = (
  queryKey: string,
  fromTokenInfoData: TokenInfo,
  toTokenInfoData: TokenInfo,
  initAmount?: number
) => {
  const [[fromAmountToken, toAmountToken], setSwapAmount] = useState([initAmount || 0, 0]);

  const { data: simulateData } = useQuery(
    [queryKey, fromTokenInfoData, toTokenInfoData, fromAmountToken],
    () =>
      simulateSwap({
        fromInfo: fromTokenInfoData!,
        toInfo: toTokenInfoData!,
        amount: toAmount(fromAmountToken, fromTokenInfoData!.decimals).toString()
      }),
    { enabled: !!fromTokenInfoData && !!toTokenInfoData && fromAmountToken > 0 }
  );

  useEffect(() => {
    setSwapAmount([fromAmountToken, toDisplay(simulateData?.amount, toTokenInfoData?.decimals)]);
  }, [simulateData, fromAmountToken, toTokenInfoData]);

  return { simulateData, fromAmountToken, toAmountToken, setSwapAmount };
};
