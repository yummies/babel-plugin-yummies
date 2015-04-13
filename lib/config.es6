import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const configPath = path.join(process.cwd(), '.yummies.yml');
const configRaw = fs.readFileSync(configPath, 'utf-8');
const config = yaml.safeLoad(configRaw);

// absolutify
config.layers = config.layers.map(layer => path.resolve(layer));
// hardcoded(?) prefix
config.prefix = '#';

export default config;
