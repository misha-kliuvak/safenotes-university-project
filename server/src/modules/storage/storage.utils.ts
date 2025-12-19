export class StorageUtils {
  static convertFileSizeToBytes(mbSize: number): number {
    if (mbSize < 0) return 0;

    const bytesInMB = 1024 * 1024;
    return mbSize * bytesInMB;
  }
}
