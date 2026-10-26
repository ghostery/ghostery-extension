//
//  DonationOptions.swift
//  Ghostery
//
//  Donation options of the donation page, opened from the Contribute section,
//  with its buttons restoring the donations and opening the legal pages.
//

import StoreKit
import SwiftUI

fileprivate enum Constants {
  static let cardCornerRadius: CGFloat = 12

  static let textSpacing: CGFloat = 8

  static let periodsSpacing: CGFloat = 32
  static let periodSpacing: CGFloat = 8
  static let radioSize: CGFloat = 16
  static let radioDotSize: CGFloat = 6
  static let radioShadowRadius: CGFloat = 8
  static let radioShadowY: CGFloat = 3

  static let amountsSpacing: CGFloat = 8
  static let amountPadding: CGFloat = 24
  static let fillingAmountHorizontalPadding: CGFloat = 8
  static let fillingAmountMinimumScale: CGFloat = 0.6
  static let amountCornerRadius: CGFloat = 12
  static let amountShadowRadius: CGFloat = 6
  static let amountShadowY: CGFloat = 4
  // Of an amount, so the card doesn't change its height while loading
  static let amountHeight: CGFloat = 72

  static let spinnerSize: CGFloat = 20
  static let spinnerLineWidth: CGFloat = 4
  static let spinnerLength: CGFloat = 0.6
  static let spinnerTurnDuration: TimeInterval = 0.8

  static let legalSpacing: CGFloat = 12
}

fileprivate enum Strings {
  // You can translate your strings here
  static let restore = String(localized: "Restore donation", comment: "Button restoring the monthly or yearly donations made with the Apple Account of the user")
  static let title = String(localized: "Choose the most convenient method to support Ghostery")
  static let description = String(localized: "Support our mission and help us develop even stronger protection against trackers and ads, making the web safer for everyone.")
  static let monthly = String(localized: "Monthly", comment: "Option for a donation made every month")
  static let yearly = String(localized: "Yearly donation", comment: "Option for a donation made every year")
  static let oneTime = String(localized: "One-time donation", comment: "Option for a single donation")
  static let donate = String(localized: "Donate", comment: "Button making the selected donation")
  static let eula = String(localized: "EULA", comment: "Link to the End User License Agreement")
  static let terms = String(localized: "Terms of Use")
  static let privacy = String(localized: "Privacy Policy")
  static let failedTitle = String(localized: "Donation failed")
  static let failedMessage = String(localized: "The App Store couldn’t complete the donation. Please try again later.")
  static let ok = String(localized: "OK", comment: "Button closing the alert")
}

fileprivate enum URLs {
  static let eula = URL(string: "https://www.ghostery.com/privacy/ghostery-subscription-plans-and-products-end-user-license-agreement")!
  static let terms = URL(string: "https://www.ghostery.com/privacy/extension-tos")!
  static let privacy = URL(string: "https://www.ghostery.com/privacy/policy")!
}

extension DonationPeriod {
  fileprivate var title: String {
    switch self {
    case .monthly: return Strings.monthly
    case .yearly: return Strings.yearly
    case .oneTime: return Strings.oneTime
    }
  }
}

/// Sizes of the donation options, which differ between the Mac, iPhones and
/// iPads
struct DonationLayout: PlatformLayout {
  /// Of the card, which is otherwise as wide as the page
  var maxWidth: CGFloat?
  var padding: EdgeInsets
  /// Between the texts, the options and the button
  var spacing: CGFloat
  var titleStyle: AppTextStyle
  /// Of the title, so it wraps as in the design
  var titleWidth: CGFloat
  /// How far the title can reach into the padding of the card
  var titleOverhang: CGFloat
  var descriptionStyle: AppTextStyle
  var descriptionWidth: CGFloat
  /// Whether the periods are one below the other, rather than in a row
  var arePeriodsStacked: Bool
  var periodsPadding: EdgeInsets
  var periodMinHeight: CGFloat?
  /// Whether the amounts share the width of the card, rather than fit
  /// their prices
  var areAmountsFilling: Bool
  var donateButtonSize: AppButtonStyle.Size
  /// Of the button, which is otherwise as wide as the card
  var donateButtonWidth: CGFloat?

