import Foundation

public struct GestureConfiguration: Codable, Hashable, Sendable {
    public let dragThreshold: Double
    public let panThreshold: Double

    public init(dragThreshold: Double = 8, panThreshold: Double = 8) {
        self.dragThreshold = dragThreshold
        self.panThreshold = panThreshold
    }
}

public enum GestureEvent: Hashable, Sendable {
    case began(point: WorldPoint, hitBook: BookID?)
    case moved(totalTranslation: WorldPoint, touchCount: Int)
    case holdRecognized
    case secondTouchBegan
    case ended
    case cancelled
}

public enum GestureIntent: Equatable, Sendable {
    case none
    case beginBookDrag(BookID)
    case updateBookDrag(BookID, translation: WorldPoint)
    case endBookDrag(BookID)
    case cancelBookDrag(BookID)
    case cancelBookDragAndBeginPinch(BookID)
    case tapBook(BookID)
    case beginPan
    case updatePan(translation: WorldPoint)
    case endPan
    case endPanAndBeginPinch
    case beginPinch
    case updatePinch
    case endPinch
    case cancelled
}

public enum GestureArbiterState: Equatable, Sendable {
    case idle
    case possibleBookDrag(BookID)
    case possiblePan
    case draggingBook(BookID)
    case panning
    case pinching
}

public struct GestureArbiter: Sendable {
    public private(set) var state: GestureArbiterState = .idle
    public let configuration: GestureConfiguration

    public init(configuration: GestureConfiguration = GestureConfiguration()) {
        self.configuration = configuration
    }

    @discardableResult
    public mutating func handle(_ event: GestureEvent) -> GestureIntent {
        switch event {
        case let .began(_, hitBook):
            guard state == .idle else { return .none }
            if let hitBook {
                state = .possibleBookDrag(hitBook)
            } else {
                state = .possiblePan
            }
            return .none

        case let .moved(translation, touchCount):
            if touchCount >= 2 {
                return promoteToPinch()
            }
            let distance = hypot(translation.x, translation.y)
            switch state {
            case let .possibleBookDrag(book) where distance >= configuration.dragThreshold:
                state = .draggingBook(book)
                return .beginBookDrag(book)
            case .possiblePan where distance >= configuration.panThreshold:
                state = .panning
                return .beginPan
            case let .draggingBook(book):
                return .updateBookDrag(book, translation: translation)
            case .panning:
                return .updatePan(translation: translation)
            case .pinching:
                return .updatePinch
            default:
                return .none
            }

        case .holdRecognized:
            guard case let .possibleBookDrag(book) = state else { return .none }
            state = .draggingBook(book)
            return .beginBookDrag(book)

        case .secondTouchBegan:
            return promoteToPinch()

        case .ended:
            defer { state = .idle }
            switch state {
            case let .possibleBookDrag(book): return .tapBook(book)
            case let .draggingBook(book): return .endBookDrag(book)
            case .panning: return .endPan
            case .pinching: return .endPinch
            default: return .none
            }

        case .cancelled:
            defer { state = .idle }
            if case let .draggingBook(book) = state {
                return .cancelBookDrag(book)
            }
            return .cancelled
        }
    }

    private mutating func promoteToPinch() -> GestureIntent {
        switch state {
        case .idle, .pinching:
            if state == .idle { state = .pinching; return .beginPinch }
            return .updatePinch
        case let .draggingBook(book):
            state = .pinching
            return .cancelBookDragAndBeginPinch(book)
        case .panning:
            state = .pinching
            return .endPanAndBeginPinch
        case .possibleBookDrag, .possiblePan:
            state = .pinching
            return .beginPinch
        }
    }
}
