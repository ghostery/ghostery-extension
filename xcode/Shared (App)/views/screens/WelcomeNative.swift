//
//  ContentView.swift
//  Ghostery
//
//  Created by Palade Timotei on 14.04.25.
//

import SwiftUI

fileprivate enum Constants {
    static let horizontalPadding: CGFloat = 16
    static let cornerRadius: CGFloat = 16
    static let noSpacing: CGFloat = .zero
    
    static let headerWidth: CGFloat = 215
    static let headerHeight: CGFloat = 32
    static let headerMaxPadding: CGFloat = 64
    static let headerMinPadding: CGFloat = 12
    static let headerVerticalPadding: CGFloat = 32

    static let instructionsCardHeight: CGFloat = 484
    static let instructionsCardWidth: CGFloat = 343
    static let instructionsCardShadowRadius: CGFloat = 24
    static let instructionsCardShadowX: CGFloat = 0
    static let instructionsCardShadowY: CGFloat = 0
    static let instructionsCardPadding: CGFloat = 16
    static let instructionsHeaderWidth: CGFloat = 220
    static let instructionsIconWidth: CGFloat = 18
    static let instructionsSpacerMinWidth: CGFloat = 16
    
    static let dividerHeight: CGFloat = 1
    
    static let donateButtonVStackSpacing: CGFloat = 8
    static let donateButtonHeight: CGFloat = 48
    
    static let containerWidth: CGFloat = 375
    static let containerHeight: CGFloat = 604
    static let containerBottomPadding: CGFloat = 12
    
    static let buttonCornerRadius: CGFloat = 8
    static let borderLineWidth: CGFloat = 1
    static let buttonShadowRadius: CGFloat = 2
    static let buttonShadowX: CGFloat = 0
    static let buttonShadowY: CGFloat = 0
    
    static let gradientStartRadius: CGFloat = 30
    static let smallGradientEndRadius: CGFloat = 300
    static let bigGradientEndRadius: CGFloat = 420
    static let gradientColorOpacity: Double = 0.42
    static let gradientWhiteOpacity: Double = 0
    
    static let stepByStepButtonHeight: CGFloat = 32
    static let stepByStepSectionVerticalSpacing: CGFloat = 8
}

fileprivate enum Strings {
    // You can translate your strings here
    static let donateSectionDescription = "Enjoying our Community-Powered Privacy Features? Help support our mission with a donation."
    static let donateButtonTitle = "Donate"
    static let instructionsHeaderTitle = "Enable Ghostery Privacy Ad Block for Safari"
    static let step = "Step"
    static let openSafari = "Open Safari "
    static let goToAnyWebsite = " and go to any website"
    static let tap = "Tap "
    static let inTheSearchBar = " in the search bar"
    static let toManageExtensions = " to manage extensions"
    static let toggleOnGhostery = "Toggle on Ghostery "
    static let tapOnThe = "Tap on the "
    static let tapAlwaysAllow = "Tap ‘Always Allow’ "
    static let thenTap = " then tap"
    static let alwaysAllowOnEveryWebsite = "‘Always Allow on Every Website’ "
    static let tapEnableGhostery = "Tap ‘Enable Ghostery’ "
    static let needMoreHelp = "Need more help?"
    static let stepByStepGuide = "Step by step guide"
}

struct WelcomeView: View {
    @State var theme = Theme.light
    
    var donateButtonPressed: () -> Void
    var stepByStepButtonPressed: () -> Void
    
    var body: some View {
        VStack(alignment: .center, spacing: Constants.noSpacing) {
            instructionsCard
            Spacer()
            donateButton
        }
        .padding(.horizontal, Constants.horizontalPadding)
        .padding(.bottom, Constants.containerBottomPadding)
        .frame(maxWidth: Constants.containerWidth)
        .frame(maxHeight: Constants.containerHeight)
    }
    
    var instructionsCard: some View {
        VStack(alignment: .center, spacing: Constants.noSpacing) {
            instructionsHeader
            Spacer(minLength: Constants.instructionsSpacerMinWidth)
            steps
            Spacer(minLength: Constants.instructionsSpacerMinWidth)
            divider
            Spacer(minLength: Constants.instructionsSpacerMinWidth)
            stepByStepGuide
        }
        .padding(Constants.instructionsCardPadding)
        .frame(height: Constants.instructionsCardHeight)
        .frame(maxWidth: Constants.instructionsCardWidth)
        .background(theme == .light ? Colors.lightBGColor : Colors.darkBGColor)
        .clipShape(RoundedRectangle(cornerRadius: Constants.cornerRadius))
        .shadow(color: Colors.shadowColor, radius: Constants.instructionsCardShadowRadius, x: Constants.instructionsCardShadowX, y: Constants.instructionsCardShadowY)
    }
    
    var instructionsHeader: some View {
        Text(Strings.instructionsHeaderTitle)
            .font(Fonts.headline)
            .multilineTextAlignment(.center)
            .foregroundStyle(Colors.textGray)
            .frame(width: Constants.instructionsHeaderWidth)
    }
    
