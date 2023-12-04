import { useMemo } from "react";

export enum RelyingParty {
  pocketrides = "pocketrides",
  pearbnb = "pearbnb",
}

export const useWhichRelyingParty = () => {
  const rp = useMemo(() => {
    const keys = Object.keys(RelyingParty);
    console.log("FOUND KEY", process.env.RP, Object.keys(RelyingParty));
    if (!keys.includes(process.env.RP ?? ""))
      throw new Error("No Valid RP Set");
    let rpString = process.env.RP as keyof typeof RelyingParty;
    return RelyingParty[rpString];
  }, []);

  return {
    isPocketRides: rp === RelyingParty.pocketrides,
    ispearbnb: rp === RelyingParty.pearbnb,
  };
};
