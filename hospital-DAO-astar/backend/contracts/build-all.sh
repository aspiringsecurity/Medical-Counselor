#!/usr/bin/env bash

set -eu

cargo +nightly contract build --manifest-path project/Cargo.toml
cargo +nightly contract build --manifest-path project/assignment/Cargo.toml
cargo +nightly contract build --manifest-path project/employee/Cargo.toml
