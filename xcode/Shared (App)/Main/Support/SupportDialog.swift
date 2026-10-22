//
//  SupportDialog.swift
//  Ghostery
//
//  Support dialog, opened from the sidebar of the main window on the Mac,
//  and from the tab bar on iPhones and iPads.
//

import SwiftUI

fileprivate enum Constants {
  static let textSpacing: CGFloat = 8

  static let imageWidth: CGFloat = 240
  static let imageHeight: CGFloat = 144

  static let optionsSpacing: CGFloat = 4
  static let optionPadding: CGFloat = 12
  static let optionSpacing: CGFloat = 16
  static let optionCornerRadius: CGFloat = 12
  static let optionTextSpacing: CGFloat = 4
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = String(localized: "Help & feedback", comment: "Title of the Support dialog")
  static let description = String(localized: "The Ghostery team reads every message.")
}

fileprivate enum URLs {
  static let submitTracker = URL(string: "https://www.ghostery.com/submit-a-tracker")!.tagged(campaign: "support")
  #if os(macOS)
  static let survey = URL(string: "https://blocksurvey.io/feedback-from-mac-app-_ZuTUk0YQkiQu7kanSVDgA")!
  #endif
  static let support = URL(string: "https://www.ghostery.com/support")!.tagged(campaign: "support")
}

fileprivate let contactOption = SupportOption(
  id: "contact",
  icon: Icons.supportContact,
  title: String(localized: "Something not working?"),
  description: String(localized: "Ghostery missing from a browser, or not behaving as expected? Our team will help."),
  actionTitle: String(localized: "Contact support"),
  action: .open(URLs.support)
)

#if os(macOS)
// About the Mac app, so there's no survey for the iOS app yet
fileprivate let feedbackOption = SupportOption(
  id: "feedback",
  icon: Icons.supportFeedback,
  title: String(localized: "How’s it going?", comment: "Title of the card with the link to the feedback survey"),
  description: String(localized: "A few quick questions about setting up and using Ghostery on your Mac."),
  actionTitle: String(localized: "Share feedback"),
  action: .open(URLs.survey)
)
#endif

fileprivate let trackerOption = SupportOption(
  id: "tracker",
  icon: Icons.supportTracker,
  title: String(localized: "Found an unknown tracker?"),
  description: String(localized: "Report it to us to help keep the tracker database up to date."),
  actionTitle: String(localized: "Submit a tracker"),
  action: .open(URLs.submitTracker)
)

#if os(macOS)
fileprivate let options = [contactOption, feedbackOption, trackerOption]
#else
fileprivate let options = [contactOption, trackerOption]
#endif

/// Sizes of the dialog, which differ between the Mac, iPhones and iPads
fileprivate struct SupportDialogLayout {
  var width: CGFloat
  var topPadding: CGFloat
  var bottomPadding: CGFloat
  var horizontalPadding: CGFloat
  /// Between the image and the texts
  var imageSpacing: CGFloat
  /// Between the texts and the options
  var optionsTopSpacing: CGFloat
  var titleStyle: AppTextStyle
  var descriptionStyle: AppTextStyle
  /// Of the description, so it wraps as in the design
  var descriptionWidth: CGFloat
  /// Whether the options are in a row, rather than one below the other
  var areOptionsInRow: Bool
  var option: SupportOptionLayout

  #if os(macOS)
  static let mac = SupportDialogLayout(
    width: 640,
    topPadding: 40,
    bottomPadding: 24,
    horizontalPadding: 24,
    imageSpacing: 24,
    optionsTopSpacing: 24,
    titleStyle: .displayS,
    descriptionStyle: .bodyM,
    descriptionWidth: 550,
    areOptionsInRow: true,
    option: .column
  )
  #else
  static let phone = SupportDialogLayout(
    width: 640,
    topPadding: 40,
    bottomPadding: 20,
    horizontalPadding: 20,
    imageSpacing: 32,
    optionsTopSpacing: 20,
    titleStyle: .headlineS,
    descriptionStyle: .bodyM,
    descriptionWidth: 331,
    areOptionsInRow: false,
    option: .row
  )
  static let tablet = SupportDialogLayout(
    width: 640,
    topPadding: 40,
    bottomPadding: 24,
    horizontalPadding: 24,
    imageSpacing: 24,
    optionsTopSpacing: 24,
    titleStyle: .displayM,
    descriptionStyle: .bodyL,
    descriptionWidth: 412,
    areOptionsInRow: true,
    option: .column
  )
  #endif
}

/// Sizes of an option, whose icon is above its texts in the cards in a row,
/// and before them in the cards one below the other
struct SupportOptionLayout {
  var isIconBeside: Bool
  var iconSize: CGFloat
  /// Of the image of the icon, which is otherwise as large as it's drawn
  var iconImageSize: CGFloat?
  /// Between the icon and the texts, when it's before them
  var iconSpacing: CGFloat
  var titleStyle: AppTextStyle
  /// Of the texts, which are at least as tall as two lines of the title
  /// and three of the description in the cards in a row
  var textMinHeight: CGFloat?

