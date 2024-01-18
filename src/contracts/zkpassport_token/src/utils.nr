mod capsule;

pub fn assert_array<T, S>(a: [T; S], b: [T; S]) {
    for i in 0..a.len() {
        assert(a[i] == b[i]);
    }
}

pub fn arr_copy_slice_to_fields<N, M>(src: [u8; N], mut dst: [Field; M], offset: Field) -> [Field; M] {
    for i in 0..dst.len() {
        dst[i] = src[i + offset] as Field;
    }
    dst
}

pub fn arr_copy_field_to_u8<N>(src: [Field; N], mut dst: [u8; N]) -> [u8; N] {
    for i in 0..dst.len() {
        dst[i] = src[i] as u8;
    }
    dst
}

pub fn arr_copy_field_to_u16<N>(src: [Field; N], mut dst: [u16; N]) -> [u16; N] {
    for i in 0..dst.len() {
        dst[i] = src[i] as u16;
    }
    dst
}

pub fn pop_capsule_field_array<N>() -> [Field; N] {
    let capsule: [Field; N] = crate::capsule::pop_capsule();
    capsule
}

pub fn pop_capsule_u8_array<N>() -> [u8; N] {
    let mut out: [u8; N] = [0; N];
    let capsule: [Field; N] = crate::capsule::pop_capsule();
    out = arr_copy_field_to_u8(capsule, out);
    out
}

pub fn pop_capsule_u16_array<N>() -> [u16; N] {
    let mut out: [u16; N] = [0; N];
    let capsule: [Field; N] = crate::capsule::pop_capsule();
    out = arr_copy_field_to_u16(capsule, out);
    out
}

pub fn pop_capsule_single() -> Field {
    let capsule: [Field; 1] = crate::capsule::pop_capsule();
    capsule[0]
}

pub fn arr_copy_slice<T, N, M>(src: [T; N], mut dst: [T; M], offset: Field) -> [T; M] {
    for i in 0..dst.len() {
        dst[i] = src[i + offset];
    }
    dst
}

pub fn field_from_bytes<N>(bytes: [u8; N], big_endian: bool) -> Field {
    assert(bytes.len() as u32 < 32, "field_from_bytes: N must be less than 32");
    let mut as_field = 0;
    let mut offset = 1;
    for i in 0..N {
        let mut index = i;
        if big_endian {
            index = N - i - 1;
        }
        as_field += (bytes[index] as Field) * offset;
        offset *= 256;
    }
    as_field
}
