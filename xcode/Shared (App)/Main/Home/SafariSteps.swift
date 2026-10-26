//
//  SafariSteps.swift
//  Ghostery
//
//  Steps to enable the extension in the settings of Safari, shown by the
//  instructions page of the Home section and by the onboarding.
//

import SwiftUI

fileprivate enum Constants {
  static let stepsSpacing: CGFloat = 4
  static let stepCornerRadius: CGFloat = 12
  // Between the text of a step and the note below it
  static let noteSpacing: CGFloat = 10
  static let notePadding: CGFloat = 12
  static let noteCornerRadius: CGFloat = 8

  #if os(iOS)
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
  #endif
}

fileprivate enum Strings {
  // You can translate your strings here
  static let openSettings = String(localized: "Open Settings", comment: "Button opening the extension settings of Safari")
  #if os(macOS)
  // The parts between ** are in bold
  static let openExtensionSettings = LocalizedStringResource("Open Safari extension **settings**.", comment: "Step of the instructions, with the part between ** in bold")
  static let selectCheckbox = LocalizedStringResource("Select the checkbox next to **Ghostery**.", comment: "Step of the instructions, with the part between ** in bold")
  static let allowOnEveryWebsite = LocalizedStringResource("Enable permission to **Always Allow on Every Website**.", comment: "Step of the instructions, with the part between ** in bold. Always Allow on Every Website is the name of the option in Safari.")
  static let goBack = LocalizedStringResource("Go back to this app.", comment: "Last step of the instructions")
  #else
  static let openSafariSettings = String(localized: "Open Safari settings", comment: "Step of the instructions, next to the button opening the settings")
  static let goToSafariSettings = String(localized: "Open Settings and go to Apps › Safari › Extensions", comment: "Step of the instructions on iPhones and iPads where the app can't open the settings of Safari, next to the button opening the Settings app. Apps, Safari and Extensions are the names of the pages in the Settings app, as it shows them in the language.")
  static let allowExtension = String(localized: "Enable “Allow\u{00A0}Extension” toggle", comment: "Step of the instructions. Allow Extension is the name of the switch in the settings of Safari on iPhones, as the settings show it in the language. A no-break space joins its words, so it stays on one line.")
  static let allowAllWebsites = String(localized: "In Permissions section select “Allow” for all websites", comment: "Step of the instructions. Permissions and Allow are the names of the section and the option in the settings of Safari on iPhones, as the settings show them in the language.")
  static let goBack = String(localized: "Return to Ghostery app", comment: "Last step of the instructions")
  static let allow = String(localized: "Allow", comment: "Option in the settings of Safari on iPhones, as the settings show it in the language. Shown in the picture next to the step selecting it.")
  #endif
}

/// Sizes of the steps, which differ between the Mac, iPhones and iPads
struct SafariStepLayout: PlatformLayout {
  var padding: CGFloat
  /// Between the number and the text
  var spacing: CGFloat
  var numberSize: CGFloat
  var numberStyle: AppTextStyle
  var textStyle: AppTextStyle
  /// Between the text and the button or the picture after it
  var accessorySpacing: CGFloat
  /// Added to the padding of the button opening the settings, as in the design
  var buttonLabelPadding: CGFloat

  #if os(macOS)
  static let mac = SafariStepLayout(
    padding: 16,
    spacing: 16,
    numberSize: 40,
    numberStyle: .headlineS,
    textStyle: .bodyL,
    accessorySpacing: 16,
    buttonLabelPadding: 8
  )
  #else
  static let phone = SafariStepLayout(
    padding: 12,
    spacing: 12,
    numberSize: 32,
    numberStyle: .labelL,
    textStyle: .bodyM,
    accessorySpacing: 8,
    buttonLabelPadding: 0
  )
  static let tablet = SafariStepLayout(
    padding: 16,
    spacing: 16,
    numberSize: 40,
    numberStyle: .headlineS,
    textStyle: .bodyL,
    accessorySpacing: 10,
    buttonLabelPadding: 0
  )
  #endif
}

/// Steps to enable the extension, also shown when the app opens for the
/// first time
struct SafariEnableSteps: View {
  var layout: SafariStepLayout

