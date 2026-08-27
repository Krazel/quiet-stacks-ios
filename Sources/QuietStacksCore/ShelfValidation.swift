import Foundation

public struct ShelfRule: Codable, Hashable, Sendable {
    public let row: ShelfRowID
    public let expectedSection: SectionID
    public let seriesOrder: [SeriesID]
    public let requiresConsecutiveVolumes: Bool

    public init(
        row: ShelfRowID,
        expectedSection: SectionID,
        seriesOrder: [SeriesID],
        requiresConsecutiveVolumes: Bool = true
    ) {
        self.row = row
        self.expectedSection = expectedSection
        self.seriesOrder = seriesOrder
        self.requiresConsecutiveVolumes = requiresConsecutiveVolumes
    }
}

public enum ShelfValidationIssue: Codable, Hashable, Sendable {
    case wrongSection(book: BookID, expected: SectionID, actual: SectionID)
    case unknownSeries(book: BookID, series: SeriesID)
    case seriesOutOfOrder(previous: BookID, current: BookID)
    case volumeOutOfOrder(previous: BookID, current: BookID)
    case duplicateVolume(series: SeriesID, volume: Int)
    case missingVolume(series: SeriesID, expected: Int, actual: Int)
}

public struct ShelfValidationReport: Codable, Hashable, Sendable {
    public let row: ShelfRowID
    public let orderedBooks: [BookID]
    public let issues: [ShelfValidationIssue]

    public var isValid: Bool { issues.isEmpty }

    public init(row: ShelfRowID, orderedBooks: [BookID], issues: [ShelfValidationIssue]) {
        self.row = row
        self.orderedBooks = orderedBooks
        self.issues = issues
    }
}

public enum ShelfValidator {
    public static func validate(
        rule: ShelfRule,
        books: [BookRecord]
    ) -> ShelfValidationReport {
        let placements = books.compactMap { record -> (Int, BookRecord)? in
            guard case let .shelf(slot) = record.location, slot.row == rule.row else {
                return nil
            }
            return (slot.index, record)
        }
        .sorted { lhs, rhs in
            if lhs.0 != rhs.0 { return lhs.0 < rhs.0 }
            return lhs.1.descriptor.id < rhs.1.descriptor.id
        }

        let seriesRanks = Dictionary(
            uniqueKeysWithValues: rule.seriesOrder.enumerated().map { ($0.element, $0.offset) }
        )
        var issues: [ShelfValidationIssue] = []
        var seenVolumes: [SeriesID: Set<Int>] = [:]

        for (_, record) in placements {
            let book = record.descriptor
            if book.section != rule.expectedSection {
                issues.append(.wrongSection(
                    book: book.id,
                    expected: rule.expectedSection,
                    actual: book.section
                ))
            }
            if seriesRanks[book.series] == nil {
                issues.append(.unknownSeries(book: book.id, series: book.series))
            }
            if seenVolumes[book.series, default: []].contains(book.volume) {
                issues.append(.duplicateVolume(series: book.series, volume: book.volume))
            }
            seenVolumes[book.series, default: []].insert(book.volume)
        }

        for pair in zip(placements, placements.dropFirst()) {
            let previous = pair.0.1.descriptor
            let current = pair.1.1.descriptor
            guard let previousRank = seriesRanks[previous.series],
                  let currentRank = seriesRanks[current.series] else {
                continue
            }

            if currentRank < previousRank {
                issues.append(.seriesOutOfOrder(previous: previous.id, current: current.id))
                continue
            }

            guard previous.series == current.series else { continue }
            if current.volume <= previous.volume {
                issues.append(.volumeOutOfOrder(previous: previous.id, current: current.id))
            } else if rule.requiresConsecutiveVolumes && current.volume != previous.volume + 1 {
                issues.append(.missingVolume(
                    series: current.series,
                    expected: previous.volume + 1,
                    actual: current.volume
                ))
            }
        }

        return ShelfValidationReport(
            row: rule.row,
            orderedBooks: placements.map { $0.1.descriptor.id },
            issues: issues
        )
    }
}
