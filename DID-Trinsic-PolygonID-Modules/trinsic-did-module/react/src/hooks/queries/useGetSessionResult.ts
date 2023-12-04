import { Verification } from "@trinsic/trinsic";
import { useQuery } from "react-query";

export type VPToken = {
  id: string;
  "@context": string[];
  type: string[];
};

interface Session {
  resultVp: VPToken;
  verifications: {
    [key: string]: Verification;
  };
}

const handleGetSessionResult = async (
  clientToken: string,
): Promise<Session> => {
  const resp = await fetch(`/api/get-result?clientToken=${clientToken}`, {
    method: "POST",
  });

  if (!resp.ok) {
    throw new Error("Error getting session result");
  }

  const text = await resp.text();
  if (text === "no-result-yet") {
    throw new Error("Result not available yet");
  }

  const json: Session | null | undefined = JSON.parse(text);
  if (!json) {
    throw new Error("Not valid");
  }

  return json;
};

export const useGetSessionResult = (
  clientToken?: string,
  enabled: boolean = true,
) => {
  return useQuery(
    ["session-result", clientToken],
    () => handleGetSessionResult(clientToken!),

    {
      onSuccess: (data) => {
        console.log("result", data);
        // //console.log(data);
        // if (session !== undefined) setSession(data);
      },
      refetchInterval: false,
      retry: 5,
      retryDelay: 100,
      refetchOnWindowFocus: false,
      enabled: !!clientToken && enabled,
    },
  );
};
