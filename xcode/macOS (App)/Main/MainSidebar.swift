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
  static let borderLineWidth: CGFloat = 1
  static let supportGradientCenter = UnitPoint(x: 0.175, y: 0.15)
  static let supportGradientEndRadius: CGFloat = 38.7
}

fileprivate enum Strings {
  // You can translate your strings here
  static let support = "Support"
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
        Image(Icons.homeNavSupport)
          .frame(width: Constants.itemSize, height: Constants.itemSize)
          .background(supportGradient)
          .clipShape(Circle())
          .contentShape(Circle())
      }
      .buttonStyle(.plain)
      .help(Strings.support)
      .accessibilityLabel(Strings.support)
    }
    .padding(Constants.innerPadding)
    .frame(width: Constants.width)
    .frame(maxHeight: .infinity)
    .background(LinearGradient(colors: [Colors.bgTertiary, Color.white], startPoint: .top, endPoint: .bottom))
    .clipShape(Capsule())
    .overlay(Capsule().strokeBorder(Color.white, lineWidth: Constants.borderLineWidth))
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
        .foregroundColor(isSelected ? Colors.foregroundBrandPrimary : Colors.foregroungTertiary)
        .frame(width: Constants.itemSize, height: Constants.itemSize)
        .background(Capsule().fill(isSelected ? Colors.bgSecondary : Color.clear))
        .contentShape(Capsule())
    }
    .buttonStyle(.plain)
    .help(section.title)
    .accessibilityLabel(section.title)
    .accessibilityAddTraits(isSelected ? .isSelected : [])
  }

  private var supportGradient: some View {
    RadialGradient(
      stops: [
        .init(color: Color(hex: "#00AEF0"), location: 0),
        .init(color: Color(hex: "#068DCF"), location: 0.25),
        .init(color: Color(hex: "#0D6BAF"), location: 0.5),
        .init(color: Color(hex: "#134A8E"), location: 0.75),
        .init(color: Color(hex: "#19296E"), location: 1),
      ],
      center: Constants.supportGradientCenter,
      startRadius: 0,
      endRadius: Constants.supportGradientEndRadius
    )
  }
}
