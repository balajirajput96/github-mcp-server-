const fs = require('fs');
let code = fs.readFileSync('src/index.ts', 'utf8');

const replacements = [
  { match: /const { type = 'all', sort = 'updated', per_page = 30, page = 1 } = args as any;/, replace: "const { type = 'all', sort = 'updated', per_page = 30, page = 1 } = args as { type?: 'all' | 'owner' | 'public' | 'private' | 'member'; sort?: 'created' | 'updated' | 'pushed' | 'full_name'; per_page?: number; page?: number };" },
  { match: /const { owner, repo } = args as any;/, replace: "const { owner, repo } = args as { owner: string; repo: string };" },
  { match: /const { owner, repo, state = 'open', per_page = 30, page = 1 } = args as any;/g, replace: "const { owner, repo, state = 'open', per_page = 30, page = 1 } = args as { owner: string; repo: string; state?: 'open' | 'closed' | 'all'; per_page?: number; page?: number };" },
  { match: /const { owner, repo, title, body, labels } = args as any;/, replace: "const { owner, repo, title, body, labels } = args as { owner: string; repo: string; title: string; body?: string; labels?: string[] };" },
  { match: /const { owner, repo, issue_number, title, body, state, labels } = args as any;/, replace: "const { owner, repo, issue_number, title, body, state, labels } = args as { owner: string; repo: string; issue_number: number; title?: string; body?: string; state?: 'open' | 'closed'; labels?: string[] };" },
  { match: /const { owner, repo, path, ref = 'main' } = args as any;/, replace: "const { owner, repo, path, ref = 'main' } = args as { owner: string; repo: string; path: string; ref?: string };" },
  { match: /const { owner, repo, issue_number } = args as any;/, replace: "const { owner, repo, issue_number } = args as { owner: string; repo: string; issue_number: number };" },
  { match: /const { owner, repo, pull_number } = args as any;/, replace: "const { owner, repo, pull_number } = args as { owner: string; repo: string; pull_number: number };" },
  { match: /const { owner, repo, ref } = args as any;/, replace: "const { owner, repo, ref } = args as { owner: string; repo: string; ref: string };" },
  { match: /const { owner, repo, tag } = args as any;/, replace: "const { owner, repo, tag } = args as { owner: string; repo: string; tag?: string };" }
];

for (const r of replacements) {
  code = code.replace(r.match, r.replace);
}

fs.writeFileSync('src/index.ts', code);
