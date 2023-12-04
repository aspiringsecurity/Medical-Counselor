import { useMemo, useState } from "react";

const getMobileDetect = (userAgent: string) => {
  const isAndroid = (): boolean => Boolean(userAgent.match(/Android/i));
  const isIos = (): boolean => Boolean(userAgent.match(/iPhone|iPad|iPod/i));
  const isOpera = (): boolean => Boolean(userAgent.match(/Opera Mini/i));
  const isWindows = (): boolean => Boolean(userAgent.match(/IEMobile/i));
  const isSSR = (): boolean => Boolean(userAgent.match(/SSR/i));

  const isMobile = (): boolean =>
    Boolean(isAndroid() || isIos() || isOpera() || isWindows());
  const isDesktop = (): boolean => Boolean(!isMobile() && !isSSR());
  return {
    isMobile,
    isDesktop,
    isAndroid,
    isIos,
    isSSR,
  };
};

export interface MobileDetect {
  isMobile: boolean;
  isDesktop: boolean;
  isAndroid: boolean;
  isIos: boolean;
  isSSR: boolean;
}

export const useMobileDetect = () => {
  const [userAgent, _] = useState(navigator.userAgent);
  return useMemo<MobileDetect>(() => {
    const mobileDetect = getMobileDetect(userAgent);
    return {
      isMobile: mobileDetect.isMobile(),
      isDesktop: mobileDetect.isDesktop(),
      isAndroid: mobileDetect.isAndroid(),
      isIos: mobileDetect.isIos(),
      isSSR: mobileDetect.isSSR(),
    };
  }, [userAgent]);
};
