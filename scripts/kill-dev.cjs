const { execFileSync } = require("child_process");
const path = require("path");

function runNodeScript(scriptPath, args) {
  try {
    execFileSync(process.execPath, [scriptPath, ...args], {
      stdio: "ignore",
      cwd: path.resolve(__dirname, ".."),
    });
    return true;
  } catch {
    return false;
  }
}

function killPort(port) {
  runNodeScript("apps/api/scripts/kill-port.js", [String(port)]);
}

function killWorkspaceNodeProcesses() {
  // WMIC isn't available on some Windows builds.
  // Port-based killing below is the reliable path for our dev stack.
}

killPort(8080);
killPort(8081);
killPort(3000);
killWorkspaceNodeProcesses();

