//
//  Components.swift
//  Ghostery
//
//  Building blocks of the views, shared by the macOS and iOS apps.
//

import SwiftUI

fileprivate enum Constants {
  static let copiedDuration: Duration = .seconds(2)
}

fileprivate enum Strings {
  // You can translate your strings here
  static let copied = String(localized: "Copied", comment: "Shown after a text, like a message or a link, is copied to the clipboard")
}

// MARK: - Cards

extension View {
  /// Background of a card, with a thin border
  func cardBackground(cornerRadius: CGFloat, fill: Color = Colors.bgPrimary) -> some View {
    let shape = RoundedRectangle(cornerRadius: cornerRadius)

    return background(shape.fill(fill))
      .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Borders.width))
  }

  /// Reads a card with a single button as one element, with the action of
  /// the button. The combined label leaves out the title of the button, so
  /// it's set from the parts of the card.
  func singleActionAccessibility(label parts: [String?]) -> some View {
    accessibilityElement(children: .combine)
      .accessibilityLabel(parts.compactMap { $0 }.joined(separator: ", "))
  }
}

/// Cards in a row, stretched to the tallest one so their buttons line up,
/// or one below the other
struct CardStack<Data: RandomAccessCollection, Card: View>: View where Data.Element: Identifiable {
  let data: Data
  var isRow: Bool
  var spacing: CGFloat
  @ViewBuilder var card: (Data.Element) -> Card

  var body: some View {
    let stack = isRow
      ? AnyLayout(HStackLayout(alignment: .top, spacing: spacing))
      : AnyLayout(VStackLayout(spacing: spacing))

    stack {
      ForEach(data) { item in
        card(item)
          .frame(maxHeight: .infinity)
      }
    }
    .fixedSize(horizontal: false, vertical: true)
  }
}

// MARK: - Copying

/// Copies texts to the clipboard, and tells for a moment that it did
@MainActor
@Observable
final class CopyConfirmation {
  /// Shown after a copy, in place of the title of its button or next to it
  static let message = Strings.copied

  private(set) var isShown = false
  @ObservationIgnored private var hiding: Task<Void, Never>?

  func copy(_ text: String) {
    Pasteboard.copy(text)
    withAnimation { isShown = true }
    AccessibilityNotification.Announcement(Strings.copied).post()

    // Every copy shows it for the whole time again
    hiding?.cancel()
    hiding = Task {
      try? await Task.sleep(for: Constants.copiedDuration)
      guard !Task.isCancelled else { return }
      withAnimation { isShown = false }
    }
  }
}

// MARK: - Spinners

/// Arc turning continuously, shown while waiting
struct AppSpinner: View {
  var color: Color
  var lineWidth: CGFloat
  /// Part of the circle covered by the arc
  var length: CGFloat
  var turnDuration: TimeInterval

  var body: some View {
    // Follows the clock, so animations of the views around don't affect it
    TimelineView(.animation) { context in
      let turns = context.date.timeIntervalSinceReferenceDate / turnDuration

      Circle()
        .trim(from: 0, to: length)
        .stroke(color, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
        // Starts at the top
        .rotationEffect(.degrees(turns.truncatingRemainder(dividingBy: 1) * 360 - 90))
    }
  }
}
