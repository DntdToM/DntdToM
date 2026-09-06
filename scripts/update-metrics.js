/**
 * Dynamic Security & GitHub Activity Updater
 * Author: DntdToM
 * Focus: Malware Research & Detection Engineering
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const USERNAME = 'DntdToM';
const README_PATH = path.join(__dirname, '..', 'README.md');

function fetchJson(url) {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'DntdToM-Security-Bot',
        Accept: 'application/vnd.github.v3+json',
      },
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function getFormattedTime() {
  const now = new Date();
  // Vietnam Time (UTC+7)
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  const year = vnTime.getUTCFullYear();
  const month = pad(vnTime.getUTCMonth() + 1);
  const day = pad(vnTime.getUTCDate());
  const hours = pad(vnTime.getUTCHours());
  const minutes = pad(vnTime.getUTCMinutes());
  const seconds = pad(vnTime.getUTCSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} (UTC+7)`;
}

async function updateReadme() {
  console.log(`[+] Initializing Security Radar synchronization for @${USERNAME}...`);

  const [userProfile, userRepos] = await Promise.all([
    fetchJson(`https://api.github.com/users/${USERNAME}`),
    fetchJson(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`),
  ]);

  const publicRepos = userProfile ? userProfile.public_repos : 'Active';
  const followers = userProfile ? userProfile.followers : '0';
  
  let totalStars = 0;
  let topRepo = 'Malware-Analysis-Lab';
  let topRepoStars = 0;

  if (Array.isArray(userRepos)) {
    userRepos.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
      if (repo.stargazers_count >= topRepoStars && !repo.fork) {
        topRepoStars = repo.stargazers_count;
        topRepo = repo.name;
      }
    });
  }

  const timestamp = getFormattedTime();

  const terminalOutput = `\`\`\`bash
┌──(root㉿dntdtom)-[~/threat-radar]
└─# ./check_telemetry.sh --verbose

[+] CONNECTION STATUS   : [ENCRYPTED // TLSv1.3]
[+] TARGET NODE         : github.com/${USERNAME}
[+] RESEARCH DOMAIN     : Malware Analysis, Reverse Engineering & Detection
[+] TELEMETRY TIMESTAMP : ${timestamp}
[+] LAB METRICS:
    ├── Public Arsenals : ${publicRepos} repositories
    ├── Network Stars   : ${totalStars} ★
    ├── Watcher Nodes   : ${followers} operators
    └── Prime Vector    : ${topRepo}
[+] LAB SANDBOX HEALTH  : ALL CONTAINERS HEALTHY (0 ESCAPES DETECTED)
[+] SYSTEM CLEARANCE    : LEVEL-4 RESEARCH ACCESS GRANTED
\`\`\``;

  if (!fs.existsSync(README_PATH)) {
    console.error(`[-] Error: README.md not found at ${README_PATH}`);
    return;
  }

  let readmeContent = fs.readFileSync(README_PATH, 'utf8');

  const startMarker = '<!-- SECURITY_FEED:START -->';
  const endMarker = '<!-- SECURITY_FEED:END -->';

  const startIndex = readmeContent.indexOf(startMarker);
  const endIndex = readmeContent.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.warn(`[!] Markers ${startMarker} and ${endMarker} not found in README.md`);
    return;
  }

  const newReadme =
    readmeContent.substring(0, startIndex + startMarker.length) +
    '\n' +
    terminalOutput +
    '\n' +
    readmeContent.substring(endIndex);

  fs.writeFileSync(README_PATH, newReadme, 'utf8');
  console.log(`[✓] Successfully updated README.md with live telemetry data!`);
}

updateReadme();
