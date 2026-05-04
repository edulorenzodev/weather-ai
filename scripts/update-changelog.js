#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getCurrentVersion() {
  try {
    const tag = execSync('git describe --tags --abbrev=0 2>/dev/null', { encoding: 'utf8' });
    return tag.trim();
  } catch {
    return '0.0.0';
  }
}

function getCommitsSince(version) {
  try {
    const range = version === '0.0.0' ? 'HEAD' : `${version}..HEAD`;
    const commits = execSync(`git log ${range} --pretty=format:"%s"`, { encoding: 'utf8' });
    return commits.split('\n').filter(c => c.trim());
  } catch {
    return [];
  }
}

function updateChangelog() {
  const currentVersion = getCurrentVersion();
  const commits = getCommitsSince(currentVersion);

  if (commits.length === 0) {
    console.log('No new commits since last release.');
    return;
  }

  console.log(`Found ${commits.length} commits since ${currentVersion}`);
  commits.forEach(c => console.log(`  - ${c}`));

  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  let changelog = fs.readFileSync(changelogPath, 'utf8');

  const versionMatch = /## \[(\d+\.\d+\.\d+)\]/;
  const currentChangelogVersion = changelog.match(versionMatch)?.[1] || '0.0.0';

  const versionParts = currentChangelogVersion.split('.').map(Number);
  versionParts[2] += 1;
  const newVersion = versionParts.join('.');

  const today = new Date().toISOString().split('T')[0];

  const changesSection = commits
    .map(c => `- ${c}`)
    .join('\n');

  const newEntry = `## [${newVersion}] - ${today}

### Added
${changesSection}

`;

  const insertPoint = changelog.indexOf('## [');
  if (insertPoint === -1) {
    changelog += '\n' + newEntry;
  } else {
    changelog = changelog.slice(0, insertPoint) + newEntry + changelog.slice(insertPoint);
  }

  fs.writeFileSync(changelogPath, changelog);
  console.log(`\n✓ CHANGELOG.md updated to version ${newVersion}`);
}

updateChangelog();