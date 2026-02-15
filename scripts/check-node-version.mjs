const REQUIRED_MAJOR = 20;
const REQUIRED_MINOR = 19;
const REQUIRED_PATCH = 0;

function parseVersion(versionString) {
  const normalized = versionString.replace(/^v/, "");
  const [major = "0", minor = "0", patch = "0"] = normalized.split(".");
  return [Number(major), Number(minor), Number(patch)];
}

function isVersionSupported(current, required) {
  for (let i = 0; i < 3; i += 1) {
    if (current[i] > required[i]) return true;
    if (current[i] < required[i]) return false;
  }
  return true;
}

const current = parseVersion(process.version);
const required = [REQUIRED_MAJOR, REQUIRED_MINOR, REQUIRED_PATCH];

if (!isVersionSupported(current, required)) {
  console.error(
    [
      `Node.js ${process.version} is not supported for this project.`,
      `Required: >=${required.join(".")}`,
      "Run `nvm use` to switch to the pinned version from .nvmrc.",
    ].join("\n")
  );
  process.exit(1);
}
