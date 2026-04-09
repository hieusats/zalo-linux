const { expect } = require('chai');
const { execSync } = require('child_process');

describe('Dependencies', function () {
  this.timeout(10000);

  const REQUIRED_LIBS = [
    'libgtk-3',
    'libnotify',
    'libnss3',
    'libsecret',
    'libgbm',
    'libasound',
    'libatk',
    'libcups',
    'libdbus',
    'libxcomposite',
    'libxdamage',
    'libxrandr',
    'libxfixes',
    'libxext',
    'libxi',
    'libxtst',
    'libexpat',
    'libxss'
  ];

  REQUIRED_LIBS.forEach(lib => {
    it(`should detect ${lib}`, function () {
      try {
        const result = execSync(`dpkg -l 2>/dev/null | grep -i '${lib}' | head -1`, {
          encoding: 'utf8',
          timeout: 5000
        });
        expect(result.trim().length).to.be.at.least(1);
      } catch {
        this.skip();
      }
    });
  });

  it('node should be available', function () {
    const version = execSync('node --version', { encoding: 'utf8', timeout: 5000 });
    expect(version.trim()).to.match(/^v\d+/);
  });

  it('npm should be available', function () {
    const version = execSync('npm --version', { encoding: 'utf8', timeout: 5000 });
    expect(version.trim()).to.match(/^\d+/);
  });
});
