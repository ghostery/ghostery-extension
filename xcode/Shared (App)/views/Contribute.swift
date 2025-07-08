//
//  ContentView.swift
//  Ghostery
//
//  Created by Palade Timotei on 14.04.25.
//

import SwiftUI
import StoreKit

// TODO: Add a spinner after pressing on Donate. It can take a bit for the payment part to show.

fileprivate enum Constants {
  static let horizontalPadding: CGFloat = 16
  static let cornerRadius: CGFloat = 16
  static let noSpacing: CGFloat = .zero
  
  static let headerImageHeight: CGFloat = 144
  static let headerImageWidth: CGFloat = 300
  
  static let descriptionLineSpacing: CGFloat = 4
  
  static let instructionsSpacerMinWidth: CGFloat = 16
  static let instructionsCardShadowRadius: CGFloat = 24
  static let instructionsCardShadowX: CGFloat = 0
  static let instructionsCardShadowY: CGFloat = 0
  static let instructionsCardWidth: CGFloat = 343
  static let instructionsCardPadding: CGFloat = 16
  
  static let dividerHeight: CGFloat = 1
  
  static let donateButtonHeight: CGFloat = 48
  
  static let containerWidth: CGFloat = 375
  static let containerHeight: CGFloat = 640
  static let containerBottomPadding: CGFloat = 12
  
  static let donationOverlayVerticalSpacing: CGFloat = 24
  static let donationOverlayTextVerticalSpacing: CGFloat = 4
  static let donationOverlayDonationButtonsVerticalSpacing: CGFloat = 16
  
  static let donationBoxPadding: CGFloat = 8
  static let donationBoxWidth: CGFloat = 311
  static let donationBoxHeight: CGFloat = 240
  static let donationBoxVerticalPadding: CGFloat = 16
  
  static let restoreDonationTopPadding: CGFloat = 12
  
  static let donationOverlayCapsuleWidth: CGFloat = 48
  static let donationOverlayCapsuleHeight: CGFloat = 5
  static let donationOverlayCapsuleOpacity: CGFloat = 0.3
  static let donationOverlayCapsuleTopPadding: CGFloat = 8
  static let donationOverlayHeight: CGFloat = 381
  
  static let backButtonTextLeadingPadding: CGFloat = 2
}

fileprivate enum Strings {
  // You can translate your strings here
  static let headerTitle = "Become a Contributor"
  static let description = "Support our mission and help us develop even stronger protection against trackers and ads, making the web safer for everyone."
  static let eula = "EULA"
  static let terms = "Terms of Use"
  static let policy = "Privacy Policy"
  static let restoreDonation = "Restore donation"
  static let donationTilte = "Select the most convenient method for your support"
  static let monthlyDonation = "Monthly Donation"
  static let yearlyDonation = "Yearly Donation"
  static let oneTimeDonation = "One-Time Donation"
  static let donationOverlayMonthlyTitle = "Choose your monthly donation amount"
  static let donationOverlayYearlyTitle = "Choose your yearly donation amount"
  static let donationOverlayOneTimeTitle = "Choose your one-time donation amount"
  static let donationOverlaySubtitle = "You can cancel anytime."
  static let donate = "Donate"
  static let perMonth = "per month"
  static let perYear = "per year"
  static let singleDonation = "Single donation"
}

struct ContributeView: View {
  @State var theme = Theme.light
  @State private var showOverlay = false
  @State private var showDonationOverlayHeaderSubtitle = true
  @State private var donationOverlayTitle: String = ""
  
  @State var donationPlans: [Product] = []
  @State var selectedDonationPlan: Product?
  
  @State var monthlyDonationPlans: [Product] = []
  @State var yearlyDonationPlans: [Product] = []
  @State var oneTimeDonationPlans: [Product] = []
  
  @State var purchaseInProgress = false
  
  @EnvironmentObject var storeHelper: StoreHelper
  
  var donateButtonPressed: () -> Void
  var eulaPressed: () -> Void
  var termsPressed: () -> Void
  var policyPressed: () -> Void
  var backPressed: () -> Void
  
