//
//  SettingsView.swift
//  Ghostery
//
//  Settings section of the main window.
//

import SwiftUI

fileprivate enum Constants {
  static let settingsSpacing: CGFloat = 8
  static let settingsBottomPadding: CGFloat = 12

  static let cardPadding: CGFloat = 16
  static let cardCornerRadius: CGFloat = 12
  static let cardTextSpacing: CGFloat = 4

  // 16 after the label, and 40 before the switch
  static let toggleSpacing: CGFloat = 56
  static let toggleTopPadding: CGFloat = 4
  static let toggleWidth: CGFloat = 36
  static let toggleHeight: CGFloat = 20
  static let toggleKnobSize: CGFloat = 16
  static let toggleKnobPadding: CGFloat = 2
  static let toggleKnobShadowRadius: CGFloat = 1.5
  static let toggleKnobShadowY: CGFloat = 1
  static let toggleStateSpacing: CGFloat = 8
  static let toggleStateWidth: CGFloat = 80
  static let toggleAnimationDuration: Double = 0.15
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = String(localized: "Ghostery Settings", comment: "Title of the Settings section")
  static let description = String(localized: "Manage your privacy settings and control how your data is tracked online.")
  static let launchAtStartup = String(localized: "Launch Ghostery automatically at startup", comment: "Setting opening the app when the user logs in")
  static let launchAtStartupDescription = String(localized: "Ensures your privacy is protected from the moment you go online. This seamless protection blocks trackers and unwanted ads without any extra effort, helping you browse faster and more securely right from startup.")
  static let keepMenuBarIcon = String(localized: "Keep app icon in the macOS Menu Bar", comment: "Setting showing the icon of the app in the menu bar")
  static let keepMenuBarIconDescription = String(localized: "Keep the app icon in your macOS menu bar to quickly access Ghostery’s privacy controls and notifications, ensuring you stay informed and in control of your online tracking at all times.")
  static let toggleOn = String(localized: "ON", comment: "State of a switch, shown next to it")
  static let toggleOff = String(localized: "OFF", comment: "State of a switch, shown next to it")
}

struct SettingsView: View {
  var body: some View {
    @Bindable var settings = AppSettings.shared

    SectionScrollView {
      SectionHeader(
        title: Strings.title,
        description: Strings.description,
        image: .settingsHeader
      )
      VStack(spacing: Constants.settingsSpacing) {
        SettingToggle(
          title: Strings.launchAtStartup,
          description: Strings.launchAtStartupDescription,
          isOn: Binding(get: { settings.launchesAtLogin }, set: settings.setLaunchesAtLogin)
        )
        SettingToggle(
          title: Strings.keepMenuBarIcon,
          description: Strings.keepMenuBarIconDescription,
          isOn: $settings.showsMenuBarIcon
        )
      }
      .sectionContentPadding()
      .padding(.bottom, Constants.settingsBottomPadding)
    } footer: {
      Banner()
    }
  }
}

// MARK: - Setting toggle

private struct SettingToggle: View {
  let title: String
  let description: String
  @Binding var isOn: Bool

  var body: some View {
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
    .toggleStyle(SettingToggleStyle())
    .padding(Constants.cardPadding)
    .cardBackground(cornerRadius: Constants.cardCornerRadius)
  }
}

/// Label of the toggle, followed by its switch and the state of the switch
private struct SettingToggleStyle: ToggleStyle {
  func makeBody(configuration: ToggleStyleConfiguration) -> some View {
    HStack(alignment: .top, spacing: Constants.toggleSpacing) {
      configuration.label
        .frame(maxWidth: .infinity, alignment: .leading)

      Button {
        configuration.isOn.toggle()
      } label: {
        HStack(spacing: Constants.toggleStateSpacing) {
          toggleSwitch(isOn: configuration.isOn)
          Text(configuration.isOn ? Strings.toggleOn : Strings.toggleOff)
            .textStyle(.labelM)
            .foregroundColor(configuration.isOn ? Colors.foregroundSecondary : Colors.foregroundTertiary)
            // Assistive technologies get the state as the value of the toggle
            .accessibilityHidden(true)
        }
        .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      // Wider for the longer states of some languages
      .frame(minWidth: Constants.toggleStateWidth, alignment: .leading)
      .padding(.top, Constants.toggleTopPadding)
    }
    // Assistive technologies get a single toggle, named by its label
    .accessibilityElement(children: .combine)
    .accessibilityAddTraits(.isToggle)
  }

  private func toggleSwitch(isOn: Bool) -> some View {
    Capsule()
      .fill(isOn ? Colors.foregroundSecondary : Colors.foregroundQuaternary)
      .frame(width: Constants.toggleWidth, height: Constants.toggleHeight)
      .overlay(alignment: isOn ? .trailing : .leading) {
        Circle()
          .fill(Colors.bgPrimary)
          .shadow(color: Colors.shadowSmall, radius: Constants.toggleKnobShadowRadius, y: Constants.toggleKnobShadowY)
          .frame(width: Constants.toggleKnobSize, height: Constants.toggleKnobSize)
          .padding(Constants.toggleKnobPadding)
      }
      .animation(.easeInOut(duration: Constants.toggleAnimationDuration), value: isOn)
  }
}

#Preview {
  SettingsView()
    .frame(width: 736, height: 642)
}
