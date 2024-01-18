
const current_year = 2024
const current_month = 1
const current_day = 1
const pivot_year = 24 + 15 // Should give enough margin for expiry year

export const johnny = {
    // SILVERHAND<<JOHNNY<<<<<<<<<<<<<<<<<<<<<
    name: [
        0x53,0x49,0x4c,0x56,0x45,0x52,0x48,0x41,0x4e,0x44,0x3c,0x3c,0x4a,0x4f,0x48,0x4e,
        0x4e,0x59,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,
        0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c],
    nationality: [0x43,0x59,0x42], // CYB
    expiry: [0x33,0x30,0x30,0x31,0x30,0x31], // 300101 (1st Jan 2030)
    current_date_fields: [current_year,current_month,current_day,pivot_year],
    // P<CYBSILVERHAND<<JOHNNY<<<<<<<<<<<<<<<<<<<<<PA12345<<8CYB8811167M300101912345<<<<<<<<<94
    dg1: [
        0x61,0x5b,0x5f,0x1f,0x58,0x50,0x3c,0x43,0x59,0x42,0x53,0x49,0x4c,0x56,0x45,0x52,
        0x48,0x41,0x4e,0x44,0x3c,0x3c,0x4a,0x4f,0x48,0x4e,0x4e,0x59,0x3c,0x3c,0x3c,0x3c,
        0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,
        0x3c,0x50,0x41,0x31,0x32,0x33,0x34,0x35,0x3c,0x3c,0x38,0x43,0x59,0x42,0x38,0x38,
        0x31,0x31,0x31,0x36,0x37,0x4d,0x33,0x30,0x30,0x31,0x30,0x31,0x39,0x31,0x32,0x33,
        0x34,0x35,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x3c,0x39,0x34],
    dg15: [
        0x6f,0x81,0xa2,0x30,0x81,0x9f,0x30,0x0d,0x06,0x09,0x2a,0x86,0x48,0x86,0xf7,0x0d,
        0x01,0x01,0x01,0x05,0x00,0x03,0x81,0x8d,0x00,0x30,0x81,0x89,0x02,0x81,0x81,0x00,
        // Pubkey start
        0x81,0xa9,0x7a,0x0d,0x65,0x2f,0xa2,0x68,0xd2,0x78,0xa6,0x38,0x18,0xe0,0x8a,0xd4,
        0x59,0x03,0xeb,0xa9,0x32,0x38,0x31,0x72,0x35,0x6b,0x2c,0xfe,0x8e,0xfa,0xba,0x85,
        0xd1,0xe5,0xea,0x31,0x4f,0xd7,0x87,0x11,0xa5,0xb7,0x38,0x5c,0xd7,0x63,0xbb,0xbe,
        0xbd,0x4c,0x32,0x0a,0x91,0x47,0x61,0xc9,0x11,0x93,0xcd,0xd4,0xa8,0x28,0xe1,0xcf,
        0x83,0x83,0x7e,0xee,0x73,0xcd,0x89,0x46,0xf0,0x36,0xfc,0x68,0xc9,0x7c,0x64,0xfa,
        0x19,0xfc,0x96,0x9f,0x1c,0x7d,0x2a,0xd0,0xd8,0x20,0xf4,0xd4,0x6f,0xbf,0x43,0x1b,
        0x9a,0x9e,0x93,0xfd,0x4c,0xd1,0xdc,0x61,0x1e,0x1b,0x29,0x7c,0xe6,0x11,0x7b,0x38,
        0xb5,0x79,0x2c,0xcb,0xb7,0xf6,0xbb,0x48,0xea,0x80,0xd5,0x87,0x16,0xc4,0xa6,0xa1,
        // Pubkey end
        0x02,0x03,0x01,0x00,0x01,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
    ],
    dg15_len: 165,
    // PKCS #7 signed data (DER encoded ASN.1 structure)
    signed_hashes: [
        0x30,0x81,0x87,0x02,0x01,0x00,0x30,0x0b,0x06,0x09,0x60,0x86,0x48,0x01,0x65,0x03,
        0x04,0x02,0x01,0x30,0x75,0x30,0x25,0x02,0x01,0x01,0x04,0x20,0x9f,0x17,0x38,0xf9,
        0x80,0xbf,0xe6,0xd8,0x0c,0x4c,0xe8,0xa6,0xcb,0xf8,0xac,0x94,0x78,0xab,0x99,0x73,
        0x1e,0x7e,0x48,0xf0,0x4f,0x2c,0xf4,0x13,0x44,0xf4,0x1e,0xae,0x30,0x25,0x02,0x01,
        0x02,0x04,0x20,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x30,0x25,0x02,0x01,0x0f,0x04,0x20,0xb3,0xd3,0xf5,0x10,0x1c,0x33,
        0x05,0x93,0x2c,0x96,0xd3,0xca,0x20,0xf9,0x80,0xb9,0x83,0x49,0x1d,0xb3,0x2a,0x93,
        0xfa,0x6f,0x7c,0x13,0x74,0x78,0xb6,0x91,0x90,0x46,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
    signed_hashes_len: 138,
    signed_hashes_dg1_hash_offset: 28,
    signed_hashes_dg15_hash_offset: 106,
    // Signed attributes (DER encoded ASN.1 structure)
    signed_attributes: [
        0x31,0x48,0x30,0x15,0x06,0x09,0x2a,0x86,0x48,0x86,0xf7,0x0d,0x01,0x09,0x03,0x31,
        0x08,0x06,0x06,0x67,0x81,0x08,0x01,0x01,0x01,0x30,0x2f,0x06,0x09,0x2a,0x86,0x48,
        0x86,0xf7,0x0d,0x01,0x09,0x04,0x31,0x22,0x04,0x20,0x81,0xdd,0x40,0xb6,0x2f,0x65,
        0x19,0x38,0xe9,0x65,0x5b,0xa7,0x97,0x85,0xfc,0x7a,0x5e,0x78,0x68,0xdd,0x46,0xd4,
        0xc6,0x08,0x28,0xb1,0xdb,0x75,0x48,0xbb,0x48,0x6c,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
    signed_attributes_len: 74,
    signed_attributes_signed_hashes_hash_offset: 42,
    sig_decrypted_signed_attributes_hash_offset: 3, // Only 3 when only the first 35 bytes are converted for checking via to_bytes_first_x()
    // Document Security Object (SOD) signature
    sod_sig: [
        0x35,0x0f,0x94,0xab,0x11,0x96,0x29,0x31,0xf3,0xeb,0xd5,0xc9,0xa4,0x23,0xce,0x91,
        0x7a,0x90,0x56,0x03,0xbe,0xb2,0xa0,0x6f,0x0e,0x8f,0xfd,0x75,0x05,0xa9,0x61,0xd6,
        0x0a,0xa6,0xd6,0x54,0x51,0x75,0x70,0x90,0x52,0x42,0x66,0xee,0x83,0xd5,0x26,0xdc,
        0x0c,0x55,0x69,0x61,0xa5,0xa8,0x16,0x90,0xf4,0xd5,0x08,0xdf,0xc0,0x41,0xda,0x41,
        0x16,0xc2,0xf3,0xef,0x00,0xc4,0x8a,0xfd,0x59,0xc5,0xca,0x53,0xc3,0xab,0xca,0x21,
        0xf4,0xe8,0x75,0x5c,0x28,0x4f,0x12,0xca,0x16,0xfc,0x25,0x8d,0xc6,0x9f,0x11,0x45,
        0xf5,0xc8,0xc7,0x96,0x1f,0xd3,0x7a,0x1a,0x43,0x6e,0xd7,0x63,0x52,0x9a,0x70,0x14,
        0xe1,0x2f,0xf9,0x89,0x92,0x3f,0x95,0x49,0x3f,0xd5,0xb7,0xaa,0xdb,0xa0,0x59,0xc4,
        0xdb,0xa4,0xe9,0xe2,0x07,0xd3,0x51,0x60,0x5a,0x86,0xe1,0x89,0x54,0xa6,0x6b,0xb4,
        0xea,0xf8,0xaa,0x42,0x5d,0x0f,0xd2,0x9b,0xda,0x67,0xad,0xf0,0xc0,0x2f,0x06,0x23,
        0xcd,0x31,0x96,0x5a,0xb5,0x27,0xa3,0xf0,0xe7,0x1b,0x8d,0xb7,0x59,0xeb,0xc3,0x26,
        0xae,0xf1,0xf2,0xbd,0xcd,0x41,0x1a,0x6d,0x5c,0x18,0xc9,0x55,0x4d,0x40,0x3d,0x0f,
        0x15,0xbd,0x6f,0xf3,0x8f,0xfa,0xc9,0xa0,0x8a,0x60,0x10,0x0d,0xc0,0x06,0x1e,0x61,
        0xb5,0xf8,0x44,0x8e,0x94,0x66,0xba,0x69,0x0f,0x91,0x9e,0xbd,0x51,0x52,0xf3,0xfa,
        0xdf,0x62,0x51,0x17,0x28,0x9e,0x95,0x49,0x8e,0xf7,0x3f,0x8f,0xdd,0x84,0x01,0x8b,
        0x05,0xec,0xf8,0x9a,0x24,0xa4,0xdf,0x1f,0x0c,0x36,0x26,0x66,0x6f,0x0f,0x62,0x8b],
    sod_pubkey: [
        0x86,0xa9,0xef,0x08,0x1c,0x5f,0x54,0xea,0xd1,0x56,0x57,0xa2,0x82,0x13,0x33,0xbb,
        0xe2,0x28,0xad,0x21,0x2b,0xbb,0x5c,0x2d,0x35,0x4c,0x27,0x06,0x59,0x88,0x28,0x05,
        0x99,0x11,0x50,0x7f,0xfb,0x7f,0xa2,0x72,0xc7,0xd7,0xd9,0x87,0x17,0x9f,0x4f,0xc3,
        0xfd,0x18,0xdd,0x57,0x7f,0x24,0xf3,0x56,0xb5,0xa8,0xec,0x7f,0x13,0xb3,0xa0,0xb6,
        0xde,0xce,0xda,0x2f,0x1f,0xca,0x01,0x9f,0x25,0xc6,0x2d,0x18,0xd3,0xb2,0x31,0xeb,
        0xb4,0xc9,0x56,0x49,0x2a,0xd7,0x6d,0xfe,0x7c,0x8d,0x53,0x07,0x6d,0xc5,0x0f,0x11,
        0xa0,0x92,0x8d,0xd0,0x9e,0xac,0xcd,0x7f,0x2f,0xb3,0xfd,0x91,0x10,0x9c,0x79,0x40,
        0xc2,0x0b,0xb5,0x94,0x2a,0x5b,0xf2,0xf0,0x2f,0x27,0x23,0x50,0xd2,0x63,0xf5,0x85,
        0x50,0x13,0x9a,0x75,0x4f,0x2d,0x50,0xd7,0xf3,0x7f,0x39,0x33,0xfd,0x95,0xa1,0xd1,
        0x61,0x2f,0x9e,0x0b,0x86,0xdb,0xf6,0x7c,0x8b,0xed,0x9f,0x9f,0x87,0xd1,0x36,0x89,
        0xcb,0x5e,0x10,0xda,0xc9,0x60,0x73,0x06,0xce,0x8f,0xeb,0x65,0x42,0x36,0x55,0x75,
        0xc0,0xc1,0xa7,0x3c,0x8d,0x30,0x7f,0x62,0x33,0xfe,0x4c,0x32,0x6c,0x15,0x20,0xfc,
        0xb4,0x4a,0x59,0x58,0x5f,0xa9,0xca,0x56,0xd1,0xc0,0x65,0x66,0x2a,0x6d,0xb7,0x4e,
        0x22,0x98,0xec,0x52,0xd7,0x3b,0x52,0x25,0x42,0xea,0xcb,0x6e,0xf2,0x85,0x05,0xa0,
        0x2b,0x0c,0x8a,0x63,0x53,0xc9,0x22,0xbc,0x53,0x45,0x9f,0x42,0x03,0x44,0x37,0x32,
        0x51,0x56,0x35,0xa4,0xe5,0x46,0xd8,0xac,0xf3,0x24,0xfc,0x96,0xc3,0x79,0x5b,0x63],
    sod_final_e: [
        0x4f,0xa9,0x31,0x11,0xb9,0xc6,0x94,0x6d,0xc1,0x45,0xa2,0x78,0x72,0x3a,0xf6,0x3a,
        0xb3,0x7f,0x83,0xf2,0x16,0x63,0x38,0x7e,0x97,0xc3,0x79,0x3e,0x66,0x02,0xbb,0x31,
        0xc7,0x18,0x9b,0x75,0x8b,0xba,0x81,0x04,0x58,0x7a,0x50,0x20,0x86,0xf8,0x81,0xb4,
        0x58,0xbf,0x6d,0xd8,0x40,0x47,0x0b,0x45,0xf3,0x89,0x00,0x91,0x6b,0x07,0xd5,0x90,
        0x06,0xc1,0xef,0x54,0xc4,0x77,0x27,0xf0,0xae,0xa3,0x82,0x9d,0x05,0x49,0x15,0xf6,
        0x40,0xf4,0xf9,0xbc,0xee,0x38,0x12,0x91,0x8e,0xbe,0x77,0x6a,0x05,0x70,0x38,0x37,
        0x65,0x62,0x08,0xb9,0x9b,0xa6,0x58,0x58,0x1b,0x2d,0x97,0xae,0x28,0x28,0xae,0xc9,
        0x55,0xbf,0xc6,0xc1,0x7b,0x86,0x38,0x8c,0x81,0xbe,0x79,0xe7,0x2a,0x67,0xa1,0x95,
        0xa4,0xb0,0x64,0x90,0x33,0x00,0x06,0x0f,0x4f,0x1c,0xc7,0x28,0x45,0x10,0xec,0x79,
        0xda,0xb4,0x32,0xd8,0xab,0xb1,0x4e,0x3f,0xbd,0xde,0x30,0x79,0x7e,0x35,0x7d,0xbc,
        0x28,0x83,0x1b,0xb6,0xce,0x82,0x1e,0xf6,0xce,0x43,0x42,0xe1,0xe0,0x80,0x8f,0x06,
        0x19,0x75,0xe3,0x6b,0x64,0x55,0xca,0x60,0x5c,0xd2,0x3b,0x31,0x21,0x81,0x6a,0xef,
        0xd6,0x84,0xa7,0xa1,0x5c,0x6b,0x55,0xf3,0x06,0x1a,0x2a,0xb5,0xea,0x21,0x41,0x4c,
        0x35,0xa0,0x14,0xd0,0x6b,0x8f,0x14,0x0b,0xbe,0x8d,0x15,0xbb,0xe0,0x49,0x98,0xe3,
        0xed,0xfa,0xe2,0x26,0x18,0x1b,0xa0,0x54,0xe9,0x36,0xe5,0xd3,0x1c,0x96,0x3d,0x4f,
        0xa2,0x4f,0x1c,0xb5,0xbe,0x6e,0xea,0x44,0xdf,0xae,0x67,0x13,0xfd,0x62,0x3a,0x7e],
    sod_sig_quotient: [
        0x1f,0x63,0x6b,0xbc,0x79,0xd1,0x87,0x3d,0x78,0xc6,0xc8,0x18,0x0a,0x46,0x70,0x4a,
        0xc3,0x0d,0x5f,0xaa,0xd0,0xc6,0xc1,0x0b,0x2c,0xb2,0xe3,0x4e,0xe7,0x78,0xd1,0xc3,
        0x6b,0xad,0x49,0x6b,0x84,0x7b,0xe5,0x46,0x5f,0xc8,0x30,0xd5,0xae,0x3d,0x5e,0x2b,
        0xa0,0xfe,0x3d,0xdc,0xc0,0x1d,0x82,0x6e,0x81,0x47,0x67,0x5e,0xc1,0xa9,0x81,0x11,
        0xae,0xfc,0xb7,0xf9,0x6b,0x25,0x9b,0x1f,0x7b,0x06,0xfe,0x69,0x4b,0x10,0x82,0x75,
        0xd3,0xa1,0x34,0x56,0x82,0xff,0xa3,0x11,0x37,0x0f,0x67,0x62,0xea,0x49,0x73,0xf0,
        0xd7,0xc1,0x9a,0xf8,0xe6,0xf9,0x8c,0x99,0x84,0xa0,0x49,0x18,0xe0,0x96,0x01,0x13,
        0x6b,0x95,0x28,0x71,0x3f,0x5d,0xc1,0xad,0x2e,0xcb,0x25,0x2d,0x07,0xc4,0xca,0x92,
        0xdb,0xb2,0x59,0x71,0x9a,0x5a,0x38,0x48,0x23,0x1a,0x03,0x61,0x33,0x87,0xec,0x6e,
        0xad,0xc8,0xbc,0xe3,0x54,0x74,0x6f,0x9b,0x35,0x8d,0xbb,0x2c,0xa0,0xe2,0x22,0x0c,
        0x93,0x23,0xf1,0x35,0xfc,0x02,0xff,0xf5,0x5d,0xab,0x14,0x66,0x36,0x79,0x26,0x33,
        0x97,0xef,0x1c,0xbf,0x96,0x07,0x92,0x2d,0x08,0x8a,0xd1,0x1b,0x3e,0xba,0x1c,0x08,
        0x98,0xe2,0x11,0x1a,0x1a,0xa2,0x9f,0xad,0x84,0x81,0x2d,0x08,0x5b,0xd1,0xaa,0xe3,
        0x55,0x04,0xbb,0x34,0xde,0x07,0xd9,0x99,0x83,0xae,0xa2,0x19,0xcd,0x5d,0xc7,0xdd,
        0x30,0x50,0x66,0x7a,0x5d,0x80,0x43,0xc3,0x93,0x11,0xa2,0x7e,0xe3,0x7f,0x87,0x5c,
        0xc9,0x00,0x96,0x57,0x5c,0x1d,0xe0,0xe9,0xf0,0xb9,0x5c,0x1c,0xa3,0x4b,0x60,0xc2],
    // ActiveAuth signature
    active_auth_dg15_pubkey_offset: 32,
    active_auth_sig: [
        0x59,0x3b,0x77,0xe7,0xc0,0xd3,0x09,0x0d,0x6f,0xea,0xe5,0x69,0x3c,0x44,0x6e,0x23,
        0x37,0x9a,0xeb,0xde,0x57,0xc8,0xc2,0x18,0x80,0x5d,0xf6,0x85,0x0c,0x52,0x4a,0x99,
        0x43,0x36,0x6a,0x76,0xd5,0xe6,0x86,0xd3,0x96,0x92,0xe1,0xad,0xb6,0x7b,0xa7,0x37,
        0xc4,0x29,0xcb,0x17,0xfb,0xcd,0x09,0x59,0x4e,0xf8,0xbb,0x45,0x35,0x32,0x6c,0x2e,
        0x0a,0xea,0x9b,0xfd,0x21,0xcf,0xb2,0x47,0x83,0x25,0x2f,0xac,0xc4,0x63,0x43,0xde,
        0x48,0x69,0x4f,0xa0,0xda,0x70,0xf6,0xd9,0xe0,0xb8,0x6f,0xb3,0xbd,0x54,0x70,0x8d,
        0x0f,0x7e,0x65,0x60,0x06,0xac,0x4a,0x08,0x37,0x7e,0x2d,0xc4,0xfa,0x84,0x2a,0x8a,
        0xbb,0xd9,0x3b,0x6f,0x45,0xca,0x04,0x7f,0x40,0xf7,0x7e,0x51,0x64,0xe0,0x23,0x46],
    active_auth_final_e: [
        0x76,0x52,0xa4,0x34,0x67,0x65,0x5f,0x8d,0x91,0xf7,0xbf,0x95,0x3a,0x3c,0xd3,0xa0,
        0xc3,0x8b,0x0d,0x33,0x07,0x3c,0x30,0x4a,0x43,0xb7,0xdd,0x5f,0xee,0xdf,0xc6,0xd2,
        0xf9,0x9a,0x6c,0x6f,0xce,0x5a,0x61,0x8e,0xe6,0x63,0x62,0xa4,0x90,0xa7,0x75,0x64,
        0xf5,0x40,0x1f,0xc3,0x47,0xc6,0x86,0x14,0xfa,0x39,0x58,0xa7,0x3d,0xa0,0x75,0xa5,
        0x0e,0x90,0x5a,0xe0,0x2a,0xf1,0x6f,0x9b,0xfd,0xb5,0x4a,0xe1,0xb3,0xd2,0xa3,0x70,
        0x9f,0xf0,0xab,0x29,0xfa,0x18,0xbb,0x5a,0x3d,0x58,0xf0,0xc2,0xb6,0x2b,0x6a,0xaf,
        0x1b,0x39,0x62,0x79,0x97,0xf1,0x0f,0x39,0x9e,0x9c,0x3e,0x56,0x97,0xe7,0xdb,0x21,
        0x9f,0x56,0x4f,0x2e,0xc4,0xff,0x2c,0xe2,0x3b,0x38,0x39,0xa1,0xcb,0xf6,0xa1,0xff],
    active_auth_sig_quotient: [
        0x51,0x6d,0xc3,0x04,0x87,0xa8,0xc7,0x1c,0x4d,0xe7,0x66,0xab,0x26,0x60,0x6c,0x6c,
        0x47,0x4e,0x6d,0x0d,0x5a,0x05,0xc3,0x8f,0x65,0xf4,0x60,0x30,0x2f,0xc8,0x7c,0x6d,
        0xeb,0xbf,0x05,0x1c,0x1b,0x3d,0x01,0x52,0x61,0x61,0x67,0x5b,0xb2,0x2c,0xa6,0xb4,
        0x2a,0xce,0x0c,0x65,0xe6,0x7d,0xaa,0x51,0xf8,0x98,0x36,0xc9,0x0d,0xd6,0x07,0xb7,
        0xb7,0xae,0xff,0xdc,0x33,0x25,0x11,0x6f,0x63,0x98,0x57,0x86,0x76,0x92,0xc3,0x42,
        0xfa,0x14,0x45,0xfb,0x4b,0x1f,0x37,0x2a,0xce,0xa5,0x7c,0x55,0x9e,0x9e,0x94,0x85,
        0x3e,0x8c,0xc5,0x9b,0xc9,0x7b,0x83,0xe2,0x8f,0x7c,0x0d,0x8b,0x2a,0x9c,0xaf,0xaf,
        0x56,0xac,0x8a,0x30,0x9d,0xd4,0xf6,0xdb,0x39,0x24,0x28,0x23,0xf1,0x23,0x6e,0x3e],
    active_auth_challenge: [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08],
    // Allowed certificate pubkeys merkle tree
    // The cert_pubkeys_mtree_root capsule here is ignored if set in the slow tree by an admin
    cert_pubkeys_mtree_root: 0x1281be6251b0c14f70d42165ee9a26c45685b9a151e0e79336191bb8fb560b19n,
    cert_pubkeys_mtree_index: 0,
    cert_pubkeys_mtree_hashpath: [
      0x2df8b940e5890e4e1377e05373fae69a1d754f6935e6a780b666947431f2cdcdn,
      0x0ae10b4fc8200c0d61ab3b00570ecf3df60c2e4679ee4c5bfb01fc0f69fa623en,
      0x24851dc3db043e149ed2860f355ae632e1ec3ce5475080c12789d7cee84af219n,
      0x141548713c20d60ae4383d4652e09b1b9a1b39f4ed6353a3c0367b8ec9180b69n,
      0x2ecf57a46782cea2f32ed1b8d988f814faabb498d336b3544b2a3be3c69ccd14n,
      0x0d459c69f13c5b1d60cc66d2cf7e9f4cde2eb65f5aee3b739f855f7363ead9d0n,
      0x1d09fb6ea6b09152bd8d3283c5a5cb8a212478ad6f56e1f7b3e388f6bff205e4n,
      0x2bb51b043a79e2e96db5c8428ce281d48a62ca303db0a98a156c67ea5c3d1314n
    ],
    // Allowed countries merkle tree
    // The countries_mtree_root capsule here is ignored if set in the slow tree by an admin
    countries_mtree_root: 0x0dd9d5b6db78ee2e4e93254bb7707af58f75bf50706c7ea9ba904c8a9fe506e5n,
    countries_mtree_index: 23,
    countries_mtree_hashpath: [
        0x0000000000000000000000000000000000000000000000000000000000435249n,
        0x2b507018bf167945cd40e9d189eebd17947e923679d47c8ff39005ec75bec19fn,
        0x07cf67991087ea378ff64968f6048f0086a0464e1c25c91e46bf9bfba194a78fn,
        0x1f841d58b08dd158e82270bf6fda09d8f9c40c1edb6dbd70aa2968ea22e985e6n,
        0x1e80b14a13092c98e18e16338f3ea3e5d49b7be96024549c88a4d0acebf3248an,
        0x251754b7a4e5caaeaa65d24411b422c8e8c7092e3dc03cad7e3ad999cfb9b076n,
        0x0f54eac0786dd36ada1d346a15536ed227bc539f761938d5331862e6607b8175n,
        0x2bb51b043a79e2e96db5c8428ce281d48a62ca303db0a98a156c67ea5c3d1314n
    ],
}

export const johnny_capsule_data = [
    johnny.name,
    johnny.nationality,
    johnny.expiry,
    johnny.current_date_fields,
    johnny.dg1,
    johnny.dg15,
    johnny.dg15_len,

    johnny.signed_hashes,
    johnny.signed_hashes_len,
    johnny.signed_hashes_dg1_hash_offset,
    johnny.signed_hashes_dg15_hash_offset,

    johnny.signed_attributes,
    johnny.signed_attributes_len,
    johnny.signed_attributes_signed_hashes_hash_offset,
    johnny.sig_decrypted_signed_attributes_hash_offset,

    johnny.sod_sig,
    johnny.sod_pubkey,
    johnny.sod_final_e,
    johnny.sod_sig_quotient,

    johnny.cert_pubkeys_mtree_root,
    johnny.cert_pubkeys_mtree_index,
    johnny.cert_pubkeys_mtree_hashpath,

    johnny.countries_mtree_root,
    johnny.countries_mtree_index,
    johnny.countries_mtree_hashpath,
]

export const johnny_capsule_data_active_auth = [
    johnny.name,
    johnny.nationality,
    johnny.expiry,
    johnny.current_date_fields,
    johnny.dg1,
    johnny.dg15,
    johnny.dg15_len,

    johnny.signed_hashes,
    johnny.signed_hashes_len,
    johnny.signed_hashes_dg1_hash_offset,
    johnny.signed_hashes_dg15_hash_offset,

    johnny.signed_attributes,
    johnny.signed_attributes_len,
    johnny.signed_attributes_signed_hashes_hash_offset,
    johnny.sig_decrypted_signed_attributes_hash_offset,

    johnny.sod_sig,
    johnny.sod_pubkey,
    johnny.sod_final_e,
    johnny.sod_sig_quotient,

    johnny.active_auth_dg15_pubkey_offset,
    johnny.active_auth_sig,
    johnny.active_auth_final_e,
    johnny.active_auth_sig_quotient,

    johnny.active_auth_challenge,

    johnny.cert_pubkeys_mtree_root,
    johnny.cert_pubkeys_mtree_index,
    johnny.cert_pubkeys_mtree_hashpath,

    johnny.countries_mtree_root,
    johnny.countries_mtree_index,
    johnny.countries_mtree_hashpath,
]
