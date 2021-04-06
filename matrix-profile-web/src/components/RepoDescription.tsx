import React, { HTMLProps } from "react";

export const RepoDescription: React.FC<HTMLProps<HTMLDivElement>> = ({
  ...props
}) => (
  <div {...props}>
    <div className="text-justify leading-snug font-normal text-base sm:text-lg">
      <p>
        A{" "}
        <a
          href="https://www.cs.ucr.edu/~eamonn/MatrixProfile.html"
          target="_black"
          rel="noopener"
        >
          matrix profile
        </a>{" "}
        is a vector that contains the z-normalized euclidean distances between a
        window of the time series and its nearest pair. This allow us to
        identify potential anomalies (discords) and common patterns (motif) in
        the data. To calculate the matrix profile I implemented the STOMP
        algorithm using{" "}
        <a href="https://www.rust-lang.org/" target="_black" rel="noopener">
          Rust
        </a>{" "}
        and loaded here with{" "}
        <a href="https://webassembly.org/" target="_black" rel="noopener">
          wasm
        </a>{" "}
        bindings, you can find the code in this{" "}
        <a
          href="https://github.com/renato145/matrix_profile/"
          target="_black"
          rel="noopener"
        >
          repository
        </a>
        . Also, if you would like to use matrix profile in python check{" "}
        <a
          href="https://github.com/TDAmeritrade/stumpy"
          target="_black"
          rel="noopener"
        >
          stumpy
        </a>
        .
      </p>
    </div>
  </div>
);