    var steps: some View {
        VStack(alignment: .listRowSeparatorLeading, spacing: Constants.noSpacing) {
            step(number: 1, textBeforeIcon: Strings.openSafari, iconName: Icons.safari, textAfterIcon: Strings.goToAnyWebsite)
            Spacer()
            step(number: 2, textBeforeIcon: Strings.tap, iconName: Icons.siteSettings, textAfterIcon: Strings.inTheSearchBar)
            Spacer()
            step(number: 3, textBeforeIcon: Strings.tap, iconName: Icons.plugins, textAfterIcon: Strings.toManageExtensions)
            Spacer()
            step(number: 4, textBeforeIcon: Strings.toggleOnGhostery, iconName: Icons.ghosterySmall, textAfterIcon: nil)
            Spacer()
            step(number: 5, textBeforeIcon: Strings.tapOnThe, iconName: Icons.warning, textAfterIcon: nil)
            Spacer()
            step(number: 6, textBeforeIcon: Strings.tapAlwaysAllow, iconName: Icons.tap, textAfterIcon: Strings.thenTap)
            Spacer()
            step(number: 7, textBeforeIcon: Strings.alwaysAllowOnEveryWebsite, iconName: Icons.tap, textAfterIcon: nil)
            Spacer()
            step(number: 8, textBeforeIcon: Strings.tapEnableGhostery, iconName: Icons.tap, textAfterIcon: nil)
        }
    }

    func step(number: Int, textBeforeIcon: String, iconName: String, textAfterIcon: String?) -> some View {
        HStack(alignment: .center, spacing: Constants.noSpacing) {
            Text(Strings.step + " \(number). ")
                .font(Fonts.text)
                .foregroundStyle(theme == .light ? Colors.lightTextColor: Colors.darkTextColor)
            Text(textBeforeIcon)
                .font(Fonts.text)
                .foregroundStyle(theme == .light ? Colors.lightTextColor: Colors.darkTextColor)
            Image(iconName)
                .resizable()
                .scaledToFit()
                .frame(width: Constants.instructionsIconWidth)
            if let textAfterIcon = textAfterIcon {
                Text(textAfterIcon)
                    .font(Fonts.text)
                    .foregroundStyle(theme == .light ? Colors.lightTextColor: Colors.darkTextColor)
            }
            Spacer()
        }
    }
    
    var divider: some View {
        Rectangle()
            .fill(Colors.dividerGray)
            .frame(height: Constants.dividerHeight)
    }
    
    var stepByStepGuide: some View {
        VStack(alignment: .center, spacing: Constants.stepByStepSectionVerticalSpacing) {
            Text(Strings.needMoreHelp)
                .font(Fonts.footnote)
                .foregroundStyle(Colors.textGray)
            Button {
                stepByStepButtonPressed()
            } label: {
                Text(Strings.stepByStepGuide)
                    .frame(height: Constants.stepByStepButtonHeight)
                    .frame(maxWidth: .infinity)
                    .modifier(GhosteryOutlinedButtonModifier())
            }
        }
    }
    
    var donateButton: some View {
        VStack(alignment: .center, spacing: Constants.donateButtonVStackSpacing) {
            Text(Strings.donateSectionDescription)
                .font(Fonts.text)
                .multilineTextAlignment(.center)
                .foregroundStyle(theme == .light ? Colors.lightTextColor : Colors.darkTextColor)
            Button {
                donateButtonPressed()
            } label: {
                Text(Strings.donateButtonTitle)
                    .frame(height: Constants.donateButtonHeight)
                    .frame(maxWidth: .infinity)
                    .modifier(GhosteryOutlinedButtonModifier())
            }
        }
    }
}

#Preview {
  WelcomeView(donateButtonPressed: {}, stepByStepButtonPressed: {})
}

struct GhosteryOutlinedButtonModifier: ViewModifier {
    
    var backgroundColor: Color?
  
    func body(content: Content) -> some View {
        content
            .font(Fonts.buttonTitle)
            .background(backgroundColor ?? Colors.buttonBGColor)
            .clipShape(
                RoundedRectangle(cornerRadius: Constants.buttonCornerRadius)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Constants.buttonCornerRadius)
                    .stroke(Colors.ghosteryBlue, lineWidth: Constants.borderLineWidth)
            )
            .shadow(color: Colors.shadowColor, radius: Constants.buttonShadowRadius, x: Constants.buttonShadowX, y: Constants.buttonShadowY)
    }
}

struct GhosteryFilledButtonModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(Fonts.buttonTitle)
            .background(Colors.bgBrandSolid)
            .clipShape(
                RoundedRectangle(cornerRadius: Constants.buttonCornerRadius)
            )
            .shadow(color: Colors.shadowColor, radius: Constants.buttonShadowRadius, x: Constants.buttonShadowX, y: Constants.buttonShadowY)
    }
}

struct GhosteryGradientBackground: View {
    @State var theme = Theme.light
  
    var body: some View {
        ZStack {
            RadialGradient(
                gradient: Gradient(colors: [
                    Colors.lightBlue.opacity(Constants.gradientColorOpacity),
                    Color.white.opacity(Constants.gradientWhiteOpacity)
                ]),
                center: .center,
                startRadius: Constants.gradientStartRadius,
                endRadius: Constants.smallGradientEndRadius
            )
            .frame(width: 2000, height: 2000)
            .offset(.init(width: -120, height: -300))
            .ignoresSafeArea()

            RadialGradient(
                gradient: Gradient(colors: [
                    Colors.purple.opacity(Constants.gradientColorOpacity),
                    Color.white.opacity(Constants.gradientWhiteOpacity)
                ]),
                center: .center,
                startRadius: Constants.gradientStartRadius,
                endRadius: Constants.bigGradientEndRadius
            )
            .frame(width: 2000, height: 2000)
            .offset(.init(width: 150, height: 120))
            .ignoresSafeArea()
        }.background(theme == .light ? Colors.lightBGColor : Colors.darkBGColor)
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int = UInt64()
        Scanner(string: hex).scanHexInt64(&int)

        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255,
                            (int >> 8) * 17,
                            (int >> 4 & 0xF) * 17,
                            (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255,
                            int >> 16,
                            int >> 8 & 0xFF,
                            int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24,
                            int >> 16 & 0xFF,
                            int >> 8 & 0xFF,
                            int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
