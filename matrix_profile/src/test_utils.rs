use rand::{distributions::Uniform, Rng, SeedableRng};
use rand_chacha::ChaCha8Rng;

pub fn random_data(n: usize, seed: u64) -> Vec<f32> {
    let rng = ChaCha8Rng::seed_from_u64(seed);
    rng.sample_iter(Uniform::new_inclusive(0.0, 100.0))
        .take(n)
        .collect::<Vec<_>>()
}