  #if os(macOS)
  static let mac = DonationLayout(
    maxWidth: nil,
    padding: EdgeInsets(top: 40, leading: 64, bottom: 40, trailing: 64),
    spacing: 32,
    titleStyle: .displayS,
    titleWidth: 362,
    titleOverhang: 0,
    descriptionStyle: .bodyS,
    descriptionWidth: 288,
    arePeriodsStacked: false,
    periodsPadding: EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16),
    periodMinHeight: nil,
    areAmountsFilling: false,
    donateButtonSize: .regular,
    donateButtonWidth: 274
  )
  #else
  static let phone = DonationLayout(
    maxWidth: nil,
    padding: EdgeInsets(top: 24, leading: 24, bottom: 24, trailing: 24),
    spacing: 24,
    titleStyle: .displayS,
    titleWidth: 362,
    titleOverhang: 21,
    descriptionStyle: .bodyS,
    descriptionWidth: 288,
    arePeriodsStacked: true,
    periodsPadding: EdgeInsets(),
    periodMinHeight: 40,
    areAmountsFilling: true,
    donateButtonSize: .large,
    donateButtonWidth: nil
  )
  static let tablet = DonationLayout(
    maxWidth: 674,
    padding: EdgeInsets(top: 24, leading: 24, bottom: 24, trailing: 24),
    spacing: 24,
    titleStyle: .displayL,
    titleWidth: 556,
    titleOverhang: 0,
    descriptionStyle: .bodyM,
    descriptionWidth: 464,
    arePeriodsStacked: false,
    periodsPadding: EdgeInsets(),
    periodMinHeight: 40,
    areAmountsFilling: true,
    donateButtonSize: .large,
    donateButtonWidth: nil
  )
  #endif
}

/// Card with the periods and the amounts of the donations, and the button
/// making the selected one
struct DonationOptions: View {
  var onDonated: () -> Void

  @CurrentLayout private var layout: DonationLayout
  private var donations: Donations { .shared }

  @State private var period = DonationPeriod.monthly
  @State private var selectedProductID: Product.ID?
  @State private var showsFailure = false

  var body: some View {
    let layout = self.layout
    let selectedProduct = self.selectedProduct

    VStack(spacing: layout.spacing) {
      VStack(spacing: Constants.textSpacing) {
        Text(Strings.title)
          .textStyle(layout.titleStyle)
          .frame(maxWidth: layout.titleWidth)
          .padding(.horizontal, -layout.titleOverhang)
          .accessibilityAddTraits(.isHeader)
        Text(Strings.description)
          .textStyle(layout.descriptionStyle)
          .frame(maxWidth: layout.descriptionWidth)
      }
      .foregroundColor(Colors.foregroundPrimary)
      .multilineTextAlignment(.center)
      .fixedSize(horizontal: false, vertical: true)

      periods
      amounts(selectedProduct: selectedProduct)

      Button {
        guard let product = selectedProduct else { return }
        Task { await donate(product) }
      } label: {
        if donations.isDonating {
          AppSpinner(
            color: Colors.foregroundOnBrand,
            lineWidth: Constants.spinnerLineWidth,
            length: Constants.spinnerLength,
            turnDuration: Constants.spinnerTurnDuration
          )
          .frame(width: Constants.spinnerSize, height: Constants.spinnerSize)
        } else {
          Text(Strings.donate)
        }
      }
      .buttonStyle(AppButtonStyle(kind: .primary, size: layout.donateButtonSize))
      .frame(width: layout.donateButtonWidth)
      .disabled(selectedProduct == nil || donations.isDonating)
    }
    .padding(layout.padding)
    .frame(maxWidth: .infinity)
    .cardBackground(cornerRadius: Constants.cardCornerRadius)
    .frame(maxWidth: layout.maxWidth)
    .frame(maxWidth: .infinity)
    .alert(Strings.failedTitle, isPresented: $showsFailure) {
      Button(Strings.ok, role: .cancel) {}
    } message: {
      Text(Strings.failedMessage)
    }
    // Loaded when the app starts, and again when that failed, like offline
    .task { await donations.loadProducts() }
  }

  private var selectedProduct: Product? {
    donations.products(for: period).first { $0.id == selectedProductID }
      ?? donations.defaultProduct(for: period)
  }

