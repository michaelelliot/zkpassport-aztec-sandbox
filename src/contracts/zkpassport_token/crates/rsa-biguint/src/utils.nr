use crate::BITS_PER_LIMB as BITS;

// NOTE: this file is forked from https://github.com/SetProtocol/noir-rsa
// NOTE: this file is forked from https://github.com/shuklaayush/noir-bigint v0.1.0

#[builtin(from_field)]
fn from_field<T>(_x: Field) -> T {}

#[builtin(as_field)]
fn as_field<T>(_x: T) -> Field {}

pub fn wrapping_add<T>(a: T, b: T) -> T {
    from_field(as_field(a) + as_field(b))
}

pub fn wrapping_add_8<T>(a: T, b: T, c: T, d: T, e: T, f: T, g: T, h: T) -> T {
    from_field(as_field(a) + as_field(b) + as_field(c) + as_field(d) + as_field(e) + as_field(f) + as_field(g) + as_field(h))
}

pub fn wrapping_sub<T>(x: T, y: T) -> T {
    from_field(as_field(x) + 340282366920938463463374607431768211456 - as_field(y))
}

// Compute a + b + carry, returning the result and the new carry over.
// TODO: Does carry need to be a u56?
pub fn adc(a: u56, b: u56, carry: u56) -> (u56, u56) {
    let ret = a as Field + b as Field + carry as Field;
    (ret as u56, (ret as u112 >> BITS as u112) as u56)
}

// Compute a - (b + borrow), returning the result and the new borrow.
pub fn sbb(a: u56, b: u56, borrow: u56) -> (u56, u56) {
    let ret = wrapping_sub(a as u112, (b as u112 + (borrow as u112 >> (BITS as u112 - 1))));
    (ret as u56, (ret >> 56) as u56)
}

// Compute a + (b * c) + carry, returning the result and the new carry over.
pub fn mac(a: u56, b: u56, c: u56, carry: u56) -> (u56, u56) {
    let ret = (a as Field) + ((b as Field) * (c as Field)) + (carry as Field);
    (ret as u56, (ret as u112 >> BITS as u112) as u56)
}
