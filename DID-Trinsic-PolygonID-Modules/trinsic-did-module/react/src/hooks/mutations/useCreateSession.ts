import { useQuery } from "react-query";
import { useToggle } from "react-use";

export interface FakeSessionResponse {
  idvSession?: string | undefined;
}

export interface CreateSessionResponse {
  clientToken: string;
  sessionId: string;
}

const handleCreateSession = async (): Promise<CreateSessionResponse> => {
  const resp = await fetch(`/api/create-session`, {
    method: "POST",
  });

  if (!resp.ok) {
    throw new Error("Error creating session");
  }

  const json: CreateSessionResponse = await resp.json();
  return json;
};

export const useCreateSession = () => {
  const [hasToken, toggleHasToken] = useToggle(false);
  return useQuery(
    ["client-token"],
    () => handleCreateSession(),

    {
      onSuccess: () => {
        toggleHasToken(true);
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      enabled: hasToken === false,
    },
  );
};
