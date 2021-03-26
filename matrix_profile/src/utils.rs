use ndarray::{prelude::*, Data, ScalarOperand};
use num_traits::{Float, FromPrimitive};
use std::cmp::Ordering;

/// Normalizes an array sing mean and std.
pub fn normalize<T>(x: Array1<T>) -> Array1<T>
where
    T: Float + FromPrimitive + ScalarOperand + Default,
{
    let means = x.mean().unwrap();
    let stds = x.std_axis(Axis(0), Default::default());
    (x - means) / stds
}

/// Calculates euclidean distance between 2 arrays.
pub fn euclidean_distance<T: Float>(a: &Array1<T>, b: &Array1<T>) -> T {
    let distance = (a - b).mapv(|o| o.powi(2)).sum().sqrt();
    distance
}

pub trait ArgminSkipZero<A, S>
where
    S: Data<Elem = A>,
{
    /// Finds the index of the minimum value of the array skipping NaN values and zeroes.
    fn argmin_skipzero(&self) -> usize;
}

impl<A, S> ArgminSkipZero<A, S> for ArrayBase<S, Ix1>
where
    S: Data<Elem = A>,
    A: Float + Default,
{
    fn argmin_skipzero(&self) -> usize {
        let (idx, _) = self
            .iter()
            .enumerate()
            .filter(|(_, &o)| !o.is_nan() && o > Default::default())
            .fold((0usize, A::max_value()), |a, b| {
                match a.1.partial_cmp(b.1).unwrap_or(Ordering::Less) {
                    Ordering::Greater => (b.0, *b.1),
                    _ => a,
                }
            });
        idx
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;

    #[test]
    fn test_normalize() {
        let x = Array1::from(vec![0.0, 1.0, 2.0, 3.0, 4.0]);
        let res = normalize(x);
        println!("{}", res);
        let x = Array1::from(vec![0f32, 1.0, 2.0, 3.0, 4.0]);
        let res = normalize(x);
        println!("{}", res);
    }

    #[test]
    fn test_euclidean() {
        let a = Array1::from(vec![0.0, 1.0, 2.0, 3.0, 4.0]);
        let b = Array1::from(vec![0.0, 1.0, 2.0, 3.0, 4.0]);
        let res = euclidean_distance(&a, &b);
        assert_relative_eq!(res, 0.0);
        let b = Array1::from(vec![1.0, 2.0, 3.0, 4.0, 5.0]);
        let res = euclidean_distance(&a, &b);
        assert_relative_eq!(res, 2.23, epsilon = 1e-2);
    }

    #[test]
    fn test_argmin() {
        let x = Array1::from(vec![0.0, 1.0, 2.0, 3.0, 4.0]);
        let idx = x.argmin_skipzero();
        assert_eq!(idx, 1);
        let x = Array1::from(vec![std::f64::NAN, 0.0, 2.0, 3.0, 4.0]);
        let idx = x.argmin_skipzero();
        assert_eq!(idx, 2);
    }
}
