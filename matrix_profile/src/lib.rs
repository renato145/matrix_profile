//! # Matrix Profile
//! 
//! Inspired by this [talk] here I implements the Matrix Profile algorithm STOMP used to analize time series.
//! 
//! Details about the algorithm can be found [here].
//! 
//! [talk]: https://www.youtube.com/watch?v=cCJy6hzAJQQ
//! [here]: https://www.cs.ucr.edu/~eamonn/MatrixProfile.html

pub mod matrix_profile;
pub mod utils;
pub mod stomp;
pub mod naive;

#[cfg(test)]
mod test_utils;