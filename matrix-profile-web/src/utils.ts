export const clamp = (x: number, min: number, max: number) => {
  return x < min ? min : x > max ? max : x;
};

export const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const extractFilename = (path: string, strip_suffix = false) => {
  const s = path.split("\\");
  let filename = s[s.length - 1];
  if (strip_suffix) filename = filename.split(".csv")[0];
  return filename;
};
