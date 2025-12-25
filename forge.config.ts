import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';

const config: ForgeConfig = {
  packagerConfig: {
    asar: {
      unpack: '**/node_modules/{node-pty,electron-store}/**/*',
    },
    icon: 'assets/icon',
  },
  rebuildConfig: {
    force: true,
  },
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  hooks: {
    packageAfterCopy: async (_config, buildPath) => {
      console.log('Installing production dependencies in build path...');

      // Copy package.json to build path (it should already be there, but ensure it is)
      const srcPackageJson = path.join(__dirname, 'package.json');
      const destPackageJson = path.join(buildPath, 'package.json');

      if (!fs.existsSync(destPackageJson)) {
        await fs.copy(srcPackageJson, destPackageJson);
      }

      // Run npm install --production to get all dependencies with proper resolution
      execSync('npm install --production --ignore-scripts', {
        cwd: buildPath,
        stdio: 'inherit',
        env: { ...process.env, npm_config_node_gyp: '' }
      });

      // Copy the pre-built native modules from our node_modules (they're already built for Electron)
      const nativeModules = ['node-pty'];
      const nodeModulesSrc = path.join(__dirname, 'node_modules');
      const nodeModulesDest = path.join(buildPath, 'node_modules');

      for (const mod of nativeModules) {
        const srcPath = path.join(nodeModulesSrc, mod);
        const destPath = path.join(nodeModulesDest, mod);

        if (fs.existsSync(srcPath)) {
          console.log(`Copying pre-built native module: ${mod}`);
          await fs.remove(destPath); // Remove the npm-installed version
          await fs.copy(srcPath, destPath); // Copy our Electron-rebuilt version
        }
      }

      console.log('Dependencies installed successfully');
    },
  },
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
