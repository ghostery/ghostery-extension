//
//  SafariInstructionsView.swift
//  Ghostery
//
//  Steps to enable the extension in Safari, opened from the Home section.
//

import SwiftUI

fileprivate enum Constants {
  // Between the header of the steps and them
  static let stepsPhoneTopPadding: CGFloat = 8
  static let stepsTabletTopPadding: CGFloat = 24
  static let stepsSpacing: CGFloat = 4
  static let stepCornerRadius: CGFloat = 12

  // Pictures of the settings of Safari, next to the steps
  static let pictureHeight: CGFloat = 32
  static let pictureHorizontalPadding: CGFloat = 8
  static let pictureCornerRadius: CGFloat = 8
  static let switchPictureSize: CGFloat = 40
  static let switchSize = CGSize(width: 24, height: 12)
  static let switchKnobSize = CGSize(width: 14, height: 10)
  static let switchKnobPadding: CGFloat = 1
  static let switchColor = Color(hex: "#35C759")
  static let allowSpacing: CGFloat = 5
  static let returnSpacing: CGFloat = 4
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = String(localized: "Enable Ghostery Privacy\nAd Block for Safari", comment: "Title in two lines. Ghostery Privacy Ad Block is the name of the extension.")
  static let stepsHeader = String(localized: "How to enable Ghostery")
  static let openSettings = String(localized: "Open Settings", comment: "Button opening the extension settings of Safari")
  static let openSafariSettings = String(localized: "Open Safari settings", comment: "Step of the instructions, next to the button opening the settings")
  static let goToSafariSettings = String(localized: "Open Settings and go to Apps › Safari › Extensions", comment: "Step of the instructions on iPhones and iPads where the app can't open the settings of Safari, next to the button opening the Settings app. Apps, Safari and Extensions are the names of the pages in the Settings app, as it shows them in the language.")
  static let allowExtension = String(localized: "Enable “Allow\u{00A0}Extension” toggle", comment: "Step of the instructions. Allow Extension is the name of the switch in the settings of Safari on iPhones, as the settings show it in the language. A no-break space joins its words, so it stays on one line.")
  static let allowAllWebsites = String(localized: "In Permissions section select “Allow” for all websites", comment: "Step of the instructions. Permissions and Allow are the names of the section and the option in the settings of Safari on iPhones, as the settings show them in the language.")
  static let goBack = String(localized: "Return to Ghostery app", comment: "Last step of the instructions")
  static let allow = String(localized: "Allow", comment: "Option in the settings of Safari on iPhones, as the settings show it in the language. Shown in the picture next to the step selecting it.")
}

/// Sizes of the steps, which are larger on the instructions page of iPads
struct SafariStepLayout {
  var padding: CGFloat
  /// Between the number and the text
  var spacing: CGFloat
  var numberSize: CGFloat
  var numberStyle: AppTextStyle
  var textStyle: AppTextStyle
  /// Between the text and the button or the picture after it
  var textSpacing: CGFloat

  static let phone = SafariStepLayout(
    padding: 12,
    spacing: 12,
    numberSize: 32,
    numberStyle: .labelL,
    textStyle: .bodyM,
    textSpacing: 8
  )
  static let tablet = SafariStepLayout(
    padding: 16,
    spacing: 16,
    numberSize: 40,
    numberStyle: .headlineS,
    textStyle: .bodyL,
    textSpacing: 10
  )
}

struct SafariInstructionsView: View {
  var onBack: () -> Void

  var body: some View {
    SectionScrollView { layout in
      SectionHeader(title: Strings.title, layout: layout, onBack: onBack)

      Text(Strings.stepsHeader)
        .textStyle(.labelL)
        .foregroundColor(Colors.foregroundPrimary)
        .accessibilityAddTraits(.isHeader)
        .padding(.bottom, layout.isTablet ? Constants.stepsTabletTopPadding : Constants.stepsPhoneTopPadding)

      SafariEnableSteps(layout: layout.isTablet ? .tablet : .phone)
    }
  }
}

/// Steps to enable the extension, also shown when the app opens for the
/// first time
struct SafariEnableSteps: View {
  var layout: SafariStepLayout

