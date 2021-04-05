import { zip } from "d3-array";
import React, { useCallback, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import { CalcState, TStore, useStore } from "../store";

const selector = ({ profile, profileIdxs, calcState, filename }: TStore) => ({
  profile,
  profileIdxs,
  calcState,
  filename,
});

interface Props {
  className?: string;
}

export const DownloadCSV: React.FC<Props> = ({ className }) => {
  const { profile, profileIdxs, calcState, filename } = useStore(selector);
  const [csv, setCsv] = useState<string>("");
  const disabled = useMemo(() => calcState === CalcState.Loading, [calcState]);
  const downloadFilename = useMemo(() => {
    if (filename === undefined) return "matrix_profile.csv";
    return filename.split(".csv")[0] + "_profile.csv";
  }, [filename]);

  const onClick = useCallback(() => {
    if (disabled) return false;
    const csvContent =
      "matrix_profile,nearest_index\n" +
      zip(profile ?? [], profileIdxs ?? [])
        .map(([a, b]) => `${a},${b}`)
        .join("\n");
    setCsv(csvContent);
    return true;
  }, [disabled, profile, profileIdxs]);

  return (
    <CSVLink
      data={csv}
      filename={downloadFilename}
      onClick={onClick}
      className={className}
    >
      <button className="btn text-base" disabled={disabled}>
        Download result
      </button>
    </CSVLink>
  );
};
