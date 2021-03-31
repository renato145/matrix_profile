import React, { ChangeEventHandler, useCallback } from "react";
import { TStore, useStore } from "../store";

const selector = ({ csvColumns, selectColumn }: TStore) => ({
  csvColumns,
  selectColumn,
});

export const ColumnSelector: React.FC = () => {
  const { csvColumns, selectColumn } = useStore(selector);

  const onChange = useCallback<ChangeEventHandler<HTMLSelectElement>>(
    ({ target }) => {
      selectColumn(target.value);
    },
    [selectColumn]
  );

  return csvColumns !== undefined ? (
    <div className="flex">
      <p className="font-medium">Select column:</p>
      <select
        className="ml-2 py-0.5 rounded-md hover:shadow"
        onChange={onChange}
      >
        {csvColumns.map((col, i) => (
          <option key={i} value={col}>
            {col}
          </option>
        ))}
      </select>
    </div>
  ) : null;
};
