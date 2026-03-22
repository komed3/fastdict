export class Hasher {

    public static fastFNV1a ( str: string ) : number {
        const len = str.length;
        const limit = len & ~3;
        let hash = 0x01000193;
        let i = 0;
    }

}
