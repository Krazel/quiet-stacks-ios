import XCTest
@testable import QuietStacksCore

final class ShelfValidationTests: XCTestCase {
    private let row = ShelfRowID(rawValue: "literature-row-1")

    func testValidatesSectionSeriesAndConsecutiveVolumeOrder() {
        let books = [
            makeBook("a1", series: "oak", volume: 1, location: .shelf(.init(row: row, index: 0))),
            makeBook("a2", series: "oak", volume: 2, location: .shelf(.init(row: row, index: 1))),
            makeBook("b1", series: "river", volume: 1, location: .shelf(.init(row: row, index: 2)))
        ]
        let rule = ShelfRule(
            row: row,
            expectedSection: SectionID(rawValue: "literature"),
            allowedSeries: [SeriesID(rawValue: "oak"), SeriesID(rawValue: "river")]
        )

        let report = ShelfValidator.validate(rule: rule, books: books)

        XCTAssertTrue(report.isValid)
        XCTAssertEqual(report.orderedBooks, books.map(\.descriptor.id))
    }

    func testReportsWrongSectionUnknownSeriesAndVolumeGap() {
        let books = [
            makeBook("a1", volume: 1, location: .shelf(.init(row: row, index: 0))),
            makeBook("a3", volume: 3, location: .shelf(.init(row: row, index: 1))),
            makeBook(
                "wrong",
                section: "history",
                series: "unknown",
                volume: 1,
                location: .shelf(.init(row: row, index: 2))
            )
        ]
        let rule = ShelfRule(
            row: row,
            expectedSection: SectionID(rawValue: "literature"),
            allowedSeries: [SeriesID(rawValue: "oak")]
        )

        let report = ShelfValidator.validate(rule: rule, books: books)

        XCTAssertFalse(report.isValid)
        XCTAssertTrue(report.issues.contains(.missingVolume(
            series: SeriesID(rawValue: "oak"),
            expected: 2,
            actual: 3
        )))
        XCTAssertTrue(report.issues.contains(.wrongSection(
            book: BookID(rawValue: "wrong"),
            expected: SectionID(rawValue: "literature"),
            actual: SectionID(rawValue: "history")
        )))
        XCTAssertTrue(report.issues.contains(.unknownSeries(
            book: BookID(rawValue: "wrong"),
            series: SeriesID(rawValue: "unknown")
        )))
    }

    func testAllowsSeriesBlocksInEitherOrderAndReportsSplitSeriesAndVolumeOrder() {
        let books = [
            makeBook("river", series: "river", volume: 1, location: .shelf(.init(row: row, index: 0))),
            makeBook("oak2", series: "oak", volume: 2, location: .shelf(.init(row: row, index: 1))),
            makeBook("river2", series: "river", volume: 2, location: .shelf(.init(row: row, index: 2))),
            makeBook("oak1", series: "oak", volume: 1, location: .shelf(.init(row: row, index: 3)))
        ]
        let rule = ShelfRule(
            row: row,
            expectedSection: SectionID(rawValue: "literature"),
            allowedSeries: [SeriesID(rawValue: "oak"), SeriesID(rawValue: "river")]
        )

        let report = ShelfValidator.validate(rule: rule, books: books)

        XCTAssertTrue(report.issues.contains(.splitSeries(
            series: SeriesID(rawValue: "river"),
            book: BookID(rawValue: "river2")
        )))
        XCTAssertTrue(report.issues.contains(.volumeOutOfOrder(
            previous: BookID(rawValue: "oak2"),
            current: BookID(rawValue: "oak1")
        )))
    }

    func testAcceptsCompleteSeriesBlocksInFreeRelativeOrder() {
        let books = [
            makeBook("river1", series: "river", volume: 1, location: .shelf(.init(row: row, index: 0))),
            makeBook("river2", series: "river", volume: 2, location: .shelf(.init(row: row, index: 1))),
            makeBook("oak1", series: "oak", volume: 1, location: .shelf(.init(row: row, index: 2))),
            makeBook("oak2", series: "oak", volume: 2, location: .shelf(.init(row: row, index: 3)))
        ]
        let rule = ShelfRule(
            row: row,
            expectedSection: SectionID(rawValue: "literature"),
            allowedSeries: [SeriesID(rawValue: "oak"), SeriesID(rawValue: "river")]
        )

        XCTAssertTrue(ShelfValidator.validate(rule: rule, books: books).isValid)
    }
}
