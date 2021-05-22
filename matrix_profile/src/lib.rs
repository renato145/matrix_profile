//! # Matrix Profile
//!
//! Inspired by this [talk] here I implements the Matrix Profile algorithm STOMP used to analize time series.
//!
//! Details about the algorithm can be found [here].
//!
//! [talk]: https://www.youtube.com/watch?v=cCJy6hzAJQQ
//! [here]: https://www.cs.ucr.edu/~eamonn/MatrixProfile.html
#![allow(clippy::many_single_char_names)]

pub mod matrix_profile;
pub mod naive;
pub mod stomp;
pub mod utils;

pub use crate::matrix_profile::MatrixProfile;
pub use naive::NaiveMatrixProfile;
pub use stomp::StompMatrixProfile;

#[cfg(test)]
mod test_utils;
