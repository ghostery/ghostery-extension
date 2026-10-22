//
//  MainTabBar.swift
//  Ghostery
//
//  Tab bar of the app, which switches between its sections, with the button
//  opening the Support dialog next to it.
//

import SwiftUI

fileprivate enum Constants {
  static let borderColor = Color(hex: "#CCE8F5")
  static let borderLineWidth: CGFloat = 1
  // Light along the top edge of the tabs
  static let highlightRadius: CGFloat = 1.5
  static let highlightY: CGFloat = 2
  static let unselectedIconOpacity: Double = 0.6
  static let selectionAnimationDuration: Double = 0.2
  // On devices without the home indicator, the tab bar keeps away from the
  // bottom edge of the screen
  static let screenEdgeBottomPadding: CGFloat = 16
}

fileprivate enum Strings {
  // You can translate your strings here
  static let support = String(localized: "Support", comment: "Button opening the dialog with the ways to get help and give feedback")
}

/// Sizes of the tab bar, which is larger on iPads
fileprivate struct MainTabBarLayout {
  var tabWidth: CGFloat
  var tabHeight: CGFloat
  /// Around the tabs, inside their bar
  var tabsPadding: EdgeInsets
  var tabSpacing: CGFloat
  var supportButtonSize: CGFloat
  /// Between the tabs and the Support button
  var spacing: CGFloat
  /// Above the tab bar, where the sections scroll below it
  var topPadding: CGFloat
  /// Between the tab bar and the home indicator
  var bottomPadding: CGFloat

  static let phone = MainTabBarLayout(
    tabWidth: 74,
    tabHeight: 40,
    tabsPadding: EdgeInsets(top: 3, leading: 4, bottom: 3, trailing: 4),
    tabSpacing: 0,
    supportButtonSize: 40,
    spacing: 12,
    topPadding: 13,
    bottomPadding: 3
  )
  static let tablet = MainTabBarLayout(
    tabWidth: 92,
    tabHeight: 44,
    tabsPadding: EdgeInsets(top: 4, leading: 4, bottom: 4, trailing: 4),
    tabSpacing: 4,
    supportButtonSize: 44,
    spacing: 16,
    topPadding: 14,
    bottomPadding: 24
  )
}

struct MainTabBar: View {
  @Binding var selection: MainSection
  /// Where the home indicator is, if the device has it
  var bottomSafeAreaInset: CGFloat
  var onSupport: () -> Void

  @Environment(\.horizontalSizeClass) private var horizontalSizeClass
  @Environment(\.accessibilityReduceMotion) private var reduceMotion
  @Namespace private var namespace

  var body: some View {
    let layout = horizontalSizeClass == .regular ? MainTabBarLayout.tablet : .phone

    HStack(spacing: layout.spacing) {
      tabs(layout)
      supportButton(layout)
    }
    .padding(.top, layout.topPadding)
    .padding(.bottom, bottomSafeAreaInset > 0 ? layout.bottomPadding : Constants.screenEdgeBottomPadding)
    .frame(maxWidth: .infinity)
  }

  private func tabs(_ layout: MainTabBarLayout) -> some View {
    HStack(spacing: layout.tabSpacing) {
      ForEach(MainSection.allCases) { section in
        tab(for: section, layout: layout)
      }
    }
    .padding(layout.tabsPadding)
    .background(
      Capsule()
        .fill(
          LinearGradient(colors: [Colors.bgBrandSecondary, Colors.bgBrandPrimary], startPoint: .top, endPoint: .bottom)
            .shadow(.inner(color: .white, radius: Constants.highlightRadius, y: Constants.highlightY))
        )
    )
    .overlay(Capsule().strokeBorder(Constants.borderColor, lineWidth: Constants.borderLineWidth))
    // The white background moves to the selected tab
    .animation(reduceMotion ? nil : .easeInOut(duration: Constants.selectionAnimationDuration), value: selection)
    // Read as a tab bar, which tells the position of each tab
    .accessibilityElement(children: .contain)
    .accessibilityAddTraits(.isTabBar)
  }

  private func tab(for section: MainSection, layout: MainTabBarLayout) -> some View {
    let isSelected = section == selection

    return Button {
      selection = section
    } label: {
      Image(section.icon)
        .renderingMode(.template)
        .foregroundColor(Colors.foregroundBrandPrimary)
        .opacity(isSelected ? 1 : Constants.unselectedIconOpacity)
        .frame(width: layout.tabWidth, height: layout.tabHeight)
        .background {
          if isSelected {
            Capsule()
              .fill(Colors.bgPrimary)
              .matchedGeometryEffect(id: "selection", in: namespace)
          }
        }
        .contentShape(Capsule())
    }
    .buttonStyle(.plain)
    .accessibilityLabel(section.title)
    .accessibilityAddTraits(isSelected ? .isSelected : [])
  }

  private func supportButton(_ layout: MainTabBarLayout) -> some View {
    Button(action: onSupport) {
      Image(Icons.homeNavSupport)
        .frame(width: layout.supportButtonSize, height: layout.supportButtonSize)
        .background(RadialGradient.support(size: layout.supportButtonSize))
        .clipShape(Circle())
        .contentShape(Circle())
    }
    .buttonStyle(.plain)
    .accessibilityLabel(Strings.support)
  }
}
