import XCTest
@testable import QuietStacksCore

final class PersistenceTests: XCTestCase {
    func testRoundTripPreservesIdentityLocationAndCamera() throws {
        let books = [
            makeBook("z", volume: 2, location: .stack(.init(stack: .init(rawValue: "leaf"), depth: 0))),
            makeBook("a", volume: 1, location: .cart(slot: 4))
        ]
        let snapshot = WorldSnapshot(
            revision: 9,
            books: books,
            stacks: [StackState(
                id: StackID(rawValue: "leaf"),
                pose: WorldPose(point: WorldPoint(x: 320, y: 180), rotation: 0.1),
                labelToken: "leaf"
            )],
            cart: CartState(
                pose: WorldPose(point: WorldPoint(x: 500, y: 210), rotation: -0.05)
            ),
            camera: CameraAnchor(
                center: WorldPoint(x: 850, y: 410),
                zoom: 2.25,
                focusedZone: ZoneID(rawValue: "west-wing")
            )
        )
        let codec = SnapshotCodec()

        let decoded = try codec.decode(codec.encode(snapshot))

        XCTAssertEqual(decoded, snapshot)
        XCTAssertEqual(decoded.books.map(\.descriptor.id.rawValue), ["a", "z"])
    }

    func testEncodingIsDeterministicRegardlessOfInputOrder() throws {
        let first = makeBook("first", volume: 1, location: .cart(slot: 0))
        let second = makeBook("second", volume: 2, location: .cart(slot: 1))
        let codec = SnapshotCodec()

        let forward = try codec.encode(makeSnapshot(books: [first, second]))
        let reverse = try codec.encode(makeSnapshot(books: [second, first]))

        XCTAssertEqual(forward, reverse)
    }

    func testRejectsFutureSchema() throws {
        let future = WorldSnapshot(
            schemaVersion: SnapshotSchema.currentVersion + 1,
            revision: 0,
            books: [],
            camera: CameraAnchor(center: WorldPoint(x: 0, y: 0), zoom: 1)
        )
        let codec = SnapshotCodec()

        XCTAssertThrowsError(try codec.decode(codec.encode(future))) {
            XCTAssertEqual(
                $0 as? SnapshotPersistenceError,
                .unsupportedSchema(found: 2, supported: 1)
            )
        }
    }
}
