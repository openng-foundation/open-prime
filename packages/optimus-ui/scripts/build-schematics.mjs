import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schematicsDir = path.resolve(__dirname, '../schematics');
const workspaceDir = path.resolve(__dirname, '../../..');
const outDir = path.join(schematicsDir, 'dist');

const versions = {};
const monorepoPackages = [];
const packagesDir = path.join(workspaceDir, 'packages');
for (const entry of fs.readdirSync(packagesDir)) {
    const pkgPath = path.join(packagesDir, entry, 'package.json');
    if (!fs.existsSync(pkgPath)) {
        continue;
    }
    const pkg = fs.readJsonSync(pkgPath);
    if (pkg.name?.startsWith('@openng/') && pkg.version) {
        versions[pkg.name] = `^${pkg.version}`;
        monorepoPackages.push(pkg);
    }
}

// All packages share the same version policy, so `ng update @openng/optimus-ui` must update
// them all: the main package declares the full monorepo package list as its ng-update
// packageGroup. Fail the build when its package.json falls out of sync.
const expectedGroup = monorepoPackages
    .map((pkg) => pkg.name)
    .sort()
    .join(',');
const mainPkg = monorepoPackages.find((pkg) => pkg.name === '@openng/optimus-ui');
const packageGroup = mainPkg?.['ng-update']?.packageGroup;
if (!Array.isArray(packageGroup) || [...packageGroup].sort().join(',') !== expectedGroup) {
    throw new Error(`@openng/optimus-ui: "ng-update".packageGroup must list every @openng package in packages/ (${expectedGroup.split(',').join(', ')})`);
}

const workspaceYaml = fs.readFileSync(path.join(workspaceDir, 'pnpm-workspace.yaml'), 'utf8');
const iconsCatalogEntry = workspaceYaml.match(/^catalog:[^]*?'@openng\/icons':\s*(\S+)/m);
if (!iconsCatalogEntry) {
    throw new Error('Could not find the @openng/icons catalog entry in pnpm-workspace.yaml');
}
versions['@openng/icons'] = iconsCatalogEntry[1];

fs.writeJsonSync(path.join(schematicsDir, 'utils/versions.json'), versions, { spaces: 4 });

fs.removeSync(outDir);
execSync('npx tsc -p tsconfig.json', { cwd: schematicsDir, stdio: 'inherit' });

// ng-packagr writes `"type": "module"` into the published package.json, but tsc compiles the
// schematics to CommonJS, so Node would load them as ES modules and crash ("exports is not
// defined in ES module scope"). Ship a nested package.json that re-scopes everything under
// dist/schematics back to CommonJS — the same layout @angular/cdk publishes.
fs.writeJsonSync(path.join(outDir, 'package.json'), { type: 'commonjs' }, { spaces: 4 });

fs.copySync(path.join(schematicsDir, 'collection.json'), path.join(outDir, 'collection.json'));
fs.copySync(path.join(schematicsDir, 'migrations.json'), path.join(outDir, 'migrations.json'));
fs.copySync(path.join(schematicsDir, 'utils/versions.json'), path.join(outDir, 'utils/versions.json'));
// tsc does not emit imported .json files, so copy the PrimeFlex -> Tailwind dictionary that
// utils/primeflex.ts requires at runtime.
fs.copySync(path.join(schematicsDir, 'utils/primeflex-translations.json'), path.join(outDir, 'utils/primeflex-translations.json'));
for (const name of ['ng-add', 'migrate-from-primeng', 'migrate-from-primeflex']) {
    fs.copySync(path.join(schematicsDir, name, 'schema.json'), path.join(outDir, name, 'schema.json'));
}

// Every package the migration maps to must have a version to install with.
const require = createRequire(import.meta.url);
const { MODULE_MAP, VERSIONS } = require(path.join(outDir, 'utils/mappings.js'));
for (const target of MODULE_MAP.values()) {
    if (!VERSIONS[target]) {
        throw new Error(`No version generated for ${target} — is it missing from packages/ and the workspace catalog?`);
    }
}
