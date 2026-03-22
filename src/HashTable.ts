import { Hasher } from './Hasher';

export type HashFn = ( str: string, seed?: number ) => number;
export type Hash = 'fasthash' | 'fnv1a' | 'murmur3' | HashFn;

export interface HashOptions {
    hash?: Hash;
    seed?: number | undefined;
    maxStrLen?: number;
    maxSize?: number;
    maxCacheSize?: number;
    fifo?: boolean;
}


const DEFAULT_OPTIONS: HashOptions = {
    hash: 'fasthash',
    maxStrLen: 2048,
    maxSize: 10_000,
    maxCacheSize: 100_000,
    fifo: true
};


export class HashTable {

    private readonly options: HashOptions;
    private readonly seed: number | undefined;
    private readonly maxStrLen: number;
    private readonly maxSize: number;
    private readonly maxCacheSize: number;
    private readonly fifo: boolean;
    private readonly hashFn: HashFn;

    private table = new Map< string, any > ();
    private hashCache = new Map< number, string > ();

    constructor ( options: HashOptions = {} ) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.seed = this.options.seed;
        this.maxStrLen = this.options.maxStrLen!;
        this.maxCacheSize = this.options.maxCacheSize!;
        this.maxSize = this.options.maxSize!;
        this.fifo = this.options.fifo!;

        try {
            this.hashFn = typeof this.options.hash === 'function'
                ? this.options.hash
                : Hasher[ this.options.hash as keyof Hasher ]
        } catch ( err ) {
            throw Error ( `Cannot set hash function`, { cause: err } )
        }

        try { this.hashFn( '', this.seed ) }
        catch ( err ) { throw Error ( `Cannot call hash function`, { cause: err } ) }
    }

    protected keygen ( strs: string[], pfx?: string, sfx?: string, sorted: boolean = false ) : string | false {
        const seed = this.seed, len = this.maxStrLen, size = this.maxCacheSize, n = strs.length;
        const hashes: number[] = new Array( n );

        for ( let i = 0; i < n; i++ ) {
            const s = strs[ i ];
            if ( s.length > len ) return false;
            hashes[ i ] = this.hashFn( s, seed );
        }

        if ( sorted && n > 1 ) {
            if ( n === 2 ) { if ( hashes[ 0 ] > hashes[ 1 ] ) {
                const tmp = hashes[ 0 ];
                hashes[ 0 ] = hashes[ 1 ];
                hashes[ 1 ] = tmp;
            } } else hashes.sort( ( a, b ) => a - b );
        }

        if ( this.hashCache.size > size ) this.hashCache.clear();

        let key = pfx ?? '', h, s;
        for ( let i = 0; i < n; i++ ) {
            s = this.hashCache.get( h = hashes[ i ] );

            if ( s === undefined ) {
                s = h.toString( 36 ).padStart( 8, '0' );
                this.hashCache.set( h, s );
            }

            key += s;
        }

        return key + sfx;
    }

    public key ( strs: string[], pfx?: string, sfx?: string, sorted: boolean = false ) : string | false {
        return this.keygen( strs, pfx, sfx, sorted );
    }

    public has ( key: string ) : boolean {
        return this.table.has( key );
    }

    public get< T = any > ( key: string ) : T | undefined {
        return this.table.get( key );
    }

    public set< T = any > ( key: string, entry: T, update: boolean = true ) : boolean {
        const has = this.table.has( key );
        if ( ! update && has ) return false;

        if ( ! has && this.table.size >= this.maxSize ) {
            if ( ! this.fifo ) return false;

            const first = this.table.keys().next();
            if ( ! first.done ) this.table.delete( first.value );
        }

        this.table.set( key, entry );
        return true;
    }

    public delete ( key: string ) : boolean {
        return this.table.delete( key );
    }

    public clear () : void {
        this.table.clear();
    }

    public clearCache () : void {
        this.hashCache.clear();
    }

    public size () : number {
        return this.table.size;
    }

}
