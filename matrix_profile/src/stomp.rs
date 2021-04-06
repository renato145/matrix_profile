//! Implementation of the STOMP algorithm to calculate the Matrix Profile, check [here] for more details.
//!
//! [here]: https://www.cs.ucr.edu/~eamonn/MatrixProfile.html
use crate::matrix_profile::MatrixProfile;
use ndarray::{concatenate, prelude::*};
use rustfft::{num_complex::Complex32, FftPlanner};

pub struct StompMatrixProfile {
    /// Matrix profile.
    profile: Vec<f32>,
    /// Matrix profile indices.
    profile_idxs: Vec<usize>,
    #[allow(dead_code)]
    /// Window size.
    m: usize,
}

fn precompute_stats(x: &Array1<f32>, m: usize) -> (Array1<f32>, Array1<f32>) {
    let n = x.len();
    let mut cumsum = x.clone();
    cumsum.accumulate_axis_inplace(Axis(0), |&prev, curr| *curr += prev);
    let mut cumsum2 = x.map(|o| o.powi(2));
    cumsum2.accumulate_axis_inplace(Axis(0), |&prev, curr| *curr += prev);
    let sum_t = cumsum.slice(s![(m - 1)..]).to_owned()
        - concatenate![Axis(0), Array1::zeros(1), cumsum.slice(s![..(n - m)])];
    let sum_t2 = cumsum2.slice(s![(m - 1)..]).to_owned()
        - concatenate![Axis(0), Array1::zeros(1), cumsum2.slice(s![..(n - m)])];
    let mean_t = sum_t / (m as f32);
    let mean_t2 = sum_t2 / (m as f32);
    let mean_tp2 = mean_t.map(|o| o.powi(2));
    let sigma_t2 = mean_t2.clone() - mean_tp2;
    let sigma_t = sigma_t2.mapv(f32::sqrt);
    (mean_t, sigma_t)
}

fn sliding_dot_product(x: &Array1<f32>, m: usize) -> Vec<f32> {
    let q = x.slice(s![..m]).to_owned();
    let n = x.len();
    let m = q.len();

    // Append x with n zeros
    let ta = concatenate![Axis(0), x.to_owned(), Array1::zeros(n)];

    // Reverse Q
    let qr = q.slice(s![..;-1]);

    // Append qra
    let qra = concatenate![Axis(0), qr, Array1::zeros(2 * n - m)];

    // Compute FFTs
    let mut planner = FftPlanner::<f32>::new();
    let fft = planner.plan_fft_forward(2 * n);

    let mut qraf = qra
        .into_raw_vec()
        .into_iter()
        .map(|o| Complex32::new(o, 0f32))
        .collect::<Vec<_>>();
    fft.process(&mut qraf);

    let mut taf = ta
        .into_raw_vec()
        .into_iter()
        .map(|o| Complex32::new(o, 0f32))
        .collect::<Vec<_>>();
    fft.process(&mut taf);

    // Compute the inverse FFT to the element-wise multiplication of qraf and taf
    let ifft = planner.plan_fft_inverse(2 * n);
    let mut qt = qraf
        .into_iter()
        .zip(taf.into_iter())
        .map(|(a, b)| a * b)
        .collect::<Vec<_>>();
    ifft.process(&mut qt);

    let div = qt.len() as f32;
    let qt = qt
        .into_iter()
        .skip(m - 1)
        .take(n - m + 1)
        .map(|o| o.re / div)
        .collect::<Vec<_>>();
    qt
}

impl MatrixProfile for StompMatrixProfile {
    fn calculate(x: Vec<f32>, m: usize) -> Self {
        let x = Array1::from(x);
        let n = x.len() - m + 1;
        // Nearby subsequences are likely highly similar so we define an "exclusion zone" around the diagonal
        let exclusion_zone = (m as f32 / 4f32).ceil() as usize;

        let (mean_t, sigma_t) = precompute_stats(&x, m);
        let mut profile: Vec<f32> = vec![f32::INFINITY; n];
        let mut profile_idxs: Vec<usize> = vec![0; n];

        let mut qt = sliding_dot_product(&x, m);
        let qt_first = qt.clone();
        let qt_len = qt.len();

        for idx in 0..n {
            let q_std = sigma_t[idx].max(f32::EPSILON);
            if idx > 0 {
                let qt_ = qt.clone().into_iter().take(qt_len);
                qt.iter_mut()
                    .skip(1)
                    .zip(qt_)
                    .enumerate()
                    .for_each(|(i, (a, b))| {
                        *a = b - (x[i] * x[idx - 1]) + (x[i + m] * x[idx + m - 1])
                    });
                qt[0] = qt_first[idx];
            }

            // Calculate distance profile
            let mut distances = qt
                .iter()
                .zip(mean_t.iter())
                .zip(sigma_t.iter())
                .map(|((t, mt), st)| {
                    2.0 * ((m as f32) - (t - (m as f32) * mt * mean_t[idx]) / (q_std * st))
                })
                .map(|o| if o < f32::EPSILON { 0f32 } else { o })
                .collect::<Vec<_>>();

            // Apply "exclusion zone"
            let min_idx = idx.checked_sub(exclusion_zone).unwrap_or(0);
            let max_idx = (idx + exclusion_zone).min(distances.len());
            for (i, o) in distances.iter_mut().enumerate() {
                if (i >= min_idx) && (i <= max_idx) {
                    *o = f32::INFINITY;
                }
            }

            // Update profile
            for (i, (profile_d, d)) in profile.iter_mut().zip(distances).enumerate() {
                if *profile_d > d {
                    profile_idxs[i] = idx;
                    *profile_d = d;
                }
            }
        }

        profile.iter_mut().for_each(|o| *o = o.sqrt());

        StompMatrixProfile {
            profile,
            profile_idxs,
            m,
        }
    }