  var body: some View {
    ZStack(alignment: .bottom) {
      VStack(alignment: .center, spacing: Constants.noSpacing) {
        card
      }
      .padding(.horizontal, Constants.horizontalPadding)
      .padding(.bottom, Constants.containerBottomPadding)
      .frame(maxWidth: Constants.containerWidth)
      .frame(maxHeight: Constants.containerHeight)
      .sheet(isPresented: $showOverlay, onDismiss: { selectedDonationPlan = nil }) {
        donationPlansOverlay
          .presentationDetents([.height(Constants.donationOverlayHeight)])
      }
    }
    .task {
      populateProducts()
    }
  }
  
  var card: some View {
    VStack(alignment: .center, spacing: Constants.noSpacing) {
      header
      Spacer(minLength: Constants.instructionsSpacerMinWidth)
      headerImage
      Spacer(minLength: Constants.instructionsSpacerMinWidth)
      description
      Spacer(minLength: Constants.instructionsSpacerMinWidth)
      donationBox
      divider
      legal
      restoreDonation
    }
    .padding(Constants.instructionsCardPadding)
    .frame(height: Constants.containerHeight)
    #if os(iOS)
    .frame(maxWidth: Constants.instructionsCardWidth)
    #else
    .frame(width: Constants.containerWidth)
    #endif
    .background(theme == .light ? Colors.lightBGColor : Colors.darkBGColor)
    .clipShape(RoundedRectangle(cornerRadius: Constants.cornerRadius))
    .shadow(color: Colors.shadowColor, radius: Constants.instructionsCardShadowRadius, x: Constants.instructionsCardShadowX, y: Constants.instructionsCardShadowY)
  }
  
  var header: some View {
    ZStack(alignment: .center) {
      Text(Strings.headerTitle)
        .font(Fonts.subheadline)
        .multilineTextAlignment(.center)
        .foregroundStyle(Colors.foregroundPrimary)
        .frame(maxWidth: .infinity)
      HStack(alignment: .center, spacing: Constants.noSpacing) {
        Button {
          backPressed()
        } label: {
          HStack(alignment: .center, spacing: Constants.noSpacing) {
            Image(systemName: "chevron.backward")
              .font(.system(size: 16, weight: .semibold))
              .foregroundStyle(Colors.foregroundBrandPrimary)
            Text("Back")
              .font(Fonts.title)
              .foregroundStyle(Colors.foregroundBrandPrimary)
              .padding(.leading, Constants.backButtonTextLeadingPadding)
          }
          
        }
#if os(macOS)
        .frame(height: 28)
        .buttonStyle(.plain)
#endif
        Spacer()
      }
    }
  }
  
  var headerImage: some View {
    Image(Icons.contributeIllustration)
      .resizable()
      .scaledToFit()
      .frame(width: Constants.headerImageWidth, height: Constants.headerImageHeight)
  }
  
  var description: some View {
    Text(Strings.description)
      .font(Fonts.description)
      .multilineTextAlignment(.center)
      .foregroundStyle(Colors.foregroundPrimary)
      .frame(maxWidth: .infinity)
      .lineSpacing(Constants.descriptionLineSpacing)
  }
  
  var donationBox: some View {
    VStack(alignment: .center, spacing: Constants.donationBoxVerticalPadding) {
      Text(Strings.donationTilte)
        .font(Fonts.text)
        .foregroundStyle(Colors.foregroundPrimary)
        .multilineTextAlignment(.center)
        .frame(maxWidth: .infinity)
      
      donationPeriodButton(title: Strings.monthlyDonation, action: {
        donationPlans = []
        withAnimation {
          Task { @MainActor in
            donationPlans = monthlyDonationPlans
            donationOverlayTitle = Strings.donationOverlayMonthlyTitle
          }
          
          showDonationOverlayHeaderSubtitle = true
          showOverlay = true
        }
      })
      donationPeriodButton(title: Strings.yearlyDonation, action: {
        donationPlans = []
        withAnimation {
          Task { @MainActor in
            donationPlans = yearlyDonationPlans
            donationOverlayTitle = Strings.donationOverlayYearlyTitle
          }
          
          showDonationOverlayHeaderSubtitle = true
          showOverlay = true
        }
      })
      donationPeriodButton(title: Strings.oneTimeDonation, action: {
        donationPlans = []
        withAnimation {
          Task { @MainActor in
            donationPlans = oneTimeDonationPlans
            donationOverlayTitle = Strings.donationOverlayOneTimeTitle
          }
          
          showDonationOverlayHeaderSubtitle = false
          showOverlay = true
        }
      })
    }
    .padding(Constants.donationBoxPadding)
    .frame(height: Constants.donationBoxHeight)
    .background(Colors.bgBrandPrimary)
    .clipShape(RoundedRectangle(cornerRadius: Constants.cornerRadius))
  }
  
  
  var divider: some View {
    Rectangle()
      .fill(Colors.dividerGray)
      .frame(height: Constants.dividerHeight)
      .padding(.vertical, Constants.donationBoxVerticalPadding)
  }
  
