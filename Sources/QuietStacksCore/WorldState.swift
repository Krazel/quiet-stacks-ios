import Foundation

public enum OccupiedTargetPolicy: Equatable, Sendable {
    case reject
    case exchange
}

public enum WorldStateError: Error, Equatable, Sendable {
    case duplicateBook(BookID)
    case duplicateExclusiveLocation(BookLocation)
    case missingBook(BookID)
    case targetOccupied(BookID)
    case invalidUndoState(BookID)
}

public struct BookTransition: Codable, Hashable, Sendable {
    public let bookID: BookID
    public let from: BookLocation
    public let to: BookLocation

    public init(bookID: BookID, from: BookLocation, to: BookLocation) {
        self.bookID = bookID
        self.from = from
        self.to = to
    }
}

public struct MoveTransaction: Codable, Hashable, Sendable {
    public let revisionBefore: Int
    public let revisionAfter: Int
    public let transitions: [BookTransition]

    public init(revisionBefore: Int, revisionAfter: Int, transitions: [BookTransition]) {
        self.revisionBefore = revisionBefore
        self.revisionAfter = revisionAfter
        self.transitions = transitions
    }
}

public struct WorldState: Sendable {
    public private(set) var revision: Int
    public private(set) var camera: CameraAnchor
    private var recordsByID: [BookID: BookRecord]

    public init(snapshot: WorldSnapshot) throws {
        var recordsByID: [BookID: BookRecord] = [:]
        var exclusiveLocations: [BookLocation: BookID] = [:]

        for record in snapshot.books {
            let id = record.descriptor.id
            guard recordsByID[id] == nil else {
                throw WorldStateError.duplicateBook(id)
            }
            if record.location.isExclusive {
                guard exclusiveLocations[record.location] == nil else {
                    throw WorldStateError.duplicateExclusiveLocation(record.location)
                }
                exclusiveLocations[record.location] = id
            }
            recordsByID[id] = record
        }

        self.revision = snapshot.revision
        self.camera = snapshot.camera
        self.recordsByID = recordsByID
    }

    public var books: [BookRecord] {
        recordsByID.values.sorted { $0.descriptor.id < $1.descriptor.id }
    }

    public func book(id: BookID) -> BookRecord? {
        recordsByID[id]
    }

    public func snapshot() -> WorldSnapshot {
        WorldSnapshot(revision: revision, books: books, camera: camera)
    }

    public mutating func updateCamera(_ anchor: CameraAnchor) {
        camera = anchor
    }

    @discardableResult
    public mutating func move(
        bookID: BookID,
        to target: BookLocation,
        occupiedPolicy: OccupiedTargetPolicy = .reject
    ) throws -> MoveTransaction {
        guard let movingBook = recordsByID[bookID] else {
            throw WorldStateError.missingBook(bookID)
        }

        let origin = movingBook.location
        if origin == target {
            return MoveTransaction(
                revisionBefore: revision,
                revisionAfter: revision,
                transitions: []
            )
        }

        let occupant = target.isExclusive
            ? recordsByID.values.first(where: { $0.descriptor.id != bookID && $0.location == target })
            : nil

        if let occupant, occupiedPolicy == .reject {
            throw WorldStateError.targetOccupied(occupant.descriptor.id)
        }

        var transitions = [BookTransition(bookID: bookID, from: origin, to: target)]
        recordsByID[bookID]?.location = target

        if let occupant {
            let occupantID = occupant.descriptor.id
            recordsByID[occupantID]?.location = origin
            transitions.append(BookTransition(bookID: occupantID, from: target, to: origin))
        }

        let previousRevision = revision
        revision += 1
        return MoveTransaction(
            revisionBefore: previousRevision,
            revisionAfter: revision,
            transitions: transitions
        )
    }

    public mutating func undo(_ transaction: MoveTransaction) throws {
        for transition in transaction.transitions {
            guard let record = recordsByID[transition.bookID] else {
                throw WorldStateError.missingBook(transition.bookID)
            }
            guard record.location == transition.to else {
                throw WorldStateError.invalidUndoState(transition.bookID)
            }
        }

        for transition in transaction.transitions.reversed() {
            recordsByID[transition.bookID]?.location = transition.from
        }
        revision = transaction.revisionBefore
    }
}

public struct WorldSession: Sendable {
    public private(set) var state: WorldState
    public private(set) var undoDepth: Int = 0
    private var undoStack: [MoveTransaction] = []

    public init(state: WorldState) {
        self.state = state
    }

    @discardableResult
    public mutating func move(
        bookID: BookID,
        to target: BookLocation,
        occupiedPolicy: OccupiedTargetPolicy = .reject
    ) throws -> MoveTransaction {
        let transaction = try state.move(
            bookID: bookID,
            to: target,
            occupiedPolicy: occupiedPolicy
        )
        if !transaction.transitions.isEmpty {
            undoStack.append(transaction)
            undoDepth = undoStack.count
        }
        return transaction
    }

    @discardableResult
    public mutating func undoLastMove() throws -> MoveTransaction? {
        guard let transaction = undoStack.last else {
            return nil
        }
        try state.undo(transaction)
        undoStack.removeLast()
        undoDepth = undoStack.count
        return transaction
    }
}
