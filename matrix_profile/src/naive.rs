//! Naive implementation to calculate the Matrix Profile.
use crate::{
    matrix_profile::MatrixProfile,
    utils::{euclidean_distance, normalize},
};
use ndarray::prelude::*;
use ndarray_stats::QuantileExt;
use std::cmp::Ordering;

pub struct NaiveMatrixProfile {
    /// Matrix profile.
    profile: Vec<f32>,
    /// Matrix profile indices.
    profile_idxs: Vec<usize>,
    #[allow(dead_code)]
    /// Window size.
    m: usize,
    full_matrix: Option<Array2<f32>>,
}

impl MatrixProfile for NaiveMatrixProfile {
    fn calculate(x: Vec<f32>, m: usize) -> Self {
        let x = Array1::from(x);
        let n = x.len() - m + 1;
        // Nearby subsequences are likely highly similar so we define an "exclusion zone" around the diagonal
        let exclusion_zone = (m as f32 / 4f32).ceil() as usize;

        let (profile, profile_idxs) = (0..n)
            .map(|i| {
                let a = normalize(x.slice(s![i..(i + m)]).to_owned());
                let exclusion_start = i - exclusion_zone.min(i);
                let exclusion_end = (i + exclusion_zone).min(n);
                (0..n)
                    .filter(|&j| (j < exclusion_start) || (exclusion_end < j))
                    .map(|j| {
                        let b = normalize(x.slice(s![j..(j + m)]).to_owned());
                        let distance = euclidean_distance(&a, &b);
                        (distance, j)
                    })
                    .min_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(Ordering::Less))
                    .unwrap()
            })
            .unzip();

        Self {
            profile,
            profile_idxs,
            m,
            full_matrix: None,
        }
    }

    fn get_profile(&self) -> &Vec<f32> {
        &self.profile
    }

    fn get_profile_idxs(&self) -> &Vec<usize> {
        &self.profile_idxs
    }
}

impl NaiveMatrixProfile {
    /// Computes the matrix profile using a naive (brute force) algorithm.
    ///
    /// # Arguments
    ///
    /// * `x` - Time series data
    /// * `m` - Window size
    pub fn calculate_full_matrix(x: Vec<f32>, m: usize) -> Self {
        let x = Array1::from(x);
        let n = x.len() - m + 1;
        // Nearby subsequences are likely highly similar so we define an "exclusion zone" around the diagonal
        let exclusion_zone = (m as f32 / 4f32).ceil() as usize;

        let matrix = (0..n)
            .map(|i| {
                let a = normalize(x.slice(s![i..(i + m)]).to_owned());
                let exclusion_start = i - exclusion_zone.min(i);
                let exclusion_end = (i + exclusion_zone).min(n);
                (0..n)
                    .map(|j| {
                        if (exclusion_start <= j) && (j <= exclusion_end) {
                            return std::f32::NAN;
                        }

                        let b = normalize(x.slice(s![j..(j + m)]).to_owned());
                        euclidean_distance(&a, &b)
                    })
                    .collect::<Vec<_>>()
            })
            .flatten()
            .collect::<Vec<_>>();
        let matrix = Array::from_shape_vec((n, n), matrix).unwrap();
        let (profile, profile_idxs) = profile_from_matrix(&matrix);

        Self {
            profile,
            profile_idxs,
            m,
            full_matrix: Some(matrix),
        }
    }

    pub fn get_full_matrix(&self) -> Option<&Array2<f32>> {
        self.full_matrix.as_ref()
    }
}

fn profile_from_matrix(x: &Array2<f32>) -> (Vec<f32>, Vec<usize>) {
    let n = x.nrows();
    let mut profile = Vec::with_capacity(n);
    let mut idxs = Vec::with_capacity(n);

    // for row in x.rows() { //ndarray 0.15
    for row in x.genrows() {
        let i = row.argmin_skipnan().unwrap();
        profile.push(row[i]);
        idxs.push(i);
    }
    (profile, idxs)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::random_data;
    use approx::assert_relative_eq;

    #[test]
    fn test_naive() {
        let x = random_data(20, 34);
        println!("x: {:?}", x);
        let res = NaiveMatrixProfile::calculate(x, 4);
        let profile = res.get_profile();
        let idxs = res.get_profile_idxs();
        println!("profile: {:?}", profile);
        println!("idxs: {:?}", idxs);
        let expected_profile: Vec<f32> = vec![
            0.56790817, 0.6122841, 0.7975659, 0.34195754, 1.4722625, 0.34195754, 1.6347985,
            0.32652372, 0.56790817, 0.32652372, 1.1161846, 0.65986866, 1.0210972, 0.8491465,
            0.65986866, 1.0210972, 0.8491465,
        ];
        let expected_idxs: Vec<usize> =
            vec![8, 9, 14, 5, 11, 3, 12, 9, 0, 7, 1, 14, 15, 16, 11, 12, 13];
        assert_relative_eq!(profile.as_slice(), expected_profile.as_slice());
        assert_eq!(idxs.as_slice(), expected_idxs.as_slice());
    }

    #[test]
    fn test_naive_large() {
        let x = random_data(100, 34);
        println!("x: {:?}", x);
        let res = NaiveMatrixProfile::calculate_full_matrix(x.clone(), 10);
        let idxs = res.get_profile_idxs();
        let expected_idxs = vec![
            71, 72, 26, 26, 27, 28, 29, 30, 30, 68, 72, 73, 74, 72, 73, 24, 25, 49, 3, 65, 82, 67,
            47, 48, 15, 16, 3, 4, 5, 6, 7, 7, 54, 55, 76, 44, 45, 46, 47, 48, 53, 54, 55, 56, 57,
            36, 37, 38, 39, 24, 60, 61, 62, 40, 41, 42, 43, 44, 85, 8, 68, 51, 52, 53, 54, 51, 20,
            21, 60, 51, 11, 40, 1, 11, 12, 13, 34, 89, 90, 59, 53, 41, 42, 43, 44, 58, 32, 50, 51,
            77, 85,
        ];
        assert_eq!(idxs.as_slice(), expected_idxs.as_slice());
        let res = NaiveMatrixProfile::calculate(x, 10);
        let idxs = res.get_profile_idxs();
        assert_eq!(idxs.as_slice(), expected_idxs.as_slice());
    }

    #[test]
    fn test_full_matrix() {
        let x = random_data(20, 34);
        let a = NaiveMatrixProfile::calculate_full_matrix(x.clone(), 4);
        let full_matrix = a.get_full_matrix().unwrap();
        println!("{:.2}", full_matrix);
        let b = NaiveMatrixProfile::calculate(x, 4);
        assert_relative_eq!(a.get_profile().as_slice(), b.get_profile().as_slice());
        assert_eq!(
            a.get_profile_idxs().as_slice(),
            b.get_profile_idxs().as_slice()
        );
    }
}