  var legal: some View {
#if os(iOS)
    let width = Constants.instructionsCardWidth - Constants.instructionsCardPadding
#else
    let width = Constants.containerWidth - Constants.instructionsCardPadding
#endif
    return HStack(alignment: .center, spacing: Constants.noSpacing) {
      Text(Strings.eula)
        .modifier(LegalText(action: eulaPressed))
        .frame(width: width/3)
        .multilineTextAlignment(.center)
      Text(Strings.terms)
        .modifier(LegalText(action: termsPressed))
        .frame(width: width/3)
        .multilineTextAlignment(.center)
      Text(Strings.policy)
        .modifier(LegalText(action: policyPressed))
        .frame(width: width/3)
        .multilineTextAlignment(.center)
    }
  }
  
  var restoreDonation: some View {
    Button {
      restorePurchases()
    } label: {
      Text(Strings.restoreDonation)
        .font(.footnote)
        .foregroundStyle(Colors.foregroundBrandPrimary)
        .padding(.top, Constants.restoreDonationTopPadding)
        .multilineTextAlignment(.center)
    }
#if os(macOS)
    .buttonStyle(.plain)
#endif
  }
  
  func donationPeriodButton(title: String, action: @escaping () -> Void) -> some View {
    Button {
      action()
    } label: {
      Text(title)
        .frame(height: Constants.donateButtonHeight)
        .frame(maxWidth: .infinity)
        .modifier(GhosteryOutlinedButtonModifier())
    }
#if os(macOS)
    .buttonStyle(.plain)
#endif
  }
  
  var donationPlansOverlay: some View {
    VStack(alignment: .center, spacing: Constants.noSpacing) {
#if os(iOS)
      Capsule()
        .frame(width: Constants.donationOverlayCapsuleWidth, height: Constants.donationOverlayCapsuleHeight)
        .background(Colors.labelsTertiary)
        .opacity(Constants.donationOverlayCapsuleOpacity)
        .padding(.top, Constants.donationOverlayCapsuleTopPadding)
      Spacer()
      donationOverlayContents
      Spacer()
#else
      donationOverlayContents
#endif
      
    }
    .padding(.horizontal, Constants.horizontalPadding)
#if os(macOS)
    .padding(.vertical, Constants.horizontalPadding)
#endif
    .background(Color.white)
    .frame(width: 375)
  }
  
  var donationOverlayContents: some View {
    VStack(alignment:.center, spacing: Constants.donationOverlayVerticalSpacing) {
      donationOverlayHeader
      donationOverlayPlanButtons
      donateSolidButton(title: Strings.donate, action: {
        guard let product = selectedDonationPlan else {
          return
        }
        Task {
          await purchase(product: product)
        }
      })
    }
  }
  
  var donationOverlayHeader: some View {
    ZStack(alignment: .top) {
      VStack(alignment:.center, spacing: Constants.donationOverlayTextVerticalSpacing) {
        Text(donationOverlayTitle)
          .font(Fonts.subheadline)
          .foregroundStyle(Colors.foregroundPrimary)
          .multilineTextAlignment(.center)
        if showDonationOverlayHeaderSubtitle {
          Text(Strings.donationOverlaySubtitle)
            .font(Fonts.footnote)
            .foregroundStyle(Colors.foregroundSecondary)
            .multilineTextAlignment(.center)
        }
      }
      #if os(macOS)
      .frame(width: 250)
      #endif
      
      #if os(macOS)
      HStack {
        Spacer()
        Button {
          showOverlay = false
        } label: {
          Image(systemName: "xmark")
            .resizable()
            .scaledToFit()
            .frame(width: 14, height: 14)
            .foregroundStyle(Colors.foregroungTertiary)
        }
        .buttonStyle(.plain)
      }
      #endif
    }
  }
  
