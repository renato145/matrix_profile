import React, { useCallback, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import { CalcState, TStore, useStore } from "../store";

const selector = ({ profile, calcState }: TStore) => ({ profile, calcState });

interface Props {
  className?: string;
}

export const DownloadCSV: React.FC<Props> = ({ className }) => {
  const { profile, calcState } = useStore(selector);
  const [csv, setCsv] = useState<string>("");
  const disabled = useMemo(() => calcState === CalcState.Loading, [calcState]);

  const onClick = useCallback(() => {
    if (disabled) return false;
    setCsv("matrix_profile\n" + (profile ?? []).join("\n"));
    return true;
  }, [disabled, profile]);

  return (
    <CSVLink
      data={csv}
      filename="matrix_profile.csv"
      onClick={onClick}
      className={className}
    >
      <button className="btn text-base" disabled={disabled}>
        Download result
      </button>
    </CSVLink>
  );
};
