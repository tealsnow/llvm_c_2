import { SpawnOptions } from "bun";
import { glob, Glob } from "glob";

export class LineLogger {
  stack: string[];

  constructor() {
    this.stack = [];
  }

  // deno-lint-ignore no-explicit-any
  public log(...args: any[]) {
    const sb = new StringBuilder();
    sb.push('[');

    for (const s of this.stack) {
      sb.push(`${s} : `);
    }

    sb.push(...args.toString());
    sb.push(']');

    stdout.clearLine();
    stdout.write(sb.string);
  }

  public logPush(str: string) {
    this.log(str);
    this.stack.push(str);
  }

  public logPop() {
    this.stack.pop();
  }
}

export namespace stdout {
  const text_encoder = new TextEncoder();

  export const ESC = "\x1b";
  export const OSC = ESC + "[";

  export function write(...args: any[]) {
    for (const v of args) {
      const text = text_encoder.encode(v.toString());
      Bun.write(Bun.stdout, text);
    }
  }

  export function clearLine() {
    write(OSC + "2K\r");
  }

  export function moveUp() {
    write(OSC + "1A");
  }
}

export class StringBuilder {
  string: string

  constructor(str: string = '') {
    this.string = str;
  }

  push(...strings: string[]) {
    this.string = this.string.concat(...strings);
  }
}

export function pathExists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

export async function remove(path: string, options?: { recursive?: boolean }, logger?: LineLogger): Promise<void> {
  logger?.log(`Trying to remove ${path}`);

  if (await pathExists(path)) {
    let cmd = ["rm"];
    if (options?.recursive ? options.recursive : false) {
      cmd.push("-r")
    }
    cmd.push(path);
    const _ = await Bun.spawn({ cmd });
    logger?.log(`Removed ${path}`);
  } 
  return Promise.resolve();
}

export async function removeGlob(glob_str: string, options?: { recursive?: boolean }): Promise<void> {
  const g = new Glob(glob_str, {});
  for await (const path of g) {
    await remove(path, options);
  }
}

export async function runCmd<Opts extends SpawnOptions.OptionsObject>(cmd: string[], options?: Opts, logger?: LineLogger): Promise<void> {
  logger?.log(`Running Command '${cmd.join(' ')}'`);

  const p = await Bun.spawn(cmd, { stdout: 'pipe', stderr: 'pipe', ...options });
  await p.exited;
  if (p.exitCode != 0) {
    const stdout = await Bun.readableStreamToText(p.stdout);
    const stderr = await Bun.readableStreamToText(p.stderr);
    throw new Error(`Failed executing '${cmd.join(' ')}'\n--- stdout:\n${stdout}\n--- stderr:\n${stderr}`);
  }
  return Promise.resolve();
}

export async function cmdOutput(cmd: string[]): Promise<[string, string]> {
  const p = Bun.spawn({ stdout: 'pipe', stderr: 'pipe', cmd });
  await p.exited;
  return [await Bun.readableStreamToText(p.stdout), await Bun.readableStreamToText(p.stderr)];
}

export async function cmdOutputStdout(cmd: string[]): Promise<string> {
  const [stdout, _stderr] = await cmdOutput(cmd);
  return stdout;
}

export async function cmdOutputStderr(cmd: string[]): Promise<string> {
  const [_stdout, stderr] = await cmdOutput(cmd);
  return stderr;
}
