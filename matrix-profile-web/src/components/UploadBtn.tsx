import React, { ChangeEventHandler, useCallback, useMemo, useRef } from "react";
import { CalcState, TStore, useStore } from "../store";

const selector = ({ calcState, uploadData }: TStore) => ({
  calcState,
  uploadData,
});

export const UploadBtn: React.FC = () => {
  const { calcState, uploadData } = useStore(selector);
  const ref = useRef<HTMLInputElement>(null);
  const disabled = useMemo(() => calcState === CalcState.Loading, [calcState]);

  const reader = useMemo(() => {
    const fr = new FileReader();
    fr.onload = () => {
      const path = ref.current?.value;
      uploadData(fr.result as string, path);
      if (ref.current !== null) ref.current.value = "";
    };
    return fr;
  }, [uploadData]);

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target }) => {
      if (target.files === null) return;
      if (target.files[0] === undefined) return;
      reader.readAsText(target.files[0]);
    },
    [reader]
  );

  const onClick = useCallback(() => {
    if (ref.current !== null) ref.current.click();
  }, []);

  return (
    <div>
      <input
        ref={ref}
        type="file"
        className="hidden pointer-events-none"
        accept=".csv"
        onChange={onChange}
      />
      <button className="btn" onClick={onClick} disabled={disabled}>
        Upload data
      </button>
    </div>
  );
};
