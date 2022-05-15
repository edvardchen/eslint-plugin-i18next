declare module 'country-emoji' {}
var a: Element['nodeName'];
var a3: Omit<T, 'af'>;

function Button({ t = 'name' }: { t: string }) {}
// var aa: 'abc' = 'abc';
var a4: 'abc' | 'name' | undefined = 'abc';

// type T = { name: 'b' };
// var a5: T = { name: 'b' };

enum T2 {
  howard = 1,
  'a b' = 2,
}
var a6 = T2['howard'];

function Button2({ t = 'name' }: { t: 'name' }) {}

type Ta = { t?: 'name' | 'abc' };
function Button3({ t = 'name' }: Ta) {}
