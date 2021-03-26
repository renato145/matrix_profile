//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

use matrix_profile_wasm::NaiveMatrixProfile;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn pass() {
    let x: Vec<f32> = vec![1.0, 2.0, 3.0, 4.0, 1.0, 4.0, 5.0, 12.0, 4.0, 5.0];
    let res = NaiveMatrixProfile::calculate(x, 4);
    let _profile = res.get_profile();
}
