import React from "react";

export const RepoDescription: React.FC = () => (
  <div className="mt-8 text-justify leading-snug font-light">
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
      window of the time series and its nearest pair. This allow us to identify
      potential anomalies (discords) and common patterns (motif) in the data.
    </p>
    <p className="mt-2">
      To perform the matrix profile calculation I used{" "}
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
      </a>{" "}
      (atm I use a naive implementation, but plan to implement the STOMP
      algorithm later). Also, if you would like to use matrix profile in python
      I recommend the{" "}
      <a
        href="https://github.com/TDAmeritrade/stumpy"
        target="_black"
        rel="noopener"
      >
        stumpy
      </a>{" "}
      library.
    </p>
  </div>
);
