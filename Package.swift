// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "QuietStacksCore",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .library(name: "QuietStacksCore", targets: ["QuietStacksCore"])
    ],
    targets: [
        .target(name: "QuietStacksCore"),
        .testTarget(
            name: "QuietStacksCoreTests",
            dependencies: ["QuietStacksCore"]
        )
    ]
)
