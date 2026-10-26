//
//  MainSidebar.swift
//  Ghostery
//
//  Sidebar of the main window, which switches between its sections.
//

import SwiftUI

fileprivate enum Constants {
  static let width: CGFloat = 48
  static let outerPadding: CGFloat = 8
  static let innerPadding: CGFloat = 4
  static let spacing: CGFloat = 4
  static let itemSize: CGFloat = 40
  static let shadowRadius: CGFloat = 20
  static let shadowY: CGFloat = 8
  static let shadowOpacity: Double = 0.12
}

struct MainSidebar: View {
  @Binding var selection: MainSection
  var onSupport: () -> Void

  var body: some View {
    VStack(spacing: Constants.spacing) {
      ForEach(MainSection.allCases) { section in
        item(for: section)
      }

      Spacer(minLength: 0)

      Button(action: onSupport) {
        Image(SupportButton.icon)
          .frame(width: Constants.itemSize, height: Constants.itemSize)
          .background(RadialGradient.support(size: Constants.itemSize))
          .clipShape(Circle())
          .contentShape(Circle())
      }
      .buttonStyle(.plain)
      .help(SupportButton.title)
      .accessibilityLabel(SupportButton.title)
    }
    .padding(Constants.innerPadding)
    .frame(width: Constants.width)
    .frame(maxHeight: .infinity)
    .background(LinearGradient(colors: [Colors.bgTertiary, Color.white], startPoint: .top, endPoint: .bottom))
    .clipShape(Capsule())
    .overlay(Capsule().strokeBorder(Color.white, lineWidth: Borders.width))
    .shadow(
      color: Color.black.opacity(Constants.shadowOpacity),
      radius: Constants.shadowRadius,
      y: Constants.shadowY
    )
    .padding(.horizontal, Constants.outerPadding)
    .padding(.bottom, Constants.outerPadding)
  }

  private func item(for section: MainSection) -> some View {
    let isSelected = section == selection

    return Button {
      selection = section
    } label: {
      Image(section.icon)
        .renderingMode(.template)
        .foregroundColor(isSelected ? Colors.foregroundBrandPrimary : Colors.foregroundTertiary)
        .frame(width: Constants.itemSize, height: Constants.itemSize)
        .background(Capsule().fill(isSelected ? Colors.bgSecondary : Color.clear))
        .contentShape(Capsule())
    }
    .buttonStyle(.plain)
    .help(section.title)
    .accessibilityLabel(section.title)
    .accessibilityAddTraits(isSelected ? .isSelected : [])
  }
}
