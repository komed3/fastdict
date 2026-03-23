# Hash Table

A fast and efficient hash table implementation for caching and data storage with optimized hash functions, written in TypeScript.

`@komed3/hashtable` provides a high-performance `HashTable` class with support for customizable hashing algorithms (including FNV-1a and MurmurHash3), seedable hashes, and FIFO-based eviction to manage memory usage efficiently.

A thrid hash algorithm named `fasthash` which is included, based on FNV-1a and the MurMurHash3 finalizer. This algorithm is optimized for performance.

## Installation

Install via npm:

```bash
npm install @komed3/hashtable
```

## Quick usage

Create a new instance and manage your data:

```ts
import { HashTable } from '@komed3/hashtable';

// initialize with default options (fasthash, max 10,000 items)
const table = new HashTable();

// generate a unique key from string components
const key = table.key( [ 'user', '123' ] );

if ( key ) {
	// store data
	table.set( key, { name: 'Max', role: 'admin' } );

	// retrieve data
	const user = table.get( key );
	console.log( user ); // { name: 'Max', role: 'admin' }

	// check existence
	console.log( table.has( key ) ); // true

	// delete entry
	table.delete( key );
}
```

## API reference

### Instantiate

- `new HashTable( options? )`  
  Creates a new `HashTable` instance with optional configuration.

### Storage & Retrieval

- `set< T >( key: string, entry: T, update: boolean = true ) : boolean`  
  Stores an entry. If the table is full and `fifo` is enabled, the oldest entry is removed. Returns `false` if `update` is false and key exists, or if table is full and FIFO is disabled.
- `get< T >( key: string ) : T | undefined`  
  Retrieves the entry associated with the given key.
- `has( key: string ) : boolean`  
  Returns `true` if the key exists in the table.
- `delete( key: string ) : boolean`  
  Removes an entry from the table. Returns `true` if deleted.
- `clear() : void`  
  Clears all entries from the table.
- `size() : number`  
  Returns the current number of entries.

### Key Generation

- `key( strs: string[], pfx?: string, sfx?: string, sorted: boolean = false ) : string | false`  
  Generates a composite key from an array of strings. 
  - `strs`: Array of strings to hash.
  - `pfx` / `sfx`: Optional prefix/suffix for the key.
  - `sorted`: If true, sorts component hashes before joining (ensures order-independence).

## Options

- `hash` (string | function, default: `'fasthash'`)  
  The hash algorithm to use. Built-in: `'fasthash'`, `'fnv1a'`, `'murmur3'`. Or a custom `( str: string, seed?: number ) => number`.
- `seed` (number, default: `undefined`)  
  Optional numeric seed for the hash function.
- `maxStrLen` (number, default: `2048`)  
  Maximum length allowed for input strings in `keygen`.
- `maxSize` (number, default: `10000`)  
  Maximum number of entries before eviction starts.
- `maxCacheSize` (number, default: `100000`)  
  Maximum number of internal hash-to-string mappings to cache.
- `fifo` (boolean, default: `true`)  
  Whether to automatically evict the oldest entry when `maxSize` is reached.

## Customization

### Custom Hash Algorithms

Pass a custom hash function that implements the `HashFn` signature:

```ts
const myHash = ( str: string, seed?: number ) : number => {
	// your implementation
	return someNumericHash;
};

const table = new HashTable( { hash: myHash } );
```

### Overriding keygen()

You can extend the `HashTable` class to implement your own key generation logic by overriding the `protected keygen()` method:

```ts
class MyTable extends HashTable {
	protected override keygen ( strs: string[], pfx?: string, sfx?: string ) : string | false {
		// custom logic before or after default hashing
		const baseKey = super.keygen( strs, pfx, sfx );
		return baseKey ? `v1_${baseKey}` : false;
	}
}
```

----

Copyright (c) 2026 Paul Köhler (komed3). All rights reserved.  
Released under the MIT license. See LICENSE file in the project root for details.
