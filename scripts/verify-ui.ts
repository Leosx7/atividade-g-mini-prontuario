import { spawn } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { createProductionApplication } from "../src/composition";
const application = createProductionApplication();
const server = application.app.listen(0);
await new Promise<void>(resolve => server.once("listening", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Porta não encontrada.");
const profile = mkdtempSync(join(tmpdir(), "mini-prontuario-browser-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
let socket: WebSocket | undefined;
try {
  const portFile = join(profile, "DevToolsActivePort");
  for (let retry = 0; retry < 100 && !existsSync(portFile); retry++) await setTimeout(100);
  if (!existsSync(portFile)) throw new Error("Chrome não disponibilizou CDP.");
  const port = readFileSync(portFile, "utf8").split("\n")[0];
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json() as { type: string; webSocketDebuggerUrl: string }[];
  const page = targets.find(target => target.type === "page");
  if (!page) throw new Error("Página não encontrada.");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise<void>((resolve, reject) => { socket!.onopen = () => resolve(); socket!.onerror = () => reject(new Error("CDP indisponível")); });
  let sequence = 0;
  const pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>();
  socket.onmessage = event => {
    const message = JSON.parse(String(event.data));
    const handler = pending.get(message.id);
    if (handler) { pending.delete(message.id); if (message.error) handler.reject(new Error(message.error.message)); else handler.resolve(message.result); }
  };
  function command(method: string, params: object = {}): Promise<any> {
    return new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket!.send(JSON.stringify({ id, method, params })); });
  }
  async function evaluate(expression: string) { return (await command("Runtime.evaluate", { expression, returnByValue: true })).result.value; }
  async function until(expression: string) { for (let retry = 0; retry < 100; retry++) { if (await evaluate(expression)) return; await setTimeout(100); } throw new Error("Estado visual esperado não apareceu."); }
  await command("Page.enable");
  await command("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await command("Page.navigate", { url: `http://127.0.0.1:${address.port}` });
  await until('document.querySelector("#login-view") && getComputedStyle(document.querySelector("#login-view")).display !== "none"');
  await setTimeout(300);
  writeFileSync("docs/evidencias/ui-login.png", Buffer.from((await command("Page.captureScreenshot", { format: "png" })).data, "base64"));
  const password = process.env.SEED_PASSWORD ?? "";
  await evaluate(`document.querySelector("#email-input").value="profissional@clinica.local"; document.querySelector("#password-input").value=${JSON.stringify(password)}; document.querySelector("#login-button").click(); true;`);
  await until('document.querySelector("#session-bar")?.textContent?.includes("Profissional de demonstração")');
  await until('document.querySelector("#patient-list")?.textContent?.includes("Ana Beatriz")');
  await setTimeout(300);
  writeFileSync("docs/evidencias/ui-autenticada.png", Buffer.from((await command("Page.captureScreenshot", { format: "png" })).data, "base64"));
  console.log("Frontend original: login apareceu sem alteração em public/.");
  console.log("Login real no Chrome: crachá profissional e lista de pacientes confirmados.");
  await command("Browser.close");
} finally {
  socket?.close();
  chrome.kill();
  await new Promise<void>(resolve => server.close(() => resolve()));
  await application.close();
}
