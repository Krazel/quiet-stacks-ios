import Foundation

public enum SnapshotSchema {
    public static let currentVersion = 1
}

public struct BookID: RawRepresentable, Codable, Hashable, Sendable, Comparable {
    public let rawValue: String

    public init(rawValue: String) {
        self.rawValue = rawValue
    }

    public static func < (lhs: BookID, rhs: BookID) -> Bool {
        lhs.rawValue < rhs.rawValue
    }
}

public struct SectionID: RawRepresentable, Codable, Hashable, Sendable, Comparable {
    public let rawValue: String

    public init(rawValue: String) {
        self.rawValue = rawValue
    }

    public static func < (lhs: SectionID, rhs: SectionID) -> Bool {
        lhs.rawValue < rhs.rawValue
    }
}

public struct SeriesID: RawRepresentable, Codable, Hashable, Sendable, Comparable {
    public let rawValue: String

    public init(rawValue: String) {
        self.rawValue = rawValue
    }

    public static func < (lhs: SeriesID, rhs: SeriesID) -> Bool {
        lhs.rawValue < rhs.rawValue
    }
}

public struct ShelfRowID: RawRepresentable, Codable, Hashable, Sendable, Comparable {
    public let rawValue: String

    public init(rawValue: String) {
        self.rawValue = rawValue
    }

    public static func < (lhs: ShelfRowID, rhs: ShelfRowID) -> Bool {
        lhs.rawValue < rhs.rawValue
    }
}

public struct StackID: RawRepresentable, Codable, Hashable, Sendable, Comparable {
    public let rawValue: String

    public init(rawValue: String) {
        self.rawValue = rawValue
    }

    public static func < (lhs: StackID, rhs: StackID) -> Bool {
        lhs.rawValue < rhs.rawValue
    }
}

public struct ZoneID: RawRepresentable, Codable, Hashable, Sendable, Comparable {
    public let rawValue: String

    public init(rawValue: String) {
        self.rawValue = rawValue
    }

    public static func < (lhs: ZoneID, rhs: ZoneID) -> Bool {
        lhs.rawValue < rhs.rawValue
    }
}

public struct WorldPoint: Codable, Hashable, Sendable {
    public var x: Double
    public var y: Double

    public init(x: Double, y: Double) {
        self.x = x
        self.y = y
    }
}

public struct WorldPose: Codable, Hashable, Sendable {
    public var point: WorldPoint
    public var rotation: Double

    public init(point: WorldPoint, rotation: Double = 0) {
        self.point = point
        self.rotation = rotation
    }
}

public struct ShelfSlotID: Codable, Hashable, Sendable {
    public let row: ShelfRowID
    public let index: Int

    public init(row: ShelfRowID, index: Int) {
        self.row = row
        self.index = index
    }
}

public struct StackPlacement: Codable, Hashable, Sendable {
    public let stack: StackID
    public let depth: Int

    public init(stack: StackID, depth: Int) {
        self.stack = stack
        self.depth = depth
    }
}

public enum BookLocation: Codable, Hashable, Sendable {
    case world(pose: WorldPose, layer: Int)
    case stack(StackPlacement)
    case cart(slot: Int)
    case shelf(ShelfSlotID)

    public var isExclusive: Bool {
        switch self {
        case .world:
            return false
        case .stack, .cart, .shelf:
            return true
        }
    }
}

public struct StackState: Codable, Hashable, Sendable {
    public let id: StackID
    public var pose: WorldPose
    public var labelToken: String?

    public init(id: StackID, pose: WorldPose, labelToken: String? = nil) {
        self.id = id
        self.pose = pose
        self.labelToken = labelToken
    }
}

public struct CartState: Codable, Hashable, Sendable {
    public var pose: WorldPose

    public init(pose: WorldPose) {
        self.pose = pose
    }
}

public enum BookTexture: String, Codable, Hashable, Sendable {
    case plain
    case linen
    case speckled
    case worn
}

public struct BookAppearance: Codable, Hashable, Sendable {
    public let width: Int
    public let height: Int
    public let paletteIndex: Int
    public let texture: BookTexture
    public let emblemIndex: Int
    public let detailSeed: UInt64

    public init(
        width: Int,
        height: Int,
        paletteIndex: Int,
        texture: BookTexture,
        emblemIndex: Int,
        detailSeed: UInt64
    ) {
        self.width = width
        self.height = height
        self.paletteIndex = paletteIndex
        self.texture = texture
        self.emblemIndex = emblemIndex
        self.detailSeed = detailSeed
    }
}

public struct BookDescriptor: Codable, Hashable, Sendable {
    public let id: BookID
    public let section: SectionID
    public let series: SeriesID
    public let volume: Int
    public let appearance: BookAppearance

    public init(
        id: BookID,
        section: SectionID,
        series: SeriesID,
        volume: Int,
        appearance: BookAppearance
    ) {
        self.id = id
        self.section = section
        self.series = series
        self.volume = volume
        self.appearance = appearance
    }
}

public struct BookRecord: Codable, Hashable, Sendable {
    public let descriptor: BookDescriptor
    public var location: BookLocation

    public init(descriptor: BookDescriptor, location: BookLocation) {
        self.descriptor = descriptor
        self.location = location
    }
}

public struct CameraAnchor: Codable, Hashable, Sendable {
    public var center: WorldPoint
    public var zoom: Double
    public var focusedZone: ZoneID?

    public init(center: WorldPoint, zoom: Double, focusedZone: ZoneID? = nil) {
        self.center = center
        self.zoom = zoom
        self.focusedZone = focusedZone
    }
}

public struct WorldSnapshot: Codable, Hashable, Sendable {
    public let schemaVersion: Int
    public let revision: Int
    public let books: [BookRecord]
    public let stacks: [StackState]
    public let cart: CartState
    public let camera: CameraAnchor

    public init(
        schemaVersion: Int = SnapshotSchema.currentVersion,
        revision: Int,
        books: [BookRecord],
        stacks: [StackState] = [],
        cart: CartState = CartState(pose: WorldPose(point: WorldPoint(x: 0, y: 0))),
        camera: CameraAnchor
    ) {
        self.schemaVersion = schemaVersion
        self.revision = revision
        self.books = books.sorted { $0.descriptor.id < $1.descriptor.id }
        self.stacks = stacks.sorted { $0.id < $1.id }
        self.cart = cart
        self.camera = camera
    }
}
