use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion};
use matrix_profile::{MatrixProfile, NaiveMatrixProfile, StompMatrixProfile};
use rand::{distributions::Uniform, Rng, SeedableRng};
use rand_chacha::ChaCha8Rng;

pub fn random_data(n: usize, seed: u64) -> Vec<f32> {
    let rng = ChaCha8Rng::seed_from_u64(seed);
    rng.sample_iter(Uniform::new_inclusive(0.0, 100.0))
        .take(n)
        .collect::<Vec<_>>()
}

pub fn criterion_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("Matrix profile");
    group.sample_size(10);

    for n in [500, 1000, 2000].iter() {
        group.bench_with_input(BenchmarkId::new("Naive", n), n, |b, &n| {
            b.iter(|| NaiveMatrixProfile::calculate(random_data(n, 34), 100))
        });
        group.bench_with_input(BenchmarkId::new("Stump", n), n, |b, &n| {
            b.iter(|| StompMatrixProfile::calculate(random_data(n, 34), 100))
        });
    }
    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
