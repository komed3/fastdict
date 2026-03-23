/**
 * Hasher is a collection of static hash functions for string-to-number conversion.
 * 
 * It provides implementations of common hashing algorithms like FNV-1a and MurmurHash3,
 * optimized for performance in JavaScript environments.
 * 
 * @author Paul Köhler
 * @license MIT
 */

'use strict';


/** The Hasher class provides static methods for various hashing algorithms. */
export class Hasher {

    /**
     * Calculates a fast 32-bit hash value for a given string and seed.
     * 
     * This is a slightly optimized version of the FNV-1a hash algorithm to improve performance.
     * The algorithm will process 4 bytes at a time and uses the MurmurHash3 finalization.
     * 
     * @param {string} str - The input string to hash.
     * @param {number} [seed=0x811c9dc5] - An optional seed for the hash function.
     * @returns {number} The calculated 32-bit unsigned integer hash.
     */
    public static fasthash ( str: string, seed: number = 0x811c9dc5 ) : number {
        const len = str.length, limit = len & ~3;
        let hash = seed, i = 0;

        // Process 4 bytes at a time
        for ( ; i < limit; i += 4 ) {
            const chunk = str.charCodeAt( i ) |
                ( str.charCodeAt( i + 1 ) << 8 ) |
                ( str.charCodeAt( i + 2 ) << 16 ) |
                ( str.charCodeAt( i + 3 ) << 24 );

            hash ^= chunk;
            hash = Math.imul( hash, 0x01000193 );
        }

        // Process remaining bytes
        for ( ; i < len; i++ ) {
            hash ^= str.charCodeAt( i );
            hash = Math.imul( hash, 0x01000193 );
        }

        // Finalization
        hash ^= hash >>> 16;
        hash = Math.imul( hash, 0x85ebca6b );
        hash ^= hash >>> 13;
        hash = Math.imul( hash, 0xc2b2ae35 );
        hash ^= hash >>> 16;

        return hash >>> 0;
    }

    /**
     * Implements the FNV-1a (32-bit) hash algorithm.
     * 
     * @param {string} str - The input string to hash.
     * @param {number} [seed=0x811c9dc5] - An optional seed (offset basis) for the hash.
     * @returns {number} The calculated 32-bit unsigned integer hash.
     */
    public static fnv1a ( str: string, seed: number = 0x811c9dc5 ) : number {
        let hash = seed;

        for ( let i = 0; i < str.length; i++ ) {
            hash ^= str.charCodeAt( i );
            hash = Math.imul( hash, 0x01000193 );
        }

        return hash >>> 0;
    }

    /**
     * Implements the MurmurHash3 (32-bit) algorithm.
     * 
     * @param {string} str - The input string to hash.
     * @param {number} [seed=00] - An optional seed for the hash.
     * @returns {number} The calculated 32-bit unsigned integer hash.
     */
    public static murmur3 ( str: string, seed: number = 0 ) : number {
        const len = str.length, limit = len & ~3;
        let hash = seed, i = 0;

        // Process 4 bytes at a time
        for ( ; i < limit; i += 4 ) {
            let chunk = str.charCodeAt( i ) |
                ( str.charCodeAt( i + 1 ) << 8 ) |
                ( str.charCodeAt( i + 2 ) << 16 ) |
                ( str.charCodeAt( i + 3 ) << 24 );

            chunk = Math.imul( chunk, 0xcc9e2d51 );
            chunk = ( chunk << 15 ) | ( chunk >>> 17 );
            chunk = Math.imul( chunk, 0x1b873593 );

            hash ^= chunk;
            hash = ( hash << 13 ) | ( hash >>> 19 );
            hash = Math.imul( hash, 5 ) + 0xe6546b64;
        }

        // Process remaining bytes
        for ( ; i < len; i++ ) {
            let k = str.charCodeAt( i );

            k = Math.imul( k, 0xcc9e2d51 );
            k = ( k << 15 ) | ( k >>> 17 );
            k = Math.imul( k, 0x1b873593 );

            hash ^= k;
        }

        // Finalization
        hash ^= len;
        hash ^= hash >>> 16;
        hash *= Math.imul( hash, 0x85ebca6b );
        hash ^= hash >>> 13;
        hash *= Math.imul( hash, 0xc2b2ae35 );
        hash ^= hash >>> 16;

        return hash >>> 0;
    }

}
