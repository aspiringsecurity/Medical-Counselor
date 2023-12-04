import { useMemo } from "react";
import { XCircle } from "react-feather";

export interface IDVError {
  success: boolean;
  msg: string;
  sessionId: string;
}

export const Error = ({ error }: { error: IDVError }) => {
  const reason = useMemo(() => {
    if (error.msg === "user-closed") return "User closed verification";
    return "Verification failed";
  }, [error.msg]);

  return (
    <div className=" flex h-full w-full place-content-center items-center">
      <div className="flex h-full max-h-[280px] w-full max-w-[380px] flex-col items-center gap-4 rounded-lg bg-white px-2 py-4">
        <div className="pt-16 text-center">
          <XCircle className="h-14 w-14 text-error-700" />
        </div>
        <span className="text-lg">{reason}</span>
      </div>
    </div>
  );
};
