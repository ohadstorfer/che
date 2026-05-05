#!/usr/bin/env node
/**
 * Generate solid-color PNG icons for the Che app without any image deps.
 * Writes:
 *   ./public/icon-192.png
 *   ./public/icon-512.png
 *   ./assets/icon.png         (1024)
 *   ./assets/splash.png       (1242x2208 portrait, off-white bg)
 *
 * Replace these later with branded artwork — they are real PNGs so the
 * build will not error.
 */

import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import zlib from "node:zlib";

const ROOT = resolve(process.argv[2] || ".");

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function solidPng(width, height, [r, g, b]) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);   // bit depth
  ihdr.writeUInt8(2, 9);   // color type RGB
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = chunk("IHDR", ihdr);

  const row = Buffer.alloc(width * 3);
  for (let x = 0; x < width; x++) {
    row[x * 3] = r;
    row[x * 3 + 1] = g;
    row[x * 3 + 2] = b;
  }
  const raw = Buffer.alloc(height * (1 + row.length));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + row.length)] = 0;
    row.copy(raw, y * (1 + row.length) + 1);
  }
  const idat = chunk("IDAT", zlib.deflateSync(raw));
  const iend = chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdrChunk, idat, iend]);
}

async function write(file, buf) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, buf);
  process.stdout.write(`wrote ${file} (${buf.length} bytes)\n`);
}

const primary = [46, 90, 136];   // #2E5A88
const offwhite = [250, 247, 242]; // #FAF7F2

await write(resolve(ROOT, "public/icon-192.png"), solidPng(192, 192, primary));
await write(resolve(ROOT, "public/icon-512.png"), solidPng(512, 512, primary));
await write(resolve(ROOT, "assets/icon.png"), solidPng(1024, 1024, primary));
await write(resolve(ROOT, "assets/splash.png"), solidPng(1242, 2208, offwhite));
