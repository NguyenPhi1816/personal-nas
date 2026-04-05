import * as fs from 'fs';
import * as path from 'path';

describe('path-utils', () => {
  const tmp = fs.mkdtempSync(path.join(process.cwd(), 'tmp-test-'));
  beforeAll(() => { process.env.NAS_ROOT_DIR = tmp; });

  it('resolves inside root and ensures dir exists', () => {
    // require after setting env var so module picks up NAS_ROOT_DIR
    const { resolveInsideRoot, ensureDirExists } = require('../utils/path-utils');
    const abs = resolveInsideRoot('.');
    expect(abs.startsWith(tmp)).toBe(true);
    ensureDirExists(path.join(abs, 'a'));
    expect(fs.existsSync(path.join(abs, 'a'))).toBe(true);
  });
});