  var body: some View {
    VStack(spacing: Constants.stepsSpacing) {
      // When the button can't open the settings of Safari, the step tells
      // the way to them in the Settings app, which the button opens
      let openSettingsText = SafariExtension.canShowSettings ? Strings.openSafariSettings : Strings.goToSafariSettings
      SafariInstructionsStep(number: 1, text: openSettingsText, layout: layout) {
        Button(Strings.openSettings, action: SafariExtension.showSettings)
          .buttonStyle(AppButtonStyle(kind: .primary))
          .fixedSize()
      }
      SafariInstructionsStep(number: 2, text: Strings.allowExtension, layout: layout) {
        SwitchPicture()
      }
      SafariInstructionsStep(number: 3, text: Strings.allowAllWebsites, layout: layout) {
        AllowPicture()
      }
      SafariInstructionsStep(number: 4, text: Strings.goBack, layout: layout) {
        ReturnPicture()
      }
    }
  }
}

/// Step with its number, followed by its button, or by the picture of what
/// to look for in the settings
private struct SafariInstructionsStep<Accessory: View>: View {
  let number: Int
  let text: String
  let layout: SafariStepLayout
  @ViewBuilder var accessory: Accessory

  var body: some View {
    HStack(spacing: layout.textSpacing) {
      HStack(spacing: layout.spacing) {
        Text(String(number))
          .textStyle(layout.numberStyle)
          .foregroundColor(Colors.foregroundBrandPrimary)
          .frame(width: layout.numberSize, height: layout.numberSize)
          .background(Circle().fill(Colors.bgBrandSecondary))
        Text(text)
          .textStyle(layout.textStyle)
          .foregroundColor(Colors.foregroundPrimary)
          .fixedSize(horizontal: false, vertical: true)
          .frame(maxWidth: .infinity, alignment: .leading)
      }
      .accessibilityElement(children: .combine)

      accessory
    }
    .padding(layout.padding)
    .cardBackground(cornerRadius: Constants.stepCornerRadius)
  }
}

// MARK: - Pictures

/// The switch of the settings, turned on
private struct SwitchPicture: View {
  var body: some View {
    Capsule()
      .fill(Constants.switchColor)
      .frame(width: Constants.switchSize.width, height: Constants.switchSize.height)
      .overlay(alignment: .trailing) {
        Capsule()
          .fill(Color.white)
          .frame(width: Constants.switchKnobSize.width, height: Constants.switchKnobSize.height)
          .padding(.trailing, Constants.switchKnobPadding)
      }
      .frame(width: Constants.switchPictureSize, height: Constants.switchPictureSize)
      .background(RoundedRectangle(cornerRadius: Constants.pictureCornerRadius).fill(Colors.bgSecondary))
      .accessibilityHidden(true)
  }
}

/// The option of the permission, selected
private struct AllowPicture: View {
  var body: some View {
    HStack(spacing: Constants.allowSpacing) {
      Text(Strings.allow)
      Image(decorative: Icons.safariInstructionsCheck)
    }
    .modifier(SettingsPicture())
  }
}

/// The button of the status bar going back to the app
private struct ReturnPicture: View {
  var body: some View {
    HStack(spacing: Constants.returnSpacing) {
      Image(decorative: Icons.safariInstructionsReturn)
      Text(verbatim: appName)
    }
    .modifier(SettingsPicture())
  }

  // As the status bar shows it
  private var appName: String {
    Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ?? "Ghostery"
  }
}

/// Small picture of a part of the system's interface
private struct SettingsPicture: ViewModifier {
  func body(content: Content) -> some View {
    content
      .textStyle(.labelXS)
      .foregroundColor(Color.black)
      .lineLimit(1)
      .padding(.horizontal, Constants.pictureHorizontalPadding)
      .frame(height: Constants.pictureHeight)
      .background(RoundedRectangle(cornerRadius: Constants.pictureCornerRadius).fill(Colors.bgSecondary))
      .fixedSize()
      .accessibilityHidden(true)
  }
}

struct SafariInstructionsView_Previews: PreviewProvider {
  static var previews: some View {
    SafariInstructionsView(onBack: {})
  }
}
