export const clamp = (x: number, min: number, max: number) => {
  return x < min ? min : x > max ? max : x;
};

export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));
