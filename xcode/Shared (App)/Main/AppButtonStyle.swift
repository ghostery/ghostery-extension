//
//  AppButtonStyle.swift
//  Ghostery
//
//  Style of the buttons of the design, shared by the macOS and iOS apps.
//

import SwiftUI

fileprivate enum Constants {
  static let height: CGFloat = 40
  static let largeHeight: CGFloat = 48
  static let smallHeight: CGFloat = 32
  static let cornerRadius: CGFloat = 8
  static let horizontalPadding: CGFloat = 8
  static let largeHorizontalPadding: CGFloat = 12
  static let shadowRadius: CGFloat = 4
  static let shadowY: CGFloat = 3
}

struct AppButtonStyle: ButtonStyle {
  enum Kind {
    case primary
    case secondary
    /// Secondary, in the colors of a warning, for the action of an alert
    case warning
    /// Secondary, in gray, next to the main action
    case secondaryGray
  }

  enum Size: Equatable {
    /// Fills the available width
    case regular
    /// Fills the available width, taller for the main action of a dialog
    case large
    /// Fits its label
    case small
    /// As wide as it's tall, for an icon
    case square(CGFloat)
  }

  /// Of a button while it's pressed, also in the other styles of buttons
  static let pressedOpacity: Double = 0.8

  var kind: Kind
  var size: Size = .regular

  func makeBody(configuration: ButtonStyleConfiguration) -> some View {
    let shape = RoundedRectangle(cornerRadius: Constants.cornerRadius)
    let colors = self.colors

    configuration.label
      .textStyle(.labelM)
      .foregroundColor(colors.label)
      .lineLimit(1)
      .padding(.horizontal, horizontalPadding)
      .frame(maxWidth: size == .regular || size == .large ? .infinity : nil)
      .frame(width: width)
      // Taller for larger text, except for the icons of the square ones
      .frame(minHeight: height, maxHeight: width == nil ? nil : height)
      .background(
        shape
          .fill(colors.fill)
          .shadow(color: Colors.shadowButton, radius: Constants.shadowRadius, y: Constants.shadowY)
      )
      .overlay(
        shape.strokeBorder(colors.border, lineWidth: Borders.width)
      )
      .contentShape(shape)
      .opacity(configuration.isPressed ? Self.pressedOpacity : 1)
  }

  private var colors: (label: Color, fill: Color, border: Color) {
    switch kind {
    case .primary: return (Colors.foregroundOnBrand, Colors.bgBrandSolid, .clear)
    case .secondary: return (Colors.foregroundBrandPrimary, Colors.bgPrimary, Colors.borderBrandSolid)
    case .warning: return (Colors.foregroundWarningPrimary, Colors.bgPrimary, Colors.borderWarningSolid)
    case .secondaryGray: return (Colors.foregroundPrimary, Colors.bgPrimary, Colors.borderSecondary)
    }
  }

  private var horizontalPadding: CGFloat {
    switch size {
    case .regular, .small: return Constants.horizontalPadding
    case .large: return Constants.largeHorizontalPadding
    case .square: return 0
    }
  }

  // Of the square ones, as the others fill the width or fit their labels
  private var width: CGFloat? {
    guard case .square(let side) = size else { return nil }
    return side
  }

  private var height: CGFloat {
    switch size {
    case .regular: return Constants.height
    case .large: return Constants.largeHeight
    case .small: return Constants.smallHeight
    case .square(let side): return side
    }
  }
}
