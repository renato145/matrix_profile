use matrix_profile::{matrix_profile::MatrixProfile, naive};
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

    /// Computes the matrix profile using a naive (brute force) algorithm.
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate() {
        let x: Vec<f32> = vec![1.0, 2.0, 3.0, 4.0, 1.0, 4.0, 5.0, 12.0, 4.0, 5.0];
        let res = NaiveMatrixProfile::calculate(x, 4);
        println!("{:?}", res.get_profile());
    }
}
