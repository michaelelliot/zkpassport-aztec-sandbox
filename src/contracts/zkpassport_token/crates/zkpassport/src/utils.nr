use dep::std::hash::sha256;

pub fn arr_copy_u8_to_field<N>(src: [u8; N]) -> [Field; N] {
    let mut dst: [Field; N] = [0; N];
    for i in 0..src.len() {
        dst[i] = src[i] as Field;
    }
    dst
}

unconstrained
pub fn unsafe_copy_bytes<M,D>(src: [u8; M], start_offset: u16, len: u16) -> [u8; D] {
    let mut dst: [u8; D] = [0; D];
    for i in 0..D {
        let mut index = i + start_offset;
        let mut copy_char = src[index];
        if i >= len {
            copy_char = 0x00;
        }
        dst[i] = copy_char;
    }
    dst
}

pub fn copy_bytes<M,D>(src: [u8; M], start_offset: u16, len: u16) -> [u8; D] {
    let mut dst: [u8; D] = [0; D];
    for i in 0..D {
        let mut index = i + start_offset;
        let mut copy_char = src[index];
        if i >= len {
            copy_char = 0x00;
        }
        dst[i] = copy_char;
    }
    dst
}

pub fn copy_from_msg<M,D>(msg: [u8; M], start_offset: u16, len: u16) -> [u8; D] {
    let mut dst: [u8; D] = [0; D];
    for i in 0..D {
        let mut index = i + start_offset;
        let mut copy_char = msg[index];
        if i >= len {
            copy_char = 0x00;
        }
        dst[i] = copy_char;
    }
    dst
}

fn copy_from_msg_x<M,D>(msg: [u8; M]) -> [u8; D] {
    let mut dst: [u8; D] = [0; D];
    for i in 0..D {
        dst[i] = msg[i];
    }
    dst
}

pub fn copy_from_msg_x_offset<M,D>(msg: [u8; M], offset: u16) -> [u8; D] {
    let mut dst: [u8; D] = [0; D];
    for i in 0..D {
        dst[i] = msg[i + offset];
    }
    dst
}

pub fn copy_bytes_src_offset<M,D>(src: [u8; M], mut dst: [u8; D], offset: u16, len: u16) -> [u8; D] {
    for i in 0..D {
        let mut index = i + offset;
        let mut copy_char = src[index];
        if i >= len {
            copy_char = 0x00;
        }
        dst[i] = copy_char;
    }
    dst
}

pub fn copy_bytes_dest_offset<M,D>(src: [u8; M], mut dst: [u8; D], offset: u16, len: u16) -> [u8; D] {
    for i in 0..D {
        let mut index = i;
        let mut copy_char = src[index];
        if i >= len {
            copy_char = 0x00;
        }
        dst[i + offset] = copy_char;
    }
    dst
}

pub fn sha256_size<M>(m: [u8; M], length: u16) -> [u8; 32] {
    // signed_hashes
    if length == 138 { let msg: [u8; 138] = copy_from_msg_x(m); sha256(msg) }
    else if length == 140 { let msg: [u8; 140] = copy_from_msg_x(m); sha256(msg) }
    else if length == 233 { let msg: [u8; 233] = copy_from_msg_x(m); sha256(msg) }
    // signed_attributes
    else if length == 74 { let msg: [u8; 74] = copy_from_msg_x(m); sha256(msg) }
    else if length == 150 { let msg: [u8; 150] = copy_from_msg_x(m); sha256(msg) }
    // // dg15
    else if length == 165 { let msg: [u8; 165] = copy_from_msg_x(m); sha256(msg) }
    else if length == 298 { let msg: [u8; 298] = copy_from_msg_x(m); sha256(msg) }
    else {
        let digest: [u8; 32] = [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];
        digest
    }
}

pub fn calculate_nullifier<M>(msg: [u8; M]) -> Field {
    let mut castedMsg: [Field; M] = [0; M];
    for i in 0..M {
        castedMsg[i] = msg[i] as Field;
    }
    let nullifier = dep::std::hash::pedersen_hash(castedMsg);
    nullifier
}

pub fn get_year_difference(from_year: u16, from_month: u16, from_day: u16, to_year: u16, to_month: u16, to_day: u16) -> u16 {
    // to_* date must be after from_* date
    assert(to_year >= from_year);
    if to_year == from_year {
        assert(to_month >= from_month);
        if to_month == from_month {
            assert(to_day >= from_day);
        }
        0
    } else {
        if to_month < from_month {
            to_year - from_year - 1
        }
        else if to_day < from_day {
            to_year - from_year - 1
        }
        else {
            to_year - from_year
        }
    }
}

