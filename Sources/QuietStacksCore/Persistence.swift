import Foundation

public enum SnapshotPersistenceError: Error, Equatable, Sendable {
    case unsupportedSchema(found: Int, supported: Int)
}

public struct SnapshotCodec: Sendable {
    public init() {}

    public func encode(_ snapshot: WorldSnapshot) throws -> Data {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        return try encoder.encode(snapshot)
    }

    public func decode(_ data: Data) throws -> WorldSnapshot {
        let snapshot = try JSONDecoder().decode(WorldSnapshot.self, from: data)
        guard snapshot.schemaVersion == SnapshotSchema.currentVersion else {
            throw SnapshotPersistenceError.unsupportedSchema(
                found: snapshot.schemaVersion,
                supported: SnapshotSchema.currentVersion
            )
        }
        return WorldSnapshot(
            schemaVersion: snapshot.schemaVersion,
            revision: snapshot.revision,
            books: snapshot.books,
            stacks: snapshot.stacks,
            cart: snapshot.cart,
            camera: snapshot.camera
        )
    }
}

public protocol SnapshotStore: Sendable {
    func save(_ snapshot: WorldSnapshot) throws
    func load() throws -> WorldSnapshot?
}

public struct JSONFileSnapshotStore: SnapshotStore, Sendable {
    public let fileURL: URL
    public let codec: SnapshotCodec

    public init(fileURL: URL, codec: SnapshotCodec = SnapshotCodec()) {
        self.fileURL = fileURL
        self.codec = codec
    }

    public func save(_ snapshot: WorldSnapshot) throws {
        let data = try codec.encode(snapshot)
        let directory = fileURL.deletingLastPathComponent()
        try FileManager.default.createDirectory(
            at: directory,
            withIntermediateDirectories: true
        )
        try data.write(to: fileURL, options: .atomic)
    }

    public func load() throws -> WorldSnapshot? {
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            return nil
        }
        return try codec.decode(Data(contentsOf: fileURL))
    }
}
