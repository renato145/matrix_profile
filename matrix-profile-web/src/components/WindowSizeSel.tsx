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
        step={5}
        disabled={calcState === CalcState.Loading}
        defaultValue={windowSize}
        onChange={onChange}
        className="ml-2 w-20 md:w-28 py-0.5 rounded-md border focus:border-gray-600 hover:shadow text-center"
      />
    </div>
  );
};