  var body: some View {
    VStack(spacing: Constants.stepsSpacing) {
      SafariOpenSettingsStep(layout: layout)
      #if os(macOS)
      SafariInstructionsStep(number: 2, text: Text(Strings.selectCheckbox, boldFont: AppTextStyle.labelL.font), layout: layout)
      SafariInstructionsStep(number: 3, text: Text(Strings.allowOnEveryWebsite, boldFont: AppTextStyle.labelL.font), layout: layout)
      #else
      SafariInstructionsStep(number: 2, text: Text(Strings.allowExtension), layout: layout) {
        SwitchPicture()
      }
      SafariInstructionsStep(number: 3, text: Text(Strings.allowAllWebsites), layout: layout) {
        AllowPicture()
      }
      #endif
      SafariReturnStep(number: 4, layout: layout)
    }
  }
}

/// First step, with the button opening the settings of Safari
struct SafariOpenSettingsStep: View {
  var layout: SafariStepLayout

  var body: some View {
    SafariInstructionsStep(number: 1, text: text, layout: layout) {
      Button(action: SafariExtension.showSettings) {
        Text(Strings.openSettings)
          .padding(.horizontal, layout.buttonLabelPadding)
      }
      .buttonStyle(AppButtonStyle(kind: .primary))
      .fixedSize()
    }
  }

  private var text: Text {
    #if os(macOS)
    Text(Strings.openExtensionSettings, boldFont: AppTextStyle.labelL.font)
    #else
    // When the button can't open the settings of Safari, the step tells
    // the way to them in the Settings app, which the button opens
    Text(SafariExtension.canShowSettings ? Strings.openSafariSettings : Strings.goToSafariSettings)
    #endif
  }
}

/// Last step, going back to the app
struct SafariReturnStep: View {
  var number: Int
  var layout: SafariStepLayout

  var body: some View {
    #if os(macOS)
    SafariInstructionsStep(number: number, text: Text(Strings.goBack, boldFont: AppTextStyle.labelL.font), layout: layout)
    #else
    SafariInstructionsStep(number: number, text: Text(Strings.goBack), layout: layout) {
      ReturnPicture()
    }
    #endif
  }
}

/// Step with its number, followed by its button, or by the picture of what
/// to look for in the settings
struct SafariInstructionsStep<Accessory: View>: View {
  let number: Int
  let text: Text
  /// Shown below the text
  var note: String?
  let layout: SafariStepLayout
  @ViewBuilder var accessory: Accessory

  var body: some View {
    HStack(spacing: layout.accessorySpacing) {
      // A step with a note is aligned to the top of its number
      HStack(alignment: note == nil ? .center : .top, spacing: layout.spacing) {
        Text(String(number))
          .textStyle(layout.numberStyle)
          .foregroundColor(Colors.foregroundBrandPrimary)
          .frame(width: layout.numberSize, height: layout.numberSize)
          .background(Circle().fill(Colors.bgBrandSecondary))
        VStack(alignment: .leading, spacing: Constants.noteSpacing) {
          text
            .textStyle(layout.textStyle)
            .foregroundColor(Colors.foregroundPrimary)
            .fixedSize(horizontal: false, vertical: true)
          if let note {
            Text(note)
              .textStyle(.bodyS)
              .foregroundColor(Colors.foregroundSecondary)
              .fixedSize(horizontal: false, vertical: true)
              .frame(maxWidth: .infinity, alignment: .leading)
              .padding(Constants.notePadding)
              .background(RoundedRectangle(cornerRadius: Constants.noteCornerRadius).fill(Colors.bgSecondary))
          }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      }
      .accessibilityElement(children: .combine)

      accessory
    }
    .padding(layout.padding)
    .cardBackground(cornerRadius: Constants.stepCornerRadius)
  }
}

extension SafariInstructionsStep where Accessory == EmptyView {
  init(number: Int, text: Text, note: String? = nil, layout: SafariStepLayout) {
    self.init(number: number, text: text, note: note, layout: layout) { EmptyView() }
  }
}

#if os(iOS)
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
      Image(.safariInstructionsCheck)
        .accessibilityHidden(true)
    }
    .modifier(SettingsPicture())
  }
}

/// The button of the status bar going back to the app
private struct ReturnPicture: View {
  var body: some View {
    HStack(spacing: Constants.returnSpacing) {
      Image(.safariInstructionsReturn)
        .accessibilityHidden(true)
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
      .frame(minHeight: Constants.pictureHeight)
      .background(RoundedRectangle(cornerRadius: Constants.pictureCornerRadius).fill(Colors.bgSecondary))
      .fixedSize()
      .accessibilityHidden(true)
  }
}
#endif
