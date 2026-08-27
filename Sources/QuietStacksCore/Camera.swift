import Foundation

public struct WorldSize: Codable, Hashable, Sendable {
    public var width: Double
    public var height: Double

    public init(width: Double, height: Double) {
        self.width = width
        self.height = height
    }
}

public struct WorldRect: Codable, Hashable, Sendable {
    public var origin: WorldPoint
    public var size: WorldSize

    public init(origin: WorldPoint, size: WorldSize) {
        self.origin = origin
        self.size = size
    }

    public var center: WorldPoint {
        WorldPoint(
            x: origin.x + size.width / 2,
            y: origin.y + size.height / 2
        )
    }
}

public struct CameraLimits: Codable, Hashable, Sendable {
    public let worldBounds: WorldRect
    public let viewportSize: WorldSize
    public let minimumZoom: Double
    public let maximumZoom: Double

    public init(
        worldBounds: WorldRect,
        viewportSize: WorldSize,
        minimumZoom: Double,
        maximumZoom: Double
    ) {
        self.worldBounds = worldBounds
        self.viewportSize = viewportSize
        self.minimumZoom = minimumZoom
        self.maximumZoom = maximumZoom
    }
}

public struct CameraController: Sendable {
    public private(set) var anchor: CameraAnchor
    public let limits: CameraLimits

    public init(anchor: CameraAnchor, limits: CameraLimits) {
        self.limits = limits
        self.anchor = anchor
        clamp()
    }

    public mutating func pan(screenTranslation: WorldPoint) {
        anchor.center.x -= screenTranslation.x / anchor.zoom
        anchor.center.y -= screenTranslation.y / anchor.zoom
        anchor.focusedZone = nil
        clamp()
    }

    public mutating func pinch(to proposedZoom: Double, around screenPoint: WorldPoint) {
        let viewportCenter = WorldPoint(
            x: limits.viewportSize.width / 2,
            y: limits.viewportSize.height / 2
        )
        let worldPointUnderGesture = WorldPoint(
            x: anchor.center.x + (screenPoint.x - viewportCenter.x) / anchor.zoom,
            y: anchor.center.y + (screenPoint.y - viewportCenter.y) / anchor.zoom
        )

        anchor.zoom = min(max(proposedZoom, limits.minimumZoom), limits.maximumZoom)
        anchor.center = WorldPoint(
            x: worldPointUnderGesture.x - (screenPoint.x - viewportCenter.x) / anchor.zoom,
            y: worldPointUnderGesture.y - (screenPoint.y - viewportCenter.y) / anchor.zoom
        )
        anchor.focusedZone = nil
        clamp()
    }

    public mutating func focus(
        zone: ZoneID,
        rect: WorldRect,
        viewportFill: Double = 0.9
    ) {
        let horizontalZoom = limits.viewportSize.width / rect.size.width
        let verticalZoom = limits.viewportSize.height / rect.size.height
        anchor.zoom = min(horizontalZoom, verticalZoom) * viewportFill
        anchor.center = rect.center
        anchor.focusedZone = zone
        clamp(preserveFocus: true)
    }

    private mutating func clamp(preserveFocus: Bool = false) {
        anchor.zoom = min(max(anchor.zoom, limits.minimumZoom), limits.maximumZoom)

        let halfVisibleWidth = limits.viewportSize.width / (2 * anchor.zoom)
        let halfVisibleHeight = limits.viewportSize.height / (2 * anchor.zoom)
        let minimumX = limits.worldBounds.origin.x + halfVisibleWidth
        let maximumX = limits.worldBounds.origin.x + limits.worldBounds.size.width - halfVisibleWidth
        let minimumY = limits.worldBounds.origin.y + halfVisibleHeight
        let maximumY = limits.worldBounds.origin.y + limits.worldBounds.size.height - halfVisibleHeight

        anchor.center.x = clampedCenter(
            anchor.center.x,
            minimum: minimumX,
            maximum: maximumX,
            fallback: limits.worldBounds.center.x
        )
        anchor.center.y = clampedCenter(
            anchor.center.y,
            minimum: minimumY,
            maximum: maximumY,
            fallback: limits.worldBounds.center.y
        )
        if !preserveFocus {
            anchor.focusedZone = nil
        }
    }

    private func clampedCenter(
        _ value: Double,
        minimum: Double,
        maximum: Double,
        fallback: Double
    ) -> Double {
        guard minimum <= maximum else { return fallback }
        return min(max(value, minimum), maximum)
    }
}
