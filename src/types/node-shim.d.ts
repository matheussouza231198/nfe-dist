declare module 'fs' {
  const fs: any;
  export = fs;
}

declare module 'fs/promises' {
  const fsPromises: any;
  export = fsPromises;
}

declare module 'path' {
  const path: any;
  export = path;
}

declare module 'https' {
  const https: any;
  export = https;
}

declare module 'zlib' {
  export function gunzipSync(buffer: any): { toString(encoding: string): string };
}

declare const Buffer: {
  from(input: string, encoding?: string): any;
  byteLength(input: string): number;
};

declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
};

declare namespace NodeJS {
  type Timeout = any;
}
