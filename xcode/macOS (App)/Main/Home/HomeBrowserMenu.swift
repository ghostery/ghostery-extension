//
//  HomeBrowserMenu.swift
//  Ghostery
//
//  Options of a browser in the Home section, shown below the button of its
//  card.
//

import SwiftUI

fileprivate enum Constants {
  static let menuPadding: CGFloat = 12
  static let menuSpacing: CGFloat = 12
  static let menuCornerRadius: CGFloat = 8
}

/// Bounds of the button whose menu is shown
struct HomeBrowserMenuAnchor: PreferenceKey {
  static let defaultValue: Anchor<CGRect>? = nil

  static func reduce(value: inout Anchor<CGRect>?, nextValue: () -> Anchor<CGRect>?) {
    value = value ?? nextValue()
  }
}

struct HomeBrowserMenu: View {
  struct Item: Identifiable {
    let title: String
    let action: () -> Void

    var id: String { title }
  }

  let items: [Item]
  var onSelect: () -> Void

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.menuCornerRadius)

    VStack(alignment: .leading, spacing: Constants.menuSpacing) {
      ForEach(items) { item in
        Button {
          onSelect()
          item.action()
        } label: {
          Text(item.title)
            .textStyle(.labelM)
            .foregroundColor(Colors.foregroundPrimary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
      }
    }
    .padding(Constants.menuPadding)
    .fixedSize()
    .background(shape.fill(Colors.bgPrimary))
    .overlay(shape.strokeBorder(Colors.borderSecondary, lineWidth: Borders.width))
    .accessibilityElement(children: .contain)
  }
}
