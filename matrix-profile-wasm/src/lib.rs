use matrix_profile::{naive, stomp, MatrixProfile};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct NaiveMatrixProfile {
    data: naive::NaiveMatrixProfile,
}

#[wasm_bindgen]
impl NaiveMatrixProfile {
    /// Computes the matrix profile using a naive (brute force) algorithm.
    ///
    /// # Arguments
    ///
    /// * `x` - Time series data
    /// * `m` - Window size
    pub fn calculate(x: Vec<f32>, m: usize) -> Self {
        let data = naive::NaiveMatrixProfile::calculate(x, m);
        Self { data }
    }

    /// Computes the full matrix profile using a naive (brute force) algorithm.
    ///
    /// # Arguments
    ///
    /// * `x` - Time series data
    /// * `m` - Window size
    pub fn calculate_full_matrix(x: Vec<f32>, m: usize) -> Self {
        let data = naive::NaiveMatrixProfile::calculate_full_matrix(x, m);
        Self { data }
    }

    pub fn get_profile(&self) -> Vec<f32> {
        self.data.get_profile().clone()
    }

    pub fn get_profile_idxs(&self) -> Vec<usize> {
        self.data.get_profile_idxs().clone()
    }
}

#[wasm_bindgen]
pub struct StompMatrixProfile {
    data: stomp::StompMatrixProfile,
}

#[wasm_bindgen]
impl StompMatrixProfile {
    /// Computes the matrix profile using the [Stomp] algorithm.
    ///
    /// # Arguments
    ///
    /// * `x` - Time series data
    /// * `m` - Window size
    ///
    /// [Stomp]: https://www.cs.ucr.edu/~eamonn/MatrixProfile.html
    pub fn calculate(x: Vec<f32>, m: usize) -> Self {
        let data = stomp::StompMatrixProfile::calculate(x, m);
        Self { data }
    }

    pub fn get_profile(&self) -> Vec<f32> {
        self.data.get_profile().clone()
    }

    pub fn get_profile_idxs(&self) -> Vec<usize> {
        self.data.get_profile_idxs().clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_naive() {
        let x: Vec<f32> = vec![1.0, 2.0, 3.0, 4.0, 1.0, 4.0, 5.0, 12.0, 4.0, 5.0];
        let res = NaiveMatrixProfile::calculate(x, 4);
        println!("{:?}", res.get_profile());
    }

    #[test]
    fn test_stomp() {
        let x: Vec<f32> = vec![1.0, 2.0, 3.0, 4.0, 1.0, 4.0, 5.0, 12.0, 4.0, 5.0];
        let res = StompMatrixProfile::calculate(x, 4);
        println!("{:?}", res.get_profile());
    }

}
