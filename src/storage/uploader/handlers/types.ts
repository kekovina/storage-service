export interface FileHandler {
  process(file: Buffer): Promise<Buffer>;
}
