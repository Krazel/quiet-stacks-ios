import XCTest
@testable import QuietStacksCore

final class CameraTests: XCTestCase {
    private func makeController() -> CameraController {
        CameraController(
            anchor: CameraAnchor(center: WorldPoint(x: 500, y: 400), zoom: 1),
            limits: CameraLimits(
                worldBounds: WorldRect(
                    origin: WorldPoint(x: 0, y: 0),
                    size: WorldSize(width: 1_000, height: 800)
                ),
                viewportSize: WorldSize(width: 300, height: 600),
                minimumZoom: 0.75,
                maximumZoom: 4
            )
        )
    }

    func testPanIsConvertedFromScreenToWorldAndClamped() {
        var controller = makeController()

        controller.pan(screenTranslation: WorldPoint(x: 1000, y: 1000))

        XCTAssertEqual(controller.anchor.center.x, 150, accuracy: 0.0001)
        XCTAssertEqual(controller.anchor.center.y, 300, accuracy: 0.0001)
    }

    func testPinchPreservesWorldPointUnderCentroid() {
        var controller = makeController()
        let screenPoint = WorldPoint(x: 225, y: 300)
        let worldBefore = controller.anchor.center.x + (screenPoint.x - 150) / controller.anchor.zoom

        controller.pinch(to: 2, around: screenPoint)

        let worldAfter = controller.anchor.center.x + (screenPoint.x - 150) / controller.anchor.zoom
        XCTAssertEqual(worldAfter, worldBefore, accuracy: 0.0001)
        XCTAssertEqual(controller.anchor.zoom, 2)
    }

    func testFocusKeepsZoneIdentityAndFitsRect() {
        var controller = makeController()
        let zone = ZoneID(rawValue: "reading-room")

        controller.focus(
            zone: zone,
            rect: WorldRect(
                origin: WorldPoint(x: 400, y: 200),
                size: WorldSize(width: 100, height: 200)
            )
        )

        XCTAssertEqual(controller.anchor.focusedZone, zone)
        XCTAssertEqual(controller.anchor.center, WorldPoint(x: 450, y: 300))
        XCTAssertEqual(controller.anchor.zoom, 2.7, accuracy: 0.0001)
    }
}
