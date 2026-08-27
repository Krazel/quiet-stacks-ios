import Foundation
@testable import QuietStacksCore

func makeBook(
    _ id: String,
    section: String = "literature",
    series: String = "oak",
    volume: Int,
    location: BookLocation
) -> BookRecord {
    BookRecord(
        descriptor: BookDescriptor(
            id: BookID(rawValue: id),
            section: SectionID(rawValue: section),
            series: SeriesID(rawValue: series),
            volume: volume,
            appearance: BookAppearance(
                width: 10,
                height: 24,
                paletteIndex: volume,
                texture: .linen,
                emblemIndex: 2,
                detailSeed: UInt64(volume)
            )
        ),
        location: location
    )
}

func makeSnapshot(books: [BookRecord]) -> WorldSnapshot {
    WorldSnapshot(
        revision: 0,
        books: books,
        camera: CameraAnchor(center: WorldPoint(x: 500, y: 300), zoom: 1)
    )
}