  var donationOverlayPlanButtons: some View {
    VStack(alignment:.center, spacing: Constants.donationOverlayDonationButtonsVerticalSpacing) {
      ForEach(donationPlans, id: \.id) { plan in
        donationAmountButton(id: plan.id,
                             title: plan.displayPrice,
                             subtitle: plan.subscription?.subscriptionPeriod.displayName ?? Strings.singleDonation,
                             action: {
          selectedDonationPlan = plan
        })
      }
    }
  }
  
  func donationAmountButton(id: String, title: String, subtitle: String, action: @escaping () -> Void) -> some View {
    Button {
      action()
    } label: {
      VStack(alignment: .center, spacing: Constants.noSpacing) {
        Text(title)
        Text(subtitle)
          .font(Fonts.buttonFootnote)
          .foregroundStyle(Colors.foregroungTertiary)
      }
      .frame(height: Constants.donateButtonHeight)
      .frame(maxWidth: .infinity)
      .modifier(GhosteryOutlinedButtonModifier(
        backgroundColor: selectedDonationPlan?.id == id ? Colors.bgBrandSecondary : nil)
      )
    }
#if os(macOS)
    .buttonStyle(.plain)
#endif
  }
  
  func donateSolidButton(title: String, action: @escaping () -> Void) -> some View {
    Button {
      if !purchaseInProgress {
        action()
      }
    } label: {
      VStack(alignment: .center, spacing: Constants.noSpacing) {
        if purchaseInProgress {
          CustomSpinner()
        } else {
          Text(title)
            .foregroundStyle(Color.white)
        }
      }
      .frame(height: Constants.donateButtonHeight)
      .frame(maxWidth: .infinity)
      .modifier(GhosteryFilledButtonModifier())
    }
#if os(macOS)
    .buttonStyle(.plain)
#endif
  }
  
  private func populateProducts() {
    guard storeHelper.hasProducts else {
      return
    }
    
    if let subscriptions = storeHelper.subscriptionProducts {
      for subscription in subscriptions {
        switch subscription.subscription?.subscriptionPeriod.unit {
        case .month:
          monthlyDonationPlans.append(subscription)
        case .year:
          yearlyDonationPlans.append(subscription)
        default:
          continue
        }
      }
    }
    
    if let oneTimeProducts = storeHelper.consumableProducts {
      for product in oneTimeProducts {
        oneTimeDonationPlans.append(product)
      }
    }
    
    monthlyDonationPlans.sort { $0.price < $1.price }
    yearlyDonationPlans.sort { $0.price < $1.price }
    oneTimeDonationPlans.sort { $0.price < $1.price }
  }
  
  /// Purchase a product using StoreHelper and StoreKit2.
  /// - Parameter product: The `Product` to purchase
  @MainActor func purchase(product: Product) async {
    purchaseInProgress = true
    do {
      let purchaseResult = try await storeHelper.purchase(product)
      purchaseInProgress = false
      switch purchaseResult.purchaseState {
      case .purchased:
        showOverlay = false
      default:
        return
      }
    } catch {
      print("Failed to purchase")
      showOverlay = false
      purchaseInProgress = false
    }
    
  }
  
  private func restorePurchases() {
    Task.init { try? await AppStore.sync() }
  }
}

fileprivate struct LegalText: ViewModifier {
  
  var action: () -> Void
  
  func body(content: Content) -> some View {
    content
      .font(.footnote)
      .foregroundStyle(Colors.foregroundBrandPrimary)
      .onTapGesture {
        action()
      }
  }
}

extension Product.SubscriptionPeriod {
  var displayName: String? {
    switch self.unit {
    case .month:
      return Strings.perMonth
    case .year:
      return Strings.perYear
    default:
      return nil
    }
  }
}

#Preview {
  ContributeView(donateButtonPressed: {}, eulaPressed: {}, termsPressed: {}, policyPressed: {}, backPressed: {})
}

struct CustomSpinner: View {
    @State private var isAnimating = false

    var body: some View {
        Circle()
            .trim(from: 0.0, to: 0.6)
            .stroke(Color.white, style: StrokeStyle(lineWidth: 4, lineCap: .round))
            .frame(width: 20, height: 20)
            .rotationEffect(Angle(degrees: isAnimating ? 360 : 0))
            .animation(.linear(duration: 0.8).repeatForever(autoreverses: false), value: isAnimating)
            .onAppear {
                isAnimating = true
            }
    }
}
