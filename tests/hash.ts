import { Dict } from '../src/Dict.ts';

const dict = new Dict( { hash: 'fnv1a' } );
const arr = [ 'Hello World', 'Some test', 'Another test', 'Hello World' ];

for ( const str of arr ) {
    const key = dict.key( [ str ] );
    if ( key && dict.has( key ) ) console.log( 'Duplicate:', str );
    else if ( key ) dict.set( key, str );
}

console.log( dict.size() );