  static let column = SupportOptionLayout(
    isIconBeside: false,
    iconSize: 64,
    iconImageSize: nil,
    iconSpacing: 0,
    titleStyle: .headlineS,
    textMinHeight: 92
  )
  static let row = SupportOptionLayout(
    isIconBeside: true,
    iconSize: 48,
    iconImageSize: 24,
    iconSpacing: 12,
    titleStyle: .labelL,
    textMinHeight: nil
  )
}

struct SupportDialog: View {
  var onClose: () -> Void

  @Environment(\.performAction) private var performAction
  #if os(iOS)
  @Environment(\.horizontalSizeClass) private var horizontalSizeClass
  #endif

  var body: some View {
    let layout = self.layout

    AppDialog(width: layout.width, onClose: onClose) {
      content(layout)
    }
  }

  private var layout: SupportDialogLayout {
    #if os(macOS)
    .mac
    #else
    horizontalSizeClass == .regular ? .tablet : .phone
    #endif
  }

  private func content(_ layout: SupportDialogLayout) -> some View {
    VStack(spacing: 0) {
      Image(decorative: Icons.supportHeader)
        .frame(width: Constants.imageWidth, height: Constants.imageHeight)
        .padding(.bottom, layout.imageSpacing)

      VStack(spacing: Constants.textSpacing) {
        Text(Strings.title)
          .textStyle(layout.titleStyle)
          .accessibilityAddTraits(.isHeader)
        Text(Strings.description)
          .textStyle(layout.descriptionStyle)
          .multilineTextAlignment(.center)
          .frame(maxWidth: layout.descriptionWidth)
          .fixedSize(horizontal: false, vertical: true)
      }
      .foregroundColor(Colors.foregroundPrimary)
      .padding(.bottom, layout.optionsTopSpacing)

      let stack = layout.areOptionsInRow
        ? AnyLayout(HStackLayout(alignment: .top, spacing: Constants.optionsSpacing))
        : AnyLayout(VStackLayout(spacing: Constants.optionsSpacing))

      // The cards stretch to the tallest one, so their buttons line up
      stack {
        ForEach(options) { option in
          SupportOptionCard(option: option, layout: layout.option, action: { performAction(option.action) })
            .frame(maxHeight: .infinity)
        }
      }
      .fixedSize(horizontal: false, vertical: true)
    }
    .padding(.top, layout.topPadding)
    .padding(.bottom, layout.bottomPadding)
    .padding(.horizontal, layout.horizontalPadding)
  }
}

// MARK: - Option card

struct SupportOption: Identifiable {
  let id: String
  let icon: String
  let title: String
  let description: String
  let actionTitle: String
  let action: MainAction
}

struct SupportOptionCard: View {
  let option: SupportOption
  let layout: SupportOptionLayout
  var action: () -> Void

  var body: some View {
    VStack(alignment: .leading, spacing: Constants.optionSpacing) {
      if layout.isIconBeside {
        HStack(spacing: layout.iconSpacing) {
          icon
          texts
        }
      } else {
        icon
        texts
          .frame(maxHeight: .infinity, alignment: .top)
      }

      Button(action: action) {
        Text(option.actionTitle)
      }
      .buttonStyle(AppButtonStyle(kind: .secondary))
    }
    .padding(Constants.optionPadding)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .cardBackground(cornerRadius: Constants.optionCornerRadius)
    .singleActionAccessibility(label: [option.title, option.description, option.actionTitle])
  }

  @ViewBuilder
  private var icon: some View {
    Group {
      if let size = layout.iconImageSize {
        Image(decorative: option.icon)
          .resizable()
          .frame(width: size, height: size)
      } else {
        Image(decorative: option.icon)
      }
    }
    .frame(width: layout.iconSize, height: layout.iconSize)
    .background(Circle().fill(Colors.bgBrandSecondary))
  }

  private var texts: some View {
    VStack(alignment: .leading, spacing: Constants.optionTextSpacing) {
      Text(option.title)
        .textStyle(layout.titleStyle)
        .foregroundColor(Colors.foregroundPrimary)
        .fixedSize(horizontal: false, vertical: true)
      Text(option.description)
        .textStyle(.bodyS)
        .foregroundColor(Colors.foregroundSecondary)
        .fixedSize(horizontal: false, vertical: true)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    // Longer texts make the card taller
    .frame(minHeight: layout.textMinHeight, alignment: .top)
  }
}

struct SupportDialog_Previews: PreviewProvider {
  static var previews: some View {
    SupportDialog(onClose: {})
      .padding(40)
  }
}