    fn get_profile(&self) -> &Vec<f32> {
        &self.profile
    }

    fn get_profile_idxs(&self) -> &Vec<usize> {
        &self.profile_idxs
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::random_data;
    use approx::assert_relative_eq;

    #[test]
    fn test_precompute_stats() {
        let x = random_data(20, 34);
        let x = Array1::from(x);
        let (means, stds) = precompute_stats(&x, 4);
        let means = means.to_vec();
        let stds = stds.to_vec();
        let expected_means: Vec<f32> = vec![
            46.65674847,
            27.05939168,
            22.90565668,
            23.72789943,
            47.41447021,
            72.287772,
            78.788712,
            86.0191985,
            64.37987475,
            39.9538552,
            22.79070727,
            13.96505727,
            15.68540265,
            18.4393017,
            34.72254713,
            26.67163048,
            29.2358316,
        ];
        let expected_stds: Vec<f32> = vec![
            29.85902311,
            28.10328597,
            22.64409521,
            23.32055262,
            33.74810079,
            25.47926001,
            22.05673344,
            11.7627809,
            33.65364617,
            34.56023576,
            28.98052781,
            13.81962595,
            13.5129983,
            11.41253782,
            23.77679109,
            26.74428495,
            26.06496464,
        ];
        assert_relative_eq!(means.as_slice(), expected_means.as_slice(), epsilon = 1e-4);
        assert_relative_eq!(stds.as_slice(), expected_stds.as_slice(), epsilon = 1e-4);
    }

    #[test]
    fn test_sliding_dot_product() {
        let x = random_data(20, 34);
        let x = Array1::from(x);
        let res = sliding_dot_product(&x, 4);
        let expected: Vec<f32> = vec![
            12273.65375704,
            7976.24013643,
            3290.74242092,
            2140.32768543,
            5206.64245513,
            10809.0319089,
            13920.31427121,
            17299.30222674,
            15872.43813917,
            11194.80940846,
            6410.00704706,
            1168.0809309,
            2185.85540503,
            3730.44702013,
            4588.54192503,
            5061.97403949,
            6093.545234,
        ];
        assert_relative_eq!(res.as_slice(), expected.as_slice(), epsilon = 1e-2);
    }

    #[test]
    fn test_stomp() {
        let x = random_data(20, 34);
        println!("x: {:?}", x);
        let res = StompMatrixProfile::calculate(x, 4);
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

        for (i, (a, b)) in profile.iter().zip(expected_profile.iter()).enumerate() {
            if (a - b) > 1e-3 {
                println!("- {}: {} != {}", i, a, b);
            }
        }

        assert_relative_eq!(
            profile.as_slice(),
            expected_profile.as_slice(),
            epsilon = 1e-3
        );
        assert_eq!(idxs.as_slice(), expected_idxs.as_slice());
    }

    #[test]
    fn test_stomp_large() {
        let x = random_data(100, 34);
        println!("x: {:?}", x);
        let res = StompMatrixProfile::calculate(x.clone(), 10);
        let expected = crate::naive::NaiveMatrixProfile::calculate(x, 10);

        for (i, (a, b)) in res
            .get_profile()
            .iter()
            .zip(expected.get_profile().iter())
            .enumerate()
        {
            if (a - b) > 1e-3 {
                println!("- {}: {} != {}", i, a, b);
            }
        }

        assert_relative_eq!(
            res.get_profile().as_slice(),
            expected.get_profile().as_slice(),
            epsilon = 1e-3
        );
        assert_eq!(
            res.get_profile_idxs().as_slice(),
            expected.get_profile_idxs().as_slice(),
        );
    }
}
