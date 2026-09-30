//
//  SettingsView.swift
//  Ghostery
//
//  Settings section of the main window.
//

import SwiftUI

fileprivate enum Constants {
  static let settingsSpacing: CGFloat = 8
  static let settingsHorizontalPadding: CGFloat = 20
  static let settingsBottomPadding: CGFloat = 12

  static let cardPadding: CGFloat = 16
  static let cardCornerRadius: CGFloat = 12
  static let cardTextSpacing: CGFloat = 4

  static let borderLineWidth: CGFloat = 1
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = "Ghostery Settings"
  static let description = "Manage your privacy settings and control how your data is tracked online."
  static let launchAtStartup = "Launch Ghostery automatically at startup"
  static let launchAtStartupDescription = "Ensures your privacy is protected from the moment you go online. This seamless protection blocks trackers and unwanted ads without any extra effort, helping you browse faster and more securely right from startup."
  static let keepMenuBarIcon = "Keep app icon in the macOS Menu Bar"
  static let keepMenuBarIconDescription = "Keep the app icon in your macOS menu bar to quickly access Ghostery’s privacy controls and notifications, ensuring you stay informed and in control of your online tracking at all times."
}

struct SettingsView: View {
  // Placeholders, to be replaced with the settings of the app
  @State private var launchAtStartup = true
  @State private var keepMenuBarIcon = true

  var body: some View {
    SectionScrollView {
      SectionHeader(
        title: Strings.title,
        description: Strings.description,
        descriptionStyle: .bodyL,
        image: Icons.settingsHeader
      )
      VStack(spacing: Constants.settingsSpacing) {
        SettingToggle(
          title: Strings.launchAtStartup,
          description: Strings.launchAtStartupDescription,
          isOn: $launchAtStartup
        )
        SettingToggle(
          title: Strings.keepMenuBarIcon,
          description: Strings.keepMenuBarIconDescription,
          isOn: $keepMenuBarIcon
        )
      }
      .padding(.horizontal, Constants.settingsHorizontalPadding)
      .padding(.bottom, Constants.settingsBottomPadding)
    } footer: {
      Banner()
    }
  }
}

// MARK: - Setting toggle

struct SettingToggle: View {
  let title: String
  let description: String
  @Binding var isOn: Bool

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: Constants.cardCornerRadius)

    Toggle(isOn: $isOn) {
      VStack(alignment: .leading, spacing: Constants.cardTextSpacing) {
        Text(title)
          .textStyle(.labelL)
          .foregroundColor(Colors.foregroundPrimary)
        Text(description)
          .textStyle(.bodyS)
          .foregroundColor(Colors.foregroundSecondary)
          .fixedSize(horizontal: false, vertical: true)
      }
    }
    .toggleStyle(AppToggleStyle())
    .padding(Constants.cardPadding)
    .background(shape.fill(Colors.bgPrimary))
    .overlay(shape.strokeBorder(Colors.borderPrimary, lineWidth: Constants.borderLineWidth))
  }
}

struct SettingsView_Previews: PreviewProvider {
  static var previews: some View {
    SettingsView()
      .frame(width: 736, height: 642)
  }
}
