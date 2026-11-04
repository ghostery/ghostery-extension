//
//  SectionStrings.swift
//  Ghostery
//
//  Texts of the sections which both apps show, each in its own views. The
//  texts of the views shared by the apps are in their own files.
//

import Foundation

enum SectionStrings {
  // You can translate your strings here
  enum Home {
    static let title = String(localized: "Block ads, trackers\n& cookie pop-ups\nin every browser.", comment: "Title of the Home section, in three lines")
    static let description = String(localized: "One app for all your browsers. Free, open source, and advertisers can’t pay to get through.", comment: "Advertisers can’t pay Ghostery to let their ads through")
    static let browsersHeader = String(localized: "Your browsers:", comment: "Header of the browsers in which Ghostery can be used")
    static let safariDescription = String(localized: "Follow these simple steps to enable Ghostery in Safari.")
    static let enabledDescription = String(localized: "Blocking ads, trackers and cookie pop-ups.", comment: "Description of a browser in which Ghostery is enabled")
    static let edgeDescription = String(localized: "One click in\nEdge Add-ons.", comment: "The line break keeps the name of the store together, and can be left out")
    static let active = String(localized: "Active", comment: "State of Ghostery in a browser in which it's enabled")
    static let moreOptions = String(localized: "More options")
    static let disableGhostery = String(localized: "Disable Ghostery", comment: "Option of the Safari card, opening the settings of Safari where the user turns off the extension")
    static let viewInstructions = String(localized: "View instructions", comment: "Button showing the steps to enable or disable Ghostery in Safari")
  }

  /// Page of the Home section with the steps to enable the extension
  enum SafariInstructions {
    static let title = String(localized: "Enable Ghostery Privacy\nAd Block for Safari", comment: "Title in two lines. Ghostery Privacy Ad Block is the name of the extension.")
    static let stepsHeader = String(localized: "How to enable Ghostery")
  }

  enum LearningZone {
    #if os(macOS)
    static let title = String(localized: "Stay one step ahead\nof advertisers.", comment: "Title of the Learning Zone section, in two lines")
    #else
    static let title = String(localized: "Stay one step ahead of advertisers.", comment: "Title of the Learning Zone section, in one line")
    #endif
    static let description = String(localized: "Privacy news and guides from the Ghostery team: ads, tracking, and how to take back your browser.")
  }

  enum Contribute {
    static let title = String(localized: "Become a contributor", comment: "Title of the Contribute section")
    static let description = String(localized: "Help Ghostery fight for a web where privacy is a basic human right.")
    static let subtitle = String(localized: "As a Contributor, you’ll support the development of the entire Ghostery Privacy Suite", comment: "Ghostery Privacy Suite is the name of all Ghostery’s products")
  }
}
