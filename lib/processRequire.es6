import fs from 'fs';
import path from 'path';
import loaderUtils from 'loader-utils';

let cache = {};

export default class {
    constructor(filename, config) {
        this.sourcePath = path.resolve(filename);
        this.config = config;
        this.sourceLayerIndex = this.getSourceLayerIndex();
        this.remainingLayers = config.layers.slice(0, this.sourceLayerIndex + 1);
    }

    getSourceLayerIndex() {
        for (let i = 0; i < this.config.layers.length; i++) {
            if (this.sourcePath.indexOf(this.config.layers[i]) === 0) {
                return i;
            }
        }

        return this.config.layers.length - 1;
    }

    parseRequiredString(requiredString) {
        let [ rawComponent, rawOpts ] = requiredString.split('?');
        let component = rawComponent.substr(this.config.prefix.length);
        let opts = {};
        let mods = {};

        if (rawOpts) {
            rawOpts = loaderUtils.parseQuery('?' + rawOpts);

            Object.keys(rawOpts).forEach(optName => {
                const optVal = rawOpts[optName];

                // mods
                if (optName.charAt(0) === '_') {
                    mods = {
                        ...mods,
                        [optName]: optVal
                    };
                // rest
                } else {
                    opts[optName] = optVal;
                }
            });
        }

        return {
            component,
            mods,
            opts
        };
    }

    collectPaths(required) {
        let out = [];

        this.remainingLayers.forEach(layer => {
            const pathToCheck = path.join(layer, required);

            // self-require guard
            if (pathToCheck === this.sourcePath) {
                return;
            }

            // main
            if (this.config.files.main) {
                out.push({
                    type: 'main',
                    path: path.join(pathToCheck, this.config.files.main)
                });
            }

            // styles
            if (this.required.opts.styles !== false && this.config.files.styles) {
                out.push({
                    type: 'styles',
                    path: path.join(pathToCheck, this.config.files.styles)
                });
            }

            // propTypes
            if (this.required.opts.propTypes !== false && this.config.files.propTypes) {
                out.push({
                    type: 'propTypes',
                    path: path.join(pathToCheck, this.config.files.propTypes)
                });
            }
        });

        return out;
    }

    filterPaths(pathsObj) {
        return pathsObj.filter(pathObj => fs.existsSync(pathObj.path));
    }

    process(requiredString) {
        const uniqueKey = this.sourceLayerIndex + requiredString;

        if (uniqueKey in cache) {
            return cache[uniqueKey];
        }

        this.required = this.parseRequiredString(requiredString);

        let pathsToCheck = [];

        // collect paths to check
        pathsToCheck.push(...this.collectPaths(this.required.component));

        // also collect main component paths if modifier was required
        if (this.required.mods) {
            Object.keys(this.required.mods).forEach(modName => {
                const modVal = this.required.mods[modName];
                const pathToCheck = path.join(this.required.component, modName, modVal);

                pathsToCheck.push(...this.collectPaths(pathToCheck));
            });
        }

        const out = {
            method: this.required.opts.raw ? 'yummifyRaw' : 'yummify',
            items: this.filterPaths(pathsToCheck)
        };

        // cache it
        cache[uniqueKey] = out;

        return out;
    }
}
