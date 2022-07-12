# `llvm_c_2`

This is my own attempt to create a C frontend to match the C++ API of llvm as close as reasonable.

Currently targeting `llvm-13`

Some notable features include:

- Any functions taking in a string take a pointer and a length.
- Match the file structure of LLVM
- All types and functions begin with `llvm_`
- All all methods are formatted as `llvm_<TypeName>_<methodName>_<maybe override specifier>`
- All enum variants start with their name
  <br/>ie. This means if an enum is named `llvm_Foo` and has the variants `Bar` and `Baz`, they will be named `llvm_Foo_Bar` and `llvm_Foo_Baz` respectively.

## Building

This has yet to be tested on windows.
It does work on linux, and should work on macos.

### Requirements

If you have nix, requirement are easily install by running `nix-shell`.

- [deno](https://deno.land)
- cmake
- ninja
- clang
- llvm-13

Building requires [deno](https://deno.land) as I am using my own _incomplete_ 'meta' build system: `rnn`, written in typescript.

### Building the library

The following will create a folder `build` where you will find the static library `libllvm_c_2.a`.

```sh
./rnn.ts build
```

### Usage

You need only to add `include` to your include path, and to link `llvm_c_2` and `LLVM-13`.

```
-I<llvm_c_2>/include/ -L<llvm_c_2/build> -L<llvm-13 lib dir> -lllvm_c_2 -lLLVM-13
```

## Contributing

Not everything is currently exposed. I'm only exposing specific APIs as I need them. Please feel free to contribute to add more.

For a loose list of what is exposed look at the file structure. Of course, not every function/method is exposed for every type.

## License

The `llvm_c_2` is licensed under the MIT license.
