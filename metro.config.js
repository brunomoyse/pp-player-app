const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Apollo Client expects to resolve .cjs entry points.
config.resolver.sourceExts.push('cjs');

// Apollo Client v4 / graphql-ws default-import `tslib`, but tslib's ESM build
// exposes no default export, so under Metro's package-exports resolution
// `tslib.default` is undefined ("Cannot destructure '__extends' of tslib.default").
// Force tslib to its CJS build so the interop default is the helpers object.
const tslibCjs = require.resolve('tslib/tslib.js');
const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return { type: 'sourceFile', filePath: tslibCjs };
  }
  return (upstreamResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/global.css' });
