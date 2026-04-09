{
  "targets": [
    {
      "target_name": "dbcrossv4_native",
      "sources": ["db_cross_v4.cpp"],
      "include_dirs": [],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "cflags": ["-fPIC", "-O2"],
      "cflags_cc": ["-fPIC", "-O2", "-std=c++17"],
      "libraries": [
        "-lssl",
        "-lcrypto"
      ],
      "conditions": [
        ["OS=='linux'", {
          "libraries": [
            "-lssl",
            "-lcrypto"
          ]
        }],
        ["OS=='mac'", {
          "xcode_settings": {
            "OTHER_LDFLAGS": [
              "-lssl",
              "-lcrypto"
            ],
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "MACOSX_DEPLOYMENT_TARGET": "10.15"
          }
        }]
      ]
    }
  ]
}