#[test]
fn test_get_year_difference() {
    let year_diff = get_year_difference(1999, 4, 1, 2023, 4, 1);
    assert(year_diff == 24);
    let year_diff = get_year_difference(1999, 4, 1, 2023, 3, 31);
    assert(year_diff == 23);
}

fn convert_string_to_u16<N>(dob: [u8; N]) -> u16 {
    let mut num: u16 = 0;
    for i in 0..N {
        // ASCII char must be 0-9
        assert(dob[i] > 47);
        assert(dob[i] < 58);
        num += 10.pow_32(N-i-1) as u16 * (dob[i] as u16 - 48);
    }
    num
}

fn convert_string_to_u32<N>(dob: [u8; N]) -> u32 {
    let mut num: u32 = 0;
    for i in 0..N {
        // ASCII char must be 0-9
        assert(dob[i] > 47);
        assert(dob[i] < 58);
        num += 10.pow_32(N-i-1) as u32 * (dob[i] as u32 - 48);
    }
    num
}

/// Returns the parts of a short date string YY-MM-DD using a pivot_year to determine which century prefix to use
pub fn convert_short_date_string_to_parts(date: [u8; 6], pivot_year_short: u16) -> (u16, u16, u16) {
    let year_short: u16 = convert_string_to_u16([date[0], date[1]]);
    let year: u16 = year_short + if year_short > pivot_year_short {
        1900
    } else {
        2000
    };
    let month: u16 = convert_string_to_u16([date[2], date[3]]);
    let day: u16 = convert_string_to_u16([date[4], date[5]]);

    (year, month, day)
}

#[test]
fn test_convert_short_date_string_to_parts() {
    let pivot_year: u16 = 24;
    let short_date_string: [u8; 6] = str_to_u8_array(["8", "5", "0", "4", "0", "1"]);
    // let short_date_string: [u8; 6] = str_to_u8_array("850401");
    let (dob_year, dob_month, dob_day) = convert_short_date_string_to_parts(short_date_string, pivot_year);
    assert(dob_year == 1985);
    assert(dob_month == 4);
    assert(dob_day == 1);
}

fn str_to_u8_array<S,M>(string: [str<1>; S]) -> [u8; M] {
    let mut u8_array: [u8; M] = [0; M];
    for i in 0..string.len() {
        u8_array[i] = string[i].as_bytes()[0];
    };
    u8_array
}

pub fn verify_date1_earlier_than_date2(date1: (u16, u16, u16), date2: (u16, u16, u16)) -> bool {
    if date1.0 < date2.0 {
        true
    }
    else if date1.0 > date2.0 {
        false
    }
    // date1.0 == date2.0
    else {
        if date1.1 < date2.1 {
            true
        }
        else if date1.1 > date2.1 {
            false
        }
        // date1.1 == date2.1
        else {
            if date1.2 < date2.2 {
                true
            }
            else if date1.2 > date2.2 {
                false
            }
            // date1.2 == date2.2
            else {
                false
            }
        }
    }
}

#[test]
fn test_verify_date1_earlier_than_date2() {
    assert(verify_date1_earlier_than_date2((2000, 1, 1), (2001, 1, 1)) == true);
    assert(verify_date1_earlier_than_date2((2000, 1, 1), (2000, 2, 1)) == true);
    assert(verify_date1_earlier_than_date2((2000, 1, 1), (2000, 1, 2)) == true);
    assert(verify_date1_earlier_than_date2((2000, 1, 1), (2000, 1, 1)) == false);
    assert(verify_date1_earlier_than_date2((2001, 1, 1), (2000, 1, 1)) == false);
    assert(verify_date1_earlier_than_date2((2000, 2, 1), (2000, 1, 1)) == false);
    assert(verify_date1_earlier_than_date2((2000, 1, 2), (2000, 1, 1)) == false);
}

fn u32_to_u8(num: u32) -> [u8; 4] {
    let mut result: [u8; 4] = [0; 4];
    for i in 0..4 {
        result[i] = (num >> (24 - (i * 8))) as u8;
    }
    result
}

fn bytes_to_u32(bytes: [u8; 4]) -> u32 {
    bytes[0] as u32 << 24 | bytes[1] as u32 << 16 | bytes[2] as u32 << 8 | bytes[3] as u32
}
