// Verify NRR ranges are now in correct ascending order
const pointsTableModel = require('./src/models/pointsTable');
const calculator = require('./src/services/calculator');

console.log('\n=== VERIFICATION: NRR Ranges Are Now in Ascending Order ===\n');

// Q1a: RR bats first, scores 120 vs DC, wants position 3
console.log('Q1a: RR scores 120/20 vs DC (wants position 3)');
const q1a = calculator.battingFirstRange('RR', 'DC', 3, 120, 20);
console.log(`restrictTo: ${q1a.restrictTo.min} to ${q1a.restrictTo.max} runs`);
console.log(`NRR range: ${q1a.nrrRange.min} to ${q1a.nrrRange.max}`);
const q1aMin = parseFloat(q1a.nrrRange.min);
const q1aMax = parseFloat(q1a.nrrRange.max);
console.log(`✓ Ascending order check: ${q1aMin} ≤ ${q1aMax}? ${q1aMin <= q1aMax ? 'YES ✓' : 'NO ✗'}\n`);

// Q1b: DC bats first, scores 119, RR chases vs DC, wants position 3
console.log('Q1b: DC scores 119/20, RR chases (wants position 3)');
const q1b = calculator.bowlingFirstRange('RR', 'DC', 3, 119, 20);
console.log(`chaseTarget: ${q1b.chaseTarget}`);
console.log(`chaseIn: ${q1b.chaseIn.min} to ${q1b.chaseIn.max} overs`);
console.log(`NRR range: ${q1b.nrrRange.min} to ${q1b.nrrRange.max}`);
const q1bMin = parseFloat(q1b.nrrRange.min);
const q1bMax = parseFloat(q1b.nrrRange.max);
console.log(`✓ Ascending order check: ${q1bMin} ≤ ${q1bMax}? ${q1bMin <= q1bMax ? 'YES ✓' : 'NO ✗'}\n`);

// Q2c: RR bats first, scores 80 vs RCB, wants position 3
console.log('Q2c: RR scores 80/20 vs RCB (wants position 3)');
const q2c = calculator.battingFirstRange('RR', 'RCB', 3, 80, 20);
console.log(`restrictTo: ${q2c.restrictTo.min} to ${q2c.restrictTo.max} runs`);
console.log(`NRR range: ${q2c.nrrRange.min} to ${q2c.nrrRange.max}`);
const q2cMin = parseFloat(q2c.nrrRange.min);
const q2cMax = parseFloat(q2c.nrrRange.max);
console.log(`✓ Ascending order check: ${q2cMin} ≤ ${q2cMax}? ${q2cMin <= q2cMax ? 'YES ✓' : 'NO ✗'}\n`);

// Q2d: RCB bats first, scores 79, RR chases vs RCB, wants position 3
console.log('Q2d: RCB scores 79/20, RR chases (wants position 3)');
const q2d = calculator.bowlingFirstRange('RR', 'RCB', 3, 79, 20);
console.log(`chaseTarget: ${q2d.chaseTarget}`);
console.log(`chaseIn: ${q2d.chaseIn.min} to ${q2d.chaseIn.max} overs`);
console.log(`NRR range: ${q2d.nrrRange.min} to ${q2d.nrrRange.max}`);
const q2dMin = parseFloat(q2d.nrrRange.min);
const q2dMax = parseFloat(q2d.nrrRange.max);
console.log(`✓ Ascending order check: ${q2dMin} ≤ ${q2dMax}? ${q2dMin <= q2dMax ? 'YES ✓' : 'NO ✗'}\n`);

// Summary
console.log('=== SUMMARY ===');
const allPassing = [q1aMin <= q1aMax, q1bMin <= q1bMax, q2cMin <= q2cMax, q2dMin <= q2dMax];
const passCount = allPassing.filter(x => x).length;
console.log(`All NRR ranges in ascending order: ${passCount}/4 ✓\n`);
