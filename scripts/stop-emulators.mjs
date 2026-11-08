// Stops Firestore emulators that are still running. firebase-tools on Windows
// sometimes leaves the emulator's Java process behind after it shuts down,
// and the next start then fails with "port taken".
//
//   npm run emulators:stop
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function stopEmulators() {
  const command =
    process.platform === "win32"
      ? "powershell -NoProfile -Command \"Get-CimInstance Win32_Process -Filter \\\"Name = 'java.exe'\\\" | Where-Object { $_.CommandLine -like '*cloud-firestore-emulator*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }\""
      : "pkill -f cloud-firestore-emulator";

  try {
    execSync(command, { stdio: "ignore" });
  } catch {
    // Nothing was running.
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  stopEmulators();
  console.log("Stopped any Firestore emulators that were still running.");
}
