import React, { ChangeEventHandler, useCallback } from "react";
import { CalcState, TStore, useStore } from "../store";

const selector = ({ windowSize, calcState, setWindowSize }: TStore) => ({
  windowSize,
  calcState,
  setWindowSize,
});

export const WindowSizeSel: React.FC = () => {
  const { windowSize, calcState, setWindowSize } = useStore(selector);
  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target }) => setWindowSize(+target.value),
    [setWindowSize]
  );

  return (
    <div className="flex items-baseline">
      <p className="font-medium">Window size:</p>
      <input
        type="number"
        min={0}
        disabled={calcState === CalcState.Loading}
        defaultValue={windowSize}
        onChange={onChange}
        className="ml-2 w-20 py-0.5 rounded-md bg-gray-200 border-2 border-transparent focus:border-gray-500 focus:bg-gray-100 hover:border-gray-500 focus:ring-0 text-center text-base"
      />
    </div>
  );
};
