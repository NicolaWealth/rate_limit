#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { extractCoverage } = require('@nicolawealth/code_coverage_extractor');

let coverageData;
try {
  const coverageRaw = fs.readFileSync('./coverage/coverage-final.json', 'utf-8');
  coverageData = JSON.parse(coverageRaw);
} catch (error) {
  console.error('Failed to read or parse ./coverage/coverage-final.json:', error);
  process.exit(1);
}

let coverage;
try {
  coverage = extractCoverage(coverageData, './codecov/badge.json');
} catch (error) {
  console.error('Failed to extract coverage from parsed data:', error);
  process.exit(1);
}

if (typeof coverage !== 'string' && typeof coverage !== 'number') {
  console.error(`Invalid coverage value type from extractCoverage: ${typeof coverage}. Expected a numeric string or number.`);
  process.exit(1);
}

const coverageMatch = String(coverage).match(/^(\d+(\.\d+)?)$/);
if (!coverageMatch) {
  console.error(`Invalid coverage value from extractCoverage: "${coverage}". Expected a numeric string or number.`);
  process.exit(1);
}
const parsedCoverage = parseFloat(coverageMatch[1]);
if (!Number.isFinite(parsedCoverage) || parsedCoverage < 0 || parsedCoverage > 100) {
  console.error(`Coverage value out of range: "${coverage}". Expected a value between 0 and 100.`);
  process.exit(1);
}

const intCov = Math.floor(parsedCoverage);

console.log(`Coverage: ${parsedCoverage}%`);

if (process.env.GITHUB_ENV) {
  fs.appendFileSync(process.env.GITHUB_ENV, `COVERAGE=${parsedCoverage.toString()}\n`);
  fs.appendFileSync(process.env.GITHUB_ENV, `INT_COV=${intCov.toString()}\n`);
}
