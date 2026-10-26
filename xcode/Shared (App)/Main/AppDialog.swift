//
//  AppDialog.swift
//  Ghostery
//
//  Card of the dialogs, shown over the sections.
//

import SwiftUI

fileprivate enum Constants {
  static let cornerRadius: CGFloat = 24
  static let shadowRadius: CGFloat = 25
  static let closeButtonSize: CGFloat = 24

  // From the edges of the dialog
  #if os(macOS)
  static let closeButtonPadding: CGFloat = 32
  static let closeTitleTopPadding: CGFloat = 23
  static let closeTitleTrailingPadding: CGFloat = 26
  static let closeHitPadding: CGFloat = 0
  #else
  static let closeButtonPadding: CGFloat = 20
  static let closeTitleTopPadding: CGFloat = 24
  static let closeTitleTrailingPadding: CGFloat = 24
  // The close button can be tapped also around it, as it's small
  static let closeHitPadding: CGFloat = 10
  #endif
}

fileprivate enum Strings {
  // You can translate your strings here
  static let close = String(localized: "Close", comment: "Button closing a dialog")
}

/// Card of a dialog, with the button closing it in the corner. On the Mac
/// it's as wide as its width, and on iPhones and iPads as the screen allows
/// up to it. Its content scrolls when it's too tall, like in short windows.
struct AppDialog<Content: View>: View {
  private let width: CGFloat
  private let closeTitle: String?
  private let onClose: (() -> Void)?
  private let content: Content

  /// The close button shows the title instead of the icon, when it's set.
  /// It's left out without the action, when only the content closes the dialog.
  init(width: CGFloat, closeTitle: String? = nil, onClose: (() -> Void)?, @ViewBuilder content: () -> Content) {
    self.width = width
    self.closeTitle = closeTitle
    self.onClose = onClose
    self.content = content()
  }

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.cornerRadius)

    ViewThatFits(in: .vertical) {
      content
      ScrollView(.vertical) {
        content
      }
      .scrollBounceBehavior(.basedOnSize)
    }
    #if os(macOS)
    .frame(width: width)
    #else
    .frame(maxWidth: width)
    #endif
    .clipShape(shape)
    .background(
      shape
        .fill(Colors.bgPrimary)
        .shadow(color: Colors.shadowPanel, radius: Constants.shadowRadius)
    )
    .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Borders.width))
    .overlay(alignment: .topTrailing) {
      if let onClose {
        closeButton(action: onClose)
      }
    }
    .accessibilityElement(children: .contain)
    .accessibilityAddTraits(.isModal)
  }

  @ViewBuilder
  private func closeButton(action: @escaping () -> Void) -> some View {
    if let closeTitle {
      Button(action: action) {
        Text(closeTitle)
          .textStyle(.labelM)
          .foregroundColor(Colors.foregroundPrimary)
          .padding(Constants.closeHitPadding)
          .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      #if os(macOS)
      .keyboardShortcut(.cancelAction)
      #endif
      .padding(.top, Constants.closeTitleTopPadding - Constants.closeHitPadding)
      .padding(.trailing, Constants.closeTitleTrailingPadding - Constants.closeHitPadding)
    } else {
      Button(action: action) {
        Image(.dialogClose)
          .frame(width: Constants.closeButtonSize, height: Constants.closeButtonSize)
          .padding(Constants.closeHitPadding)
          .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      #if os(macOS)
      .keyboardShortcut(.cancelAction)
      .help(Strings.close)
      #endif
      .accessibilityLabel(Strings.close)
      .padding(Constants.closeButtonPadding - Constants.closeHitPadding)
    }
  }
}
