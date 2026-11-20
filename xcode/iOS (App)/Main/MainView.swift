//
//  MainView.swift
//  Ghostery
//
//  Root view of the app. The section selected in the tab bar is shown above
//  it, and the dialogs over both.
//

import SwiftUI

fileprivate enum Constants {
  // Lights of the background on iPhones: blurred circles, placed for
  // a screen of the design's size
  static let backgroundSize = CGSize(width: 402, height: 874)
  static let backgroundBlur: CGFloat = 200
  static let blueLightColor = Color(hex: "#A1E4FF")
  static let blueLightOpacity: Double = 0.6
  static let blueLightRadius: CGFloat = 207
  static let blueLightCenter = CGPoint(x: 119.5, y: 231)
  static let violetLightColor = Color(hex: "#3751D5")
  static let violetLightOpacity: Double = 0.3
  static let violetLightRadius: CGFloat = 165
  static let violetLightCenter = CGPoint(x: 360, y: 626)

  // Background on iPads, from the top to the bottom
  static let backgroundGradient = Gradient(stops: [
    .init(color: Color(hex: "#E7F8FF"), location: 0),
    .init(color: Color(hex: "#F6FBFF"), location: 0.48),
    .init(color: Color(hex: "#EBECFA"), location: 1),
  ])
}

struct MainView: View {
  // Restored with the window. As in the macOS app, the selection is a state
  // saved to the scene storage, so the views it shows are updated.
  @SceneStorage("MainView.section") private var restoredSection = MainSection.home
  @State private var section = MainSection.home
  @State private var dialogs = DialogPresenter()

  var body: some View {
    GeometryReader { proxy in
      detail
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        // The sections scroll below the tab bar, which floats over them
        .safeAreaInset(edge: .bottom, spacing: 0) {
          MainTabBar(
            selection: $section,
            bottomSafeAreaInset: proxy.safeAreaInsets.bottom,
            onSupport: { dialogs.show(.support) }
          )
        }
        // A dialog covers the sections and the tab bar
        .dialogHost(dialogs)
    }
    .background(MainBackground())
    .preferredColorScheme(.light)
    // The text grows with the size chosen by the user up to the largest one
    // before the accessibility sizes, which the layouts don't fit
    .dynamicTypeSize(...DynamicTypeSize.xxxLarge)
    .task { await dialogs.showSafariOnboardingIfNeeded() }
    .onAppear { section = DebugLaunch.section ?? restoredSection }
    .onChange(of: section) { restoredSection = section }
    // Links to the app, like the one of the settings page of the extension
    // in Safari, show a section
    .onOpenURL { url in
      guard let section = MainSection(url: url) else { return }
      dialogs.dismiss()
      self.section = section
    }
  }

  @ViewBuilder
  private var detail: some View {
    switch section {
    case .home:
      HomeView()
    case .learningZone:
      LearningZoneView()
    case .contribute:
      BecomeContributorView()
    }
  }
}

/// Light background of the app, also behind the status bar and the tab bar
private struct MainBackground: View {
  @Environment(\.horizontalSizeClass) private var horizontalSizeClass

  var body: some View {
    Group {
      if horizontalSizeClass == .regular {
        LinearGradient(gradient: Constants.backgroundGradient, startPoint: .top, endPoint: .bottom)
      } else {
        lights
      }
    }
    .ignoresSafeArea()
  }

  // Blue and violet lights over white, placed relative to the screen size
  private var lights: some View {
    GeometryReader { proxy in
      let scale = CGSize(
        width: proxy.size.width / Constants.backgroundSize.width,
        height: proxy.size.height / Constants.backgroundSize.height
      )

      ZStack {
        Colors.bgPrimary
        light(color: Constants.blueLightColor, opacity: Constants.blueLightOpacity, radius: Constants.blueLightRadius)
          .position(x: Constants.blueLightCenter.x * scale.width, y: Constants.blueLightCenter.y * scale.height)
        light(color: Constants.violetLightColor, opacity: Constants.violetLightOpacity, radius: Constants.violetLightRadius)
          .position(x: Constants.violetLightCenter.x * scale.width, y: Constants.violetLightCenter.y * scale.height)
      }
    }
  }

  // A blurred circle spreads like a Gaussian whose variance is the sum of the
  // blur's and the circle's, which is a quarter of its squared radius. Drawn
  // as a gradient, it's the same as the blur of the design, without blurring.
  private func light(color: Color, opacity: Double, radius: CGFloat) -> some View {
    let spread = (Constants.backgroundBlur * Constants.backgroundBlur + radius * radius / 4).squareRoot()
    // With the same amount of color as the circle
    let peak = opacity * radius * radius / (2 * spread * spread)
    let stops = stride(from: 0.0, through: 3, by: 0.25).map { distance in
      Gradient.Stop(color: color.opacity(peak * exp(-distance * distance / 2)), location: distance / 3)
    }

    return RadialGradient(stops: stops, center: .center, startRadius: 0, endRadius: 3 * spread)
      .frame(width: 6 * spread, height: 6 * spread)
  }
}

#Preview {
  MainView()
}
