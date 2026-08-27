import XCTest
@testable import QuietStacksCore

final class WorldStateTests: XCTestCase {
    func testMoveAndUndoRestoreExactLocationsAndRevision() throws {
        let book = makeBook(
            "book-1",
            volume: 1,
            location: .world(point: WorldPoint(x: 20, y: 30), layer: 0)
        )
        var session = WorldSession(state: try WorldState(snapshot: makeSnapshot(books: [book])))
        let target = BookLocation.cart(slot: 2)

        let transaction = try session.move(bookID: book.descriptor.id, to: target)

        XCTAssertEqual(session.state.book(id: book.descriptor.id)?.location, target)
        XCTAssertEqual(session.state.revision, 1)
        XCTAssertEqual(transaction.transitions.count, 1)
        XCTAssertEqual(session.undoDepth, 1)

        _ = try session.undoLastMove()

        XCTAssertEqual(session.state.book(id: book.descriptor.id)?.location, book.location)
        XCTAssertEqual(session.state.revision, 0)
        XCTAssertEqual(session.undoDepth, 0)
    }

    func testExchangeMovesBothBooksAndUndoRestoresBoth() throws {
        let first = makeBook("first", volume: 1, location: .cart(slot: 0))
        let second = makeBook("second", volume: 2, location: .cart(slot: 1))
        var session = WorldSession(state: try WorldState(snapshot: makeSnapshot(books: [first, second])))

        let transaction = try session.move(
            bookID: first.descriptor.id,
            to: second.location,
            occupiedPolicy: .exchange
        )

        XCTAssertEqual(transaction.transitions.count, 2)
        XCTAssertEqual(session.state.book(id: first.descriptor.id)?.location, second.location)
        XCTAssertEqual(session.state.book(id: second.descriptor.id)?.location, first.location)

        _ = try session.undoLastMove()
        XCTAssertEqual(session.state.book(id: first.descriptor.id)?.location, first.location)
        XCTAssertEqual(session.state.book(id: second.descriptor.id)?.location, second.location)
    }

    func testRejectsOccupiedExclusiveTarget() throws {
        let first = makeBook("first", volume: 1, location: .cart(slot: 0))
        let second = makeBook("second", volume: 2, location: .cart(slot: 1))
        var state = try WorldState(snapshot: makeSnapshot(books: [first, second]))

        XCTAssertThrowsError(try state.move(bookID: first.descriptor.id, to: second.location)) {
            XCTAssertEqual($0 as? WorldStateError, .targetOccupied(second.descriptor.id))
        }
    }

    func testRejectsDuplicateExclusiveLocationsOnLoad() {
        let first = makeBook("first", volume: 1, location: .cart(slot: 0))
        let second = makeBook("second", volume: 2, location: .cart(slot: 0))

        XCTAssertThrowsError(try WorldState(snapshot: makeSnapshot(books: [first, second]))) {
            XCTAssertEqual($0 as? WorldStateError, .duplicateExclusiveLocation(.cart(slot: 0)))
        }
    }
}
