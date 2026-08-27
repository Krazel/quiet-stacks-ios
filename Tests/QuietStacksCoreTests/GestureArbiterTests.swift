import XCTest
@testable import QuietStacksCore

final class GestureArbiterTests: XCTestCase {
    func testBookTouchBecomesDragAfterThreshold() {
        let book = BookID(rawValue: "book")
        var arbiter = GestureArbiter()

        XCTAssertEqual(
            arbiter.handle(.began(point: WorldPoint(x: 1, y: 1), hitBook: book)),
            .none
        )
        XCTAssertEqual(
            arbiter.handle(.moved(totalTranslation: WorldPoint(x: 9, y: 0), touchCount: 1)),
            .beginBookDrag(book)
        )
        XCTAssertEqual(
            arbiter.handle(.moved(totalTranslation: WorldPoint(x: 12, y: 2), touchCount: 1)),
            .updateBookDrag(book, translation: WorldPoint(x: 12, y: 2))
        )
        XCTAssertEqual(arbiter.handle(.ended), .endBookDrag(book))
    }

    func testBackgroundTouchOwnsCameraPan() {
        var arbiter = GestureArbiter()

        _ = arbiter.handle(.began(point: WorldPoint(x: 1, y: 1), hitBook: nil))
        XCTAssertEqual(
            arbiter.handle(.moved(totalTranslation: WorldPoint(x: 9, y: 0), touchCount: 1)),
            .beginPan
        )
        XCTAssertEqual(
            arbiter.handle(.moved(totalTranslation: WorldPoint(x: 15, y: 0), touchCount: 1)),
            .updatePan(translation: WorldPoint(x: 15, y: 0))
        )
    }

    func testSecondTouchCancelsActiveBookDragBeforePinchUpdates() {
        let book = BookID(rawValue: "book")
        var arbiter = GestureArbiter()
        _ = arbiter.handle(.began(point: WorldPoint(x: 0, y: 0), hitBook: book))
        _ = arbiter.handle(.holdRecognized)

        XCTAssertEqual(
            arbiter.handle(.secondTouchBegan),
            .cancelBookDragAndBeginPinch(book)
        )
        XCTAssertEqual(
            arbiter.handle(.moved(totalTranslation: WorldPoint(x: 0, y: 0), touchCount: 2)),
            .updatePinch
        )
        XCTAssertEqual(arbiter.handle(.ended), .endPinch)
    }

    func testShortBookTouchRemainsTap() {
        let book = BookID(rawValue: "book")
        var arbiter = GestureArbiter()
        _ = arbiter.handle(.began(point: WorldPoint(x: 0, y: 0), hitBook: book))
        _ = arbiter.handle(.moved(totalTranslation: WorldPoint(x: 2, y: 2), touchCount: 1))

        XCTAssertEqual(arbiter.handle(.ended), .tapBook(book))
    }
}
