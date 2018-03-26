const getSequenceLengths = require('./App.getSequenceLengths');


let sa = [AGAGAGA, GAGAGAG];

test('getSequenceLengths', () => {
  expect(getSequenceLengths(sa)).toBe([7,7])
});
