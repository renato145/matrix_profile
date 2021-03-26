//! General trait for Matrix Profile calculation.

pub trait MatrixProfile {
    /// # Arguments
    ///
    /// * `x` - Time series data
    /// * `m` - Window size
    fn calculate(x: Vec<f32>, m: usize) -> Self;
    fn get_profile(&self) -> &Vec<f32>;
    fn get_profile_idxs(&self) -> &Vec<usize>;
}