  private var periods: some View {
    let stack = layout.arePeriodsStacked
      ? AnyLayout(VStackLayout(alignment: .leading, spacing: 0))
      : AnyLayout(HStackLayout(spacing: Constants.periodsSpacing))

    return stack {
      ForEach(DonationPeriod.allCases) { option in
        Button {
          period = option
          selectedProductID = nil
        } label: {
          HStack(spacing: Constants.periodSpacing) {
            DonationRadio(isSelected: period == option)
            Text(option.title)
              .textStyle(.labelM)
              .foregroundColor(Colors.foregroundPrimary)
          }
          .frame(minHeight: layout.periodMinHeight)
          .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(period == option ? .isSelected : [])
      }
    }
    .padding(layout.periodsPadding)
  }

  @ViewBuilder
  private func amounts(selectedProduct: Product?) -> some View {
    let products = donations.products(for: period)

    if products.isEmpty {
      ProgressView()
        .controlSize(.small)
        .frame(height: Constants.amountHeight)
    } else {
      HStack(spacing: Constants.amountsSpacing) {
        ForEach(products) { product in
          let isSelected = product.id == selectedProduct?.id

          Button(product.displayPrice) {
            selectedProductID = product.id
          }
          .buttonStyle(DonationAmountStyle(isSelected: isSelected, isFilling: layout.areAmountsFilling))
          .accessibilityAddTraits(isSelected ? .isSelected : [])
        }
      }
    }
  }

  private func donate(_ product: Product) async {
    switch await donations.donate(product) {
    case .donated:
      onDonated()
    case .failed:
      showsFailure = true
    case .pending, .cancelled:
      break
    }
  }
}

/// Restores the monthly or yearly donations made with the Apple Account
struct DonationRestoreButton: View {
  /// Around the title, where the button can also be tapped
  var hitPadding: CGFloat = 0

  private var donations: Donations { .shared }

  var body: some View {
    Button {
      Task { await donations.restore() }
    } label: {
      Text(Strings.restore)
        .padding(hitPadding)
        .contentShape(Rectangle())
    }
    .padding(-hitPadding)
    .disabled(donations.isRestoring)
  }
}

/// Links to the legal pages of the donations
struct DonationLegalLinks: View {
  @Environment(\.openURL) private var openURL

  var body: some View {
    HStack(spacing: Constants.legalSpacing) {
      Button(Strings.eula) { openURL(URLs.eula) }
      separator
      Button(Strings.terms) { openURL(URLs.terms) }
      separator
      Button(Strings.privacy) { openURL(URLs.privacy) }
    }
    .buttonStyle(.plain)
    .textStyle(.labelM)
    .foregroundColor(Colors.foregroundPrimary)
    .frame(maxWidth: .infinity)
  }

  private var separator: some View {
    Text(verbatim: "•")
      .foregroundColor(Colors.foregroundQuaternary)
      .accessibilityHidden(true)
  }
}

private struct DonationRadio: View {
  var isSelected: Bool

  var body: some View {
    if isSelected {
      Circle()
        .fill(Colors.foregroundBrandPrimary)
        .overlay(
          Circle()
            .fill(Colors.bgPrimary)
            .frame(width: Constants.radioDotSize, height: Constants.radioDotSize)
        )
        .frame(width: Constants.radioSize, height: Constants.radioSize)
    } else {
      Circle()
        .fill(Colors.bgPrimary)
        .shadow(color: Colors.shadowButton, radius: Constants.radioShadowRadius, y: Constants.radioShadowY)
        .overlay(Circle().strokeBorder(Colors.borderSecondary, lineWidth: Borders.width))
        .frame(width: Constants.radioSize, height: Constants.radioSize)
    }
  }
}

private struct DonationAmountStyle: ButtonStyle {
  var isSelected: Bool
  /// Whether the amount takes its share of the width, rather than fits
  var isFilling: Bool

  func makeBody(configuration: ButtonStyleConfiguration) -> some View {
    let shape = RoundedRectangle(cornerRadius: Constants.amountCornerRadius)

    configuration.label
      .textStyle(.displayS)
      .foregroundColor(isSelected ? Colors.foregroundBrandPrimary : Colors.foregroundPrimary)
      .lineLimit(1)
      // In its share of the width, the price has less space around it,
      // and gets smaller when it's still too long
      .minimumScaleFactor(isFilling ? Constants.fillingAmountMinimumScale : 1)
      .padding(.vertical, Constants.amountPadding)
      .padding(.horizontal, isFilling ? Constants.fillingAmountHorizontalPadding : Constants.amountPadding)
      .frame(maxWidth: isFilling ? .infinity : nil)
      .background(
        shape
          .fill(isSelected ? Colors.bgBrandPrimary : Colors.bgPrimary)
          .shadow(color: isSelected ? Colors.shadowCard : .clear, radius: Constants.amountShadowRadius, y: Constants.amountShadowY)
      )
      .overlay(
        shape.strokeBorder(isSelected ? Colors.borderBrandSolid : Colors.borderPrimary, lineWidth: Borders.width)
      )
      .contentShape(shape)
      .opacity(configuration.isPressed ? AppButtonStyle.pressedOpacity : 1)
  }
}
